/** Ambiant pour l’IDE / tsc — le déploiement utilise toujours le runtime Deno Supabase. */

export {};

declare global {
  const Deno: {
    env: { get(key: string): string | undefined };
    serve: (
      handler: (request: Request) => Response | Promise<Response>,
    ) => void;
  };
}
