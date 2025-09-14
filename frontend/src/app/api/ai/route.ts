import OpenAI from "openai";
import { NextResponse } from "next/server";
import { VAULT_SYSTEM_PROMPT } from "@/lib/vaultPrompts";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
    try {
        const { question } = await req.json();

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // cheaper & fast
            messages: [
                { role: "system", content: VAULT_SYSTEM_PROMPT },
                { role: "user", content: question },
            ],
        });

        return NextResponse.json({ answer: completion.choices[0].message.content });
    } catch (err) {
        console.error("AI Error:", err);
        return NextResponse.json({ error: "AI Error" }, { status: 500 });
    }
}
