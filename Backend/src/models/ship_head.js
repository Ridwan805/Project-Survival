
import mongoose, { Schema } from "mongoose";

const ShipHead_Schema = new Schema(
  {
    head_id: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      minlength: 6,
      maxlength: 35,
      trim: true
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      required: true,
      unique: true
    },

    temp_password: {
      type: String,
      default: null
    },

    temp_password_expiry: {
      type: Date,
      default: null
    },

    account_status: {
      type: String,
      default: null
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
