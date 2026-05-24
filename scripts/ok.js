#!/usr/bin/env node

import { spawn } from "node:child_process";

const commands = [
  { name: "format", command: "pnpm", args: ["run", "format"] },
  { name: "lint", command: "pnpm", args: ["run", "lint"] },
  { name: "test", command: "pnpm", args: ["run", "test"] },
  { name: "typecheck", command: "pnpm", args: ["run", "typecheck"] },
  { name: "build", command: "pnpm", args: ["run", "build"] },
];

function runCommand({ name, command, args }) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      if (code === 0) {
        console.log(`✓ ${name}`);
        resolve();
        return;
      }

      console.error(`\n✗ ${name} failed with exit code ${code}\n`);

      if (stdout.trim()) {
        console.error("stdout:");
        console.error(stdout);
      }

      if (stderr.trim()) {
        console.error("stderr:");
        console.error(stderr);
      }

      reject(new Error(`${name} failed`));
    });

    child.on("error", reject);
  });
}

try {
  for (const command of commands) {
    await runCommand(command);
  }

  console.log("\n✓ all checks passed");
} catch {
  process.exit(1);
}
