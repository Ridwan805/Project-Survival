import { Router } from "express";
import {
  registerVesselType,
  getAllVesselTypes,
} from "../controllers/vessel_type.controller.js";

const router = Router();

// POST http://localhost:4000/api/v1/vessel-types/register
router.post("/register", registerVesselType);

// GET http://localhost:4000/api/v1/vessel-types
router.get("/", getAllVesselTypes);

export default router;