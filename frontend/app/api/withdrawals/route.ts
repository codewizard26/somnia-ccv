import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const user = searchParams.get('user');

        // Note: table name is intentionally "withdrawl" per provided DB setup
        const withdrawals = await (user
            ? sql`
                SELECT * FROM withdrawl 
                WHERE user_address = ${user}
                ORDER BY created_at DESC
            `
            : sql`
                SELECT * FROM withdrawl 
                ORDER BY created_at DESC
            `
        );

        return NextResponse.json({ success: true, withdrawals });
    } catch (error: unknown) {
        console.error("DB Query Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


