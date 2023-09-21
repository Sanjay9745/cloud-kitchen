import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TopNav from "../TopNav/TopNav";
import SERVER_URL from "../../../config/serverURL";

function AddChangeUser() {
  const navigate = useNavigate();

  const [change, setChange] = useState({
    date: "",
    count: 0,
    package: "",
    route: "",
    location: "",
    meal: "",
    foodType: "",
    userId: "",
  });
  const [user, setUser] = useState({});
  const [meals, setMeals] = useState([]);
  const [location, setLocation] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(""); // Selected route state

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

        // Fetch routes and locations
        const locationResponse = await axios.get(
          SERVER_URL + "/admin/locations",
          {
            headers,
          }
        );

        if (locationResponse.status !== 200) {
          console.error("Failed to fetch location");
          return;
        }

        setLocation(locationResponse.data.locations);
        setRoutes(locationResponse.data.routes);

        // Fetch user data
        axios
          .get(SERVER_URL + "/user/", {
            headers: {
              "x-access-token": localStorage.getItem("token"),
            },
          })
          .then((res) => {
            if (res.status === 200) {
              setChange({ ...change, userId: res.data._id });
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

  // Handle route change
  const handleRouteChange = (e) => {
    const selectedRoute = e.target.value;
    setSelectedRoute(selectedRoute);
    // Clear the location when the route changes
    const routeName = routes?.find((route) => route._id === selectedRoute);

    // Make sure routeName is not undefined before updating the state
    if (routeName) {
      setChange((prev) => ({
        ...prev,
        route: routeName.route,
        location: "",
      }));
    }
  };

  function handleSubmit(e) {
    e.preventDefault();

    if (change.date === "" || change.meal === "") {
      toast.error("Please date and meal are required");
      return;
    }

    const currentDate = new Date();
    const changeDate = new Date(change.date);
    const userEndDate = new Date(user.endDate);

    if (
      userEndDate.getDate() <= changeDate.getDate() ||
      changeDate.getDate() <= currentDate.getDate()
    ) {
      toast.error("You can't add a change for this date");
      return;
    }

    if (
      changeDate.getDate() === currentDate.getDate() + 1 &&
      (change.meal === "breakfast" || change.meal === "lunch")
    ) {
      toast.error(
        "You cannot pause breakfast or lunch for tomorrow after 10 PM."
      );
      return;
    }

    axios
      .post(SERVER_URL + "/admin/add-change", { change: change })
      .then((response) => {
        if (response.status === 200) {
          toast.success("Change added successfully");
          navigate("/");
        } else if (response.status === 405) {
          toast.error("You had already paused this meal for this date");
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
            <h1>Add Change</h1>
          </div>
          <div className="add-user-container">
            <div className="register-container">
              <div className="title">Add Change</div>
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
                      <span className="details">Route</span>
                      <select
                        required
                        name="route"
                        value={selectedRoute}
                        onChange={handleRouteChange}
                        className="select-option drop-down"
                      >
                        <option value="" disabled>
                          Select a route
                        </option>
                        {routes?.map((route) => (
                          <option key={route._id} value={route._id}>
                            {route.route}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="input-box">
                      <span className="details">Location</span>
                      <select
                        required
                        name="location"
                        value={change.location}
                        onChange={(e) =>
                          setChange({ ...change, location: e.target.value })
                        }
                        className="select-option drop-down"
                      >
                        <option value="" disabled>
                          Select a location
                        </option>
                        {location
                          ?.filter((loc) => loc.routeId === selectedRoute)
                          .sort((a, b) => a.location.localeCompare(b.location)) // Sort alphabetically
                          .map((loc) => (
                            <option key={loc._id} value={loc.location}>
                              {loc.location}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                  <label className="select" htmlFor={`select-meal`}>
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
                      {meals?.map((meal, index) => (
                        <option key={index} value={meal}>
                          {meal}
                        </option>
                      ))}
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
    </>
  );
}

export default AddChangeUser;
