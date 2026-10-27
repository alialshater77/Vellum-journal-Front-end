import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");

const raw = readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8");
const json = raw.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
const config = JSON.parse(json);
const env = { ...process.env };

if (config.vars && typeof config.vars === "object") {
  for (const [key, value] of Object.entries(config.vars)) {
    if (typeof value === "string") env[key] = value;
  }
}

const result = spawnSync(process.execPath, [nextBin, "build"], {
  stdio: "inherit",
  env,
});

process.exit(result.status ?? 1);
