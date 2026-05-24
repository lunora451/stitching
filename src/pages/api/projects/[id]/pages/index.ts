import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { DB } from '../../../../../lib/db';

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
  const page = await db.createPage(params.id!, name.trim(), layoutIds ?? []);
  return new Response(JSON.stringify(page), { status: 201, headers: { 'content-type': 'application/json' } });
};
