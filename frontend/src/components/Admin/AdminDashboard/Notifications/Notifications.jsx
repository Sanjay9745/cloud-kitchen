import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SERVER_URL from "../../../../config/serverURL";
import SideBar from "../SideBar/SideBar";
import Modal from "react-modal"; // Import react-modal

function Notifications() {
  const navigate = useNavigate();

  const [changes, setChanges] = useState([]);
  const [deleteItemId, setDeleteItemId] = useState(null);
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
  
        const isProtected = await axios.get(SERVER_URL + "/admin/protected",{headers})
        if(isProtected.status !== 200){
          navigate("/login");
          return;
        }

        // Fetch other data (e.g., packages)
        const changesResponse = await axios.get(
          SERVER_URL + "/admin/changes",
          { headers }
        );
  
        if (changesResponse.status !== 200) {
          console.error("Failed to fetch packages");
          return;
        }
  
       const changesDate = changesResponse.data;
        setChanges(changesDate);
  

      } catch (error) {
        console.error("Error fetching data:", error);
        // Handle errors and show appropriate feedback to the user.
      }
    };
  
    fetchData();
  }, [navigate]);
function handleAccept(id){
axios.post(SERVER_URL + "/admin/accept-change", {id},{
  headers: {
    "x-access-token": localStorage.getItem("admin-token"),
  },
}).then((res)=>{
  if(res.status === 200){
    const newChanges = changes.filter((change)=>change._id !== id)
    setChanges(newChanges)
  }
}).catch((err)=>{
  console.log(err)})
}
const openDeleteModal = (id) => {
  setDeleteItemId(id);
};

// Function to close the delete confirmation modal
const closeDeleteModal = () => {
  setDeleteItemId(null);
};

// Function to handle the actual delete action
const handleDelete = () => {
  if (deleteItemId) {
    axios
      .delete(SERVER_URL + "/admin/decline-change/" + deleteItemId, {
        headers: {
          "x-access-token": localStorage.getItem("admin-token"),
        },
      })
      .then((res) => {
        if (res.status === 200) {
          // Remove the deleted item from the changes array
          const updatedChanges = changes.filter(
            (change) => change._id !== deleteItemId
          );
          setChanges(updatedChanges);
          closeDeleteModal();
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

  return (
    <>
    <div className="dashboard">

    <SideBar/>
    <div className="main_content">
        <div className="header">
            <h1>Change Request</h1>
          {/* <div className="header-tab">
            <div className="container-search-input">
      <input type="text" placeholder="Search" name="text" className="search-input" />
      <svg
        fill="#000000"
        width="20px"
        height="20px"
        viewBox="0 0 1920 1920"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M790.588 1468.235c-373.722 0-677.647-303.924-677.647-677.647 0-373.722 303.925-677.647 677.647-677.647 373.723 0 677.647 303.925 677.647 677.647 0 373.723-303.924 677.647-677.647 677.647Zm596.781-160.715c120.396-138.692 193.807-319.285 193.807-516.932C1581.176 354.748 1226.428 0 790.588 0S0 354.748 0 790.588s354.748 790.588 790.588 790.588c197.647 0 378.24-73.411 516.932-193.807l516.028 516.142 79.963-79.963-516.142-516.028Z"
          fillRule="evenodd"
        ></path>
      </svg>
    </div>
    <button className="btn">Export</button>
    </div> */}
        </div>

        <div className="table">
        <ul className="responsive-table">
      <li className="table-header">
        <div className="col col-1">Date</div>
        <div className="col col-1">Count</div>
        <div className="col col-1">Meal</div>
        <div className="col col-1">Route</div>
        <div className="col col-1">Location</div>
        <div className="col col-1">Package</div>
        <div className="col col-1">Type</div>
        <div className="col col-1">Accept</div>
        <div className="col col-1">Decline</div>
      </li>
      {changes.map((change) => (  
      <li className="table-row" key={change._id}>
        <div className="col col-1" data-label="Count">{change.date}</div>
        <div className="col col-1" data-label="Count">{change.count}</div>
        <div className="col col-1" data-label="Meal">{change.meal}</div>
        <div className="col col-1" data-label="Route">{change.route}</div>
        <div className="col col-1" data-label="Location">{change.location}</div>
        <div className="col col-1" data-label="Package">{change.package}</div>
        <div className="col col-1" data-label="Type">{change.foodType}</div>
        <div className="col col-1" data-label="Accept"><button className="btn btn-success btn-s-small" onClick={()=>handleAccept(change._id)}>Accept</button></div>
        <div className="col col-1" data-label="Decline"><button className="btn btn-danger btn-s-small" onClick={()=>openDeleteModal(change._id)}>Decline</button></div>
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
          <button className="btn btn-danger" onClick={handleDelete} style={{marginRight:"40px"}}>
           Delete
          </button>
          <button className="btn" onClick={closeDeleteModal}>
            Cancel
          </button>
        </div>
      </Modal>
    </div>
    </>
  )
}

export default Notifications