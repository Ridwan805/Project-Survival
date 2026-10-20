import mongoose from "mongoose";

const VesselTypeSchema = new mongoose.Schema(
    {
        // e.g. "Container Ship", "Bulk Carrier"
        name: {
            type: String,
            required: true,
            unique: true,  // no two vessel types can have the same name
            trim: true
        }
    },
    {
        timestamps: true // Automatically manages createdAt and updatedAt
    }
);

export default mongoose.model("VesselType", VesselTypeSchema);