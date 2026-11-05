import { Router } from "express";
import {
  registerVessel,
  getAllVessels,
  getVesselById,
  updateVessel,
  updateVesselStatus,
  deactivateVessel,
} from "../controllers/vessel.controller.js";

const router = Router();

// POST http://localhost:4000/api/v1/vessels/register
router.post("/register", registerVessel);

// GET http://localhost:4000/api/v1/vessels   (optional: ?companyId=...)
router.get("/", getAllVessels);

// GET http://localhost:4000/api/v1/vessels/:id
router.get("/:id", getVesselById);

// PATCH http://localhost:4000/api/v1/vessels/:id
router.patch("/:id", updateVessel);

// PATCH http://localhost:4000/api/v1/vessels/:id/status
router.patch("/:id/status", updateVesselStatus);

// PATCH http://localhost:4000/api/v1/vessels/:id/deactivate
router.patch("/:id/deactivate", deactivateVessel);

export default router;