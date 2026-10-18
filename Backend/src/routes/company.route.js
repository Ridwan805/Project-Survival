import { Router } from "express";
import {
  registerCompany,
  reviewCompany,
  getCompanies,
} from "../controllers/company.controller.js";

const router = Router();

// POST http://localhost:4000/api/v1/companies/register
router.post("/register", registerCompany);

// PATCH http://localhost:4000/api/v1/companies/:id/review
router.patch("/:id/review", reviewCompany);

// GET http://localhost:4000/api/v1/companies
router.get("/", getCompanies);

export default router;
