// Resources
import express from "express";
import session from "express-session";
import { RedisStore } from "connect-redis";
import { createClient } from "redis";
import dotenv from "dotenv";
import socket from "./socket";
import { debug } from "./lib/Debug";

// Routers
import chat from "./routes/chat";

// Schema
import structure from "./structure";

dotenv.config();

// Variables
const app = express();
const client = createClient({
  url: String(process.env.REDIS_CONNECTION_URL),
});

await (async () => {
  await client.connect();
  debug.info("Connected to Redis instance.");
  await structure();
  debug.info("Constructed schema and pushed to Redis instance.");

  app.use(
    session({
      store: new RedisStore({ client }),
      secret: String(process.env.SECRET),
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use("/chats", chat);

  const { server } = socket(app);
  server.listen(process.env.PORT, () => {
    debug.success(
      `Started HTTP instances on port ${String(process.env.PORT)}.`
    );
  });
})();

export { app, client };
