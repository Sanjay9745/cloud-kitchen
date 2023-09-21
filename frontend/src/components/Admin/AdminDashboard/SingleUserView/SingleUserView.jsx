import SideBar from "../SideBar/SideBar";
import "../../AdminDashboard/AdminDashboard.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import SERVER_URL from "../../../../config/serverURL";
import "./SingleUserView.css";
import * as XLSX from "xlsx";
import MyCalendar from "./MyCalendar";

function SingleUserView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState({});
  const [calendarData, setCalendarData] = useState([]);
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

        // Fetch user data
        const userResponse = await axios.get(
          SERVER_URL + "/admin/get-user/" + id,
          { headers }
        );

        if (userResponse.status === 200) {
          setUser(userResponse.data);
          axios
            .get(
              SERVER_URL +
                "/admin/get-orders-of-user/" +
                userResponse.data.startDate +
                "/" +
                userResponse.data.endDate +
                "/" +
                userResponse.data._id,
              { headers }
            )
            .then((res) => {
              setCalendarData(res.data);
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // You can handle errors here, e.g., show an error message to the user.
      }
    };

    fetchData();
  }, [id, navigate]);

  // Use a separate useEffect for logging the user data
  useEffect(() => {}, [user]);
  const createExcelFile = async (endpoint, fileName) => {
    try {
      const response = await axios.get(SERVER_URL + endpoint + user._id);
      let mappedData = [];
  
      // Map the response data to the desired fields
      if (fileName === "change-list") {
        mappedData = response.data.map((item) => ({
          name: user.fullName,
          phoneNumber: user.phoneNumber,
          date: item.date,
          meal: item.meal,
          count: item.count,
          route: item.route,
          location: item.location,
          foodType: item.foodType,
          verified: item.verified,
          package: item.package,
        }));
      } else {
        mappedData = response.data.map((item) => ({
          name: user.fullName,
          phoneNumber: user.phoneNumber,
          date: item.date,
          meal: item.meal,
        }));
      }
  
      const ws = XLSX.utils.json_to_sheet(mappedData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Orders");
      XLSX.writeFile(wb, `${fileName}-${user.fullName}.xlsx`);
    } catch (error) {
      console.error(`Error fetching data from ${endpoint}: ${error.message}`);
    }
  };
  

  const handlePause = () => {
    createExcelFile("/admin/pause-list/", "pause-list");
  };

  const handleExtra = () => {
    createExcelFile("/admin/extra-list/", "extra-list");
  };

  const handleChange = () => {
    createExcelFile("/admin/change-list/", "change-list");
  };

  const handleCalendarData = () => {
    const ws = XLSX.utils.json_to_sheet(calendarData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    const timestamp = new Date().getTime(); // Get the current timestamp
    XLSX.writeFile(wb, `data-${timestamp}.xlsx`);
  }
  

  return (
    <>
      <div className="dashboard">
        <SideBar />
        <div className="main_content">
          <div className="header">
            <h1>{user.fullName}</h1>
            <div className="header-tab"></div>
          </div>
          <div className="profile-view">
            <p>Name : {user.fullName}</p>
            <p>Phone : {user.phoneNumber}</p>
            <p>Address : {user.address}</p>
            <p>Email : {user.email}</p>
            <p>Start Date : {user.startDate}</p>
            <p>end Date : {user.endDate}</p>
            <p>Plan Type : {user.planType}</p>
            <p>Note : {user.note}</p>

            <div className="profile-meals">
              {user?.breakfast?.selected && (
                <div>
                  <h4>Breakfast</h4>
                  <p>Count : {user.breakfast.count}</p>
                  <p>Route : {user.breakfast.route}</p>
                  <p>Location : {user.breakfast.location}</p>
                  <p>Package : {user.breakfast.package}</p>
                </div>
              )}
              {user?.lunch?.selected && (
                <div>
                  <h4>Lunch</h4>
                  <p>Count : {user.lunch.count}</p>
                  <p>Route : {user.lunch.route}</p>
                  <p>Location : {user.lunch.location}</p>
                  <p>Package : {user.lunch.package}</p>
                </div>
              )}
              {user?.dinner?.selected && (
                <div>
                  <h4>Dinner</h4>
                  <p>Count : {user.dinner.count}</p>
                  <p>Route : {user.dinner.route}</p>
                  <p>Location : {user.dinner.location}</p>
                  <p>Package : {user.dinner.package}</p>
                </div>
              )}
            </div>
            <div className="profile-calendar">
              
              <MyCalendar events={calendarData} />
            </div>
            <div className="button-container">
              <button onClick={handlePause} className="btn m-10">
                Pause List
              </button>
              <button onClick={handleChange} className="btn m-10">
                ChangeList
              </button>
              <button onClick={handleExtra} className="btn m-10">
                Extra List
              </button>
              <button onClick={handleCalendarData} className="btn m-10">
                Download Calendar Data
              </button>
              <button onClick={()=>navigate("/admin/from-and-to-date/"+user._id)} className="btn m-10">
                Download Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SingleUserView;
