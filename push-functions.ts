import { db } from "@/server/db";
import { sql } from "drizzle-orm";
import fs from "fs";

export async function pushFunction(code: string) {
  await db.execute(sql.raw(code));
}

export async function getFunctions() {
  // read all functions from db_functions/*.sql
  const files = fs.readdirSync("db_functions");
  const functions = files.map((file) => {
    const code = fs.readFileSync(`db_functions/${file}`, "utf-8");
    return { name: file.split(".")[0], code };
  });
  return functions;
}

export async function main() {
  const functions = await getFunctions();
  console.log(` -> Found ${functions.length} functions`);
  for (const func of functions) {
    console.log(` -> Pushing function ${func.name}`);
    await pushFunction(func.code);
    console.log(` -> Done pushing function ${func.name}`);
  }
  console.log(` -> Done pushing all functions`);
}
await main();
process.exit(); // tsx hangs for some reason