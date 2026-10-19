import Company from "../models/company.model.js";

// Register a new company (Status starts as PENDING)
export const registerCompany = async (req, res) => {
  try {
    const { 
        name, 
        registrationNo, 
        country } = req.body;

    if (!name || !registrationNo || !country) {
      return res.status(400).json({ message: "Name, registrationNo, and country are required." });
    }

    const existingCompany = await Company.findOne({
      $or: [{ registrationNo }, { name }],
    });
    if (existingCompany) {
      return res.status(400).json({ message: "Company with this registration number or name already exists." });
    }

    const company = await Company.create({
      name,
      registrationNo,
      country,
      status: "PENDING",
    });

    return res.status(201).json({
      message: "Company registered successfully. Pending approval.",
      company,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Fleet Admin approves or rejects a company
export const reviewCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason, reviewedBy } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Status must be either APPROVED or REJECTED." });
    }

    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }

    company.status = status;
    company.reviewedBy = reviewedBy || null;
    company.reviewedAt = new Date();
    if (status === "REJECTED") {
      company.rejectionReason = rejectionReason || "No reason specified";
    }

    await company.save();

    return res.status(200).json({
      message: `Company ${status.toLowerCase()} successfully.`,
      company,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Get list of all companies
export const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
    return res.status(200).json(companies);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
