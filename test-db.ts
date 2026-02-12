import { neon } from "@neondatabase/serverless";


const DATABASE_URL = process.env.DATABASE_URL;

async function testConnection() {
    if (!DATABASE_URL) {
        console.error("DATABASE_URL is not set");
        return;
    }
    const sql = neon(DATABASE_URL);
    try {
        const result = await sql`SELECT 1 as test`;
        console.log("Connection successful:", result);
    } catch (error) {
        console.error("Connection failed:", error);
    }
}

testConnection();
