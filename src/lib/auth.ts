import { supabase } from "@/lib/supabase"

export async function getCurrentUserWithRole() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  return {
    id: user.id,
    email: user.email,
    role: profile?.role || "user",
  }
}