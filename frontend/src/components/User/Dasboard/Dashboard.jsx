import { useEffect, useState } from "react";
import TopNav from "../TopNav/TopNav";
import "./Dashboard.css";
import axios from "axios";
import SERVER_URL from "./../../../config/serverURL";
import { useNavigate } from "react-router-dom";
import Loading from './../Loading/Loading';

function Dashboard() {
  const [user, setUser] = useState({});
  // const [progressPercentage, setProgressPercentage] = useState(0);
  const navigate = useNavigate();
  const [extra, setExtra] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    } else {
      axios
        .get(SERVER_URL + "/user/protected", {
          headers: {
            "x-access-token": localStorage.getItem("token"),
          },
        })
        .then((res) => {
          if (res.status === 200) {
            axios
              .get(SERVER_URL + "/user/", {
                headers: {
                  "x-access-token": localStorage.getItem("token"),
                },
              })
              .then((res) => {
                if (res.status === 200) {
                  setUser(res.data);
                  setLoading(false);
                  // Calculate the progress percentage
                  // const startDate = new Date(user.startDate);
                  // const endDate = new Date(user.endDate);
                  // const currentDate = new Date();
                  // const totalTimeRange = endDate - startDate;
                  // const elapsedTime = currentDate - startDate;
                  // const percentage = (elapsedTime / totalTimeRange) * 100;
                
                  // setProgressPercentage(Math.min(100, Math.max(0, percentage)));
                  axios
                    .get(SERVER_URL + "/admin/extra-list/" + user._id, {
                      headers: {
                        "x-access-token": localStorage.getItem("token"),
                      },
                    })
                    .then((extraResponse) => {
                      console.log(extraResponse.data);
                      const currentDate = new Date();
                      const filteredExtra = extraResponse.data?.filter(
                        (item) => {
                          const itemDate = new Date(item.date);
                         
                          //itemDate needs to be lesser than current date
                          return itemDate.getDay() <= currentDate.getDay();
                        }
                      );
                      
                      setExtra(filteredExtra);
                    })
                    .catch(() => {
                      console.log("no extra");
                      setLoading(false);
                    });
                }
              })
              .catch((err) => {
                console.log(err);
                setLoading(false);
                navigate("/login");
                localStorage.removeItem("token");
              });
          }
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
          localStorage.removeItem("token");
          navigate("/login");
        });
    }
  }, [navigate, user.startDate, user.endDate, user._id]);
  // const containerStyle = {
  //   background:
  //     `radial-gradient(closest-side, white 79%, transparent 80% 100%)` +
  //     `, conic-gradient(hotpink ${progressPercentage}%, pink 0)`,
  // };
  if(loading){
    return <Loading />
  }
  return (
    <div className="dashboard-user">
      <TopNav />
      <div className="progress-container">
        <div className="progress-form">
          {/* <div className="progress-bar" style={containerStyle}>
            <progress
              value={progressPercentage}
              min="0"
              max="100"
              style={{ visibility: "hidden", height: "0", width: "0" }}
            >
              75%
            </progress>
          </div> */}
          <div className="progress-name">
            <h2>Hello ! <br/><span>{user.fullName}</span></h2>
          </div>
          <div className="progress-date">
            <div className="start-date">
              <h3>Start Date</h3>
              <p>{user.startDate}</p>
            </div>
            <div className="end-date">
              <h3>End Date</h3>
              <p>{user.endDate}</p>
            </div>
          </div>
          <div className="progress-details">
            <p>
              <i className="fa-solid fa-phone"></i> {user?.phoneNumber}
            </p>
            <p>
              <i className="fa-solid fa-envelope"></i> {user?.email}
            </p>
            <p>
              <i className="fa-solid fa-address-card"></i> {user?.address}
            </p>
            <div className="meals-list">
              {user?.breakfast?.selected && (
                <>
                  <div className="breakfast">
                    <h3>Breakfast</h3>
                    <p>Count : {user?.breakfast.count}</p>
                    <p>Package : {user?.breakfast.package}</p>
                    <p>Route : {user?.breakfast.route}</p>
                    <p>Location : {user?.breakfast.location}</p>
                  </div>
                </>
              )}
              {user?.lunch?.selected && (
                <>
                  <div className="lunch">
                    <h3>Lunch</h3>
                    <p>Count : {user?.lunch.count}</p>
                    <p>Package : {user?.lunch.package}</p>
                    <p>Route : {user?.lunch.route}</p>
                    <p>Location : {user?.lunch.location}</p>
                  </div>
                </>
              )}
              {user?.dinner?.selected && (
                <>
                  <div className="dinner">
                    <h3>Dinner</h3>
                    <p>Count : {user?.dinner.count}</p>
                    <p>Package : {user?.dinner.package}</p>
                    <p>Route : {user?.dinner.route}</p>
                    <p>Location : {user?.dinner.location}</p>
                  </div>
                </>
              )}
            </div>
                    <h2>Extras</h2>
              <div className="extras">
              {extra?.map((item, index) => (
                <>
                  <div className="extra" key={item._id}>
                    <p>No : {index+1}</p>
                    <p>Meal : {item.meal}</p>
                    <p>Date : {item.date}</p>
                  </div>
                </>
              ))}
               </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
