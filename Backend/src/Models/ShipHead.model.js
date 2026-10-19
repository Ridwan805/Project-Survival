
import mongoose, { Schema } from "mongoose";

export const SHIP_HEAD_ROLES = [
  "VOYAGE_OPS_MANAGER",
  "CARGO_OFFICER",
  "CREW_MANAGER",
];

const ShipHead_Schema = new Schema(
  {
    head_id: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      minlength: 6,
      maxlength: 35,
      trim: true,
      match: [/^[a-z0-9._-]+$/, "headId may only contain letters, numbers, dot, dash and underscore"],
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      required: true,
      unique: true
    },
     // 2. The 3 types enforced by an enum
    role: {
      type: String,
      required: [true, "A ship head must have a designated role"],
      enum: {
        values: SHIP_HEAD_ROLES,
        message: "Role must be one of: VOYAGE_OPS_MANAGER, CARGO_OFFICER, CREW_MANAGER",
      },
    },

    // 3. Link to Company
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    temp_password: {
      type: String,
      default: null
    },

    temp_password_expiry: {
      type: Date,
      default: null
    },

    must_change_password: {
      type: Boolean,
      default: true,
    },

    account_status: {
      type: String,
      enum: ["ACTIVE", "DISABLED"],
      default: "ACTIVE"
    },

    password: {
      type: String,
      minlength: 8,
      required: true
    }
  },
  {
    timestamps: true
  }
);

export const Head = mongoose.model("Head", ShipHead_Schema);

