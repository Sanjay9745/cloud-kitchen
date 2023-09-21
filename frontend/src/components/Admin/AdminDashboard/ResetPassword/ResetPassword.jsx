import SideBar from "../SideBar/SideBar";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useEffect, useState } from "react";
import SERVER_URL from "../../../../config/serverURL";
function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  useEffect(() => {
    if (!localStorage.getItem("admin-token")) {
      navigate("/");
    } else {
      axios
        .get(SERVER_URL + "/admin/protected", {
          headers: {
            "x-access-token": localStorage.getItem("admin-token"),
          },
        })
        .then((res) => {
          if (res.status !== 200) {
            navigate("/");
          }
        })
        .catch(() => {
          navigate("/");
        });
    }
  }, [navigate]);

  function handleSubmit(e) {
    e.preventDefault();
    const data = {
      password: password,
    };
    console.log(data);
    axios
      .post(
        SERVER_URL + "/admin/reset-password",
        { password: password },
        {
          headers: {
            "x-access-token": localStorage.getItem("admin-token"),
          },
        }
      )
      .then((res) => {
        console.log(res);
        if (res.status === 200) {
          toast.success("Password Changed Successfully");
        } else {
          toast.error("Invalid Credentials");
        }
      })
      .catch(() => {
        toast.error("Invalid Credentials");
      });
  }

  return (
    <>
      <div className="dashboard">
        <SideBar />
        <div className="main_content">
          <div className="header">
            <h1>Reset Password</h1>
          </div>
          <div className="add-user-container">
            <div className="register-container">
              <div className="title"></div>
              <div className="content">
                <form onSubmit={handleSubmit}>
                  <div className="user-details">
                    <div className="input-box">
                      <span className="details">Enter Password</span>
                      <input
                        placeholder="Password"
                        id="password"
                        className="inputField"
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="button">
                    <input type="submit" value="Add" />
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default ResetPassword;