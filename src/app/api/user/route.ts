import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Get profile data if exists
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("name, avatar_url")
    .eq("id", user.id)
    .single();

  // Return only relevant data
  return NextResponse.json({
    id: user.id,
    email: user.email,
    name: profile?.name ?? user.email?.split("@")[0],
    avatarUrl: profile?.avatar_url ?? null,
  });
}
