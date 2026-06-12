import postgres from "postgres";

const urls = [
  "postgresql://postgres.qndtqqrmupalxwhjbxuf:Yh4ATQGetSRDdInJuKXv9MfF@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require",
  "postgresql://postgres.qndtqqrmupalxwhjbxuf:Yh4ATQGetSRDdInJuKXv9MfF@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require",
];

for (const url of urls) {
  try {
    const sql = postgres(url, { connect_timeout: 30, ssl: "require" });
    const result = await sql`SELECT version()`;
    console.log("OK:", url.includes(":6543") ? "pooler-6543" : "pooler-5432");
    console.log(result[0].version);
    await sql.end();
    process.exit(0);
  } catch (e) {
    console.log("FAIL:", url.includes(":6543") ? "pooler-6543" : "pooler-5432", e.message);
  }
}
process.exit(1);
