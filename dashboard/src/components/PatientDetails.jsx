// PatientDetails.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Navigate, useNavigate } from "react-router-dom"; 
import Webcam from "react-webcam";
import jsQR from "jsqr"; 

const PatientDetails = () => {
  const [patients, setPatients] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(true); 
  const [scannedEmail, setScannedEmail] = useState(""); 

 

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4000/api/v1/appointment/getall",
          { withCredentials: true }
        );
        console.log(data);

        const patientDetails = data.appointments.map((appointment) => ({
          firstName: appointment.patientId?.firstName || "N/A",
          lastName: appointment.patientId?.lastName || "N/A",
          email: appointment.patientId?.email || "N/A",
          phone: appointment.patientId?.phone || "N/A",
          nic: appointment.patientId?.nic || "N/A",
          dob: appointment.patientId?.dob || "N/A",
          gender: appointment.patientId?.gender || "N/A",
          appointment_date: appointment.appointment_date || "N/A",
          department: appointment.department || "N/A",
          doctorId: appointment.doctorId || "N/A",
          hasVisited: appointment.hasVisited ? "Yes" : "No",
          address: appointment.address || "N/A",
          appointment_time: appointment.appointment_time || "N/A",
        }));

        setPatients(patientDetails);
      } catch (error) {
        console.error("Error fetching patients:", error);
        toast.error("Failed to fetch patients.");
      }
    };

    fetchPatients();
  }, []);

  if (!isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  

  return (
    <section style={styles.section}>
      <h1 style={styles.title}>Patients Details</h1>
      <QrCodeScanner setScannedEmail={setScannedEmail} />
      <div style={styles.banner}>
        {patients.length > 0 ? (
          patients
            .filter((patient) =>
              scannedEmail ? patient.email === scannedEmail : true
            )
            .map((patient, index) => (
              <div style={styles.card} key={index}>
                <h4 style={styles.cardTitle}>{`${patient.firstName} ${patient.lastName}`}</h4>
                <div style={styles.details}>
                  <div style={styles.detailRow}>
                    <p>Email:</p>
                    <p>{patient.email}</p>
                  </div>
                  <div style={styles.detailRow}>
                    <p>Phone:</p>
                    <p>{patient.phone}</p>
                  </div>
                  <div style={styles.detailRow}>
                    <p>DOB:</p>
                    <p>{patient.dob.substring(0, 10)}</p>
                  </div>
                  <div style={styles.detailRow}>
                    <p>NIC:</p>
                    <p>{patient.nic}</p>
                  </div>
                  <div style={styles.detailRow}>
                    <p>Gender:</p>
                    <p>{patient.gender}</p>
                  </div>
                  <div style={styles.detailRow}>
                    <p>Appointment Date:</p>
                    <p>{patient.appointment_date.substring(0, 10)}</p>
                  </div>
                  <div style={styles.detailRow}>
                    <p>Department:</p>
                    <p>{patient.department}</p>
                  </div>
                  <div style={styles.detailRow}>
                    <p>Doctor ID:</p>
                    <p>{patient.doctorId}</p>
                  </div>
                  <div style={styles.detailRow}>
                    <p>Has Visited:</p>
                    <p>{patient.hasVisited}</p>
                  </div>
                  <div style={styles.detailRow}>
                    <p>Address:</p>
                    <p>{patient.address}</p>
                  </div>
                  <div style={styles.detailRow}>
                    <p>Appointment Time:</p>
                    <p>{patient.appointment_time}</p>
                  </div>

                 


                </div>
              </div>
            ))
        ) : (
          <h1>No Patients Found!</h1>
        )}
      </div>
    </section>
  );
};

// QR Code Scanner Component
const QrCodeScanner = ({ setScannedEmail }) => {
  const webcamRef = useRef(null); 
  const [data, setData] = useState(""); 
  const navigate = useNavigate(); 

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot(); 

    if (imageSrc) {
      const img = new Image();
      img.src = imageSrc;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0, img.width, img.height);

        const imageData = context.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, img.width, img.height); 

        if (code) {
          console.log("QR Code detected:", code.data); 
          setData(code.data); 
          setScannedEmail(code.data); 
        } else {
          console.log("QR Code not detected");
        }
      };
    }
  }, [webcamRef, setScannedEmail]);

  useEffect(() => {
    const interval = setInterval(() => {
      capture(); 
    }, 1000); 

    return () => clearInterval(interval); 
  }, [capture]);

  return (
    <div style={styles.scannerContainer}>
      <h2>Scan QR Code</h2>
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width={400} 
      />
      {data && <p>Scanned email: {data}</p>}
    </div>
  );
};

const styles = {
  section: {
    padding: "20px",
    backgroundColor: "#c0c0c0", // Light gray background
    minHeight: "100vh", // Ensure the background covers the full viewport height
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
  },
  banner: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    justifyContent: "flex-start", 
    marginLeft: "220px", 
  },
  card: {
    background: "#f9f9f9",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "15px",
    width: "350px",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    textAlign: "left",
  },
  cardTitle: {
    marginBottom: "10px",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "18px",
  },
  details: {
    marginTop: "10px",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "5px 0",
    borderBottom: "1px solid #eee",
  },
  scannerContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
    textAlign: "center",
    fontSize: "10px",
  },

};

export default PatientDetails;
