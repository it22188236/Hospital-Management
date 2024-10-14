import React, { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../main";
import axios from "axios";

const AddNewDoctor = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nic, setNic] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [doctorDepartment, setDoctorDepartment] = useState("");
  const [docAvatar, setDocAvatar] = useState("");
  const [docAvatarPreview, setDocAvatarPreview] = useState("");
  const [fees, setFees] = useState(""); // State for fees

  const [phoneError, setPhoneError] = useState(""); // Error state for phone
  const [dobError, setDobError] = useState(""); // Error state for DOB

  // Availability state for days and hours
  const [availability, setAvailability] = useState({
    Sunday: { available: false, startTime: "", endTime: "" },
    Monday: { available: false, startTime: "", endTime: "" },
    Tuesday: { available: false, startTime: "", endTime: "" },
    Wednesday: { available: false, startTime: "", endTime: "" },
    Thursday: { available: false, startTime: "", endTime: "" },
    Friday: { available: false, startTime: "", endTime: "" },
    Saturday: { available: false, startTime: "", endTime: "" },
  });

  const navigateTo = useNavigate();

  const departmentsArray = [
    "Pediatrics",
    "Orthopedics",
    "Cardiology",
    "Neurology",
    "Oncology",
    "Radiology",
    "Physical Therapy",
    "Dermatology",
    "ENT",
  ];

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setDocAvatarPreview(reader.result);
      setDocAvatar(file);
    };
  };

  // Handle availability changes for each day
  const handleAvailabilityChange = (day, field, value) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  // Phone validation
  const validatePhone = (value) => {
    const phonePrefixes = ["071", "072", "074", "076", "077"];
    if (value.length >= 10) {
      const phonePrefix = value.substring(0, 3); // Get the first 3 digits
      if (!phonePrefixes.includes(phonePrefix)) {
        setPhoneError(
          "Phone number must start with 071, 072, 074, 076, or 077."
        );
      } else if (value.length !== 10) {
        setPhoneError("Phone number must be exactly 10 digits.");
      } else {
        setPhoneError(""); // Valid phone number
      }
    }
  };

  // DOB validation
  const validateDob = (value) => {
    const dobDate = new Date(value);
    const today = new Date();

    // Calculate the age
    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();

    // Adjust age if the current month is before the birth month or
    // it's the birth month but the current day is before the birth day.
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < dobDate.getDate())
    ) {
      age--;
    }

    if (dobDate >= today) {
      setDobError("Date of birth cannot be today or in the future.");
    } else if (age < 18) {
      setDobError("Doctor must be at least 18 years old.");
    } else {
      setDobError(""); // Clear error if the DOB is valid
    }
  };

  const handleAddNewDoctor = async (e) => {
    e.preventDefault();
    if (phoneError || dobError) {
      toast.error("Please fix the errors in the form.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("email", email);
      formData.append("phone", phone);
      formData.append("password", password);
      formData.append("nic", nic);
      formData.append("dob", dob);
      formData.append("gender", gender);
      formData.append("doctorDepartment", doctorDepartment);
      formData.append("docAvatar", docAvatar);
      formData.append("fees", fees); // Include fees in the form data
      formData.append("availability", JSON.stringify(availability)); // Send availability data

      await axios
        .post("http://localhost:4000/api/v1/user/doctor/addnew", formData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((res) => {
          toast.success(res.data.message);
          setIsAuthenticated(true);
          navigateTo("/");
          // Reset the form fields
          setFirstName("");
          setLastName("");
          setEmail("");
          setPhone("");
          setNic("");
          setDob("");
          setGender("");
          setPassword("");
          setFees(""); // Reset fees
        });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  return (
    <section className="page">
      <section className="container add-doctor-form">
        <img src="/logo.png" alt="logo" className="logo" />
        <h1 className="form-title">REGISTER A NEW DOCTOR</h1>
        <form onSubmit={handleAddNewDoctor}>
          <div className="first-wrapper">
            <div>
              <img
                src={
                  docAvatarPreview ? `${docAvatarPreview}` : "/docHolder.jpg"
                }
                alt="Doctor Avatar"
              />
              <input type="file" onChange={handleAvatar} />
            </div>
            <div>
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Mobile Number"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  validatePhone(e.target.value);
                }}
                required
              />
              {phoneError && <span className="error-text">{phoneError}</span>}
              <input
                type="text"
                placeholder="NIC"
                value={nic}
                onChange={(e) => setNic(e.target.value)}
                required
              />
              <input
                type={"date"}
                placeholder="Date of Birth"
                value={dob}
                onChange={(e) => {
                  setDob(e.target.value);
                  validateDob(e.target.value);
                }}
                required
              />
              {dobError && <span className="error-text">{dobError}</span>}
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Fees"
                value={fees}
                onChange={(e) => setFees(e.target.value)}
                required
              />
              <select
                value={doctorDepartment}
                onChange={(e) => setDoctorDepartment(e.target.value)}
                required
              >
                <option value="">Select Department</option>
                {departmentsArray.map((depart, index) => (
                  <option value={depart} key={index}>
                    {depart}
                  </option>
                ))}
              </select>

              {/* Days of the Week Availability */}
              <div>
                <h3>Select Availability</h3>
                {Object.keys(availability).map((day) => (
                  <div key={day}>
                    <label>
                      <input
                        type="checkbox"
                        checked={availability[day].available}
                        onChange={(e) =>
                          handleAvailabilityChange(
                            day,
                            "available",
                            e.target.checked
                          )
                        }
                      />
                      {day}
                    </label>
                    {availability[day].available && (
                      <div>
                        <label>
                          Start Time:
                          <input
                            type="time"
                            value={availability[day].startTime}
                            onChange={(e) =>
                              handleAvailabilityChange(
                                day,
                                "startTime",
                                e.target.value
                              )
                            }
                          />
                        </label>
                        <label>
                          End Time:
                          <input
                            type="time"
                            value={availability[day].endTime}
                            onChange={(e) =>
                              handleAvailabilityChange(
                                day,
                                "endTime",
                                e.target.value
                              )
                            }
                          />
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button type="submit">Add Doctor</button>
            </div>
          </div>
        </form>
      </section>
    </section>
  );
};

export default AddNewDoctor;
