import {  useState } from "react"
import axios from "axios";

import { useNavigate, useParams } from 'react-router-dom';
import { toast } from "react-toastify";
import SERVER_URL from "../../../../config/serverURL";

const ForgotPassword = () => {
  const email = useParams()
 const [otp,setOtp] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post(SERVER_URL+"/admin/verify-otp", {otp:otp,email:email}).then((res) => {
        console.log(res);
        if (res.status ===200) {
            localStorage.setItem("admin-token", res.data.token);
            navigate("/admin/reset-password")
        } else {
            alert("Invalid Credentials");
        }
    }).catch(()=>{
        toast.error("Invalid OTP");
    })
  };

  return (
    <>
      <div className="form-container">
      <form className="form_main" action="">
        <p className="heading">Admin Login</p>

        <div className="inputContainer">
          <svg
            viewBox="0 0 16 16"
            fill="#2e2e2e"
            height="16"
            width="16"
            xmlns="http://www.w3.org/2000/svg"
            className="inputIcon"
          >
            <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"></path>
          </svg>
          <input
            placeholder="OTP"
            id="otp"
            className="inputField"
            type="number"
            onChange={(e) => setOtp(e.target.value)}
          />
        </div>

        <button id="button" onClick={handleSubmit}>Submit</button>

      </form>
      </div>
    </>
  )
}

export default ForgotPassword;

