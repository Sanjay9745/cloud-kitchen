import "./Login.css";
import { useEffect, useState } from 'react';
import { auth } from "../../../config/firebase"; // Make sure to import Firebase correctly
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import axios from "axios";
import SERVER_URL from './../../../config/serverURL';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

const Login = () => {
    const [mynumber, setnumber] = useState("");
    const [otp, setotp] = useState('');
    const [showOTP, setShowOTP] = useState(false);
    const [otpSent, setOtpSent] = useState(false); // New state for OTP sending status
    const navigate = useNavigate();

    // Initialize the reCAPTCHA verifier
    useEffect(() => {
        if (localStorage.getItem("token")) {
          axios.get(SERVER_URL+"/user/protected", {
            headers: {
              "x-access-token": localStorage.getItem("token"),
            },
          }).then((res) => {
            if (res.status === 200) {
              navigate("/");
            }else{
                localStorage.removeItem("token");
            }
          }
          ).catch(()=>{
            localStorage.removeItem("token");
          })
        }
      }, [navigate]);

    const initializeRecaptchaVerifier = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(
                "recaptcha-container",
                {
                    size: "invisible",
                    callback: () => {
                        onSignup();
                    },
                    "expired-callback": () => {},
                },
                auth
            );
        }
    }

    // Handle phone number submission
    const onSignup = async () => {
        initializeRecaptchaVerifier();
    
        // Ensure the phone number includes "91"
        const formatPh = mynumber.startsWith("91") ? `+${mynumber}` : `+91${mynumber}`;
    
        try {
            setOtpSent(false); // Reset OTP sent status
          
    
            const confirmationResult = await signInWithPhoneNumber(auth, formatPh, window.recaptchaVerifier);
            window.confirmationResult = confirmationResult;
    
            setShowOTP(true);
            setOtpSent(true); // Update OTP sent status
        } catch (error) {
            console.log(error);
            toast.error("Something went wrong"); // Display "Something went wrong" message
            // Handle error, show user-friendly message
        }
    }

    // Handle OTP verification
    const onOTPVerify = async () => {
        try {
            if (!window.confirmationResult) {
                throw new Error("No confirmation result available. Please submit your phone number again.");
            }
    
            const res = await window.confirmationResult.confirm(otp);
    
            if (res.user) {
                console.log("User signed in:", res.user);
                axios.post(SERVER_URL + '/user/phone-login', {
                    token: await res.user.getIdToken()
                }).then((res) => {
                    if (res.status === 200) {
                        localStorage.setItem('token', res.data.token);
                        navigate("/")
                    }
                })
                // Handle successful verification, e.g., redirect or update UI
            } else {
                throw new Error("Verification failed. User not signed in.");
            }
        } catch (error) {
            console.log(error);
            toast.error("Invalid OTP"); // Display "Invalid OTP" message
            // Handle the error, display a user-friendly message, and potentially allow the user to retry OTP entry.
        }
    }
    

    return (
        <>
            <div className="form-container">
                {showOTP ? (
                    <div className="form_main">
                        <p className="heading">Verify OTP</p>
                        <div className="inputContainer">
                            <i className="fa-solid fa-mobile inputIcon"></i>
                            <input
                                id="inputField"
                                className="inputField"
                                type="number"
                                name="otp"
                                maxLength={6} // Ensure maxLength is set to 6
                                placeholder="Enter your OTP"
                                value={otp}
                                onChange={(e) => {
                                    // Limit input to 6 characters
                                    setotp(e.target.value.slice(0, 6));
                                }}
                            />
                        </div>
                        <button id="button" onClick={onOTPVerify}>Verify</button>
                        {otpSent && <p>OTP sent successfully</p>}
                    </div>
                ) : (
                    <div className="form_main">
                        <p className="heading">Login</p>
                        <div className="inputContainer">
                            <i className="fa-solid fa-mobile inputIcon"></i>
                            <input
                                placeholder="Mobile Number"
                                id="inputField"
                                className="inputField"
                                type="number"
                                name="mobile"
                                value={mynumber}
                                onChange={(e) => {
                                    setnumber(e.target.value);
                                }}
                            />
                        </div>
                        <div id="recaptcha-container"></div>
                        <button onClick={onSignup} id="button">Submit</button>
                        {otpSent && <p>OTP sending in progress...</p>}
                    </div>
                )}
            </div>
        </>
    );
}

export default Login;