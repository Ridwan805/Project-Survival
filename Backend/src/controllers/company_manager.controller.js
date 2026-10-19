import bcrypt from "bcrypt";
import mongoose from "mongoose";
import CompanyManager from "../models/companymanager.model.js";
import Company from "../models/company.model.js";

// Register a new Company Manager for an already registered company
export const registerCompanyManager = async (req, res) => {
  try {
    const { email, password, companyId } = req.body;

    // 1. Check all required fields are present
    if (!email || !password || !companyId) {
      return res.status(400).json({
        message: "You must provide: email, password, and companyId.",
      });
    }

    // 2. email and password must be text
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "email and password must be text." });
    }

    // 3. Password length check
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }

    // 4. companyId must look like a valid MongoDB id
    if (!mongoose.isValidObjectId(companyId)) {
      return res.status(400).json({ message: "companyId is not a valid id." });
    }

    // 5. Verify the company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }

    // 6. One company can only have one manager (1-to-1)
    const existingManager = await CompanyManager.findOne({ companyId });
    if (existingManager) {
      return res.status(400).json({ message: "This company already has a manager." });
    }

    // 7. Check for duplicate email
    const emailTaken = await CompanyManager.findOne({ email: email.toLowerCase() });
    if (emailTaken) {
      return res.status(400).json({ message: "A manager with this email already exists." });
    }

    // 8. Hash the password (never store the real password)
    const passwordHash = await bcrypt.hash(password, 10);

    // 9. Create the new Company Manager
    const new_manager = await CompanyManager.create({
      email: email.toLowerCase(),
      passwordHash,
      companyId,
    });

    return res.status(201).json({
      message: "Company Manager successfully created",
      manager: {
        id: new_manager._id,
        email: new_manager.email,
        companyId: new_manager.companyId,
        accountStatus: new_manager.accountStatus,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Company Manager login (returns the company status so the frontend can show a waiting screen)
export const loginCompanyManager = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check all required fields are present
    if (!email || !password) {
      return res.status(400).json({ message: "You must provide: email and password." });
    }

    // 2. email and password must be text
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "email and password must be text." });
    }

    // 3. Find the manager by email
    const manager = await CompanyManager.findOne({ email: email.toLowerCase() });
    if (!manager) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // 4. Compare the typed password with the saved hash
    const isMatch = await bcrypt.compare(password, manager.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // 5. Disabled accounts cannot log in
    if (manager.accountStatus !== "ACTIVE") {
      return res.status(403).json({ message: "This account is disabled." });
    }

    // 6. Get the company this manager belongs to
    const company = await Company.findById(manager.companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }

    // 7. Message for the frontend (a PENDING company only sees a waiting screen)
    const statusMessages = {
      PENDING: "Your company is waiting for approval by the Fleet Administrator.",
      APPROVED: "Your company is approved.",
      REJECTED: "Your company registration was rejected.",
      SUSPENDED: "Your company is suspended.",
    };

    return res.status(200).json({
      message: "Login successful.",
      manager: {
        id: manager._id,
        email: manager.email,
        companyId: manager.companyId,
      },
      company: {
        id: company._id,
        name: company.name,
        status: company.status,
        statusMessage: statusMessages[company.status],
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Get list of all Company Managers (password hash is never returned)
export const getAllCompanyManagers = async (req, res) => {
  try {
    const managers = await CompanyManager.find().select("-passwordHash");
    return res.status(200).json(managers);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};