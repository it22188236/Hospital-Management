import React, { useContext } from "react";
import Hero from "../components/Hero";
import Biography from "../components/Biography";
import MessageForm from "../components/MessageForm";
import Departments from "../components/Departments";
import { useParams, useNavigate } from 'react-router-dom'; 

const Home = () => {
  const { email } = useParams();
  console.log(email)
  const navigate = useNavigate(); // Hook for navigation

  const handleGetQrClick = () => {
    navigate('/myqrcode/${email}');
  };

  return (
    <>
      <Hero
        title={
          "Welcome to ZeeCare Medical Institute | Your Trusted Healthcare Provider"
        }
        imageUrl={"/hero.png"}
      />
      <div>
      <button onClick={handleGetQrClick}>
        Get Your QR Code
      </button>
      </div>
      <Biography imageUrl={"/about.png"} />
      <Departments />
      <MessageForm />
    </>
  );
};

export default Home;