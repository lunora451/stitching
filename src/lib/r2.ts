import { uuid } from './ids';

const PUBLIC_BASE = '/r2';

export async function putImage(bucket: any, file: File): Promise<string> {
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
  const key = `images/${uuid()}.${ext}`;
  await bucket.put(key, file.stream(), {
    httpMetadata: { contentType: file.type || 'application/octet-stream' },
  });
  return `${PUBLIC_BASE}/${key}`;
}
