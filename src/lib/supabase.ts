import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const URL = import.meta.env.PUBLIC_SUPABASE_URL;
const ANON = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!URL || !ANON) {
  throw new Error(
    "Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY — copy them to web/.env.local"
  );
}

export const supabase = createClient<Database>(URL, ANON, {
  auth: { persistSession: false, autoRefreshToken: false },
});
