import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { actionId, userId } = body

    if (!actionId || !userId) {
      return NextResponse.json(
        { error: "Missing actionId or userId" },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Create workflow in PENDING state
    const { data, error } = await supabase
      .from("workflows")
      .insert({
        action_id: actionId,
        user_id: userId,
        status: "pending",   // ✅ correct lifecycle start
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