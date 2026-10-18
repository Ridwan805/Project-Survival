import mongoose from "mongoose";

export const Company_status = ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"];

const CompanySchema = new mongoose.Schema(
    {
        name :{
            type: String,
            required : true,
            trim: true
        },
        registrationNo :{
            type : String,
            required : true, 
            unique: true,  // No two companies can have the same registration number
            trim: true 
        }, 
        country: {
            type: String, 
            required : true,
            trim: true
        },
        status: {
            type: String, 
            enum: Company_status, 
            default: "PENDING" // New companies are always PENDING until reviewed
        }, 
        RejectionReason : {
            type :String,
            deafult: null 
        }, 
        reviewedBy: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "FleetAdmin",  // Connects to the Fleet Admin who approved/rejected it
            default: null 
        },
        reviewedAt: { 
            type: Date, 
            default: null 
        },
    }, 
    {
        timestamps: true // Automatically manages createdAt and updatedAt
    }
); 

export default mongoose.model("Company", CompanySchema);