import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;

async function listTables() {
    if (!DATABASE_URL) {
        console.error("DATABASE_URL is not set");
        return;
    }
    const sql = neon(DATABASE_URL);
    try {
        const result = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
        console.log("Tables:", result);
    } catch (error) {
        console.error("Failed to list tables:", error);
    }
}

listTables();
