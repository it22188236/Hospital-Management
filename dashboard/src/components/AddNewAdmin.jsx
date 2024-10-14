import React, { useContext, useState } from "react";
import { Context } from "../main";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const AddNewAdmin = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nic, setNic] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");

  const [phoneError, setPhoneError] = useState("");
  const [dobError, setDobError] = useState("");

  const navigateTo = useNavigate();

  // Real-time phone number validation
  const validatePhone = (value) => {
    const phoneRegex = /^[0-9]{10}$/; // Ensure phone number is 10 digits
    const validPrefixes = ["071", "072", "074", "076", "077"]; // Valid prefixes

    if (value.length >= 10) {
      const phonePrefix = value.substring(0, 3); // Extract the first 3 digits

      // Check if the phone number is exactly 10 digits and starts with a valid prefix
      if (!phoneRegex.test(value)) {
        setPhoneError("Invalid phone number. Must be exactly 10 digits.");
      } else if (!validPrefixes.includes(phonePrefix)) {
        setPhoneError(
          "Invalid phone number. It must start with 071, 072, 074, 076, or 077."
        );
      } else {
        setPhoneError(""); // No errors
      }
    } else {
      setPhoneError("Phone number must be 10 digits long.");
    }

    setPhone(value);
  };

  // Real-time date of birth validation (age must be 18 or older)
  const validateDob = (value) => {
    const today = new Date();
    const birthDate = new Date(value);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    if (age < 18) {
      setDobError("Age must be 18 or older.");
    } else {
      setDobError("");
    }

    setDob(value);
  };

  const handleAddNewAdmin = async (e) => {
    e.preventDefault();

    // Ensure there are no validation errors before submitting
    if (phoneError || dobError) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    try {
      await axios
        .post(
          "http://localhost:4000/api/v1/user/admin/addnew",
          { firstName, lastName, email, phone, nic, dob, gender, password },
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        )
        .then((res) => {
          toast.success(res.data.message);
          setIsAuthenticated(true);
          navigateTo("/");
          setFirstName("");
          setLastName("");
          setEmail("");
          setPhone("");
          setNic("");
          setDob("");
          setGender("");
          setPassword("");
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
      <section className="container form-component add-admin-form">
        <img src="/logo.png" alt="logo" className="logo" />
        <h1 className="form-title">ADD NEW ADMIN</h1>
        <form onSubmit={handleAddNewAdmin}>
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
          </div>
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Mobile Number"
              value={phone}
              onChange={(e) => validatePhone(e.target.value)}
              required
            />
            {phoneError && <span style={{ color: "red" }}>{phoneError}</span>}
          </div>
          <div>
            <input
              type="number"
              placeholder="NIC"
              value={nic}
              onChange={(e) => setNic(e.target.value)}
              required
            />
            <input
              type="date"
              placeholder="Date of Birth"
              value={dob}
              onChange={(e) => validateDob(e.target.value)}
              required
            />
            {dobError && <span style={{ color: "red" }}>{dobError}</span>}
          </div>
          <div>
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
          </div>
          <div style={{ justifyContent: "center", alignItems: "center" }}>
            <button type="submit">ADD NEW ADMIN</button>
          </div>
        </form>
      </section>
    </section>
  );
};

export default AddNewAdmin;
