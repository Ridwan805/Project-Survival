// Routes are used to create these pathways like stardew/home/

import Router from "express";
import { registerUser, fetch_users } from "../controllers/ship_head.controller.js";

const router= Router();

router.post("/register", registerUser);
router.get("/register", fetch_users);

export default router;