import { Router } from "express";
import {
  registerCompanyManager,
  loginCompanyManager,
  getAllCompanyManagers,
} from "../controllers/company_manager.controller.js";

const router = Router();

// POST http://localhost:4000/api/v1/company-managers/register
router.post("/register", registerCompanyManager);

// POST http://localhost:4000/api/v1/company-managers/login
router.post("/login", loginCompanyManager);

// GET http://localhost:4000/api/v1/company-managers
router.get("/", getAllCompanyManagers);

export default router;