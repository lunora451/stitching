# Lunora Stitch V1 — POC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a working POC of the V1 refonte: Astro SSR + Cloudflare D1 backend, CRUD projects/pages, theme editor, 1 hero layout refactored to a schema-driven component, and a generic editor panel that renders fields from that schema. POC validates the schema-driven approach before migrating the 4 remaining layouts and adding exports (V1.1).

**Architecture:**
- Astro SSR via `@astrojs/cloudflare` adapter (v13, Astro 6). D1 binding `DB` exposes single-user persistence (3 tables: `projects`, `pages`, `sections`). R2 binding `IMAGES` reserved but not wired in POC (no `image` field on hero POC). Runtime env accessed via `import { env } from 'cloudflare:workers'` (new adapter API — `Astro.locals.runtime` is removed in v13).
- **Wrangler config**: in Astro 6 the wrangler file is *optional for projects with no bindings*. We have bindings (D1, R2 later), so a `wrangler.jsonc` IS required — but it's now JSONC, not TOML, and uses the Astro adapter's unified entrypoint `@astrojs/cloudflare/entrypoints/server`.
- Schema-driven editing: each editable layout exports a JS schema (id, category, fields[]) from `src/schemas/<layoutId>.ts`. The Astro layout component takes those fields as props. The editor reads the schema to render the edit panel; saved values live in `sections.content` (JSON TEXT in D1).
- Old `templateBuilder.astro` and `editor.astro` stay in place untouched. New flows live under `/projects/...` routes.

**Tech Stack:** Astro 6.3, `@astrojs/cloudflare` 13.5, wrangler 4.x, Cloudflare D1, vanilla JS islands (no React/Vue). TypeScript for `src/lib/`, `src/schemas/`, and API routes.

**Scope cut for POC (V1.1 will cover):** 4 remaining layouts (nav/services/quotes/footer), exports (MD + ZIP HTML), R2 image upload, internal-link field type, list field type. Note these in code as `// V1.1` comments where touched.

---

## Context

The current app at `c:\Users\trous\Desktop\1.0\templateMaking\stitching\` is an experimental template picker. `templateBuilder.astro` (1550 lines) lets you select layout variants via dropdowns and serializes the selection into URL params. `editor.astro` (1662 lines) reads those params and edits text/images/colors via `contentEditable` + `localStorage`. Layouts under `src/layouts/<category>/N.astro` are fully hardcoded (no props). State is lost on reload of another browser/device.

The user wants this to become a real client-presentation tool: persistent projects, persistent pages, persistent edits. Brief V1 (see `Brief V1 — lunora-stitch.txt`) defines a 9-step delivery. This plan covers steps 1–5 (POC). Steps 6–9 (migrate 4 layouts + 2 exports + access protection) follow in V1.1 once the POC pattern is validated against a real layout.

The Cloudflare adapter is already installed (`@astrojs/cloudflare` 13.5.4 in `package.json`) and registered in `astro.config.mjs`, but no `wrangler.jsonc`, no D1, no R2 bindings exist yet.

---

## File Structure

**Created:**
- `wrangler.jsonc` — D1 binding, R2 binding (declared, unused in POC), compatibility date, Astro adapter entrypoint
- `migrations/0001_init.sql` — `projects`, `pages`, `sections` schema
- `src/lib/db.ts` — typed wrapper around `env.DB` (helpers: `getProject`, `listProjects`, `createProject`, `updateProject`, `deleteProject`, equivalent for pages and sections)
- `src/lib/ids.ts` — `uuid()` helper (`crypto.randomUUID()` works on Workers)
- `src/lib/slugify.ts` — page name → slug (lowercase, ASCII, dash-separated)
- `src/schemas/types.ts` — shared types: `FieldDef`, `LayoutSchema`, `ContentValues`
- `src/schemas/hero-1.ts` — POC schema (matches refactored hero component)
- `src/schemas/registry.ts` — `LAYOUT_SCHEMAS: Record<string, LayoutSchema>` indexed by `layoutId`; lookup helpers `getSchema(id)` and `defaultContent(id)`
- `src/components/library/Hero1.astro` — POC refactor of `src/layouts/hero/centered/1.astro` (or first existing centered hero — exact source picked in Task 9) into a props-driven component
- `src/components/library/registry.ts` — `LAYOUT_COMPONENTS: Record<string, AstroComponent>` indexed by `layoutId`
- `src/components/editor/SectionPanel.astro` — schema-driven edit panel (right side, fixed)
- `src/components/editor/ThemeEditor.astro` — color pickers + font selects for project theme
- `src/pages/projects/index.astro` — replaces `src/pages/index.astro` as the Home (project list)
- `src/pages/projects/[projectId]/index.astro` — project view (theme editor + page list)
- `src/pages/projects/[projectId]/pages/new.astro` — new templateBuilder restricted to layouts with a schema
- `src/pages/projects/[projectId]/pages/[pageId]/edit.astro` — schema-driven editor
- `src/pages/api/projects/index.ts` — GET (list) / POST (create)
- `src/pages/api/projects/[id].ts` — GET / PATCH (rename, update theme) / DELETE
- `src/pages/api/projects/[id]/pages/index.ts` — GET / POST (create with default sections)
- `src/pages/api/projects/[id]/pages/[pageId].ts` — GET / PATCH (rename, update sections content) / DELETE
- `tests/lib/slugify.test.ts` — unit tests
- `tests/lib/db.test.ts` — integration tests against local D1 (via `wrangler d1 execute --local`)

**Modified:**
- `astro.config.mjs` — confirm `output: 'server'`, keep `adapter: cloudflare()` (currently only `adapter: cloudflare()` is set — Astro 6 may need explicit `output: 'server'`; verify in Task 1)
- `package.json` — add `wrangler` devDependency, add scripts (`db:migrate:local`, `db:migrate:remote`, `test`)
- `src/pages/index.astro` — redirect to `/projects` (one-liner) so old `/` still resolves
- `src/layouts/Layout.astro` — add a single optional `theme?: {primary, secondary, headerFont, bodyFont}` prop that, if set, overrides CSS variables inline (used by editor preview only; landing/templateBuilder pages don't pass it)

**Untouched (kept in parallel per user choice):**
- `src/pages/templateBuilder.astro` (old)
- `src/pages/editor.astro` (old)
- All existing `src/layouts/<category>/N.astro` files (only the chosen POC hero is *copied* into `src/components/library/Hero1.astro`; the original stays in place)

---

## Data Model

`migrations/0001_init.sql`:

```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  theme TEXT NOT NULL DEFAULT '{"primary":"#ff6a3e","secondary":"#ffba43","headerFont":"Oswald","bodyFont":"Source Sans 3"}',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE pages (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  UNIQUE (project_id, slug)
);

CREATE INDEX idx_pages_project ON pages(project_id, "order");

CREATE TABLE sections (
  id TEXT PRIMARY KEY,
  page_id TEXT NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  layout_id TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  content TEXT NOT NULL DEFAULT '{}'
);

CREATE INDEX idx_sections_page ON sections(page_id, "order");
```

`theme` and `content` are stored as JSON-serialized TEXT. All timestamps are unix-ms ints.

---

## Tasks

### Task 1: Wrangler config + D1 database created locally

**Files:**
- Create: `wrangler.jsonc`
- Modify: `astro.config.mjs`
- Modify: `package.json` (add wrangler devDep + scripts)

- [ ] **Step 1: Install wrangler**

Run: `npm install --save-dev wrangler@^4.83.0`
Expected: `package.json` shows `wrangler` in `devDependencies`.

- [ ] **Step 2: Create `wrangler.jsonc`**

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "lunora-stitch",
  "main": "@astrojs/cloudflare/entrypoints/server",
  "compatibility_date": "2026-05-23",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "binding": "ASSETS",
    "directory": "./dist"
  },
  "observability": { "enabled": true },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "lunora-stitch-dev",
      "database_id": "PLACEHOLDER_FILLED_IN_STEP_3",
      "migrations_dir": "migrations"
    }
  ],
  "r2_buckets": [
    {
      "binding": "IMAGES",
      "bucket_name": "lunora-stitch-images"
    }
  ]
}
```

Note: Astro 6 uses the adapter's unified entrypoint `@astrojs/cloudflare/entrypoints/server` (not `dist/_worker.js/index.js` as in older Astro). The `assets` block is required when `main` is set so static assets keep working.

- [ ] **Step 3: Create the D1 database**

Run: `npx wrangler d1 create lunora-stitch-dev`
Expected: prints a `database_id` UUID. Copy it into `wrangler.jsonc` replacing `PLACEHOLDER_FILLED_IN_STEP_3`.

- [ ] **Step 4: Update `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    platformProxy: { enabled: true },
  }),
});
```

`platformProxy.enabled` makes `env.DB` work in `npm run dev` against the local D1.

- [ ] **Step 5: Add npm scripts**

In `package.json`, add to `scripts`:

```json
"db:migrate:local": "wrangler d1 migrations apply lunora-stitch-dev --local",
"db:migrate:remote": "wrangler d1 migrations apply lunora-stitch-dev --remote",
"test": "node --test tests/**/*.test.ts"
```

- [ ] **Step 6: Verify dev server boots**

Run: `npm run dev`
Expected: Astro dev server starts without "binding not found" warnings. Visit `http://localhost:4321/` — old home page still renders.

- [ ] **Step 7: Commit**

```bash
git add wrangler.jsonc astro.config.mjs package.json package-lock.json
git commit -m "feat: wrangler.jsonc + D1 binding setup for V1 backend"
```

---

### Task 2: D1 schema migration applied

**Files:**
- Create: `migrations/0001_init.sql` (content shown in Data Model section above — copy verbatim)

- [ ] **Step 1: Write the migration file**

Create `migrations/0001_init.sql` with the full SQL from the **Data Model** section above.

- [ ] **Step 2: Apply locally**

Run: `npm run db:migrate:local`
Expected: `🌀 Mapping SQL input ...` then `✅ ... 3 commands executed`.

- [ ] **Step 3: Verify tables exist**

Run: `npx wrangler d1 execute lunora-stitch-dev --local --command="SELECT name FROM sqlite_master WHERE type='table';"`
Expected output includes `projects`, `pages`, `sections`.

- [ ] **Step 4: Commit**

```bash
git add migrations/0001_init.sql
git commit -m "feat: initial D1 schema (projects, pages, sections)"
```

---

### Task 3: `src/lib/db.ts` typed wrapper

**Files:**
- Create: `src/lib/db.ts`
- Create: `src/lib/ids.ts`
- Create: `src/lib/slugify.ts`
- Create: `tests/lib/slugify.test.ts`

- [ ] **Step 1: Write `slugify` test first**

```ts
// tests/lib/slugify.test.ts
import { test } from 'node:test';
import assert from 'node:assert';
import { slugify } from '../../src/lib/slugify.ts';

test('lowercases and dashes spaces', () => {
  assert.strictEqual(slugify('About Us'), 'about-us');
});
test('strips accents', () => {
  assert.strictEqual(slugify('Évènements'), 'evenements');
});
test('collapses multi-dashes and trims', () => {
  assert.strictEqual(slugify('  Hello -- World  '), 'hello-world');
});
test('empty input becomes "page"', () => {
  assert.strictEqual(slugify(''), 'page');
});
```

- [ ] **Step 2: Run test — should fail**

Run: `npm test`
Expected: import error (file doesn't exist).

- [ ] **Step 3: Implement `slugify`**

```ts
// src/lib/slugify.ts
export function slugify(input: string): string {
  const s = input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return s || 'page';
}
```

- [ ] **Step 4: Run test — should pass**

Run: `npm test`
Expected: 4 tests pass.

- [ ] **Step 5: Implement `ids.ts`**

```ts
// src/lib/ids.ts
export const uuid = (): string => crypto.randomUUID();
```

- [ ] **Step 6: Implement `db.ts` wrapper**

```ts
// src/lib/db.ts
import { uuid } from './ids';
import { slugify } from './slugify';

export interface Project {
  id: string;
  name: string;
  theme: ProjectTheme;
  createdAt: number;
  updatedAt: number;
}
export interface ProjectTheme {
  primary: string;
  secondary: string;
  headerFont: string;
  bodyFont: string;
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
  content: Record<string, unknown>;
}

const DEFAULT_THEME: ProjectTheme = {
  primary: '#ff6a3e',
  secondary: '#ffba43',
  headerFont: 'Oswald',
  bodyFont: 'Source Sans 3',
};

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

  async createPage(projectId: string, name: string, layoutIds: string[], defaults: (id: string) => Record<string, unknown>): Promise<Page> {
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

  async replaceSectionsContent(pageId: string, updates: Array<{ id: string; content: Record<string, unknown> }>): Promise<void> {
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
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/db.ts src/lib/ids.ts src/lib/slugify.ts tests/lib/slugify.test.ts
git commit -m "feat: D1 wrapper + slugify + uuid helpers"
```

---

### Task 4: Projects API routes

**Files:**
- Create: `src/pages/api/projects/index.ts`
- Create: `src/pages/api/projects/[id].ts`

- [ ] **Step 1: Implement `src/pages/api/projects/index.ts`**

```ts
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { DB } from '../../../lib/db';

export const prerender = false;

export const GET: APIRoute = async () => {
  const db = new DB(env.DB);
  const projects = await db.listProjects();
  return new Response(JSON.stringify(projects), { headers: { 'content-type': 'application/json' } });
};

export const POST: APIRoute = async ({ request }) => {
  const { name } = await request.json() as { name?: string };
  if (!name || typeof name !== 'string' || !name.trim()) {
    return new Response(JSON.stringify({ error: 'name required' }), { status: 400 });
  }
  const db = new DB(env.DB);
  const project = await db.createProject(name.trim());
  return new Response(JSON.stringify(project), { status: 201, headers: { 'content-type': 'application/json' } });
};
```

- [ ] **Step 2: Implement `src/pages/api/projects/[id].ts`**

```ts
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { DB } from '../../../lib/db';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const db = new DB(env.DB);
  const project = await db.getProject(params.id!);
  if (!project) return new Response('not found', { status: 404 });
  return new Response(JSON.stringify(project), { headers: { 'content-type': 'application/json' } });
};

export const PATCH: APIRoute = async ({ params, request }) => {
  const body = await request.json() as { name?: string; theme?: any };
  const db = new DB(env.DB);
  await db.updateProject(params.id!, body);
  const updated = await db.getProject(params.id!);
  return new Response(JSON.stringify(updated), { headers: { 'content-type': 'application/json' } });
};

export const DELETE: APIRoute = async ({ params }) => {
  const db = new DB(env.DB);
  await db.deleteProject(params.id!);
  return new Response(null, { status: 204 });
};
```

- [ ] **Step 3: Manually verify**

Start dev server: `npm run dev`. In a second terminal:

```bash
curl -X POST http://localhost:4321/api/projects -H 'content-type: application/json' -d '{"name":"Test Project"}'
curl http://localhost:4321/api/projects
```
Expected: first call returns the project JSON with an id. Second call lists it.

- [ ] **Step 4: Commit**

```bash
git add src/pages/api/projects/
git commit -m "feat: projects API (list/create/get/patch/delete)"
```

---

### Task 5: Home page = project list

**Files:**
- Create: `src/pages/projects/index.astro`
- Modify: `src/pages/index.astro` (redirect)

- [ ] **Step 1: Replace `src/pages/index.astro` content with a redirect**

```astro
---
return Astro.redirect('/projects');
---
```

- [ ] **Step 2: Create `src/pages/projects/index.astro`**

```astro
---
import Layout from '../../layouts/Layout.astro';
import { env } from 'cloudflare:workers';
import { DB } from '../../lib/db';

export const prerender = false;

const db = new DB(env.DB);
const projects = await db.listProjects();
---
<Layout>
  <main style="max-width: 900px; margin: 2rem auto; padding: 1rem;">
    <h1>Lunora Stitch — Projets</h1>

    <form id="new-project-form" style="display: flex; gap: 0.5rem; margin: 1rem 0;">
      <input name="name" placeholder="Nom du projet" required style="flex:1; padding:0.5rem;" />
      <button type="submit">Nouveau projet</button>
    </form>

    {projects.length === 0 && <p>Aucun projet. Créez-en un ci-dessus.</p>}

    <ul style="list-style:none; padding:0;">
      {projects.map((p) => (
        <li style="border:1px solid #ddd; padding:1rem; margin:0.5rem 0; display:flex; justify-content:space-between; align-items:center;">
          <a href={`/projects/${p.id}`} style="font-weight:bold; text-decoration:none;">{p.name}</a>
          <span style="opacity:0.6;">{new Date(p.updatedAt).toLocaleString()}</span>
          <span>
            <button data-action="rename" data-id={p.id}>Renommer</button>
            <button data-action="delete" data-id={p.id}>Supprimer</button>
          </span>
        </li>
      ))}
    </ul>
  </main>

  <script>
    const form = document.getElementById('new-project-form') as HTMLFormElement;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim();
      if (!name) return;
      const res = await fetch('/api/projects', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name }) });
      const project = await res.json();
      location.href = `/projects/${project.id}`;
    });
    document.querySelectorAll('button[data-action="delete"]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = (btn as HTMLElement).dataset.id;
        if (!confirm('Supprimer ce projet et toutes ses pages ?')) return;
        await fetch(`/api/projects/${id}`, { method: 'DELETE' });
        location.reload();
      });
    });
    document.querySelectorAll('button[data-action="rename"]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = (btn as HTMLElement).dataset.id;
        const name = prompt('Nouveau nom ?');
        if (!name) return;
        await fetch(`/api/projects/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name }) });
        location.reload();
      });
    });
  </script>
</Layout>
```

- [ ] **Step 3: Manually verify**

`npm run dev`, visit `http://localhost:4321/`. Create, rename, delete projects. Confirm `/projects` is the landing and the old `/templateBuilder` link still works from URL.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro src/pages/projects/index.astro
git commit -m "feat: Home = project list (CRUD UI)"
```

---

### Task 6: Pages API

**Files:**
- Create: `src/pages/api/projects/[id]/pages/index.ts`
- Create: `src/pages/api/projects/[id]/pages/[pageId].ts`

- [ ] **Step 1: Implement `pages/index.ts`**

```ts
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { DB } from '../../../../../lib/db';
import { defaultContent } from '../../../../../schemas/registry';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const db = new DB(env.DB);
  const pages = await db.listPages(params.id!);
  return new Response(JSON.stringify(pages), { headers: { 'content-type': 'application/json' } });
};

export const POST: APIRoute = async ({ params, request }) => {
  const { name, layoutIds } = await request.json() as { name?: string; layoutIds?: string[] };
  if (!name?.trim()) return new Response(JSON.stringify({ error: 'name required' }), { status: 400 });
  const db = new DB(env.DB);
  const page = await db.createPage(params.id!, name.trim(), layoutIds ?? [], defaultContent);
  return new Response(JSON.stringify(page), { status: 201, headers: { 'content-type': 'application/json' } });
};
```

- [ ] **Step 2: Implement `pages/[pageId].ts`**

```ts
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { DB } from '../../../../../lib/db';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const db = new DB(env.DB);
  const page = await db.getPage(params.pageId!);
  if (!page) return new Response('not found', { status: 404 });
  const sections = await db.listSections(page.id);
  return new Response(JSON.stringify({ page, sections }), { headers: { 'content-type': 'application/json' } });
};

export const PATCH: APIRoute = async ({ params, request }) => {
  const body = await request.json() as { name?: string; sections?: Array<{ id: string; content: Record<string, unknown> }> };
  const db = new DB(env.DB);
  if (body.name !== undefined) await db.updatePage(params.pageId!, { name: body.name });
  if (body.sections) await db.replaceSectionsContent(params.pageId!, body.sections);
  return new Response(null, { status: 204 });
};

export const DELETE: APIRoute = async ({ params }) => {
  const db = new DB(env.DB);
  await db.deletePage(params.pageId!);
  return new Response(null, { status: 204 });
};
```

- [ ] **Step 3: Verify (after Task 7 schema exists)**

Skip manual curl until Task 7 lands schemas; the POST needs `defaultContent` to return real fields.

- [ ] **Step 4: Commit**

```bash
git add src/pages/api/projects/
git commit -m "feat: pages API (list/create/get/patch/delete)"
```

---

### Task 7: POC layout — schema, refactored component, registries

**Files:**
- Create: `src/schemas/types.ts`
- Create: `src/schemas/hero-1.ts`
- Create: `src/schemas/registry.ts`
- Create: `src/components/library/Hero1.astro`
- Create: `src/components/library/registry.ts`

- [ ] **Step 1: Schema types**

```ts
// src/schemas/types.ts
export type FieldType = 'text';

export interface TextField {
  type: 'text';
  label: string;
  default: string;
  multiline?: boolean;
}

export type FieldDef = TextField;
// V1.1: add ImageField, InternalLinkField, ListField

export interface LayoutSchema {
  id: string;
  category: string;
  label: string;
  fields: Record<string, FieldDef>;
}

export type ContentValues = Record<string, string>;
```

- [ ] **Step 2: Hero POC schema**

```ts
// src/schemas/hero-1.ts
import type { LayoutSchema } from './types';

export const heroOneSchema: LayoutSchema = {
  id: 'hero-1',
  category: 'hero',
  label: 'Hero — centered (1)',
  fields: {
    title: { type: 'text', label: 'Titre', default: 'Titre par défaut', multiline: false },
    subtitle: { type: 'text', label: 'Sous-titre', default: 'Sous-titre par défaut', multiline: true },
    ctaText: { type: 'text', label: 'Texte du bouton', default: 'En savoir plus' },
  },
};
```

- [ ] **Step 3: Schema registry**

```ts
// src/schemas/registry.ts
import type { LayoutSchema, ContentValues } from './types';
import { heroOneSchema } from './hero-1';

export const LAYOUT_SCHEMAS: Record<string, LayoutSchema> = {
  [heroOneSchema.id]: heroOneSchema,
};

export function getSchema(id: string): LayoutSchema | undefined {
  return LAYOUT_SCHEMAS[id];
}

export function defaultContent(id: string): ContentValues {
  const schema = getSchema(id);
  if (!schema) return {};
  const out: ContentValues = {};
  for (const [key, field] of Object.entries(schema.fields)) {
    out[key] = field.default;
  }
  return out;
}
```

- [ ] **Step 4: Refactor a hero variant to props**

Pick the first existing file under `src/layouts/hero/centered/` (the executor must `ls` that directory and choose the lowest-numbered one — e.g. `1.astro`). Copy its markup into `src/components/library/Hero1.astro` and replace the hardcoded title/subtitle/CTA strings with props. Example skeleton (the executor adapts to the actual hero markup):

```astro
---
interface Props {
  content: { title: string; subtitle: string; ctaText: string };
}
const { content } = Astro.props;
---
<section class="lunora-hero-1">
  <div class="lunora-hero-1__inner">
    <h1>{content.title}</h1>
    <p>{content.subtitle}</p>
    <a class="cs-button" href="#">{content.ctaText}</a>
  </div>
</section>

<style lang="scss">
  /* paste the original <style> block from src/layouts/hero/centered/1.astro here unchanged */
</style>
```

Keep the original `src/layouts/hero/centered/1.astro` untouched (user chose "garder en parallèle").

- [ ] **Step 5: Component registry**

```ts
// src/components/library/registry.ts
import Hero1 from './Hero1.astro';

export const LAYOUT_COMPONENTS = {
  'hero-1': Hero1,
} as const;

export type KnownLayoutId = keyof typeof LAYOUT_COMPONENTS;

export function getComponent(id: string) {
  return (LAYOUT_COMPONENTS as Record<string, any>)[id];
}
```

- [ ] **Step 6: Commit**

```bash
git add src/schemas/ src/components/library/
git commit -m "feat: POC layout hero-1 (schema + props-driven component + registries)"
```

---

### Task 8: TemplateBuilder route (schema-aware)

**Files:**
- Create: `src/pages/projects/[projectId]/pages/new.astro`

- [ ] **Step 1: Implement the new templateBuilder**

```astro
---
import Layout from '../../../../layouts/Layout.astro';
import { env } from 'cloudflare:workers';
import { DB } from '../../../../lib/db';
import { LAYOUT_SCHEMAS } from '../../../../schemas/registry';

export const prerender = false;

const { projectId } = Astro.params;
const db = new DB(env.DB);
const project = await db.getProject(projectId!);
if (!project) return Astro.redirect('/projects');

const editableLayouts = Object.values(LAYOUT_SCHEMAS);
---
<Layout>
  <main style="max-width: 900px; margin: 2rem auto; padding: 1rem;">
    <p><a href={`/projects/${projectId}`}>← Retour au projet</a></p>
    <h1>Nouvelle page — {project.name}</h1>

    <form id="builder-form">
      <label>Nom de la page <input name="name" required style="padding:0.5rem;" /></label>

      <h2 style="margin-top: 1.5rem;">Sections (cliquez pour ajouter dans l'ordre)</h2>
      <ul id="picker" style="list-style:none; padding:0;">
        {editableLayouts.map((s) => (
          <li>
            <button type="button" data-layout={s.id} style="margin:0.25rem 0; padding:0.5rem 1rem;">
              + {s.label}
            </button>
          </li>
        ))}
        {/* V1.1: render greyed-out items for non-schema layouts */}
      </ul>

      <h2>Sections sélectionnées</h2>
      <ol id="selected" style="border:1px dashed #aaa; min-height: 4rem; padding:1rem;"></ol>

      <button type="submit" style="margin-top:1rem; padding:0.75rem 1.5rem;">Ouvrir l'éditeur</button>
    </form>
  </main>

  <script>
    const selected: string[] = [];
    const selectedEl = document.getElementById('selected')!;

    function render() {
      selectedEl.innerHTML = '';
      selected.forEach((id, i) => {
        const li = document.createElement('li');
        li.textContent = id;
        const rm = document.createElement('button');
        rm.type = 'button';
        rm.textContent = '×';
        rm.style.marginLeft = '0.5rem';
        rm.onclick = () => { selected.splice(i, 1); render(); };
        li.appendChild(rm);
        selectedEl.appendChild(li);
      });
    }

    document.querySelectorAll<HTMLButtonElement>('#picker button[data-layout]').forEach((btn) => {
      btn.addEventListener('click', () => {
        selected.push(btn.dataset.layout!);
        render();
      });
    });

    const form = document.getElementById('builder-form') as HTMLFormElement;
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim();
      if (!name || selected.length === 0) { alert('Nom et au moins 1 section requis.'); return; }
      const projectId = location.pathname.split('/')[2];
      const res = await fetch(`/api/projects/${projectId}/pages`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, layoutIds: selected }),
      });
      const page = await res.json();
      location.href = `/projects/${projectId}/pages/${page.id}/edit`;
    });
  </script>
</Layout>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/projects/
git commit -m "feat: new templateBuilder route (schema-aware picker)"
```

---

### Task 9: Project view (theme editor + page list)

**Files:**
- Create: `src/pages/projects/[projectId]/index.astro`
- Create: `src/components/editor/ThemeEditor.astro`

- [ ] **Step 1: ThemeEditor component**

```astro
---
interface Props {
  project: { id: string; theme: { primary: string; secondary: string; headerFont: string; bodyFont: string } };
}
const { project } = Astro.props;
const FONTS = ['Oswald', 'Source Sans 3', 'Yellowtail', 'Charter', 'Poppins', 'system-ui'];
---
<form id="theme-form" data-project-id={project.id} style="display:grid; grid-template-columns: repeat(4, 1fr); gap:1rem; padding:1rem; border:1px solid #ddd;">
  <label>Primaire <input type="color" name="primary" value={project.theme.primary} /></label>
  <label>Secondaire <input type="color" name="secondary" value={project.theme.secondary} /></label>
  <label>Police header
    <select name="headerFont">{FONTS.map(f => <option value={f} selected={f === project.theme.headerFont}>{f}</option>)}</select>
  </label>
  <label>Police body
    <select name="bodyFont">{FONTS.map(f => <option value={f} selected={f === project.theme.bodyFont}>{f}</option>)}</select>
  </label>
</form>

<script>
  const form = document.getElementById('theme-form') as HTMLFormElement;
  const projectId = form.dataset.projectId!;
  let saveTimer: number;
  form.addEventListener('change', () => {
    clearTimeout(saveTimer);
    saveTimer = window.setTimeout(async () => {
      const theme = {
        primary: (form.elements.namedItem('primary') as HTMLInputElement).value,
        secondary: (form.elements.namedItem('secondary') as HTMLInputElement).value,
        headerFont: (form.elements.namedItem('headerFont') as HTMLSelectElement).value,
        bodyFont: (form.elements.namedItem('bodyFont') as HTMLSelectElement).value,
      };
      await fetch(`/api/projects/${projectId}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ theme }) });
    }, 300);
  });
</script>
```

- [ ] **Step 2: Project view page**

```astro
---
import Layout from '../../../layouts/Layout.astro';
import ThemeEditor from '../../../components/editor/ThemeEditor.astro';
import { env } from 'cloudflare:workers';
import { DB } from '../../../lib/db';

export const prerender = false;

const { projectId } = Astro.params;
const db = new DB(env.DB);
const project = await db.getProject(projectId!);
if (!project) return Astro.redirect('/projects');
const pages = await db.listPages(project.id);
---
<Layout>
  <main style="max-width: 1100px; margin: 2rem auto; padding: 1rem;">
    <p><a href="/projects">← Tous les projets</a></p>
    <h1>{project.name}</h1>

    <h2>Thème</h2>
    <ThemeEditor project={project} />

    <h2 style="margin-top:2rem;">Pages</h2>
    <p><a href={`/projects/${project.id}/pages/new`}><button>+ Nouvelle page</button></a></p>

    {pages.length === 0 && <p>Aucune page.</p>}
    <ul style="list-style:none; padding:0;">
      {pages.map((p) => (
        <li style="border:1px solid #ddd; padding:1rem; margin:0.5rem 0; display:flex; justify-content:space-between; align-items:center;">
          <span><strong>{p.name}</strong> <code>/{p.slug}</code></span>
          <span>
            <a href={`/projects/${project.id}/pages/${p.id}/edit`}><button>Éditer</button></a>
            <button data-action="rename" data-id={p.id}>Renommer</button>
            <button data-action="delete" data-id={p.id}>Supprimer</button>
          </span>
        </li>
      ))}
    </ul>
  </main>

  <script>
    const projectId = location.pathname.split('/')[2];
    document.querySelectorAll('button[data-action="delete"]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Supprimer cette page ?')) return;
        const id = (btn as HTMLElement).dataset.id;
        await fetch(`/api/projects/${projectId}/pages/${id}`, { method: 'DELETE' });
        location.reload();
      });
    });
    document.querySelectorAll('button[data-action="rename"]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = (btn as HTMLElement).dataset.id;
        const name = prompt('Nouveau nom ?');
        if (!name) return;
        await fetch(`/api/projects/${projectId}/pages/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name }) });
        location.reload();
      });
    });
  </script>
</Layout>
```

- [ ] **Step 3: Manually verify**

`npm run dev`. From `/projects` create a project, open it, change a color → confirm via curl that theme persisted: `curl http://localhost:4321/api/projects/<id>`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/projects/ src/components/editor/ThemeEditor.astro
git commit -m "feat: project view with theme editor and page list"
```

---

### Task 10: Schema-driven editor

**Files:**
- Create: `src/pages/projects/[projectId]/pages/[pageId]/edit.astro`
- Create: `src/components/editor/SectionPanel.astro`
- Modify: `src/layouts/Layout.astro` (add optional `theme` prop)

- [ ] **Step 1: Patch `src/layouts/Layout.astro` to accept a `theme` prop**

Add to the frontmatter of `src/layouts/Layout.astro` (do not remove anything):

```ts
interface Props {
  title?: string;
  theme?: { primary: string; secondary: string; headerFont: string; bodyFont: string };
}
const { theme } = Astro.props;
const themeStyle = theme
  ? `--primary:${theme.primary};--secondary:${theme.secondary};--headerFont:'${theme.headerFont}';--bodyFont:'${theme.bodyFont}';`
  : '';
```

Then add `style={themeStyle}` to the existing top-level `<html>` (or `<body>`) tag. Verify the existing CSS variables in Layout.astro use the same names; if not, alias to whatever names the file already declares.

- [ ] **Step 2: SectionPanel component**

```astro
---
import type { LayoutSchema } from '../../schemas/types';
interface Props {
  section: { id: string; layoutId: string; content: Record<string, string> };
  schema: LayoutSchema;
}
const { section, schema } = Astro.props;
---
<aside class="lunora-edit-panel" data-section-id={section.id}>
  <h3>{schema.label}</h3>
  {Object.entries(schema.fields).map(([key, field]) => (
    <label style="display:block; margin:0.5rem 0;">
      <span>{field.label}</span>
      {field.multiline
        ? <textarea data-field={key} rows="3">{section.content[key] ?? field.default}</textarea>
        : <input data-field={key} type="text" value={section.content[key] ?? field.default} />}
    </label>
  ))}
</aside>

<style>
  .lunora-edit-panel { padding: 1rem; border:1px solid #ddd; background:#fafafa; }
  .lunora-edit-panel input, .lunora-edit-panel textarea { width:100%; padding:0.4rem; }
</style>
```

- [ ] **Step 3: Editor page**

```astro
---
import Layout from '../../../../../layouts/Layout.astro';
import SectionPanel from '../../../../../components/editor/SectionPanel.astro';
import { env } from 'cloudflare:workers';
import { DB } from '../../../../../lib/db';
import { getSchema } from '../../../../../schemas/registry';
import { getComponent } from '../../../../../components/library/registry';

export const prerender = false;

const { projectId, pageId } = Astro.params;
const db = new DB(env.DB);
const project = await db.getProject(projectId!);
const page = await db.getPage(pageId!);
if (!project || !page) return Astro.redirect('/projects');
const sections = await db.listSections(page.id);

const renderable = sections.map((s) => ({
  section: s,
  schema: getSchema(s.layoutId),
  Component: getComponent(s.layoutId),
}));
---
<Layout theme={project.theme}>
  <div style="display:grid; grid-template-columns: 1fr 360px; min-height:100vh;">
    <main id="preview">
      {renderable.map(({ section, Component }) => (
        Component
          ? <div class="lunora-section" data-section-id={section.id}>
              <Component content={section.content} />
            </div>
          : <div style="padding:1rem; background:#fee;">Layout inconnu : {section.layoutId}</div>
      ))}
    </main>
    <aside id="editor" style="border-left:1px solid #ddd; padding:1rem; position:sticky; top:0; height:100vh; overflow:auto;">
      <p><a href={`/projects/${project.id}`}>← Retour au projet</a></p>
      <h2>{page.name}</h2>
      <button id="save-btn" style="padding:0.75rem 1.5rem;">Sauvegarder</button>
      <span id="dirty-indicator" hidden style="color:#c00; margin-left:0.5rem;">●  modifications non sauvegardées</span>
      <hr />
      {renderable.map(({ section, schema }) => (
        schema
          ? <SectionPanel section={section} schema={schema} />
          : <div>Section sans schema (non éditable)</div>
      ))}
    </aside>
  </div>

  <script>
    const projectId = location.pathname.split('/')[2];
    const pageId = location.pathname.split('/')[4];
    let dirty = false;
    const dirtyEl = document.getElementById('dirty-indicator')!;
    const setDirty = (v: boolean) => { dirty = v; dirtyEl.hidden = !v; };

    function collect() {
      const updates: Array<{ id: string; content: Record<string, string> }> = [];
      document.querySelectorAll<HTMLElement>('.lunora-edit-panel').forEach((panel) => {
        const id = panel.dataset.sectionId!;
        const content: Record<string, string> = {};
        panel.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-field]').forEach((el) => {
          content[el.dataset.field!] = el.value;
        });
        updates.push({ id, content });
      });
      return updates;
    }

    function applyToPreview(sectionId: string, field: string, value: string) {
      const sec = document.querySelector(`.lunora-section[data-section-id="${sectionId}"]`);
      if (!sec) return;
      // POC live update: replace by data-field if the component marks editable nodes.
      // For Hero1 with title/subtitle/ctaText we re-query naively:
      const map: Record<string, string> = { title: 'h1', subtitle: 'p', ctaText: '.cs-button' };
      const sel = map[field];
      if (sel) { const el = sec.querySelector(sel); if (el) el.textContent = value; }
    }

    document.querySelectorAll<HTMLElement>('.lunora-edit-panel').forEach((panel) => {
      const id = panel.dataset.sectionId!;
      panel.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-field]').forEach((el) => {
        el.addEventListener('input', () => {
          setDirty(true);
          applyToPreview(id, el.dataset.field!, el.value);
        });
      });
    });

    document.getElementById('save-btn')!.addEventListener('click', async () => {
      const res = await fetch(`/api/projects/${projectId}/pages/${pageId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sections: collect() }),
      });
      if (res.ok) setDirty(false); else alert('Erreur de sauvegarde');
    });

    window.addEventListener('beforeunload', (e) => {
      if (dirty) { e.preventDefault(); e.returnValue = ''; }
    });
  </script>
</Layout>
```

- [ ] **Step 4: End-to-end verification**

`npm run dev`. Walk this flow in the browser:
1. `/projects` → create project "Demo"
2. `/projects/<id>` → change primary color, confirm theme persists on reload
3. Click "+ Nouvelle page", name it "Home", pick "Hero — centered (1)" twice, submit
4. Editor opens — preview shows two hero sections, panel shows two edit blocks
5. Edit title/subtitle of first hero → preview updates live, dirty indicator appears
6. Click "Sauvegarder" → indicator clears
7. Reload → edits persisted
8. Close tab while dirty → browser confirms beforeunload

- [ ] **Step 5: Commit**

```bash
git add src/pages/projects/ src/components/editor/ src/layouts/Layout.astro
git commit -m "feat: schema-driven editor (POC) with save + dirty state"
```

---

## Verification (end-to-end)

After all tasks land, run the full flow above (Task 10 Step 4). Plus check:

- `npm run build` succeeds without TypeScript errors.
- `npm run preview` (uses wrangler under the hood) serves the same flow against local D1.
- D1 inspection: `npx wrangler d1 execute lunora-stitch-dev --local --command="SELECT id, name FROM projects;"` shows your test rows.
- Old routes still resolve: `/templateBuilder` and `/editor` open as before (no D1 calls).

---

## Out of POC scope (V1.1 plan)

Track these in a follow-up plan once POC pattern is validated:
- Migrate 4 remaining layouts: 1 nav, 1 services, 1 footer, 1 quotes (user chose quotes as "about" substitute). Each = one schema file + one props-driven component + one entry in both registries.
- Add field types: `image` (upload to R2 via `/api/uploads`), `internal-link` (dropdown of project pages), `list` (array of sub-objects with add/remove).
- TemplateBuilder: show non-schema layouts greyed out with tooltip.
- Editor: "Add a layout at the end" mini-builder, beforeunload polish.
- Exports: `/api/projects/[id]/export-md` (Markdown dump), `/api/projects/[id]/export-html` (ZIP via jszip).
- Deploy: wire `wrangler.jsonc` remote D1, push, configure Cloudflare Access.
