import SideBar from "../SideBar/SideBar";
import "../../AdminDashboard/AdminDashboard.css";
import "../AddUser/AddUser.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import SERVER_URL from "./../../../../config/serverURL";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function EditUser() {
  // State for user details
  const navigate = useNavigate();
  const { id } = useParams();

  const [userDetails, setUserDetails] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    note: "",
    startDate: "",
    endDate: "",
    planType: "",
  });
  const [packages, setPackages] = useState([]);
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
        // Fetch user data
        const userResponse = await axios.get(
          SERVER_URL + "/admin/get-user/" + id,
          { headers }
        );

        if (userResponse.status !== 200) {
          navigate("/login");
          return;
        }

        const userData = userResponse.data;

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

        // Update state with fetched data
        setUserDetails({
          fullName: userData.fullName,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          address: userData.address,
          note: userData.note,
          startDate: userData.startDate,
          endDate: userData.endDate,
          planType: userData.planType,
        });

        setPackages(packagesData);

        setMeals({
          breakfast: {
            selected: userResponse.data.breakfast.selected,
            route: userResponse.data.breakfast.route,
            location: userResponse.data.breakfast.location,
            foodType: userResponse.data.breakfast.foodType,
            count: userResponse.data.breakfast.count,
            package: userResponse.data.breakfast.package,
          },
          lunch: {
            selected: userResponse.data.lunch.selected,
            route: userResponse.data.lunch.route,
            location: userResponse.data.lunch.location,
            foodType: userResponse.data.lunch.foodType,
            count: userResponse.data.lunch.count,
            package: userResponse.data.lunch.package,
          },
          dinner: {
            selected: userResponse.data.dinner.selected,
            route: userResponse.data.dinner.route,
            location: userResponse.data.dinner.location,
            foodType: userResponse.data.dinner.foodType,
            count: userResponse.data.dinner.count,
            package: userResponse.data.dinner.package,
          },
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        // Handle errors and show appropriate feedback to the user.
      }
    };

    fetchData();
  }, [id, navigate]);

  console.log(packages);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails({ ...userDetails, [name]: value });
  };

  // State for meal selection
  const [meals, setMeals] = useState({
    breakfast: {
      selected: false,
      route: "",
      location: "",
      foodType: "veg",
      count: 0,
      package: "",
    },
    lunch: {
      selected: false,
      route: "",
      location: "",
      foodType: "veg",
      count: 0,
      package: "",
    },
    dinner: {
      selected: false,
      route: "",
      location: "",
      foodType: "veg",
      count: 0,
      package: "",
    },
  });

  // Function to toggle meal selection
  const handleMealSelection = (meal) => {
    setMeals({
      ...meals,
      [meal]: { ...meals[meal], selected: !meals[meal].selected },
    });
  };

  // Function to handle option change (veg or non-veg)
  const handleOptionChange = (meal, value) => {
    setMeals({
      ...meals,
      [meal]: {
        ...meals[meal],
        foodType: value,
      },
    });
  };
  const handleMealInputChange = (meal, e) => {
    const { name, value } = e.target;
    setMeals({
      ...meals,
      [meal]: {
        ...meals[meal],
        [name]: value,
      },
    });
  };

  // Function to submit the form
  const handleSubmit = (e) => {
    e.preventDefault();
  
    // Check if any required fields are missing
    if (
      !userDetails.fullName ||
      !userDetails.email ||
      !userDetails.phoneNumber ||
      !userDetails.address ||
      !userDetails.startDate ||
      !userDetails.endDate ||
      !userDetails.planType
    ) {
      return toast.error("Please Enter All Required Fields");
    }
  
    if (!userDetails.phoneNumber.startsWith("+91")) {
      // If not, check if it starts with "91" and add "+" in front
      if (userDetails.phoneNumber.startsWith("91")) {
        userDetails.phoneNumber = "+" + userDetails.phoneNumber;
      } else {
        // If it doesn't start with either, add "+91" in front
        userDetails.phoneNumber = "+91" + userDetails.phoneNumber;
      }
    }
    
  
    const headers = {
      "x-access-token": localStorage.getItem("admin-token"),
    };
  
    axios
      .post(
        SERVER_URL + "/admin/update-user/" + id,
        {
          userDetails: {
            ...userDetails,
            ...meals, // Assuming 'meals' is defined elsewhere
          },
        },
        { headers }
      )
      .then((res) => {
        if (res.status === 200) {
          toast.success("User Updated Successfully");
          setUserDetails({
            fullName: "",
            email: "",
            phoneNumber: "",
            address: "",
            note: "",
            startDate: "",
            endDate: "",
            planType: "",
          });
          navigate("/admin/all-users")
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something Went Wrong");
      });
  };
  

  return (
    <>
      <div className="dashboard">
        <SideBar />
        <div className="main_content">
          <div className="header">
            <h1>Edit User</h1>
          </div>
          <div className="add-user-container">
            <div className="register-container">
              <div className="title">Registration</div>
              <div className="content">
                <form onSubmit={handleSubmit}>
                  <div className="user-details">
                    <div className="input-box">
                      <span className="details">Full Name</span>
                      <input
                        type="text"
                        placeholder="Enter name"
                        required
                        name="fullName"
                        value={userDetails.fullName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="input-box">
                      <span className="details">Email</span>
                      <input
                        type="text"
                        placeholder="Enter email"
                        required
                        name="email"
                        value={userDetails.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="input-box">
                      <span className="details">Phone Number</span>
                      <input
                        type="number"
                        placeholder="Enter number"
                        required
                        name="phoneNumber"
                        value={Number(userDetails.phoneNumber)}
                        onChange={handleInputChange}
                     
                      />
                    </div>
                    <div className="input-box">
                      <span className="details">Address</span>
                      <textarea
                        name="address"
                        id="address"
                        cols="30"
                        rows="10"
                        required
                        placeholder="Enter address"
                        value={userDetails.address}
                        onChange={handleInputChange}
                      ></textarea>
                    </div>

                    <div className="input-box">
                      <span className="details">Start Date</span>
                      <input
                        type="Date"
                        required
                        name="startDate"
                        value={userDetails.startDate}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="input-box">
                      <span className="details">End Date</span>
                      <input
                        type="Date"
                        required
                        name="endDate"
                        value={userDetails.endDate}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="input-box">
                      <span className="details">Note</span>
                      <textarea
                        name="note"
                        id="note"
                        cols="30"
                        rows="10"
                        required
                        placeholder="Enter Note"
                        value={userDetails.note}
                        onChange={handleInputChange}
                      ></textarea>
                    </div>
                  </div>

                  {/* Plan Type */}
                  <div className="plan-details">
                    <span className="plan-title">Plan Type</span>
                    <div className="category">
                      <label className="radio-label">
                        <input
                          type="radio"
                          id="premium"
                          name="planType"
                          value="premium"
                          checked={userDetails.planType === "premium"}
                          onChange={handleInputChange}
                        />
                        <span
                          className={`radio-custom ${
                            userDetails.planType === "premium" ? "selected" : ""
                          }`}
                        ></span>
                        Premium
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          id="non-premium"
                          name="planType"
                          value="non-premium"
                          checked={userDetails.planType === "non-premium"}
                          onChange={handleInputChange}
                        />
                        <span
                          className={`radio-custom ${
                            userDetails.planType === "non-premium"
                              ? "selected"
                              : ""
                          }`}
                        ></span>
                        Non-Premium
                      </label>
                    </div>
                  </div>

                  {/* Meals */}
                  <h2>Meals</h2>
                  <div className="meals-container">
                    {Object.keys(meals).map((meal) => (
                      <div className="meal" key={meal}>
                        <input
                          type="checkbox"
                          id={meal}
                          checked={meals[meal].selected}
                          onChange={() => handleMealSelection(meal)}
                        />
                        <label className="details" htmlFor={meal}>
                          {meal.charAt(0).toUpperCase() + meal.slice(1)}
                        </label>
                      </div>
                    ))}
                  </div>

                  {/* Meal Options */}
                  {Object.keys(meals).map(
                    (meal) =>
                      meals[meal].selected && (
                        <div className="meal-option" key={meal}>
                          <h2>
                            {meal.charAt(0).toUpperCase() + meal.slice(1)}
                          </h2>
                          <label className="select" htmlFor={`select-${meal}`}>
                            <select
                              id={`select-${meal}`}
                              required
                              name="package"
                              onChange={(e) => handleMealInputChange(meal, e)}
                            >
                              <option value="" disabled selected>
                                Package
                              </option>
                              {packages.map((pack) => (
                                <option
                                  key={pack._id}
                                  value={pack.name}
                                  name="package"
                                >
                                  {pack.name}
                                </option>
                              ))}
                            </select>

                            <svg>
                              <use xlinkHref="#select-arrow-down"></use>
                            </svg>
                          </label>

                          <div className="user-details">
                            <div className="input-box">
                              <span className="details">Route</span>
                              <input
                                type="text"
                                placeholder="Enter your Route"
                                name="route"
                                value={meals[meal].route}
                                onChange={(e) => handleMealInputChange(meal, e)}
                                required
                              />
                            </div>
                            <div className="input-box">
                              <span className="details">Location</span>
                              <input
                                type="text"
                                placeholder="Enter Location"
                                name="location"
                                value={meals[meal].location}
                                onChange={(e) => handleMealInputChange(meal, e)}
                                required
                              />
                            </div>
                          </div>
                          <div className="user-details">
                            <div className="input-box">
                              <span className="details">Count</span>
                              <input
                                type="number"
                                placeholder="Enter your Count"
                                name="count"
                                value={meals[meal].count}
                                onChange={(e) => handleMealInputChange(meal, e)}
                                required
                              />
                            </div>
                          </div>
                          <div className="radio-button-container">
                            <p>Type</p>
                            <label className="radio-label">
                              <input
                                type="radio"
                                value="veg"
                                checked={meals[meal].foodType === "veg"}
                                onChange={(e) =>
                                  handleOptionChange(meal, e.target.value)
                                }
                              />
                              <span className="radio-custom"></span>
                              Veg
                            </label>
                            <label className="radio-label">
                              <input
                                type="radio"
                                value="non-veg"
                                checked={meals[meal].foodType === "non-veg"}
                                onChange={(e) =>
                                  handleOptionChange(meal, e.target.value)
                                }
                              />
                              <span className="radio-custom"></span>
                              Non-Veg
                            </label>
                          </div>
                        </div>
                      )
                  )}

                  <div className="button">
                    <input
                      type="submit"
                      value="Update"
                      onClick={handleSubmit}
                    />
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

export default EditUser;
