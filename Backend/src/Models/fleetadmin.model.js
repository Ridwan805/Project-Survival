import monngoose from "monngoose";

const FleetAdminSchema = new monngoose.Schema(
    {
        singleton: { 
            type: String, 
            default: "ONLY_ONE", 
            immutable: true, 
            unique: true 
        },

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

        mustChangePassword: { 
            type: Boolean, 
            default: true 
        }
    }, 
    {
        timestamps: true
    }
); 

export default monngoose.model("FleetAdmin", FleetAdminSchema);