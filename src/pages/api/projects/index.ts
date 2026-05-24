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
