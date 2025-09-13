import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const user = searchParams.get('user');

        let query;
        if (user) {
            // Get deposits for a specific user
            query = sql`
                SELECT * FROM deposits 
                WHERE user_address = ${user}
                ORDER BY created_at DESC
            `;
        } else {
            // Get all deposits
            query = sql`
                SELECT * FROM deposits 
                ORDER BY created_at DESC
            `;
        }

        const deposits = await query;

        return NextResponse.json({ success: true, deposits });
    } catch (error: any) {
        console.error("DB Query Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
