import SideBar from "../SideBar/SideBar";
import "../../AdminDashboard/AdminDashboard.css";
import "../AddUser/AddUser.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import SERVER_URL from "./../../../../config/serverURL";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function AddChange() {
  // State for user details
  const navigate = useNavigate();
  const { id } = useParams();
  const [packages, setPackages] = useState([]);
  const [change, setChange] = useState({
    date: "",
    count: 0,
    package: "",
    route: "",
    location: "",
    meal: "",
    foodType: "",
    userId: id,
  });

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

        // Fetch other data (e.g., packages)
        const packagesResponse = await axios.get(
          SERVER_URL + "/admin/packages",
          { headers }
        );

        if (packagesResponse.status !== 200) {
          console.error("Failed to fetch packages");
          return;
        }

        const packagesData = packagesResponse.data;

        setPackages(packagesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Handle errors and show appropriate feedback to the user.
      }
    };

    fetchData();
  }, [navigate]);

  function handleSubmit(e) {
    e.preventDefault();
    if(change.date === "" || change.meal === "" ){
        toast.error("Please date and meal are required")
        return;
    }
    axios
      .post(
        SERVER_URL + "/admin/add-change",
        { change: change },
        {
          headers: {
            "x-access-token": localStorage.getItem("admin-token"),
          },
        }
      )
      .then((response) => {
        if (response.status === 200) {
          const changeId = response.data.change._id; // Assuming the change ID is in the response data

          // Now make a request to accept the change
          axios
            .post(
              SERVER_URL + "/admin/accept-change",
              { id: changeId },
              {
                headers: {
                  "x-access-token": localStorage.getItem("admin-token"),
                },
              }
            )
            .then((res) => {
              if (res.status === 200) {
                toast.success("Change Added and Accepted Successfully");
                navigate("/admin/all-users");
              }
            })
            .catch(() => {
                toast.error("Failed to add change")
            });
        }
      })
      .catch(() => {
       toast.error("Failed to add change")
      });
  }

  return (
    <>
      <div className="dashboard">
        <SideBar />
        <div className="main_content">
          <div className="header">
            <h1>Add Change</h1>
          </div>
          <div className="add-user-container">
            <div className="register-container">
              <div className="title">Add Change</div>
              <div className="content">
                <form onSubmit={handleSubmit}>
                  <div className="user-details user">
                    <div className="input-box user">
                      <span className="details">Date</span>
                      <input
                        required
                        type="date"
                        placeholder="Enter date"
                        name="date"
                        onChange={(e) =>
                          setChange({ ...change, date: e.target.value })
                        }
                      />
                    </div>
                    <div className="input-box">
                      <span className="details">Count</span>
                      <input
                        type="count"
                        placeholder="Enter count"
                        name="count"
                        onChange={(e) =>
                          setChange({ ...change, count: e.target.value })
                        }
                      />
                    </div>
                    <div className="input-box">
                      <span className="details">Location</span>
                      <input
                        type="location"
                        placeholder="Enter location"
                        name="location"
                        onChange={(e) =>
                          setChange({ ...change, location: e.target.value })
                        }
                      />
                    </div>
                    <div className="input-box">
                      <span className="details">Route</span>
                      <input
                        type="route"
                        placeholder="Enter  route"
                        name="route"
                        onChange={(e) =>
                          setChange({ ...change, route: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <label className="select" htmlFor={`select`}>
                    <select
                      id={`select`}
                      name="package"
                      className="select-option"
                      onChange={(e) =>
                        setChange({ ...change, package: e.target.value })
                      }
                    >
                      <option value="" disabled selected>
                        Package
                      </option>
                      {packages.map((pack) => (
                        <option key={pack._id} value={pack.name} name="package">
                          {pack.name}
                        </option>
                      ))}
                    </select>

                    <svg>
                      <use xlinkHref="#select-arrow-down"></use>
                    </svg>
                  </label>
                  <label className="select " htmlFor={`select-meal`}>
                    <select
                    required
                      id={`select-meal`}
                      name="meal"
                      onChange={(e) =>
                        setChange({ ...change, meal: e.target.value })
                      }
                      className="select-option"
                    >
                      <option value="" disabled selected>
                        Meal
                      </option>
                      <option value="breakfast">Break Fast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                    </select>

                    <svg>
                      <use xlinkHref="#select-arrow-down"></use>
                    </svg>
                  </label>
                  <label className="select" htmlFor={`select-food-type`}>
                    <select
                      id={`select-food-type`}
                      name="foodType"
                      className="select-option"
                      onChange={(e) =>
                        setChange({ ...change, foodType: e.target.value })
                      }
                    >
                      <option value="" disabled selected>
                        Food Type
                      </option>
                      <option value="non-veg">Non-Veg</option>
                      <option value="veg">Veg</option>
                    </select>

                    <svg>
                      <use xlinkHref="#select-arrow-down"></use>
                    </svg>
                  </label>
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

export default AddChange;
