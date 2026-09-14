export async function uploadImageToStorage(
  file: File,
  env?: Env
): Promise<{ url: string }> {
  const extension = file.name.split('.').pop() || 'png';
  const key = `uploads/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  if (env?.BUCKET) {
    await env.BUCKET.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type || 'application/octet-stream',
      },
    });

    const publicDomain = env.R2_PUBLIC_DOMAIN || '/api/media';
    const baseUrl = publicDomain.endsWith('/') ? publicDomain.slice(0, -1) : publicDomain;
    return { url: `${baseUrl}/${key}` };
  }

  // Fallback for local development when R2 bucket is not bound
  const buffer = await file.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const mimeType = file.type || 'image/png';
  return { url: `data:${mimeType};base64,${base64}` };
}
