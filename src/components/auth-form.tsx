"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function AuthForm({
    mode,
}: {
    mode: "login" | "signup"
}) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [message, setMessage] = useState("")

    async function handleAuth() {
        setMessage("Processing...")

        if (mode === "signup") {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            })

            if (error) {
                setMessage(error.message)
                return
            }

            if (data.user) {
                await supabase.from("users").insert({
                    id: data.user.id,
                    email: data.user.email,
                    role: "user",
                })
            }

            setMessage("Signup successful. Check email.")
        }

        if (mode === "login") {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) setMessage(error.message)
            else setMessage("Login successful ✅")
        }
    }

    return (
        <Card className="w-[400px]">
            <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">
                    {mode === "login" ? "Login" : "Sign Up"}
                </h2>

                <Input
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <Input
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <Button className="w-full" onClick={handleAuth}>
                    {mode === "login" ? "Login" : "Create Account"}
                </Button>

                <div className="text-sm text-slate-600">
                    {message}
                </div>
            </CardContent>
        </Card>
    )
}