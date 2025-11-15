
const { execSync } = require("child_process");
const net = require("net");

function waitForPostgres({
  host = "localhost",
  port = 5433,
  retries = 30,
  delayMs = 1000
} = {}) {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    function tryOnce() {
      attempts += 1;
      const socket = net.createConnection({ host, port }, () => {
        socket.end();
        console.log(`✅ Postgres is reachable on ${host}:${port}`);
        resolve();
      });

      socket.on("error", (err) => {
        socket.destroy();
        if (attempts >= retries) {
          console.error("❌ Postgres did not become ready in time.");
          reject(err);
          return;
        }
        console.log(
          `⏳ Waiting for Postgres... (attempt ${attempts}/${retries})`
        );
        setTimeout(tryOnce, delayMs);
      });
    }

    tryOnce();
  });
}

(async () => {
  try {
    console.log("➡️  Starting database (docker compose up -d)...");
    execSync("docker compose up -d", { stdio: "inherit" });

    console.log("⏳ Waiting for Postgres on localhost:5433...");
    await waitForPostgres({ host: "localhost", port: 5433 });

    console.log("➡️  Starting backend in dev mode (ts-node-dev src/index.ts)...");
    execSync("npx ts-node-dev --respawn src/index.ts", { stdio: "inherit" });
  } catch (err) {
    console.error("❌ Failed to start dev server with Docker:", err);
    process.exit(1);
  }
})();

