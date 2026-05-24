import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { DB } from '../../../../lib/db';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const db = new DB(env.DB);
  const project = await db.getProject(params.id!);
  if (!project) return new Response('not found', { status: 404 });
  const pages = await db.listPages(project.id);
  const sectionsByPage = new Map<string, Awaited<ReturnType<typeof db.listSections>>>();
  for (const p of pages) sectionsByPage.set(p.id, await db.listSections(p.id));

  const lines: string[] = [];
  lines.push(`# Projet : ${project.name}`, '');
  lines.push('## Thème', '');
  lines.push('### Couleurs racine');
  for (const [k, v] of Object.entries(project.theme.rootColors)) lines.push(`- \`${k}\` : ${v}`);
  if (project.theme.customVars.length) {
    lines.push('', '### Variables personnalisées');
    for (const cv of project.theme.customVars) lines.push(`- \`${cv.name}\` : ${cv.hex}`);
  }
  lines.push('', '### Polices');
  for (const [k, v] of Object.entries(project.theme.rootFonts)) lines.push(`- \`${k}\` : ${v}`);

  lines.push('', '## Pages', '');
  for (const p of pages) {
    lines.push(`### ${p.name} (slug: \`${p.slug}\`)`);
    const sections = sectionsByPage.get(p.id)!;
    sections.forEach((s, i) => lines.push(`${i + 1}. \`${s.layoutId}\``));
    lines.push('');
  }

  lines.push('---', '', '## Annexe JSON', '', '```json');
  lines.push(JSON.stringify({ project, pages: pages.map((p) => ({ ...p, sections: sectionsByPage.get(p.id) })) }, null, 2));
  lines.push('```');

  const body = lines.join('\n');
  return new Response(body, {
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      'content-disposition': `attachment; filename="${project.name.replace(/[^a-z0-9-]+/gi, '_')}.md"`,
    },
  });
};
