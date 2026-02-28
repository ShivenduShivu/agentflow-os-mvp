import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { actionId } = body

    if (!actionId) {
      return NextResponse.json(
        { error: "Missing actionId" },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // 🔐 Get logged-in user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { data, error } = await supabase
      .from("workflows")
      .insert({
        action_id: actionId,
        user_id: user.id,   // ✅ secure user binding
        status: "awaiting_approval",
        input: {},
      })
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || "Insert failed" },
        { status: 400 }
      )
    }

    return NextResponse.json(data)

  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    )
  }
}