import React, { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Context } from "../main";
import axios from "axios";
import styled from "styled-components";

const Page = styled.section`
  margin-left: 120px;
  background: #e5e5e5;
  padding: 40px;
  height: 100vh;
  border-top-left-radius: 50px;
  border-bottom-left-radius: 50px;

  @media (max-width: 1208px) {
    margin-left: 0;
    border-radius: 0;
  }

  @media (max-width: 485px) {
    padding: 40px 20px;
  }
`;

const Container = styled.section`
  padding: 0 100px;

  @media (max-width: 700px) {
    padding: 0 20px;
  }
`;

const FormTitle = styled.h1`
  font-size: 2rem;
  color: #111;
  margin-bottom: 30px;
`;

const FormGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 600px;
  margin: auto;

  input,
  select {
    padding: 10px;
    font-size: 18px;
    border-radius: 5px;
    border: 1px solid gray;
  }

  button {
    padding: 10px 20px;
    color: #fff;
    font-weight: 700;
    border: none;
    border-radius: 5px;
    font-size: 18px;
    background: linear-gradient(140deg, #9083d5, #271776ca);
    cursor: pointer;

    &:hover {
      background: #271776;
    }
  }
`;

const AddNewStaff = () => {
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nic, setNic] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  // Validation States
  const [phoneError, setPhoneError] = useState("");
  const [dobError, setDobError] = useState("");

  const navigateTo = useNavigate();

  // Real-time Phone Number Validation
  const validatePhone = (value) => {
    const phoneRegex = /^[0-9]{10}$/; // Ensure phone number is exactly 10 digits
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

    setPhone(value); // Set the phone value
  };

  // Real-time Date of Birth Validation
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
      setDobError("Staff must be at least 18 years old.");
    } else {
      setDobError(""); // Clear error if the DOB is valid
    }
    setDob(value);
  };

  const handleAddNewStaff = async (e) => {
    e.preventDefault();
    if (phoneError || dobError) {
      toast.error("Please fix the validation errors before submitting.");
      return;
    }

    try {
      const formData = {
        firstName,
        lastName,
        email,
        phone,
        nic,
        dob,
        gender,
        password,
        role,
      };
      await axios
        .post("http://localhost:4000/api/v1/staff/add", formData, {
          withCredentials: true,
        })
        .then((res) => {
          toast.success(res.data.message);
          setIsAuthenticated(true);
          navigateTo("/"); // Redirect to home page
          // Clear input fields
          setFirstName("");
          setLastName("");
          setEmail("");
          setPhone("");
          setNic("");
          setDob("");
          setGender("");
          setPassword("");
          setRole("");
        });
    } catch (error) {
      toast.error(
        error.response ? error.response.data.message : "Error occurred"
      );
    }
  };

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  return (
    <Page style={{marginLeft:'140px',marginBottom:'50px',marginRight:'20px',borderRadius:'50px'}}>
      <Container >
        <img src="/logo.png" alt="logo" className="logo" />
        <FormTitle>REGISTER A NEW STAFF MEMBER</FormTitle>
        <form onSubmit={handleAddNewStaff}>
          <FormGrid>
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
              type="text"
              placeholder="Mobile Number"
              value={phone}
              onChange={(e) => validatePhone(e.target.value)}
              required
            />
            {phoneError && <span style={{ color: "red" }}>{phoneError}</span>}
            <input
              type="text"
              placeholder="NIC"
              value={nic}
              onChange={(e) => setNic(e.target.value)}
              required
            />
            <input
              type="date"
              placeholder="Date of Birth"
              value={dob}
              onChange={(e) => validateDob(e.target.value)} // DOB Validation
              required
            />
            {dobError && <span className="error-text">{dobError}</span>}{" "}
            {/* Display DOB error */}
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
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">Select Role</option>
              <option value="Nurse">Nurse</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Technician">Technician</option>
            </select>
            <button type="submit">Register New Staff</button>
          </FormGrid>
        </form>
      </Container>
    </Page>
  );
};

export default AddNewStaff;
