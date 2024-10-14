import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
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

const FormTitle = styled.h2`
  font-size: 2rem;
  color: #111;
  margin-bottom: 30px;
`;

const FormGrid = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 600px;
  margin: auto;

  input {
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

const AvailabilitySection = styled.div`
  margin-top: 30px;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
`;

const AvailabilityTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 20px;
`;

const AvailabilityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
`;

const AvailabilityItem = styled.div`
  background: ${({ $available }) => ($available ? '#d4edda' : '#f8d7da')};
  padding: 15px;
  border-radius: 8px;
  text-align: center;

  h3 {
    margin: 0;
    font-size: 1.2rem;
  }

  p {
    margin: 5px 0 0;
  }
`;

const DoctorUpdate = () => {
  const { id } = useParams(); // Get the doctor ID from the URL
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/v1/user/doctor/${id}`, {
          withCredentials: true,
        });
        setDoctor(response.data);
      } catch (error) {
        toast.error("Error fetching doctor details: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorDetails();
  }, [id]);

  const handleUpdate = async (event) => {
    event.preventDefault();

    // Prepare updated doctor data based on form inputs
    const updatedDoctor = {
      firstName: event.target.firstName.value,
      lastName: event.target.lastName.value,
      email: event.target.email.value,
      phone: event.target.phone.value,
      nic: event.target.nic.value,
      dob: event.target.dob.value,
      gender: event.target.gender.value,
      doctorDepartment: event.target.doctorDepartment.value,
      fees: event.target.fees.value,
      availability: {},
    };

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    days.forEach((day) => {
      updatedDoctor.availability[day] = {
        available: event.target[`${day.toLowerCase()}Available`].checked,
        startTime: event.target[`${day.toLowerCase()}StartTime`].value,
        endTime: event.target[`${day.toLowerCase()}EndTime`].value,
      };
    });

    try {
      await axios.put(`http://localhost:4000/api/v1/user/doctor/${id}`, updatedDoctor, {
        withCredentials: true,
      });
      toast.success("Doctor updated successfully");
    } catch (error) {
      toast.error("Error updating doctor: " + error.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!doctor) return <p>No doctor found.</p>;

  return (
    <Page>
      <Container>
        <FormTitle>Update Doctor: {doctor.firstName} {doctor.lastName}</FormTitle>
        <FormGrid onSubmit={handleUpdate}>
          <div>
            <label>First Name</label>
            <input type="text" name="firstName" defaultValue={doctor.firstName} required />
          </div>
          <div>
            <label>Last Name</label>
            <input type="text" name="lastName" defaultValue={doctor.lastName} required />
          </div>
          <div>
            <label>Email</label>
            <input type="email" name="email" defaultValue={doctor.email} required />
          </div>
          <div>
            <label>Phone</label>
            <input type="text" name="phone" defaultValue={doctor.phone} required />
          </div>
          <div>
            <label>NIC</label>
            <input type="text" name="nic" defaultValue={doctor.nic} required />
          </div>
          <div>
            <label>Date of Birth</label>
            <input type="date" name="dob" defaultValue={doctor.dob.split("T")[0]} required />
          </div>
          <div>
            <label>Gender</label>
            <input type="text" name="gender" defaultValue={doctor.gender} required />
          </div>
          <div>
            <label>Department</label>
            <input type="text" name="doctorDepartment" defaultValue={doctor.doctorDepartment} required />
          </div>
          <div>
            <label>Fees</label>
            <input type="number" name="fees" defaultValue={doctor.fees} required />
          </div>
          <AvailabilitySection>
            <AvailabilityTitle>Availability</AvailabilityTitle>
            {Object.entries(doctor.availability).map(([day, details]) => (
              <AvailabilityItem key={day} $available={details.available}>
                <h3>{day.charAt(0).toUpperCase() + day.slice(1)}</h3>
                <label>
                  Available
                  <input type="checkbox" name={`${day.toLowerCase()}Available`} defaultChecked={details.available} />
                </label>
                <div>
                  <label>Start Time</label>
                  <input type="time" name={`${day.toLowerCase()}StartTime`} defaultValue={details.startTime} />
                </div>
                <div>
                  <label>End Time</label>
                  <input type="time" name={`${day.toLowerCase()}EndTime`} defaultValue={details.endTime} />
                </div>
              </AvailabilityItem>
            ))}
          </AvailabilitySection>
          <button type="submit">Update Doctor</button>
        </FormGrid>
      </Container>
    </Page>
  );
};

export default DoctorUpdate;
