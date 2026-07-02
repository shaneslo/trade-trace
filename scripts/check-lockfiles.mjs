import { existsSync } from "node:fs";
import { join } from "node:path";

const disallowedLockfiles = ["pnpm-lock.yaml", "bun.lock"];
const found = disallowedLockfiles.filter((file) => existsSync(join(process.cwd(), file)));

if (found.length > 0) {
  console.error(
    `This repo uses npm/package-lock.json only. Remove stray lockfile(s): ${found.join(", ")}`,
  );
  process.exit(1);
}
