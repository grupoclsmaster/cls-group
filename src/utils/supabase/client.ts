import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase browser client.
 *
 * SSR-safe: returns `null` during server-side rendering / build-time prerender,
 * where browser APIs and NEXT_PUBLIC_ env vars may not be available.
 * All real Supabase calls happen inside useEffect or event handlers,
 * which are client-side only and never run on the server.
 */
export const createClient = () => {
  // During SSR/build-time prerendering, env vars are not embedded yet
  // and window is not defined. Return null to avoid build errors.
  if (typeof window === "undefined") {
    return null as any;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  return createBrowserClient(supabaseUrl, supabaseKey);
};
