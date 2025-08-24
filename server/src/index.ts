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

// Schema
import structure from "./structure";

dotenv.config(); // Make sure environment variables are fully loaded before continuing.

// Variables
const app = express();
const client = createClient({
  url: String(process.env.REDIS_CONNECTION_URL),
});

await (async () => {
  await client.connect(); // Connect to Redis instance.
  debug.info("Connected to Redis instance.");
  await structure(); // Construct schema.
  debug.info("Constructed schema and pushed to Redis instance.");

  // Create middleware structure for Express Session.
  const sessionMiddleware = session({
    store: new RedisStore({ client, prefix: "session:" }),
    secret: String(process.env.SECRET),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: String(process.env.ENVIRONMENT) === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  });

  // Define CORS options.
  const corsOptions = {
    origin: String(process.env.FRONTEND_URL),
    methods: ["GET", "POST", "PUT", "PATCH"],
    credentials: true,
  };

  // Connect middlewares to Express.
  app.use(cors(corsOptions));
  app.use(cookieParser());

  app.get("/session-exists", (req, res) => {
    const sessionCookie = req.headers.cookie
      ?.split(";")
      .find((c) => c.trim().startsWith("connect.sid="));

    return res.send(!!sessionCookie);
  });

  app.use(sessionMiddleware);

  const { io, server } = socket(app, corsOptions); // Create socket.

  io.engine.use(sessionMiddleware);

  // Start server on port found in environment variables.
  server.listen(process.env.PORT, () => {
    debug.success(
      `Started HTTP instances on port ${String(process.env.PORT)}.`
    );
  });
})();

export { app, client }; // Export Express router and Redis instance for use in other files.
