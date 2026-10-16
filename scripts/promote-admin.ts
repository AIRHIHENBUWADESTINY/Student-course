// Promotes a registered user to the "admin" role so they can open /admin.
//
// The role change is a server-only operation, so this script needs the
// Supabase service role key (Project Settings > API > service_role). Never
// expose that key to the browser.
//
// Usage:
//   node scripts/promote-admin.ts you@example.com
//   node scripts/promote-admin.ts --id 00000000-0000-0000-0000-000000000000
//
// Values are read from the environment or from .env.local, so a normal
//   node scripts/promote-admin.ts you@example.com
// works when .env.local already contains SUPABASE_SERVICE_ROLE_KEY.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile(file: string): void {
  let raw: string;
  try {
    raw = readFileSync(file, "utf8");
  } catch {
    return;
  }
  for (const line of raw.split(/\r?\n/)) {
    const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/.exec(line);
    if (!match) continue;
    const key = match[1];
    let value = match[2];
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
loadEnvFile(path.join(scriptDir, "..", ".env.local"));
loadEnvFile(path.join(scriptDir, "..", ".env"));

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

function fail(message: string): never {
  console.error(`\n[promote-admin] ${message}\n`);
  process.exit(1);
}

const args = process.argv.slice(2);
const idIndex = args.indexOf("--id");
let userId = idIndex !== -1 ? args[idIndex + 1] : "";
let email = "";

if (!userId) {
  const positional = args.find((arg) => !arg.startsWith("--"));
  if (positional && positional.includes("@")) {
    email = positional;
  } else if (positional) {
    userId = positional;
  }
}

if (!userId && !email) {
  fail(
    "Provide an email or user id.\n  Usage: node scripts/promote-admin.ts you@example.com"
  );
}

if (!url) {
  fail(
    "Missing NEXT_PUBLIC_SUPABASE_URL. Add it to .env.local or the environment."
  );
}

if (!serviceKey) {
  fail(
    "Missing SUPABASE_SERVICE_ROLE_KEY. Add the service role key to .env.local " +
      "(Project Settings > API) and re-run."
  );
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function findUserIdByEmail(target: string): Promise<string> {
  const perPage = 200;
  for (let page = 1; page <= 50; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error) fail(`Could not list users: ${error.message}`);
    const match = data.users.find(
      (user) => user.email?.toLowerCase() === target.toLowerCase()
    );
    if (match) return match.id;
    if (data.users.length < perPage) break;
  }
  fail(`No user found with email "${target}". Sign the user up first.`);
}

async function main(): Promise<void> {
  if (!userId) {
    userId = await findUserIdByEmail(email);
  }

  const { data: userData, error: userError } =
    await supabase.auth.admin.getUserById(userId);
  if (userError || !userData.user) {
    fail(`Could not find user "${userId}": ${userError?.message ?? "unknown"}`);
  }

  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, role: "admin" }, { onConflict: "id" });
  if (error) fail(`Could not promote the user: ${error.message}`);

  console.log(
    `\n[promote-admin] Done. ${userData.user.email ?? userId} is now an admin.` +
      "\nSign out and back in (or refresh) to see the Admin dashboard.\n"
  );
}

void main();
