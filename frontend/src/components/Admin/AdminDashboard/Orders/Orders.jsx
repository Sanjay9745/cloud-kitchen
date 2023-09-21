import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SERVER_URL from "../../../../config/serverURL";
import SideBar from "../SideBar/SideBar";
import "./Orders.css";
import * as XLSX from "xlsx";
import Loading from "../../../User/Loading/Loading";
import jsPDF from "jspdf";
import "jspdf-autotable";

function Orders() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(false);
  const [orders, setOrders] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [planType, setPlanType] = useState("all");
  const [meal, setMeal] = useState("breakfast");
  const [locationList, setLocationList] = useState([]);
  const [location, setLocation] = useState("all");
  const [name, setName] = useState("");
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [packageList, setPackageList] = useState({
    package: "",
    count: "",
  });
  useEffect(() => {
    // Check if the user is authenticated
    const checkAuthentication = async () => {
      try {
        const headers = {
          "x-access-token": localStorage.getItem("admin-token"),
        };
        const res = await axios.get(SERVER_URL + "/admin/protected", {
          headers,
        });
        if (res.status === 200) {
          setAdmin(true);
          setLoading(false);
        } else {
          navigate("/login");
        }
      } catch (error) {
        navigate("/login");
      }
    };

    if (!localStorage.getItem("admin-token")) {
      navigate("/login");
    } else {
      checkAuthentication();
    }
  }, [navigate]);
  useEffect(() => {
    let totalCount = 0; // Initialize a variable to accumulate the count

    // Iterate through filteredOrders and accumulate the count
    filteredOrders.forEach((order) => {
      totalCount += order[meal]?.count || 0; // Use the count property if it exists, or 0 if it doesn't
    });

    // Update the count state once with the total count
    setCount(totalCount);
  }, [filteredOrders, meal]); // Include meal in the dependencies if it's a variable from the outer scope

  useEffect(() => {
    // Fetch orders when the admin and date change
    const fetchOrders = async () => {
      try {
        if (admin) {
          const headers = {
            "x-access-token": localStorage.getItem("admin-token"),
          };
          const res = await axios.get(
            SERVER_URL + `/admin/get-orders-date/${date}`,
            { headers }
          );
          if (res.status === 200) {
            setOrders(res.data);

            // Filter orders based on 'order[meal].selected'\
            setTimeout(() => {
              const filter = res.data.filter(
                (order) => order[meal]?.selected === true
              );

              setFilteredOrders(filter);
            }, 0);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchOrders();
  }, [admin, date, meal]); // Include 'meal' in the dependency array

  useEffect(() => {
    // Update locationList whenever orders or meal change
    if (orders.length > 0) {
      const uniqueRoutes = Array.from(
        new Set(
          orders
            .filter((order) => order[meal]?.route) // Filter orders where user.[meal].route exists
            .map((order) => order[meal]?.route)
        )
      ).filter(Boolean);
      setLocationList(["all", ...uniqueRoutes]);
    }
  }, [orders, meal]);

  useEffect(() => {
    // Filter orders whenever any filter criteria change
    const filtered = orders.filter((order) => {
      const matchLocation =
        location === "all" || order[meal]?.route === location;
      const matchPlanType = planType === "all" || order.planType === planType;
      const matchName =
        name.trim() === "" ||
        order.fullName.toLowerCase().includes(name.toLowerCase());

      return matchLocation && matchPlanType && matchName;
    });
    setTimeout(() => {
      const filter = filtered.filter((order) => order[meal]?.selected === true);
      setFilteredOrders(filter);
    }, 0);
  }, [orders, meal, location, planType, name]);
  useEffect(() => {
    const filteredPackage = filteredOrders.map((order) => {
      return {
        package: order[meal]?.package,
        count: order[meal]?.count,
      };
    });
    const uniquePackage = Array.from(
      new Set(filteredPackage.map((item) => item.package))
    ).filter(Boolean);
    const uniquePackageCount = uniquePackage.map((item) => {
      return {
        package: item,
        count: filteredPackage
          .filter((order) => order.package === item)
          .reduce((a, b) => a + b.count, 0),
      };
    });
    setPackageList(uniquePackageCount);
  }, [filteredOrders, meal]);
  const exportPackageToExcel = () => {
    // Calculate the total count
    const total = packageList.reduce((acc, pack) => acc + pack.count, 0);
  
    // Create a new package with the total count
    const totalPackage = { package: "Total", count: total };
  
    // Combine the original packageList and the totalPackage
    const dataToExport = [...packageList, totalPackage];
  
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Package");
    XLSX.writeFile(wb, `pause-${date}.xlsx`);
  };
  
  const exportToExcel = () => {
    // Clone filteredOrders to avoid modifying the original data
    const sortedOrders = [...filteredOrders];

    // Sort the orders by the "Route" column in alphabetical order
    sortedOrders.sort((a, b) => {
      const routeA = a[meal]?.route || "";
      const routeB = b[meal]?.route || "";
      return routeA.localeCompare(routeB);
    });

    const dataWithHeaders = [];

    // Add main headings
    const mainHeadings = [
      "Date",
      "Meal",
      "Location",
      "Plan Type",
      "Name",
      "Count",
      "Route",
      "Package",
      "Food Type",
      "Phone Number",
      "Email",
    ];
    dataWithHeaders.push(mainHeadings);

    // Add sorted data rows
    sortedOrders.forEach((order) => {
      const rowData = [
        date,
        meal,
        order[meal]?.location,
        order.planType,
        order.fullName,
        order[meal]?.count,
        order[meal]?.route,
        order[meal]?.package,
        order[meal]?.foodType,
        order.phoneNumber,
        order.email,
      ];
      dataWithHeaders.push(rowData);
    });

    const ws = XLSX.utils.aoa_to_sheet(dataWithHeaders);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, `orders-${date}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [["Name", "Phone Number", "Plan Type", "Route", "Count", "Package", "Type", "Location"]],
      body: filteredOrders.map(order => [
        order.fullName,
        order.phoneNumber,
        order.planType,
        order[meal]?.route || "",
        order[meal]?.count || "",
        order[meal]?.package || "",
        order[meal]?.foodType || "",
        order[meal]?.location || "",
      ]),
    });
  
    doc.save(`orders-${date}.pdf`);
  };
  


  if (loading) return <Loading />;
  return (
    <div className="dashboard">
      <SideBar />
      <div className="main_content">
        {/* Your UI elements and filters */}
        {/* For example: */}
        <div className="header">
          <h1>Orders</h1>
          <button className="btn m-s-10 btn-s-small" onClick={exportToExcel}>
            Export
          </button>
          <button className="btn m-s-10 btn-s-small" style={{marginLeft:"20px"}} onClick={exportToPDF}>
               Export as PDF
         </button>

          <button className="btn m-s-10 btn-s-small" style={{marginLeft:"20px"}} onClick={exportPackageToExcel}>
           Package List
          </button>
          <div className="header-tab">
            <div className="container-search-input">
              <input
                type="text"
                placeholder="Search by Name"
                name="text"
                className="search-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {/* Add the search icon/svg here */}
            </div>

            <div className="inputGroup">
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setName("");
                  setLocation("all");
                  setPlanType("all");
                  setDate(e.target.value);
                }}
              />
            </div>

            <div>
              <select
                value={planType}
                className="drop-down"
                onChange={(e) => setPlanType(e.target.value)}
              >
                <option value="all">All Plan Type</option>
                <option value="premium">Premium</option>
                <option value="non-premium">Non-Premium</option>
              </select>
            </div>
            <div>
              <select
                value={meal}
                className="drop-down"
                onChange={(e) => {
                  setMeal(e.target.value);
                  setPlanType("all");
                  setLocation("all");
                }}
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
              </select>
            </div>
            <div>
              <select
                value={location}
                className="drop-down"
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="all">All Routes</option>
                {locationList.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
            <p>Total Count: {count}</p>
          </div>
        </div>

        {/* Display the filtered orders */}
        <div className="table">
          <ul className="responsive-table">
            <li className="table-header">
              <div className="col col-1">Name</div>
              <div className="col col-1">Phone Number</div>

              <div className="col col-1">Plan Type</div>
              <div className="col col-1">Route</div>
              <div className="col col-1">Count</div>
              <div className="col col-1">Package</div>
              <div className="col col-1">Type</div>
              <div className="col col-1">Location</div>
            </li>
            {filteredOrders?.map((order) => (
              <li className="table-row" key={order._id}>
                <div className="col col-1" data-label="Name">
                  {order?.fullName}
                </div>
                <div className="col col-1" data-label="Phone Number">
                  {order?.phoneNumber}
                </div>
                <div className="col col-1" data-label="Plan Type">
                  {order.planType}
                </div>
                <div className="col col-1" data-label="Route">
                  {order[meal]?.route}
                </div>
                <div className="col col-1" data-label="Count">
                  {order[meal]?.count}
                </div>
                <div className="col col-1" data-label="Package">
                  {order[meal]?.package}
                </div>
                <div className="col col-1" data-label="Type">
                  {order[meal]?.foodType}
                </div>
                <div className="col col-1" data-label="Location">
                  {order[meal]?.location}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="table-container">
          <table className="package-table">
            <thead>
              <tr>
                <th>Package</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {packageList.map((item) => (
                <tr key={item.package}>
                  <td data-label="package">{item.package}</td>
                  <td data-label="Count">{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Orders;
