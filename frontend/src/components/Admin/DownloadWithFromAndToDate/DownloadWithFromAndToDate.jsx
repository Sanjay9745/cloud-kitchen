import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";
import "react-toastify/dist/ReactToastify.css";

import SERVER_URL from "../../../config/serverURL";
import SideBar from "../AdminDashboard/SideBar/SideBar";
function DownloadWithFromAndToDate() {
  // State for user details
  const navigate = useNavigate();
    const {id} = useParams();
    const [fromDate,setFromDate] = useState("");
    const [toDate,setToDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!localStorage.getItem("admin-token")) {
          navigate("/login");
          return;
        }

        const headers = {
          "x-access-token": localStorage.getItem("admin-token"),
        };

        const isProtected = await axios.get(SERVER_URL + "/admin/protected", {
          headers,
        });
        if (isProtected.status !== 200) {
          navigate("/login");
          return;
        }
       
      } catch (error) {
        console.error("Error fetching data:", error);
        // Handle errors and show appropriate feedback to the user.
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

    function handleSubmit(e) {
        e.preventDefault();
        axios
        .get(
          SERVER_URL +
            "/admin/get-orders-of-user/" +
          fromDate+
            "/" +
           toDate +
            "/" +
            id,
          { headers:{
            "x-access-token": localStorage.getItem("admin-token"),
          } }
        )
        .then((res) => {

          const ws = XLSX.utils.json_to_sheet(res.data);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Orders");
          const timestamp = new Date().getTime(); // Get the current timestamp
          XLSX.writeFile(wb, `data-${timestamp}.xlsx`);
        })
        .catch((err) => {
          console.log(err);
        });
    }

    
  return (
    <>
      <div className="dashboard">
        <SideBar/>
        <div className="main_content">
          <div className="header">
            <h1>Download Data</h1>
          </div>
          <div className="add-user-container">
            <div className="register-container">
              <div className="title">Download Data</div>
              <div className="content">
                <form onSubmit={handleSubmit}>
                  <div className="user-details user">
                    <div className="input-box">
                      <span className="details">From Date</span>
                      <input
                        required
                        type="date"
                        placeholder="Enter From date"
                        name="date"
                        onChange={(e) =>
                          setFromDate(e.target.value)
                        }
                      />
                    </div>
                    <div className="input-box">
                      <span className="details">To Date</span>
                      <input
                        required
                        type="date"
                        placeholder="Enter To date"
                        name="date"
                        onChange={(e) =>
                          setToDate(e.target.value)
                        }
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
    </>
  );
}

export default DownloadWithFromAndToDate;
