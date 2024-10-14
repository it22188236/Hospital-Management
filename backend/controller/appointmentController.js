import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Appointment } from "../models/appointmentSchema.js"; // Use named import
import { User } from "../models/userSchema.js";
import validator from "validator"; // Ensure you have this package installed

// Create a new appointment
export const postAppointment = catchAsyncErrors(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    appointment_date,
    department,
    doctorId,
    hasVisited,
    address,
    appointment_time,
  } = req.body;

  // Validate required fields
  if (
    !firstName ||
    !lastName ||
    !email ||
    !phone ||
    !nic ||
    !dob ||
    !gender ||
    !appointment_date ||
    !department ||
    !doctorId ||
    !address ||
    !appointment_time
  ) {
    return next(new ErrorHandler("Please fill the full form!", 400));
  }

  // Validate email and phone number
  if (!validator.isEmail(email)) {
    return next(new ErrorHandler("Invalid email format!", 400));
  }

  if (!validator.isMobilePhone(phone, "any", { strictMode: false })) {
    return next(new ErrorHandler("Invalid phone number!", 400));
  }

  // Convert appointment_date to a Date object
  const appointmentDate = new Date(appointment_date);

  // Check for existing appointments on the same date for the user
  const existingPatientAppointment = await Appointment.findOne({
    patientId: req.user._id,
    appointment_date: appointmentDate,
  });
  if (existingPatientAppointment) {
    return next(
      new ErrorHandler("You already have an appointment for this date!", 400)
    );
  }

  // **New Check**: Check if the doctor already has an appointment at the same date and time
  const existingDoctorAppointment = await Appointment.findOne({
    doctorId: doctorId,
    appointment_date: appointmentDate,
    appointment_time: appointment_time,
  });
  if (existingDoctorAppointment) {
    return next(
      new ErrorHandler(
        "The doctor already has an appointment at this date and time!",
        400
      )
    );
  }

  // Check if the doctor exists
  const doctor = await User.findById(doctorId);
  if (!doctor) {
    return next(new ErrorHandler("Doctor not found", 404));
  }

  // Create the appointment
  const appointment = await Appointment.create({
    firstName,
    lastName,
    email,
    phone,
    nic,
    dob,
    gender,
    appointment_date: appointmentDate,
    department,
    hasVisited: hasVisited || false, // Default to false if not provided
    address,
    doctorId: doctor._id,
    patientId: req.user._id, // Ensure patient ID is set
    appointment_time, // Store the time of appointment
  });

  res.status(201).json({
    success: true,
    appointment,
    message: "Appointment created successfully!",
  });
});

// Get all appointments
// Get all appointments

export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patientId") // Ensure this is correct; match the schema
      .exec();

    if (!appointments) {
      return res
        .status(404)
        .json({ success: false, message: "No appointments found." });
    }

    res.status(200).json({ success: true, appointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update appointment status
// Update appointment status
export const updateAppointmentStatus = catchAsyncErrors(
  async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    // Log for debugging
    console.log("Received status:", status);

    // Validate status
    if (!["Pending", "Accepted", "Rejected"].includes(status)) {
      return next(new ErrorHandler("Invalid status value!", 400));
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return next(new ErrorHandler("Appointment not found!", 404));
    }

    // Update appointment with new status
    appointment.status = status; // Update the status
    await appointment.save(); // Save the changes

    res.status(200).json({
      success: true,
      appointment,
      message: "Appointment status updated successfully!",
    });
  }
);

// Delete an appointment
export const deleteAppointment = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    return next(new ErrorHandler("Appointment not found!", 404));
  }

  await appointment.deleteOne();
  res.status(200).json({
    success: true,
    appointmentId: id,
    message: "Appointment deleted successfully!",
  });
});
