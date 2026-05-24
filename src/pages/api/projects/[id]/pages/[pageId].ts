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
