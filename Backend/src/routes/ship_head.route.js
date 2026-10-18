import { Router } from "express";
import { registerUser, getAllShipHeads, deleteShipHead  } from "../controllers/ship_head.controller.js";

const router = Router();

// POST http://localhost:4000/api/v1/ship-heads/register
router.post("/register", registerUser);

// GET http://localhost:4000/api/v1/ship-heads
router.get("/", getAllShipHeads);

// DELETE http://localhost:4000/api/v1/ship-heads/:id
router.delete("/:id", deleteShipHead);

export default router;
