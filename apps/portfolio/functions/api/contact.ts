/* For more details, see docs/portfolio/implementation-notes.md#functions-api-contact-ts-note-1. */

interface Env {
  MAILER?: { fetch(request: Request): Promise<Response> };
}

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  try {
    if (!env.MAILER) throw new Error("MAILER binding missing");
    return await env.MAILER.fetch(request);
  } catch {
    return Response.json(
      { success: false, error: "Mail service unavailable" },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
};
