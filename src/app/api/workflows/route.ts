import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
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

  const { data, error } = await supabase
    .from("workflows")
    .insert({
      action_id: actionId,
      user_id: userId,
      status: "pending",
      input: {},
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json(data)
}