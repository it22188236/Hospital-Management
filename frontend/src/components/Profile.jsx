import React, { useEffect, useState } from 'react';
import { toast } from "react-toastify";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const Profile = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [nic, setNic] = useState("");
    const [dob, setDob] = useState("");
    const [gender, setGender] = useState("");
    const [address, setAddress] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigateTo = useNavigate();

    const validatePhone = (phone) => {
        const phonePattern = /^(070|071|072|074|076|077|078)\d{7}$/;
        return phonePattern.test(phone);
    };

    const validateDob = (dob) => {
        const today = new Date();
        const enteredDob = new Date(dob);
        return enteredDob < today;
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();

        if (isSubmitting) return;
        setIsSubmitting(true);

        // Validate required fields
        if (!firstName || !lastName || !email || !phone || !nic || !dob || !gender || !address) {
            toast.error("Please fill the full form!");
            setIsSubmitting(false);
            return;
        }

        if (!validatePhone(phone)) {
            toast.error("Please enter a valid phone number starting with 070, 071, 072, 074, 076, 077, or 078 and exactly 10 digits.");
            setIsSubmitting(false);
            return;
        }

        if (!validateDob(dob)) {
            toast.error("Date of birth cannot be today or a future date.");
            setIsSubmitting(false);
            return;
        }

        try {
            const updatedData = {
                firstName,
                lastName,
                email,
                phone,
                nic,
                dob,
                gender,
                address
            };

            const { data } = await axios.put("http://localhost:4000/api/v1/user/patient/update", updatedData, { withCredentials: true });
            toast.success("Profile updated successfully!");
            setIsSubmitting(false);

            // Optionally, you can update the form fields with the returned data
            setFirstName(data.user.firstName);
            setLastName(data.user.lastName);
            setEmail(data.user.email);
            setPhone(data.user.phone);
            setNic(data.user.nic);
            setDob(new Date(data.user.dob).toISOString().slice(0, 10));
            setGender(data.user.gender);
            setAddress(data.user.address);
            navigateTo('/profile')

        } catch (error) {
            toast.error("Failed to update profile. Please try again.");
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        const fetchPatientDetails = async () => {
            try {
                const { data } = await axios.get("http://localhost:4000/api/v1/user/patient/me", { withCredentials: true });

                // Populate form fields with fetched data
                setFirstName(data.user.firstName);
                setLastName(data.user.lastName);
                setEmail(data.user.email);
                setPhone(data.user.phone);
                setNic(data.user.nic);
                setDob(new Date(data.user.dob).toISOString().slice(0, 10)); // Format for input type="date"
                setGender(data.user.gender);
                setAddress(data.user.address);
            } catch (error) {
                toast.error("Error fetching patient details.");
            }
        };

        fetchPatientDetails();
    }, []);

    return (
        <div className="container form-component login-form">
            <form onSubmit={handleProfileUpdate}>
                <div>
                    <input
                        type="text"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                </div>
                <div>
                    <input
                        type="text"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                </div>
                <div>
                    <input
                        type="text"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <input
                        type="text"
                        placeholder="Mobile Number"
                        value={phone}
                        onChange={(e) => {
                            const value = e.target.value;
                            setPhone(value);
                            if (value.length >= 10 && !validatePhone(value)) {
                                toast.error("Please enter a valid phone number starting with 071, 072, 074, 076, or 077, and exactly 10 digits.");
                            }
                        }}
                    />
                </div>
                <div>
                    <input
                        type="number"
                        placeholder="NIC"
                        value={nic}
                        onChange={(e) => setNic(e.target.value)}
                    />
                </div>
                <div>
                    <input
                        type="date"
                        placeholder="Date of Birth"
                        value={dob}
                        onChange={(e) => {
                            setDob(e.target.value);
                            if (!validateDob(e.target.value)) {
                                toast.error("Date of birth cannot be today or a future date.");
                            }
                        }}
                    />
                </div>
                <div>
                    <select value={gender} onChange={(e) => setGender(e.target.value)}>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>
                <div>
                    <textarea
                        placeholder="Address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                </div>
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Update Profile"}
                </button>
            </form>
        </div>
    );
};

export default Profile;
