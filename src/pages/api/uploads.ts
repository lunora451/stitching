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
  if (!file.type.startsWith('image/')) {
    return new Response(JSON.stringify({ error: 'only image/* accepted' }), { status: 400 });
  }
  const url = await putImage(env.IMAGES, file);
  return new Response(JSON.stringify({ url }), { headers: { 'content-type': 'application/json' } });
};
