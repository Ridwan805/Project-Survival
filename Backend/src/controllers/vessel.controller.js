import mongoose from "mongoose";
import Vessel from "../models/vessel.model.js";
import VesselType from "../models/vesseltype.model.js";
import Company from "../models/company.model.js";

// Register a new Vessel for an APPROVED company
export const registerVessel = async (req, res) => {
  try {
        const { name, imoNumber, maxCapacity, companyId, vesselTypeId } = req.body || {};

    // 1. Check all required fields are present
    if (!name || !imoNumber || maxCapacity === undefined || !companyId || !vesselTypeId) {
      return res.status(400).json({
        message: "You must provide: name, imoNumber, maxCapacity, companyId, and vesselTypeId.",
      });
    }

    // 2. name, companyId and vesselTypeId must be text
    if (
      typeof name !== "string" ||
      typeof companyId !== "string" ||
      typeof vesselTypeId !== "string"
    ) {
      return res.status(400).json({
        message: "name, companyId and vesselTypeId must be text.",
      });
    }

    // 3. imoNumber must be text or a number, and exactly 7 digits
    if (typeof imoNumber !== "string" && typeof imoNumber !== "number") {
      return res.status(400).json({ message: "imoNumber must be text or a number." });
    }
    const cleanImo = String(imoNumber).trim();
    if (!/^\d{7}$/.test(cleanImo)) {
      return res.status(400).json({ message: "imoNumber must be exactly 7 digits." });
    }

    // 4. name must not be empty
    const cleanName = name.trim();
    if (cleanName.length === 0) {
      return res.status(400).json({ message: "name cannot be empty." });
    }
        if (cleanName.length > 100) {
      return res.status(400).json({ message: "name must be 100 characters or fewer." });
    }

    // 5. maxCapacity must be a number above 0
    if (typeof maxCapacity !== "number" || !Number.isFinite(maxCapacity) || maxCapacity <= 0) {
      return res.status(400).json({ message: "maxCapacity must be a number above 0." });
    }

    // 6. companyId and vesselTypeId must look like valid MongoDB ids
    if (!mongoose.isValidObjectId(companyId)) {
      return res.status(400).json({ message: "companyId is not a valid id." });
    }
    if (!mongoose.isValidObjectId(vesselTypeId)) {
      return res.status(400).json({ message: "vesselTypeId is not a valid id." });
    }

    // 7. Verify the company exists and is APPROVED
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }
    if (company.status !== "APPROVED") {
      return res.status(400).json({
        message: "Cannot register a Vessel for a company that is not APPROVED.",
      });
    }

    // 8. Verify the vessel type exists
    const vesselType = await VesselType.findById(vesselTypeId);
    if (!vesselType) {
      return res.status(404).json({ message: "Vessel type not found." });
    }

    // 9. The IMO number must be unique
    const imoTaken = await Vessel.findOne({ imoNumber: cleanImo });
    if (imoTaken) {
      return res.status(400).json({ message: "A vessel with this IMO number already exists." });
    }

    // 10. Create the new Vessel (status starts as AVAILABLE)
    const new_vessel = await Vessel.create({
      name: cleanName,
      imoNumber: cleanImo,
      maxCapacity,
      companyId,
      vesselTypeId,
    });

    return res.status(201).json({
      message: "Vessel successfully registered",
      vessel: {
        id: new_vessel._id,
        name: new_vessel.name,
        imoNumber: new_vessel.imoNumber,
        maxCapacity: new_vessel.maxCapacity,
        status: new_vessel.status,
        companyId: new_vessel.companyId,
        vesselTypeId: new_vessel.vesselTypeId,
      },
    });
  } catch (error) {
    // Two requests at the same moment can both pass step 9; the unique index stops the second one
    if (error.code === 11000) {
      return res.status(400).json({ message: "A vessel with this IMO number already exists." });
    }
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Get list of all Vessels (optional filter: ?companyId=...)
export const getAllVessels = async (req, res) => {
  try {
    const { companyId } = req.query;
    const filter = {};

    // 1. If a companyId filter is given, it must be a valid id
    if (companyId !== undefined) {
      if (typeof companyId !== "string" || !mongoose.isValidObjectId(companyId)) {
        return res.status(400).json({ message: "companyId is not a valid id." });
      }
      filter.companyId = companyId;
    }

    // 2. Find the vessels (newest first) with the company name and vessel type name
    const vessels = await Vessel.find(filter)
      .populate("companyId", "name")
      .populate("vesselTypeId", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json(vessels);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Get one Vessel by its id
export const getVesselById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. id must look like a valid MongoDB id
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Vessel id is not a valid id." });
    }

    // 2. Find the vessel with the company name and vessel type name
    const vessel = await Vessel.findById(id)
      .populate("companyId", "name")
      .populate("vesselTypeId", "name");
    if (!vessel) {
      return res.status(404).json({ message: "Vessel not found." });
    }

    return res.status(200).json(vessel);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Update a Vessel (only name, maxCapacity and vesselTypeId can be changed)
export const updateVessel = async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const allowedFields = ["name", "maxCapacity", "vesselTypeId"];

    // 1. id must look like a valid MongoDB id
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Vessel id is not a valid id." });
    }

    // 2. The request body must be a JSON object
    if (typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({ message: "Request body must be a JSON object." });
    }

    // 3. Reject any field that is not allowed (imoNumber, companyId, status, ...)
    const notAllowed = Object.keys(body).filter((key) => !allowedFields.includes(key));
    if (notAllowed.length > 0) {
      return res.status(400).json({
        message: `You cannot update: ${notAllowed.join(", ")}. Only name, maxCapacity and vesselTypeId can be changed.`,
      });
    }

    // 4. At least one allowed field must be given
    const { name, maxCapacity, vesselTypeId } = body;
    if (name === undefined && maxCapacity === undefined && vesselTypeId === undefined) {
      return res.status(400).json({
        message: "You must provide at least one of: name, maxCapacity, vesselTypeId.",
      });
    }

    // 5. Check each given field
    let cleanName;
    if (name !== undefined) {
      if (typeof name !== "string") {
        return res.status(400).json({ message: "name must be text." });
      }
      cleanName = name.trim();
      if (cleanName.length === 0) {
        return res.status(400).json({ message: "name cannot be empty." });
      }
      if (cleanName.length > 100) {
        return res.status(400).json({ message: "name must be 100 characters or fewer." });
      }
    }
    if (maxCapacity !== undefined) {
      if (typeof maxCapacity !== "number" || !Number.isFinite(maxCapacity) || maxCapacity <= 0) {
        return res.status(400).json({ message: "maxCapacity must be a number above 0." });
      }
    }
    if (vesselTypeId !== undefined) {
      if (typeof vesselTypeId !== "string" || !mongoose.isValidObjectId(vesselTypeId)) {
        return res.status(400).json({ message: "vesselTypeId is not a valid id." });
      }
    }

    // 6. Verify the vessel exists
    const vessel = await Vessel.findById(id);
    if (!vessel) {
      return res.status(404).json({ message: "Vessel not found." });
    }

    // 7. If a new vessel type is given, verify it exists
    if (vesselTypeId !== undefined) {
      const vesselType = await VesselType.findById(vesselTypeId);
      if (!vesselType) {
        return res.status(404).json({ message: "Vessel type not found." });
      }
      vessel.vesselTypeId = vesselTypeId;
    }

    // 8. Apply the other changes and save
    if (cleanName !== undefined) vessel.name = cleanName;
    if (maxCapacity !== undefined) vessel.maxCapacity = maxCapacity;
    await vessel.save();

    return res.status(200).json({
      message: "Vessel successfully updated",
      vessel: {
        id: vessel._id,
        name: vessel.name,
        imoNumber: vessel.imoNumber,
        maxCapacity: vessel.maxCapacity,
        status: vessel.status,
        companyId: vessel.companyId,
        vesselTypeId: vessel.vesselTypeId,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Set a Vessel's status by hand (AVAILABLE, SAILING or UNDER_MAINTENANCE)
export const updateVesselStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    const settableStatuses = ["AVAILABLE", "SAILING", "UNDER_MAINTENANCE"];

    // 1. id must look like a valid MongoDB id
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Vessel id is not a valid id." });
    }

    // 2. status must be given
    if (!status) {
      return res.status(400).json({ message: "You must provide: status." });
    }

    // 3. status must be text
    if (typeof status !== "string") {
      return res.status(400).json({ message: "status must be text." });
    }

    // 4. INACTIVE has its own route
    if (status === "INACTIVE") {
      return res.status(400).json({
        message: "To make a vessel INACTIVE, use the deactivate route.",
      });
    }

    // 5. status must be one of the allowed values
    if (!settableStatuses.includes(status)) {
      return res.status(400).json({
        message: `status must be one of: ${settableStatuses.join(", ")}.`,
      });
    }

    // 6. Verify the vessel exists
    const vessel = await Vessel.findById(id);
    if (!vessel) {
      return res.status(404).json({ message: "Vessel not found." });
    }

    // 7. The vessel must not already have this status
    if (vessel.status === status) {
      return res.status(400).json({ message: `Vessel is already ${status}.` });
    }

    // 8. An INACTIVE vessel can only go back to AVAILABLE
    if (vessel.status === "INACTIVE" && status !== "AVAILABLE") {
      return res.status(400).json({
        message: "An INACTIVE vessel can only be set back to AVAILABLE.",
      });
    }

    // 9. Save the new status
    vessel.status = status;
    await vessel.save();

    return res.status(200).json({
      message: "Vessel status updated successfully",
      vessel: {
        id: vessel._id,
        name: vessel.name,
        imoNumber: vessel.imoNumber,
        maxCapacity: vessel.maxCapacity,
        status: vessel.status,
        companyId: vessel.companyId,
        vesselTypeId: vessel.vesselTypeId,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Deactivate a Vessel (set INACTIVE) without losing its history
export const deactivateVessel = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. id must look like a valid MongoDB id
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Vessel id is not a valid id." });
    }

    // 2. Verify the vessel exists
    const vessel = await Vessel.findById(id);
    if (!vessel) {
      return res.status(404).json({ message: "Vessel not found." });
    }

    // 3. It must not already be INACTIVE
    if (vessel.status === "INACTIVE") {
      return res.status(400).json({ message: "Vessel is already INACTIVE." });
    }

    // 4. A vessel at sea cannot be deactivated
    if (vessel.status === "SAILING") {
      return res.status(400).json({ message: "A SAILING vessel cannot be deactivated." });
    }

    // 5. Change status instead of deleting
    vessel.status = "INACTIVE";
    await vessel.save();

    return res.status(200).json({
      message: "Vessel deactivated successfully",
      vessel: {
        id: vessel._id,
        name: vessel.name,
        imoNumber: vessel.imoNumber,
        maxCapacity: vessel.maxCapacity,
        status: vessel.status,
        companyId: vessel.companyId,
        vesselTypeId: vessel.vesselTypeId,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};