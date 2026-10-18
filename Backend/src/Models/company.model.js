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
            unique: true, 
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
            default: "PENDING"
        }, 
        RejectionReason : {
            tyoe :String,
            deafult: null 
        }, 
        reviewedBy: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "FleetAdmin", 
            default: null 
        },
        reviewedAt: { 
            type: Date, 
            default: null 
        },
    }, 
    {
        timestamps: true
    }
); 

export default mongoose.model("Company", CompanySchema);