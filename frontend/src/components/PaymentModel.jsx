import { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import emailjs from '@emailjs/browser';
import { useNavigate } from 'react-router-dom';

// eslint-disable-next-line react/prop-types
const PaymentModal = ({ orderID, totalPrice, isOpen, onClose, address, phoneNumber, doctorId, customerNic, email, addAppointment }) => {
    const [cardNumber, setCardNumber] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const validateForm = () => {
        const errors = {};
        if (!cardNumber.trim()) {
            errors.cardNumber = 'Card number is required';
        }
        if (!expirationDate.trim()) {
            errors.expirationDate = 'Expiration date is required';
        } else {
            const currentDate = new Date();
            const enteredDate = new Date(expirationDate);
            if (enteredDate <= currentDate) {
                errors.expirationDate = 'Expiration date must be in the future';
            }
        }
        if (!cvv.trim()) {
            errors.cvv = 'CVV is required';
        }
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length === 0) {
            const orderDetails = {
                orderID: orderID,
                totalPrice: totalPrice,
                doctorId: doctorId,
                customerNic: customerNic,
                address: address,
                phoneNumber: phoneNumber,
                email: email
            };
            try {
                // Send order details to your backend
                await axios.post('http://localhost:4000/api/v1/order', orderDetails);

                // Prepare email parameters
                const templateParams = {
                    to_email: email,
                    order_id: orderID,
                    price: totalPrice,
                    address: address,
                };

                // Send email using EmailJS
                const emailResponse = await emailjs.send(
                    'service_ug7k33r',
                    'template_tsj7bya',
                    templateParams,
                    'VrWGIjPEAlbOz6cfO'
                );

                console.log('Email sent:', emailResponse);

                // Add appointment (you might want to wait for email success if necessary)
                await addAppointment();

                Swal.fire({
                    icon: 'success',
                    title: 'Appointment Placed Successfully!',
                    text: 'Your appointment has been placed successfully.',
                    confirmButtonText: 'OK'
                });

                // Navigate to appointment page after a delay
                setTimeout(() => {
                    navigate("/appointment");
                }, 3000);
            } catch (error) {
                console.error('Error adding order or sending email:', error);

                // If email sending failed, show specific error
                const errorMessage = error.response ? error.response.data : 'There was an error sending your email.';
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: errorMessage,
                    confirmButtonText: 'OK'
                });
            }
        } else {
            setErrors(validationErrors);
        }
    };

    const handleCancel = () => {
        onClose(); // Close modal without action
        navigate("/appointment");
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <div className="modal-header">
                    <h2>Payment</h2>
                    
                </div>
                <div className="modal-body">
                    <h4 style={{ fontWeight: 'bold', marginBottom: '20px' }}>Order ID: {orderID}</h4>
                    <h4 style={{ fontWeight: 'bold', marginBottom: '20px' }}>Payment Price: LKR {totalPrice}</h4>
                    <hr />
                    <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <input
                                type="text"
                                value={cardNumber}
                                onChange={(e) => {
                                    const inputCardNumber = e.target.value.replace(/\D/g, '').slice(0, 16);
                                    setCardNumber(inputCardNumber);
                                }}
                                placeholder='Card Number'
                            />
                            {errors.cardNumber && <small style={{ color: 'red' }}>{errors.cardNumber}</small>}
                        </div>
                        <div>
                            <input
                                type="date"
                                value={expirationDate}
                                onChange={(e) => setExpirationDate(e.target.value)}
                                placeholder='Expire Date'
                            />
                            {errors.expirationDate && <small style={{ color: 'red' }}>{errors.expirationDate}</small>}
                        </div>
                        <div>
                            <input
                                type="text"
                                value={cvv}
                                onChange={(e) => {
                                    const inputCVV = e.target.value.replace(/\D/g, '').slice(0, 3);
                                    setCvv(inputCVV);
                                }}
                                placeholder='CVV'
                            />
                            {errors.cvv && <small style={{ color: 'red' }}>{errors.cvv}</small>}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#009637', color: '#fff', border: 'none', borderRadius: '4px' }}>
                                Pay Now
                            </button>
                            <button type="button" onClick={handleCancel} style={{ padding: '10px 20px', backgroundColor: 'red', color: '#fff', border: 'none', borderRadius: '4px', marginLeft: '20px' }}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;