import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { putImage } from '../../lib/r2';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return new Response(JSON.stringify({ error: 'file required (multipart field "file")' }), { status: 400 });
  }
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
  if (!ALLOWED_TYPES.includes(file.type)) {
    return new Response(JSON.stringify({ error: 'only jpeg/png/gif/webp/avif accepted' }), { status: 400 });
  }
  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
  if (file.size > MAX_SIZE) {
    return new Response(JSON.stringify({ error: 'file exceeds 10 MB limit' }), { status: 413 });
  }
  const url = await putImage(env.IMAGES_BUCKET, file);
  return new Response(JSON.stringify({ url }), { headers: { 'content-type': 'application/json' } });
};
