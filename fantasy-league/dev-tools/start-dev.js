const { spawn } = require("child_process");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const isWindows = process.platform === "win32";

function run(command, args, label) {
  const child = spawn(command, args, {
    cwd: rootDir,
    stdio: "inherit",
    shell: isWindows
  });

  child.on("exit", (code) => {
    if (code !== 0) {
      console.error(`${label} exited with code ${code}`);
    }
  });

  return child;
}

const server = run("node", ["server/server.js"], "API server");
const client = run("npx", ["react-scripts", "start"], "React app");

function shutdown() {
  if (!server.killed) {
    server.kill();
  }

  if (!client.killed) {
    client.kill();
  }
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
