// Resources
import express from "express";
import session from "express-session";
import { RedisStore } from "connect-redis";
import { createClient } from "redis";
import dotenv from "dotenv";
import socket from "./socket";
import { debug } from "./lib/Debug";
import cookieParser from "cookie-parser";
import cors from "cors";

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

  const middleware = session({
    store: new RedisStore({ client }),
    secret: String(process.env.SECRET),
    resave: false,
    saveUninitialized: true, // TODO: Change in future, used to test functionality of session cookie.
    cookie: {
      secure: false, // TODO: Change in production.
      sameSite: false,
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
    },
  });

  const corsOptions = {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "PATCH"],
    credentials: true,
  };

  app.use(middleware, cors(corsOptions));
  app.use(cookieParser());
  app.use("/chats", chat);

  const { io, server } = socket(app, corsOptions);

  io.engine.use(middleware);
  server.listen(process.env.PORT, () => {
    debug.success(
      `Started HTTP instances on port ${String(process.env.PORT)}.`
    );
  });
})();

export { app, client };
