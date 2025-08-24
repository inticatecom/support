// Resources
import { Router } from "express";

// Variables
const router = Router();

router.get("/session", (req, res) => {
  const sessionCookie = req.headers.cookie
    ?.split(";")
    .find((c) => c.trim().startsWith("connect.sid="));

  return res.send(!!sessionCookie);
});

router.get("/agents", (_, res) => {
  return res.send(1);
});

export default router;
