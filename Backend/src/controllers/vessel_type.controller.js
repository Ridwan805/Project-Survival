import VesselType from "../models/vesseltype.model.js";

// Register a new Vessel Type (e.g. "Container Ship")
export const registerVesselType = async (req, res) => {
  try {
        const { name } = req.body || {};

    // 1. Check the name is present
    if (!name) {
      return res.status(400).json({ message: "You must provide: name." });
    }

    // 2. name must be text
    if (typeof name !== "string") {
      return res.status(400).json({ message: "name must be text." });
    }

    // 3. Remove extra spaces and check it is not empty or too long
    const cleanName = name.trim();
    if (cleanName.length === 0) {
      return res.status(400).json({ message: "name cannot be empty." });
    }
    if (cleanName.length > 50) {
      return res.status(400).json({ message: "name must be 50 characters or fewer." });
    }

    // 4. No duplicate names ("Container Ship" and "container ship" count as the same)
    const existingType = await VesselType.findOne({ name: cleanName }).collation({
      locale: "en",
      strength: 2,
    });
    if (existingType) {
      return res.status(400).json({ message: "A vessel type with this name already exists." });
    }

    // 5. Create the new Vessel Type
    const new_type = await VesselType.create({ name: cleanName });

    return res.status(201).json({
      message: "Vessel Type successfully created",
      vesselType: {
        id: new_type._id,
        name: new_type.name,
      },
    });
  } catch (error) {
    // Two requests at the same moment can both pass step 4; the unique index stops the second one
    if (error.code === 11000) {
      return res.status(400).json({ message: "A vessel type with this name already exists." });
    }
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Get list of all Vessel Types
export const getAllVesselTypes = async (req, res) => {
  try {
    const types = await VesselType.find().sort({ name: 1 });
    return res.status(200).json(types);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};