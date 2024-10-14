import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from 'uuid';
import PaymentModal from "../components/PaymentModel";

const AppointmentForm = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nic, setNic] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [department, setDepartment] = useState("Pediatrics");
  const [doctorId, setDoctorId] = useState("");
  const [doctorFirstName, setDoctorFirstName] = useState("");
  const [doctorLastName, setDoctorLastName] = useState("");
  const [doctorFees, setDoctorFees] = useState("");
  const [address, setAddress] = useState("");
  const [hasVisited, setHasVisited] = useState(false);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loggedPatient, setLoggedPatient] = useState({
    firstName: "",
    lastName: "",
    nic: "",
    dob: "",
    gender: "",
  });

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

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4000/api/v1/user/patient/me",
          { withCredentials: true }
        );

        // Update the state with the logged-in patient's details
        setLoggedPatient({
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          nic: data.user.nic,
          dob: new Date(data.user.dob).toISOString(), // Ensure dob is in ISO format
          gender: data.user.gender,
        });
      } catch (error) {
        toast.error("Error fetching patient details.");
      }
    };

    fetchPatientDetails();
  }, []);
  

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4000/api/v1/user/doctors",
          { withCredentials: true }
        );
        setDoctors(data.doctors);
      } catch (error) {
        toast.error("Error fetching doctors.");
      }
    };
    fetchDoctors();
  }, []);

  // Fetch available times when the doctor and appointment date are selected
  // Fetch available times when the doctor and appointment date are selected
  useEffect(() => {
    const fetchAvailableTimes = async () => {
      if (doctorId && appointmentDate) {
        try {
          const { data } = await axios.get(
            "http://localhost:4000/api/v1/user/doctor/availability",
            {
              params: { doctorId, selectedDate: appointmentDate },
              withCredentials: true,
            }
          );

          // Check if the API response has available times
          if (data.success && data.availableTimes) {
            const start = new Date(
              `1970-01-01T${data.availableTimes.startTime}:00`
            );
            const end = new Date(
              `1970-01-01T${data.availableTimes.endTime}:00`
            );
            const timeSlots = [];

            for (let d = start; d <= end; d.setMinutes(d.getMinutes() + 30)) {
              timeSlots.push(d.toTimeString().slice(0, 5));
            }

            setAvailableTimes(timeSlots);
          } else {
            // If no available times
            setAvailableTimes([]);
          }
        } catch (error) {
          toast.error("Error fetching available times.");
        }
      }
    };
    fetchAvailableTimes();
  }, [doctorId, appointmentDate]);

  const validatePhone = (phone) => {
    const phonePattern = /^(071|072|074|076|077)\d{7}$/;
    return phonePattern.test(phone);
  };

  const validateDob = (dob) => {
    const today = new Date();
    const enteredDob = new Date(dob);
    return enteredDob < today;
  };

  const validateAppointmentDate = (appointmentDate) => {
    const today = new Date();
    const selectedAppointmentDate = new Date(appointmentDate);
    return selectedAppointmentDate > today;
  };

  const handleAppointment = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !nic ||
      !dob ||
      !gender ||
      !appointmentDate ||
      !appointmentTime ||
      !doctorId ||
      !department ||
      !address
    ) {
      toast.error("Please fill the full form!");
      setIsSubmitting(false);
      return;
    }

    if (!validatePhone(phone)) {
      toast.error(
        "Please enter a valid phone number starting with 070, 071, 072, 074, 075, 076, 077 or 078 and exactly 10 digits."
      );
      setIsSubmitting(false);
      return;
    }

    if (!validateDob(dob)) {
      toast.error("Date of birth cannot be today or a future date.");
      setIsSubmitting(false);
      return;
    }

    if (!validateAppointmentDate(appointmentDate)) {
      toast.error("Appointment date must be in the future.");
      setIsSubmitting(false);
      return;
    }

    setIsOpen(true);
  };

  const addAppointment = async () => {
    try {
      const { data } = await axios.post(
        "http://localhost:4000/api/v1/appointment/post",
        {
          firstName,
          lastName,
          email,
          phone,
          nic,
          dob: new Date(dob).toISOString(),
          gender,
          appointment_date: new Date(appointmentDate).toISOString(),
          appointment_time: appointmentTime,
          department,
          hasVisited,
          address,
          doctorId,
          doctorFirstName,
          doctorLastName,
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      toast.success(data.message);
      resetForm();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error submitting appointment."
      );
    } finally {
      setIsSubmitting(false); // Reset the submitting state
    }
  }

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setNic("");
    setDob("");
    setGender("");
    setAppointmentDate("");
    setAppointmentTime("");
    setDepartment("Pediatrics");
    setDoctorFirstName("");
    setDoctorLastName("");
    setDoctorId("");
    setDoctorFees("");
    setAvailableTimes([]);
    setHasVisited(false);
    setAddress("");
  };

  return (
    <div className="container form-component appointment-form">
      <h2>Appointment</h2>
      <form onSubmit={handleAppointment}>
        <div>
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
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
          <input
            type="text"
            placeholder="Mobile Number"
            value={phone}
            onChange={(e) => {
              const value = e.target.value;
              setPhone(value);

              // Show error message only if 10 or more digits are entered
              if (value.length >= 10 && !validatePhone(value)) {
                toast.error(
                  "Please enter a valid phone number starting with 071, 072, 074, 076, or 077, and exactly 10 digits."
                );
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
          <input
            type="date"
            placeholder="Appointment Date"
            value={appointmentDate}
            onChange={(e) => {
              setAppointmentDate(e.target.value);
              setAvailableTimes([]);
              if (!validateAppointmentDate(e.target.value)) {
                toast.error("Appointment date must be in the future.");
              }
            }}
          />
        </div>
        <div>
          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setDoctorFirstName("");
              setDoctorLastName("");
              setDoctorId("");
              setDoctorFees(""); // Reset doctor fees when department changes
              setAvailableTimes([]);
              setAppointmentDate("");
              setAppointmentTime(""); // Reset time when department changes
            }}
          >
            {departmentsArray.map((depart, index) => (
              <option value={depart} key={index}>
                {depart}
              </option>
            ))}
          </select>
          <select
            value={`${doctorFirstName} ${doctorLastName}`}
            onChange={(e) => {
              const [firstName, lastName] = e.target.value.split(" ");
              const selectedDoctor = doctors.find(
                (doc) =>
                  doc.firstName === firstName && doc.lastName === lastName
              );
              setDoctorFirstName(firstName);
              setDoctorLastName(lastName);
              setDoctorId(selectedDoctor?._id);
              setDoctorFees(selectedDoctor?.fees || ""); // Set doctor fees
            }}
            disabled={!department}
          >
            <option value="">Select Doctor</option>
            {doctors
              .filter((doctor) => doctor.doctorDepartment === department)
              .map((doctor, index) => (
                <option
                  value={`${doctor.firstName} ${doctor.lastName}`}
                  key={index}
                >
                  {doctor.firstName} {doctor.lastName}
                </option>
              ))}
          </select>
        </div>

        {/* Show available times if a doctor and date are selected */}
        {doctorId && appointmentDate && (
          <div>
            <h4>
              Available Times for {doctorFirstName} {doctorLastName}:
            </h4>
            <select
              value={appointmentTime}
              onChange={(e) => setAppointmentTime(e.target.value)}
            >
              <option value="">Select Appointment Time</option>
              {availableTimes.length > 0 ? (
                availableTimes.map((time, index) => (
                  <option key={index} value={time}>
                    {time}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No available times
                </option>
              )}
            </select>
          </div>
        )}

        {/* Display doctor's fees */}
        {doctorFees && (
          <div>
            <h4>Doctor's Fees: {doctorFees}</h4>
          </div>
        )}

        <div>
          <textarea
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <div className="checkbox-container">
          <input
            type="checkbox"
            checked={hasVisited}
            onChange={() => setHasVisited(!hasVisited)}
          />
          <label>Has Visited</label>
        </div>
        <button type="submit" >
          {" "}
          {/* Disable button when submitting */}
          { "Submit Appointment"}
        </button>
      </form>
      <PaymentModal orderID={uuidv4()} totalPrice={doctorFees}
        address={address}
        phoneNumber={phone}
        doctorId={doctorId}
        customerNic={nic}
        email={email}
        addAppointment={addAppointment}
        isOpen={isOpen} onClose={() => {
          setIsOpen(false);
        }} />
    </div>
  );
};

export default AppointmentForm;
