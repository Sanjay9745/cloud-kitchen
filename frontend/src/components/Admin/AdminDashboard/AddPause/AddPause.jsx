import SideBar from "../SideBar/SideBar";
import "../../AdminDashboard/AdminDashboard.css";
import "../AddUser/AddUser.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import SERVER_URL from "./../../../../config/serverURL";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AddPause() {
  // State for user details
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedMeals, setSelectedMeals] = useState([]); // Store selected meals as an array

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
  }, [navigate]);

  function handleSubmit(e) {
    e.preventDefault();
    if (selectedMeals.length === 0) {
      toast.error("Please select at least one meal");
      return;
    }

    // Send a separate POST request for each selected meal
    selectedMeals.forEach((meal) => {
      axios
        .post(
          SERVER_URL + "/admin/add-pause",
          { meal, date: e.target.date.value, userId: id },
          {
            headers: {
              "x-access-token": localStorage.getItem("admin-token"),
            },
          }
        )
        .then((response) => {
          if (response.status === 200) {
            toast.success(`Pause for ${meal} added successfully`);
          }
        })
        .catch(() => {
          toast.error(`Failed to add pause for ${meal}`);
        });
    });

    navigate("/admin/all-users");
  }

  return (
    <>
      <div className="dashboard">
        <SideBar />
        <div className="main_content">
          <div className="header">
            <h1>Add Pause</h1>
          </div>
          <div className="add-user-container">
            <div className="register-container">
              <div className="title">Add Pause</div>
              <div className="content">
                <form onSubmit={handleSubmit}>
                  <div className="user-details">
                    <div className="input-box">
                      <span className="details">Date</span>
                      <input
                        required
                        type="date"
                        placeholder="Enter date"
                        name="date"
                      />
                    </div>
                  </div>

                  <div className="meals-container">
                    <span className="details">Meals</span>
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          value="breakfast"
                          onChange={(e) =>
                            e.target.checked
                              ? setSelectedMeals([...selectedMeals, "breakfast"])
                              : setSelectedMeals(
                                  selectedMeals.filter(
                                    (meal) => meal !== "breakfast"
                                  )
                                )
                          }
                        />
                        Breakfast
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          value="lunch"
                          onChange={(e) =>
                            e.target.checked
                              ? setSelectedMeals([...selectedMeals, "lunch"])
                              : setSelectedMeals(
                                  selectedMeals.filter(
                                    (meal) => meal !== "lunch"
                                  )
                                )
                          }
                        />
                        Lunch
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          value="dinner"
                          onChange={(e) =>
                            e.target.checked
                              ? setSelectedMeals([...selectedMeals, "dinner"])
                              : setSelectedMeals(
                                  selectedMeals.filter(
                                    (meal) => meal !== "dinner"
                                  )
                                )
                          }
                        />
                        Dinner
                      </label>
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

export default AddPause;
