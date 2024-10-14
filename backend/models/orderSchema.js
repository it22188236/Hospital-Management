import mongoose from "mongoose";
import validator from "validator";

const orderSchema = new mongoose.Schema({
  orderID: {
    type: String,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  doctorId: {
    type: String,
    required: true,
  },
  customerNic: {
    type: String,
    required: true,
    minLength: [12, "NIC must contain at least 12 characters!"],
  },
  address: {
    type: String,
    required: true,
    minLength: [5, "Address must contain at least 5 characters!"],
  },
  phoneNumber: {
    type: String,
    required: true,
    minLength: [10, "Phone Number must contain exactly 10 digits!"],
    maxLength: [10, "Phone Number must contain exactly 10 digits!"],
  },
  email: {
    type: String,
    required: true,
    validate: [validator.isEmail, "Provide a valid email!"],
  },
});

export const Order = mongoose.model("Order", orderSchema);