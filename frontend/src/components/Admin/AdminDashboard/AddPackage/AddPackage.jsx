import SideBar from "../SideBar/SideBar";
import "../../AdminDashboard/AdminDashboard.css";
import "../AddUser/AddUser.css";
import { useEffect, useState } from "react";
import { useNavigate} from "react-router-dom";
import axios from "axios";
import SERVER_URL from "./../../../../config/serverURL";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AddPackage.css"
function AddPackage() {
  // State for user details
  const navigate = useNavigate();

  const [packages, setPackages] = useState([]);
  const [pack, setPack] = useState("");
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

function handleSubmit(e){
    e.preventDefault();
    axios.post(SERVER_URL + "/admin/add-package", {name:pack},{
        headers: {
            "x-access-token": localStorage.getItem("admin-token"),
            },

    }).then((res)=>{
        if(res.status === 200){
            setPackages([...packages,res.data]);
            toast.success("Package Added Successfully");
            setPack("");
        }
    })
}

function handleDelete(id){
    axios.delete(SERVER_URL + "/admin/delete-package/"+id,{
        headers: {
            "x-access-token": localStorage.getItem("admin-token"),
            },

    }).then((res)=>{
        if(res.status === 200){
            setPackages(packages.filter((pack)=>pack._id !== id));
            toast.success("Package Deleted Successfully");
            setPack("");
        }
    })
}
  return (
    <>
      <div className="dashboard">
        <SideBar />
        <div className="main_content">
          <div className="header">
            <h1>Package</h1>

          </div>
          <div className="add-user-container">
  
            <div className="register-container">
              <div className="title">Add Package</div>
              <div className="content">
                <form onSubmit={handleSubmit}>
                  <div className="user-details">
                    <div className="input-box">
                      <span className="details">Package Name</span>
                      <input
                        type="text"
                        placeholder="Enter Package name"
                        required
                        name="pack"
                        value={pack}
                        onChange={(e)=>setPack(e.target.value)}
                      />
                    </div>
                    </div>
                  <div className="button">
                    <input
                      type="submit"
                      value="Add"
                    />
                  </div>
                </form>
              </div>
              <div className="delete-package">
                <div className="title">Delete Package</div>
                <ul>
                    {packages.map((pack)=>(
                        <li key={pack._id}>
                            <span>{pack.name}</span>
                            <button className="btn btn-danger" onClick={()=>handleDelete(pack._id)}>Delete</button>
                        </li>
                    ))}

                </ul>
            </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}

export default  AddPackage;
