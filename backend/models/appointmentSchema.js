import mongoose from "mongoose";
import validator from "validator";

const appointmentSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: [3, "First Name Must Contain At Least 3 Characters!"],
    },
    lastName: {
      type: String,
      required: true,
      minLength: [3, "Last Name Must Contain At Least 3 Characters!"],
    },
    email: {
      type: String,
      required: true,
      validate: [validator.isEmail, "Provide A Valid Email!"],
    },
    phone: {
      type: String,
      required: true,
      minLength: [10, "Phone Number Must Contain Exactly 10 Digits!"],
      maxLength: [10, "Phone Number Must Contain Exactly 10 Digits!"],
    },
    nic: {
      type: String,
      required: true,
      minLength: [9, "NIC Must Contain At Least 9 Characters!"], // Adjust according to your NIC requirements
    },
    dob: {
      type: Date,
      required: true,
      validate: {
        validator: function (v) {
          return v instanceof Date && !isNaN(v);
        },
        message: "Provide A Valid Date Of Birth!",
      },
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"], // Adjust as necessary for your application
    },
    appointment_date: {
      type: Date,
      required: true,
      validate: {
        validator: function (v) {
          return v instanceof Date && !isNaN(v);
        },
        message: "Provide A Valid Appointment Date!",
      },
    },
    appointment_time: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v); // Validate time format HH:MM
        },
        message: "Provide A Valid Appointment Time In HH:MM Format!",
      },
    },
    department: {
      type: String,
      required: true,
      minLength: [3, "Department Name Must Contain At Least 3 Characters!"],
    },
    hasVisited: {
      type: Boolean,
      default: false,
    },
    address: {
      type: String,
      required: true,
      minLength: [10, "Address Must Contain At Least 10 Characters!"],
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Assuming your doctors are also in the User collection
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Change this to refer to User if using the same model for patients
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    }
    
  },
  {
    timestamps: true,
  }
);

// Create the Appointment model
export const Appointment = mongoose.model("Appointment", appointmentSchema);
