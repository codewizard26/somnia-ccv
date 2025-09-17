import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { user, amount, txHash } = body;

        if (!user || !amount || !txHash) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // Note: table name is intentionally "withdrawl" per provided DB setup
        await sql`
      INSERT INTO withdrawl (user_address, amount, tx_hash)
      VALUES (${user}, ${amount}, ${txHash})
    `;

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error("DB Insert Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


