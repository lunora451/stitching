import { uuid } from './ids';
import { slugify } from './slugify';
import { ProjectTheme, OverridesPayload, EMPTY_OVERRIDES, DEFAULT_THEME } from './types';
export type { ProjectTheme, OverridesPayload } from './types';
export { EMPTY_OVERRIDES, DEFAULT_THEME } from './types';

export interface Project {
  id: string;
  name: string;
  theme: ProjectTheme;
  createdAt: number;
  updatedAt: number;
}
export interface Page {
  id: string;
  projectId: string;
  name: string;
  slug: string;
  order: number;
  createdAt: number;
  updatedAt: number;
}
export interface Section {
  id: string;
  pageId: string;
  layoutId: string;
  order: number;
  content: OverridesPayload;
}


export class DB {
  constructor(private d1: D1Database) {}

  async listProjects(): Promise<Project[]> {
    const { results } = await this.d1
      .prepare('SELECT * FROM projects ORDER BY updated_at DESC')
      .all<any>();
    return results.map(rowToProject);
  }

  async getProject(id: string): Promise<Project | null> {
    const row = await this.d1
      .prepare('SELECT * FROM projects WHERE id = ?')
      .bind(id)
      .first<any>();
    return row ? rowToProject(row) : null;
  }

  async createProject(name: string): Promise<Project> {
    const now = Date.now();
    const project: Project = {
      id: uuid(),
      name,
      theme: DEFAULT_THEME,
      createdAt: now,
      updatedAt: now,
    };
    await this.d1
      .prepare('INSERT INTO projects (id, name, theme, created_at, updated_at) VALUES (?, ?, ?, ?, ?)')
      .bind(project.id, project.name, JSON.stringify(project.theme), now, now)
      .run();
    return project;
  }

  async updateProject(id: string, patch: Partial<Pick<Project, 'name' | 'theme'>>): Promise<void> {
    const now = Date.now();
    const fields: string[] = ['updated_at = ?'];
    const binds: unknown[] = [now];
    if (patch.name !== undefined) { fields.push('name = ?'); binds.push(patch.name); }
    if (patch.theme !== undefined) { fields.push('theme = ?'); binds.push(JSON.stringify(patch.theme)); }
    binds.push(id);
    await this.d1.prepare(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`).bind(...binds).run();
  }

  async deleteProject(id: string): Promise<void> {
    await this.d1.prepare('DELETE FROM projects WHERE id = ?').bind(id).run();
  }

  async listPages(projectId: string): Promise<Page[]> {
    const { results } = await this.d1
      .prepare('SELECT * FROM pages WHERE project_id = ? ORDER BY "order" ASC')
      .bind(projectId)
      .all<any>();
    return results.map(rowToPage);
  }

  async getPage(pageId: string): Promise<Page | null> {
    const row = await this.d1.prepare('SELECT * FROM pages WHERE id = ?').bind(pageId).first<any>();
    return row ? rowToPage(row) : null;
  }

  async createPage(projectId: string, name: string, layoutIds: string[], defaults: (layoutId: string) => OverridesPayload = () => EMPTY_OVERRIDES): Promise<Page> {
    const now = Date.now();
    const existing = await this.listPages(projectId);
    const order = existing.length;
    const slugBase = slugify(name);
    const slug = await uniqueSlug(this.d1, projectId, slugBase);
    const page: Page = { id: uuid(), projectId, name, slug, order, createdAt: now, updatedAt: now };
    await this.d1
      .prepare('INSERT INTO pages (id, project_id, name, slug, "order", created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(page.id, projectId, name, slug, order, now, now)
      .run();
    const stmts = layoutIds.map((layoutId, i) =>
      this.d1
        .prepare('INSERT INTO sections (id, page_id, layout_id, "order", content) VALUES (?, ?, ?, ?, ?)')
        .bind(uuid(), page.id, layoutId, i, JSON.stringify(defaults(layoutId)))
    );
    if (stmts.length) await this.d1.batch(stmts);
    return page;
  }

  async updatePage(pageId: string, patch: { name?: string }): Promise<void> {
    const now = Date.now();
    const fields = ['updated_at = ?']; const binds: unknown[] = [now];
    if (patch.name !== undefined) { fields.push('name = ?'); binds.push(patch.name); }
    binds.push(pageId);
    await this.d1.prepare(`UPDATE pages SET ${fields.join(', ')} WHERE id = ?`).bind(...binds).run();
  }

  async deletePage(pageId: string): Promise<void> {
    await this.d1.prepare('DELETE FROM pages WHERE id = ?').bind(pageId).run();
  }

  async listSections(pageId: string): Promise<Section[]> {
    const { results } = await this.d1
      .prepare('SELECT * FROM sections WHERE page_id = ? ORDER BY "order" ASC')
      .bind(pageId)
      .all<any>();
    return results.map(rowToSection);
  }

  async replaceSectionsContent(pageId: string, updates: Array<{ id: string; content: OverridesPayload }>): Promise<void> {
    const stmts = updates.map(u =>
      this.d1.prepare('UPDATE sections SET content = ? WHERE id = ? AND page_id = ?')
        .bind(JSON.stringify(u.content), u.id, pageId)
    );
    if (stmts.length) await this.d1.batch(stmts);
    await this.d1.prepare('UPDATE pages SET updated_at = ? WHERE id = ?').bind(Date.now(), pageId).run();
  }
}

async function uniqueSlug(d1: D1Database, projectId: string, base: string): Promise<string> {
  let slug = base; let i = 2;
  while (true) {
    const row = await d1.prepare('SELECT 1 FROM pages WHERE project_id = ? AND slug = ?').bind(projectId, slug).first();
    if (!row) return slug;
    slug = `${base}-${i++}`;
  }
}

function rowToProject(r: any): Project {
  return { id: r.id, name: r.name, theme: JSON.parse(r.theme), createdAt: r.created_at, updatedAt: r.updated_at };
}
function rowToPage(r: any): Page {
  return { id: r.id, projectId: r.project_id, name: r.name, slug: r.slug, order: r.order, createdAt: r.created_at, updatedAt: r.updated_at };
}
function rowToSection(r: any): Section {
  return { id: r.id, pageId: r.page_id, layoutId: r.layout_id, order: r.order, content: JSON.parse(r.content) };
}
