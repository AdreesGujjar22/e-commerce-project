import { spawn } from "node:child_process";

// Process arguments to support --host by converting it to -H (hostname) for Next.js
const nextArgs = [];

for (let i = 2; i < process.argv.length; i++) {
  const arg = process.argv[i];
  if (arg === "--host") {
    nextArgs.push("-H");
    if (i + 1 < process.argv.length) {
      nextArgs.push(process.argv[++i]);
    }
  } else if (arg.startsWith("--host=")) {
    nextArgs.push("-H");
    nextArgs.push(arg.substring(7));
  } else {
    nextArgs.push(arg);
  }
}

// Enforce port 3000 (which is the only port routed externally by the platform proxy)
if (!nextArgs.includes("-p") && !nextArgs.some((a) => a === "--port")) {
  nextArgs.push("-p", "3000");
}

// Set default host to 0.0.0.0 if neither is specified
if (!nextArgs.includes("-H") && !nextArgs.includes("--hostname")) {
  nextArgs.push("-H", "0.0.0.0");
}

console.log("Starting Next.js Dev Server with filtered args:", ["dev", ...nextArgs]);

const child = spawn("npx", ["next", "dev", ...nextArgs], {
  stdio: "inherit",
  shell: true,
});

child.on("close", (code) => {
  process.exit(code || 0);
});

child.on("error", (err) => {
  console.error("Failed to start child process:", err);
  process.exit(1);
});
