// Resources
import { Router } from "express";

// Variables
const router = Router();

router.get("/test", (req, res) => {
  console.log(req.sessionID);
  return res.send("cool thing!");
});

export default router;
