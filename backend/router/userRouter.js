import express from "express";
import {
  addNewAdmin,
  addNewDoctor,
  getAllDoctors,
  getUserDetails,
  login,
  logoutAdmin,
  logoutPatient,
  patientRegister,
  getAvailableTimes,
  getDoctorsByDepartment,
  getDoctorsByIds,
  getFullDoctorDetailsById,
  updateDoctor, // Import the update function
  deleteDoctor,
  updateUserProfile,
  getUserProfile // Import the delete function
} from "../controller/userController.js";
import {
  isAdminAuthenticated,
  isPatientAuthenticated,
} from "../middlewares/auth.js";

const router = express.Router();

router.post("/patient/register", patientRegister);
router.post("/login", login);
router.post("/admin/addnew", isAdminAuthenticated, addNewAdmin);
router.post("/doctor/addnew", isAdminAuthenticated, addNewDoctor);
router.get("/doctors", getAllDoctors);
router.get("/doctors/department", getDoctorsByDepartment);
router.get("/patient/me", isPatientAuthenticated, getUserDetails);
router.get("/admin/me", isAdminAuthenticated, getUserDetails);
router.get("/patient/logout", isPatientAuthenticated, logoutPatient);
router.get("/admin/logout", isAdminAuthenticated, logoutAdmin);
router.get("/doctor/availability", getAvailableTimes);
router.get("/doctor/getAllByIds", getDoctorsByIds);
router.get("/doctor/:id", isAdminAuthenticated, getFullDoctorDetailsById); 
router.get("/patient/fetch", isPatientAuthenticated, getUserProfile); 
router.put("/patient/update",isPatientAuthenticated,updateUserProfile)

// New routes for update and delete doctor
router.put("/doctor/:id", isAdminAuthenticated, updateDoctor); // Update doctor by ID
router.delete("/doctor/:id", isAdminAuthenticated, deleteDoctor); // Delete doctor by ID

export default router;
