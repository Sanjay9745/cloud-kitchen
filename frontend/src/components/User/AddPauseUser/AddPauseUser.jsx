import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TopNav from "../TopNav/TopNav";
import SERVER_URL from "../../../config/serverURL";
function AddPauseUser() {
  // State for user details
  const navigate = useNavigate();
  const [pause, setPause] = useState({
    date: "",
    meal: "",
  });
  const [id, setId] = useState("");
  const [user, setUser] = useState({});
  const [meals, setMeals] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!localStorage.getItem("token")) {
          navigate("/login");
          return;
        }

        const headers = {
          "x-access-token": localStorage.getItem("token"),
        };

        const isProtected = await axios.get(SERVER_URL + "/user/protected", {
          headers,
        });
        if (isProtected.status !== 200) {
          navigate("/login");
          return;
        }
        axios
          .get(SERVER_URL + "/user/", {
            headers: {
              "x-access-token": localStorage.getItem("token"),
            },
          })
          .then((res) => {
            if (res.status === 200) {
              setId(res.data._id);
              setUser(res.data);

              const newMeals = [];

              if (res.data.breakfast.selected && !meals.includes("breakfast")) {
                newMeals.push("breakfast");
              }

              if (res.data.lunch.selected && !meals.includes("lunch")) {
                newMeals.push("lunch");
              }

              if (res.data.dinner.selected && !meals.includes("dinner")) {
                newMeals.push("dinner");
              }

              setMeals([...meals, ...newMeals]);
            }
          })
          .catch((err) => {
            console.log(err);
          });
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
    if (pause.date === "" || pause.meal === "") {
      toast.error("Please date and meal are required");
      return;
    }

    // Get current date and time
    const currentDate = new Date();
    const currentHour = currentDate.getHours();

    // Check if the pause date is tomorrow
    const pauseDate = new Date(pause.date);
    const isTomorrow = pauseDate.getDate() === currentDate.getDate() + 1;
    const isToday = pauseDate.getDate() === currentDate.getDate();

    // Check if the pause date is after tomorrow's breakfast
    const tomorrowBreakfastLimit = new Date(currentDate);
    tomorrowBreakfastLimit.setDate(currentDate.getDate() + 2);
    tomorrowBreakfastLimit.setHours(10, 0, 0, 0);
    if (isToday) {
      if (pause.meal === "breakfast" || pause.meal === "lunch") {
        toast.error("You cannot pause breakfast or lunch on today.");
        return;
      } else if (pause.meal === "dinner" && currentHour >= 10) {
        toast.error("You cannot pause dinner on today after 10 AM.");
        return;
      }
    }

    if (isTomorrow) {
      if (pause.meal === "breakfast" || pause.meal === "lunch") {
        // Check if the pause is for breakfast or lunch
        if (currentHour >= 22) {
          toast.error(
            "You cannot pause breakfast or lunch on tomorrow after today 10 PM."
          );
          return;
        }
      }
    } else if (pauseDate.getDate() < currentDate.getDate() + 1) {
      toast.error(
        "You cannot pause meals for past days or today's breakfast and lunch."
      );
      return;
    } else {
      // Check if pauseDate is between startDate and endDate (inclusive)
      const startDate = new Date(user.startDate);
      const endDate = new Date(user.endDate);

      if (pauseDate >= startDate && pauseDate <= endDate) {
        // Allow pausing any meal on or between startDate and endDate
      } else {
        toast.error(
          "Please select a pause date on or between your user's start and end date."
        );
        return;
      }
    }

    // If none of the error conditions are met, proceed with the pause action
    axios
      .post(
        SERVER_URL + "/admin/add-pause",
        { meal: pause.meal, date: pause.date, userId: id },
        {
          headers: {
            "x-access-token": localStorage.getItem("token"),
          },
        }
      )
      .then((response) => {
        if (response.status === 200) {
          toast.success("Pause added successfully");
          navigate("/");
        }
      })
      .catch(() => {
        toast.error("Failed to add change");
      });
  }

  return (
    <>
      <div className="dashboard-user">
        <TopNav />
        <div className="main_content">
          <div className="header">
            <h1>Add Pause</h1>
          </div>
          <div className="add-user-container">
            <div className="register-container">
              <div className="title">Add Pause</div>
              <div className="content">
                <form onSubmit={handleSubmit}>
                  <div className="user-details user">
                    <div className="input-box">
                      <span className="details">Date</span>
                      <input
                        required
                        type="date"
                        placeholder="Enter date"
                        name="date"
                        onChange={(e) =>
                          setPause({ ...pause, date: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <label className="select " htmlFor={`select-meal`}>
                    <select
                      required
                      id={`select-meal`}
                      name="meal"
                      onChange={(e) =>
                        setPause({ ...pause, meal: e.target.value })
                      }
                      className="select-option"
                    >
                      <option value="" disabled selected>
                        Meal
                      </option>
                      {meals.map((meal, index) => (
                        <option key={index} value={meal}>
                          {meal}
                        </option>
                      ))}
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
    </>
  );
}

export default AddPauseUser;
