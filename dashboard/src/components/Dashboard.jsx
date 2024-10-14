import React, { useContext, useEffect, useState } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { GoCheckCircleFill } from "react-icons/go";
import { AiFillCloseCircle } from "react-icons/ai";

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]); // State to hold doctor details
  const [doctorsCount, setDoctorsCount] = useState(0); // State to hold the count of doctors

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4000/api/v1/appointment/getall",
          { withCredentials: true }
        );
        console.log("Fetched appointments:", data.appointments);
        setAppointments(data.appointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setAppointments([]);
      }
    };

    fetchAppointments(); // Call the function to fetch appointments
  }, []);

  useEffect(() => {
    const fetchDoctorsCount = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4000/api/v1/user/doctors", // Fetch all doctors
          { withCredentials: true }
        );
        console.log("Fetched doctors:", data); // Log the fetched doctors data

        // Access the count from the response
        if (data.success && Array.isArray(data.doctors)) {
          setDoctorsCount(data.doctors.length); // Set the count of doctors
          setDoctors(data.doctors); // Store the doctors' data
        } else {
          console.error("Unexpected response structure:", data);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctorsCount(); // Call the function to fetch the count of doctors
  }, []); // This effect only runs once on mount

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      const { data } = await axios.put(
        `http://localhost:4000/api/v1/appointment/update/${appointmentId}`,
        { status },
        { withCredentials: true }
      );
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment._id === appointmentId
            ? { ...appointment, status }
            : appointment
        )
      );
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const { isAuthenticated, admin } = useContext(Context);
  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  return (
    <section className="dashboard page">
      <div className="banner">
        <div className="firstBox">
          <img src="/doc.png" alt="docImg" />
          <div className="content">
            <div>
              <p>Hello,</p>
              <h5>{admin && `${admin.firstName} ${admin.lastName}`}</h5>
            </div>
            <p>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit.
              Facilis, nam molestias. Eaque molestiae ipsam commodi neque.
              Assumenda repellendus necessitatibus itaque.
            </p>
          </div>
        </div>
        <div className="secondBox">
          <p>Total Appointments</p>
          <h3>{appointments.length}</h3>
        </div>
        <div className="thirdBox">
          <p>Registered Doctors</p>
          <h3>{doctorsCount > 0 ? doctorsCount : "Loading..."}</h3> {/* Display the count of doctors */}
        </div>
      </div>
      <div className="banner">
        <h5>Appointments</h5>
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Date</th>
              <th>Time</th> {/* New Time Column */}
              <th>Doctor</th>
              <th>Department</th>
              <th>Status</th>
              <th>Visited</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length > 0 ? appointments.map((appointment) => {
              // Find the doctor for this appointment
              const doctor = doctors.find(doc => doc._id === appointment.doctorId);
              return (
                <tr key={appointment._id}>
                  <td>{`${appointment.firstName || "Unknown"} ${appointment.lastName || "Unknown"}`}</td>
                  <td>{appointment.appointment_date.substring(0, 10)}</td>
                  <td>{appointment.appointment_time}</td> {/* Display the appointment time */}
                  <td>{`${doctor ? `${doctor.firstName} ${doctor.lastName}` : "Unknown"}`}</td>
                  <td>{appointment.department || "N/A"}</td>
                  <td>
                    <select
                      className={
                        appointment.status === "Pending"
                          ? "value-pending"
                          : appointment.status === "Accepted"
                          ? "value-accepted"
                          : "value-rejected"
                      }
                      value={appointment.status}
                      onChange={(e) =>
                        handleUpdateStatus(appointment._id, e.target.value)
                      }
                    >
                      <option value="Pending" className="value-pending">Pending</option>
                      <option value="Accepted" className="value-accepted">Accepted</option>
                      <option value="Rejected" className="value-rejected">Rejected</option>
                    </select>
                  </td>
                  <td>
                    {appointment.hasVisited ? (
                      <GoCheckCircleFill className="green" />
                    ) : (
                      <AiFillCloseCircle className="red" />
                    )}
                  </td>
                </tr>
              );
            }) : <tr><td colSpan="7">No Appointments Found!</td></tr>} {/* Adjusted colSpan for the new column */}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Dashboard;
