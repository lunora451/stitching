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
