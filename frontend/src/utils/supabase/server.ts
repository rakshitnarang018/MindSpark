import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Admin client (server only)
export function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],      // Admin client doesn't use cookies
        setAll: () => {},      // So dummy functions are fine
      },
    }
  );
}

// Regular client for user operations
export async function createClient() {
  const cookieStore = await cookies(); // FIXED: Added await

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () =>
          cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore if called from a Server Component
          }
        },
      },
    }
  );
}