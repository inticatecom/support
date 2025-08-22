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

// Types
import { Request, Response } from "express";
import { NextFunction } from "express-serve-static-core";

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
  const middleware = session({
    store: new RedisStore({ client, prefix: "session:" }),
    secret: String(process.env.SECRET),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // TODO: Change in production.
      sameSite: false,
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
    },
  });

  // Define CORS options.
  const corsOptions = {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "PATCH"],
    credentials: true,
  };

  // Connect middlewares to Express.
  app.use(cors(corsOptions));
  app.use(cookieParser());
  app.use(middleware);

  // Create route to fetch session ID.
  app.get("/session", (req, res) => {
    if (!req.session) return res.status(404).send("No active session.");
    return res.send(req.session.id);
  });

  const { io, server } = socket(app, corsOptions); // Create socket.

  // Apply session middleware to socket.
  io.use((socket, next) =>
    middleware(
      socket.request as unknown as Request,
      {} as Response,
      next as NextFunction
    )
  );

  // Start server on port found in environment variables.
  server.listen(process.env.PORT, () => {
    debug.success(
      `Started HTTP instances on port ${String(process.env.PORT)}.`
    );
  });
})();

export { app, client }; // Export Express router and Redis instance for use in other files.
