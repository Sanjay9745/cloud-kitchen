import  { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SERVER_URL from "../../../../config/serverURL";
import SideBar from "../SideBar/SideBar";
import Modal from "react-modal";
import * as XLSX from "xlsx"; // Import XLSX library

function PauseList() {
  const navigate = useNavigate();

  const [pause, setPause] = useState([]);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [originalPause, setOriginalPause] = useState([]);

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

        // Fetch data based on date
        const currentDate = date || new Date().toISOString().slice(0, 10);
        const pauseResponse = await axios.get(
          SERVER_URL + "/admin/get-pause-by-date/" + currentDate,
          {
            headers,
          }
        );

        if (pauseResponse.status === 200) {
          setPause(pauseResponse.data);
          setOriginalPause(pauseResponse.data); // Update original data
        } else {
          console.error("Failed to fetch pause data");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        // Handle errors and show appropriate feedback to the user.
      }
    };

    fetchData();
  }, [navigate, date]);

  const openDeleteModal = (id) => {
    setDeleteItemId(id);
  };

  const closeDeleteModal = () => {
    setDeleteItemId(null);
  };

  const handleDelete = () => {
    if (deleteItemId) {
      axios
        .delete(SERVER_URL + "/admin/delete-pause/" + deleteItemId, {
          headers: {
            "x-access-token": localStorage.getItem("admin-token"),
          },
        })
        .then((res) => {
          if (res.status === 200) {
            // Remove the deleted item from the pause array
            const updatedPause = pause.filter(
              (change) => change.pauseId !== deleteItemId
            );
            setPause(updatedPause);
            closeDeleteModal();
          } else {
            console.error("Failed to delete item");
          }
        })
        .catch((err) => {
          console.error("Error deleting item:", err);
        });
    }
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const handleSearch = (e) => {
    setName(e.target.value);

    // Filter the items based on the search input from the original data
    const filtered = originalPause.filter((change) =>
      change.name.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setPause(filtered);
  };

  const exportToExcel = () => {


    const ws = XLSX.utils.json_to_sheet(pause);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pause"); // Set sheet name as "Users"
    XLSX.writeFile(wb, `pause-${date}.xlsx`); // Export to a file named "users.xlsx"
  };

  return (
    <div className="dashboard">
      <SideBar />
      <div className="main_content">
        <div className="header">
          <h1>Pause List</h1>
          <div className="header-tab">
            <div className="container-search-input">
              <input
                type="text"
                placeholder="Search by Name"
                name="text"
                className="search-input"
                value={name}
                onChange={(e) => handleSearch(e)}
              />
              <div className="inputGroup">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => handleDateChange(e)}
                />
              </div>
            </div>
            <button className="btn" onClick={exportToExcel}>
              Export to Excel
            </button>
          </div>
        </div>

        <div className="table">
          <ul className="responsive-table">
            <li className="table-header">
              <div className="col col-1">Name</div>
              <div className="col col-1">Phone</div>
              <div className="col col-1">Meal</div>
              <div className="col col-1">Delete</div>
            </li>
            {pause.map((change) => (
              <li className="table-row" key={change.pauseId}>
                <div className="col col-1" data-label="Count">
                  {change.name}
                </div>
                <div className="col col-1" data-label="Phone">
                  {change.phoneNumber}
                </div>
                <div className="col col-1" data-label="Meal">
                  {change.meal}
                </div>
                <div className="col col-1" data-label="Decline">
                  <button
                    className="btn btn-danger"
                    onClick={() => openDeleteModal(change.pauseId)}
                  >
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Modal
        isOpen={!!deleteItemId}
        onRequestClose={closeDeleteModal}
        contentLabel="Delete Confirmation Modal"
      >
        <h3>Confirm Delete</h3>
        <p>Are you sure you want to delete this item?</p>
        <div className="modal-buttons">
          <button
            className="btn btn-danger"
            onClick={handleDelete}
            style={{ marginRight: "40px" }}
          >
            Delete
          </button>
          <button className="btn" onClick={closeDeleteModal}>
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default PauseList;
