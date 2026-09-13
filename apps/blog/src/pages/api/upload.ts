import type { APIRoute } from 'astro';
import { verifyAccessJWT } from '../../lib/auth';
import { uploadImageToStorage } from '../../lib/storage';
import { getRuntimeEnv } from '../../lib/env';

export const POST: APIRoute = async ({ request, locals }) => {
  const env = getRuntimeEnv(locals);

  // 1. Authenticate Request
  const user = await verifyAccessJWT(request, env);
  if (!user) {
    return new Response(JSON.stringify({ success: 0, error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return new Response(JSON.stringify({ success: 0, error: 'No image file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { url } = await uploadImageToStorage(file, env);

    return new Response(
      JSON.stringify({
        success: 1,
        file: {
          url,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: 0,
        error: error.message || 'Image upload failed',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
