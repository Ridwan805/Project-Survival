import { Head, SHIP_HEAD_ROLES } from "../models/ShipHead.model.js";
import Company from "../models/company.model.js";

export const registerUser = async (req, res) => {
  try {
    const { 
        head_id, 
        email, 
        password, 
        role, 
        company_id } = req.body;

    // 1. Check all required fields are present
    if (!head_id || !email || !password || !role || !company_id) {
      return res.status(400).json({
        message: "You must provide: head_id, email, password, role, and company_id.",
      });
    }

    // 2. Password length check
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }

    // 3. head_id length check
    if (head_id.length < 6 || head_id.length > 35) {
      return res.status(400).json({ message: "head_id must be between 6 and 35 characters." });
    }

    // 4. Validate role against the 3 allowed roles
    if (!SHIP_HEAD_ROLES.includes(role)) {
      return res.status(400).json({
        message: `Invalid role. Allowed roles are: ${SHIP_HEAD_ROLES.join(", ")}`,
      });
    }

    // 5. Verify the company exists and is APPROVED
    const company = await Company.findById(company_id);
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }
    if (company.status !== "APPROVED") {
      return res.status(400).json({
        message: "Cannot add a Ship Head to a company that is not APPROVED.",
      });
    }

    // 6. Check for duplicate head_id or email
    const existingUser = await Head.findOne({
      $or: [{ head_id: head_id.toLowerCase() }, { email: email.toLowerCase() }],
    });
    if (existingUser) {
      return res.status(400).json({ message: "User with this head_id or email already exists." });
    }

    // 7. Create the new Ship Head
    const new_user = await Head.create({
      head_id: head_id.toLowerCase(),
      email: email.toLowerCase(),
      password,
      role,
      company_id,
    });

    return res.status(201).json({
      message: "Ship Head successfully created",
      user: {
        id: new_user._id,
        head_id: new_user.head_id,
        email: new_user.email,
        role: new_user.role,
        company_id: new_user.company_id,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const getAllShipHeads = async (req, res) => {
  try {
    const heads = await Head.find().select("-password");
    return res.status(200).json(heads);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Permanently remove a Ship Head
export const deleteShipHead = async (req, res) => {
  try {
    const { id } = req.params; // Get the ID from the URL
    // Find by ID and delete from MongoDB in one command
    const deletedHead = await Head.findByIdAndDelete(id);
    if (!deletedHead) {
      return res.status(404).json({ message: "Ship Head not found." });
    }
    return res.status(200).json({
      message: "Ship Head permanently deleted successfully.",
      deletedHead,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Deactivate a Ship Head without losing history
export const deactivateShipHead = async (req, res) => {
  try {
    const { id } = req.params;

    const head = await Head.findById(id);
    if (!head) {
      return res.status(404).json({ message: "Ship Head not found." });
    }

    // Change status instead of deleting
    head.account_status = "DISABLED";
    await head.save();

    return res.status(200).json({
      message: "Ship Head account deactivated successfully.",
      head,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


