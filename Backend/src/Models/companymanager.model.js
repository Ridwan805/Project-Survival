import mongoose from "mongoose";

export const MANAGER_ACCOUNT_STATUS = ["ACTIVE", "DISABLED"];

const CompanyManagerSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        passwordHash: {
            type: String,
            required: true
        },

        accountStatus: {
            type: String,
            enum: MANAGER_ACCOUNT_STATUS,
            default: "ACTIVE"
        },

        // 1-to-1 link: each manager belongs to exactly one company
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            unique: true  // a company can only have one manager
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("CompanyManager", CompanyManagerSchema);