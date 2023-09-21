import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SideBar from "../AdminDashboard/SideBar/SideBar";
import SERVER_URL from "../../../config/serverURL";

function AddLocation() {
  const navigate = useNavigate();

  const [location, setLocation] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [route, setRoute] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [selectedRoute, setSelectedRoute] = useState("");
  const [selectedRouteForDelete, setSelectedRouteForDelete] = useState("");
  const [rerender, setRerender] = useState(false);
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

        const locationResponse = await axios.get(
          SERVER_URL + "/admin/locations",
          { headers }
        );

        if (locationResponse.status !== 200) {
          console.error("Failed to fetch location");
          return;
        }

        setLocation(locationResponse.data.locations);
        setRoutes(locationResponse.data.routes);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [navigate, rerender]);

  const handleRouteAdd = async (e) => {
    e.preventDefault();

    try {
      const newRouteObj = {
        route: route,
      };

      const response = await axios.post(
        SERVER_URL + "/admin/add-route",
        newRouteObj,
        {
          headers: {
            "x-access-token": localStorage.getItem("admin-token"),
          },
        }
      );

      if (response.status === 201) {
        setRoutes([...routes, response.data.route]);
        setRoute("");
        toast.success("Route added successfully");
      } else {
        toast.error("Failed to add route");
      }
    } catch (error) {
      console.error("Error adding route:", error);
    }
  };

  const handleLocationAdd = async (e) => {
    e.preventDefault();

    if (selectedRoute === "" || newLocation === "") {
      toast.error("Please select a route and enter a location");
      return;
    }

    try {
      const response = await axios.post(
        SERVER_URL + "/admin/add-location",
        {
          location: newLocation,
          routeId: selectedRoute,
        },
        {
          headers: {
            "x-access-token": localStorage.getItem("admin-token"),
          },
        }
      );

      if (response.status === 201) {
        const newLocation = response.data.location;
        setLocation((prevLocations) => [...prevLocations, newLocation]);
        setRerender((prev) => !prev);
        setNewLocation("");
        toast.success("Location added successfully");
      } else {
        toast.error("Failed to add location");
      }
    } catch (error) {
      console.error("Error adding location:", error);
      toast.error("Failed to add location");
    }
  };
  const handleLocationDelete = async (id) => {
    try {
      await axios.delete(SERVER_URL + `/admin/delete-location/${id}`, {
        headers: {
          "x-access-token": localStorage.getItem("admin-token"),
        },
      });

      // Update the location state by filtering out the deleted location
      setLocation((prevLocations) =>
        prevLocations.filter((loc) => loc._id !== id)
      );
      setRerender((prev) => !prev);
      toast.success("Location deleted successfully");
    } catch (error) {
      console.error("Error deleting location:", error);
      toast.error("Failed to delete location");
    }
  };

  const handleDeleteRoute = async () => {
    try {
      await axios.delete(
        SERVER_URL + `/admin/delete-route/${selectedRouteForDelete}`,
        {
          headers: {
            "x-access-token": localStorage.getItem("admin-token"),
          },
        }
      );

      setLocation(
        location.filter((loc) => loc.routeId !== selectedRouteForDelete)
      );
      setRoutes(routes?.filter((rout) => rout._id !== selectedRouteForDelete));
      setSelectedRouteForDelete("");
      toast.success("Route deleted successfully");
    } catch (error) {
      console.error("Error deleting route:", error);
      toast.error("Failed to delete route");
    }
  };
  return (
    <>
      <div className="dashboard">
        <SideBar />
        <div className="main_content">
          <div className="header">
            <h1>Locations</h1>
          </div>
          <div className="add-user-container">
            <div className="register-container">
              <div className="title">Add Route</div>
              <div className="content">
                <form onSubmit={handleRouteAdd}>
                  <div className="user-details">
                    <div className="input-box">
                      <span className="details">Route Name</span>
                      <input
                        type="text"
                        placeholder="Enter Route name"
                        required
                        name="route"
                        value={route}
                        onChange={(e) => setRoute(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="button">
                    <input type="submit" value="Add" />
                  </div>
                </form>
              </div>

              <div className="add-location">
                <div className="title">Add Location</div>
                <div className="content">
                  <form onSubmit={handleLocationAdd}>
                    <div className="user-details">
                      <div className="input-box">
                        <span className="details">Location Name</span>
                        <input
                          type="text"
                          placeholder="Enter Location name"
                          required
                          value={newLocation}
                          onChange={(e) => setNewLocation(e.target.value)}
                        />
                      </div>
                      <div className="input-box">
                        <span className="details">Select Route</span>
                        <select
                          className="drop-down"
                          value={selectedRoute}
                          onChange={(e) => setSelectedRoute(e.target.value)}
                        >
                          <option value="" disabled>
                            Select a route
                          </option>
                          {routes?.map((rout) => (
                            <option key={rout._id} value={rout._id}>
                              {rout.route}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="button">
                      <input type="submit" value="Add Location" />
                    </div>
                  </form>
                </div>
              </div>
              <div className="locations-to-add">
                <div className="title">View And Delete</div>
                <div className="input-box">
                  <span className="details">Select Route</span>
                  <br/>
                  <select
                    className="drop-down" // Apply a custom CSS class for styling
                    value={selectedRouteForDelete}
                    onChange={(e) => setSelectedRouteForDelete(e.target.value)}
                  >
                    <option value="" disabled>
                      Select a route
                    </option>
                    {routes?.map((rout) => (
                      <option key={rout._id} value={rout._id}>
                        {rout.route}
                      </option>
                    ))}
                  </select>
                </div>
                <h3>
                  Wanna Delete{" "}
                  {routes
                    ?.filter((rout) => rout?._id === selectedRouteForDelete)
                    .map((rout) => {
                      return rout.route;
                    })}
                  <button
                    className="btn btn-danger btn-small"
                    onClick={handleDeleteRoute}
                  >
                    Delete
                  </button>
                </h3>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Location</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {location
                      ?.filter((loc) => loc?.routeId === selectedRouteForDelete)
                      .map((loc) => (
                        <tr key={loc?._id}>
                          <td>{loc?.location}</td>
                          <td>
                            <button
                              className="btn btn-danger btn-small"
                              onClick={() => handleLocationDelete(loc?._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default AddLocation;
