import React from 'react';
import { QRCodeCanvas } from 'qrcode.react'; // QR code generator
import { saveAs } from 'file-saver'; // For downloading the QR code
import { useParams, useNavigate } from 'react-router-dom'; // Hook to get UID from the route and navigate
import './MyQrCode.css'; // Import your custom CSS file

function MyQrCode() {
  const { email } = useParams(); // Get UID from route parameters
  const navigate = useNavigate(); // Hook for navigation

  const downloadQrCode = () => {
    const canvas = document.createElement('canvas');
    const size = 1000; // Set a high resolution for the downloaded QR code
    const borderWidth = 70; // Width of the white border
    canvas.width = size + borderWidth * 2; // Add border to width
    canvas.height = size + borderWidth * 2; // Add border to height

    const context = canvas.getContext('2d');

    // Draw white border
    context.fillStyle = 'white'; // Set border color
    context.fillRect(0, 0, canvas.width, canvas.height); // Draw border rectangle

    // Create a new QR code with a higher resolution
    const qrCanvas = document.getElementById('qrCode');
    context.drawImage(qrCanvas, borderWidth, borderWidth, size, size); // Draw QR code with border offset

    canvas.toBlob((blob) => {
      saveAs(blob, 'UID-QRCode.png'); // Save QR code as PNG
    });
  };

  // Function to handle "Back" button click
 

  return (
    <div>
    <div className="qr-container">
      <h2 className="qr-title">Generate QR Code from UID</h2>
      
      {email ? (
        
        <div className="qr-wrapper">
          <QRCodeCanvas
            id="qrCode"
            value={email} // QR code generated based on UID
            size={200} // QR code size for display
            className="qr-code"
          />
          <button className="qr-button" onClick={downloadQrCode}>
            Download QR Code
          </button>
          
        </div>
      ) : (
        <p className="loading-text">Loading UID...</p>
      )}
    </div>
    {/* Back Button */}
          <button >
            Back to Medical Profile
          </button>
    </div>
  );
}

export default MyQrCode;