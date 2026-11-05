import mongoose from "mongoose";

// Statuses from the SRS. A new vessel always starts as AVAILABLE.
// SAILING and UNDER_MAINTENANCE are set by hand until voyages and maintenance exist.
export const VESSEL_STATUS = ["AVAILABLE", "SAILING", "UNDER_MAINTENANCE", "INACTIVE"];

const VesselSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        // IMO number: exactly 7 digits, stored as text so leading zeros are kept
        imoNumber: {
            type: String,
            required: true,
            unique: true,  // no two vessels can have the same IMO number
            trim: true,
            match: [/^\d{7}$/, "imoNumber must be exactly 7 digits"]
        },

        // Maximum cargo the vessel can carry, in tonnes. Must be above 0.
        maxCapacity: {
            type: Number,
            required: true,
            validate: {
                validator: (value) => value > 0,
                message: "maxCapacity must be a number above 0"
            }
        },

        status: {
            type: String,
            enum: VESSEL_STATUS,
            default: "AVAILABLE"
        },

        // COMPANY owns VESSEL (one company, many vessels)
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true
        },

        // VESSEL classified as VESSEL_TYPE (many vessels, one type)
        vesselTypeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "VesselType",
            required: true
        }
    },
    {
        timestamps: true // Automatically manages createdAt and updatedAt
    }
);

export default mongoose.model("Vessel", VesselSchema);