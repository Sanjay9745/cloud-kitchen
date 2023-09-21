import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SideBar from "../SideBar/SideBar";
import SERVER_URL from "../../../../config/serverURL";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DeleteConfirmationModal from '../../DeleteConfirmModel/DeleteConfirmModel';
import Loading from "../../../User/Loading/Loading";
function AllUsers() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!localStorage.getItem("admin-token")) {
      navigate("/login");
    } else {
      const headers = {
        "x-access-token": localStorage.getItem("admin-token"),
      };
      axios
        .get(SERVER_URL + "/admin/protected", { headers })
        .then((res) => {
          if (res.status === 200) {
            setAdmin(true);
            setLoading(false);
          } else {
            navigate("/login");
          }
        })
        .catch(() => {
          navigate("/login");
        });
    }
  }, [navigate]);


  const handlePageDecrement = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  useEffect(() => {
    if (admin) {
      const headers = {
        "x-access-token": localStorage.getItem("admin-token"),
      };
      axios
        .get(SERVER_URL + "/admin/get-users/" + page, { headers })
        .then((res) => {
          if (res.status === 200) {
            setUsers(res.data.users);
            setTotalPages(res.data.totalPages);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [admin, page]);

  // Logic for search function
  function handleSearch(e) {
    e.preventDefault();
    let name = e.target.value;
    if (admin) {
      const headers = {
        "x-access-token": localStorage.getItem("admin-token"),
      };

      if (name === "") {
        axios
          .get(SERVER_URL + "/admin/get-users/" + page, { headers })
          .then((res) => {
            if (res.status === 200) {
              setUsers(res.data.users);
              setTotalPages(res.data.totalPages);
              setPage(1);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        axios
          .get(SERVER_URL + "/admin/get-user-by-name/" + name, { headers })
          .then((res) => {
            if (res.status === 200) {
              setUsers(res.data);
              setTotalPages(res.data.totalPages);
            }
            console.log(res);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  }

  function reverseTransformUserData(transformedUser) {
    const user = {};
    // Map other user fields
    const fieldsToMap = [
      "fullName",
      "email",
      "phoneNumber",
      "address",
      "startDate",
      "endDate",
      "note",
      "planType",
    ];

    fieldsToMap.forEach((field) => {
      user[field] = transformedUser[field];
    });
    // Map meal types (breakfast, lunch, dinner)
    ["breakfast", "lunch", "dinner"].forEach((mealType) => {
      user[`${mealType} selected`] = transformedUser[mealType].selected
        ? "yes"
        : "no";
      user[`${mealType} route`] = transformedUser[mealType].route;
      user[`${mealType} location`] = transformedUser[mealType].location;
      user[`${mealType} foodType`] = transformedUser[mealType].foodType;
      user[`${mealType} count`] = transformedUser[mealType].count;
      user[`${mealType} package`] = transformedUser[mealType].package;
      // Add other meal properties as needed
    });

    return user;
  }

  const exportToExcel = () => {
    const transformedUser = users.map((user) => {
      return reverseTransformUserData(user);
    });
    console.log(transformedUser);

    const ws = XLSX.utils.json_to_sheet(transformedUser);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users"); // Set sheet name as "Users"
    XLSX.writeFile(wb, "users.xlsx"); // Export to a file named "users.xlsx"
  };
  
  function handleDelete(id) {
    setUserToDelete(id);
    setShowDeleteModal(true);
  }

  function confirmDelete() {
    if (userToDelete) {
      axios
        .delete(SERVER_URL + "/admin/delete-user/" + userToDelete, {
          headers: {
            "x-access-token": localStorage.getItem("admin-token"),
          },
        })
        .then((res) => {
          console.log(res);
          setUsers((prev) => prev.filter((user) => user._id !== userToDelete));
          toast.success('User deleted successfully', {
            position: toast.POSITION.TOP_RIGHT,
          });
        })
        .catch((err) => {
          console.log(err);
          toast.error('Error deleting user', {
            position: toast.POSITION.TOP_RIGHT,
          });
        })
        .finally(() => {
          setShowDeleteModal(false);
          setUserToDelete(null);
        });
    }
  }
  if(loading) return <Loading />
  const handlePageIncrement = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };
  return (
    <div className="dashboard">
      <SideBar />
      <div className="main_content">
        <div className="header">
          <h1>All Users</h1>
          <div className="header-tab">
            <div className="container-search-input">
              <input
                type="text"
                placeholder="Search"
                name="text"
                className="search-input"
                onChange={(e) => handleSearch(e)}
              />
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
            <button className="btn m-10" onClick={exportToExcel}>
              Export
            </button>
          </div>
        </div>

        <div className="table">
          <ul className="responsive-table">
            <li className="table-header">
              <div className="col col-1">Full Name</div>
              <div className="col col-1">Phone Number</div>
    
              <div className="col col-1">View</div>
              <div className="col col-1">Add Change</div>
              <div className="col col-1">Add Pause</div>
              <div className="col col-1">Edit</div>
              <div className="col col-1">Delete</div>
            </li>

            {users?.map((user) => (
              <li className="table-row" key={user._id}>
                <div className="col col-1" data-label="Full Name">
                  {user.fullName}
                </div>
                <div className="col col-1" data-label="Phone Number">
                  {user.phoneNumber}
                </div>
                <div className="col col-1" data-label="View">
                  <button
                    className="btn btn-success btn-s-small"
                    onClick={() => navigate("/admin/single-user/" + user._id)}
                  >
                    View
                  </button>
                </div>
                <div className="col col-1" data-label="Change">
                  <button
                    className="btn btn-s-small"
                    onClick={() => navigate("/admin/add-change/" + user._id)}
                  >
                    Change
                  </button>
                </div>
                <div className="col col-1" data-label="Pause">
                  <button
                    className="btn btn-danger btn-s-small"
                    onClick={() => navigate("/admin/add-pause/" + user._id)}
                  >
                    Pause
                  </button>
                </div>
                <div className="col col-1" data-label="Edit">
                  <button
                    className="btn btn-s-small"
                    onClick={() => navigate("/admin/edit-user/" + user._id)}
                  >
                    Edit
                  </button>
                </div>
                <div className="col col-1" data-label="Delete">
                  <button
                    className="btn btn-danger btn-s-small"
                    onClick={() => handleDelete(user._id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="pagination">
          <ul className="page">
            <li className="page__btn" onClick={handlePageDecrement} >
              <i
                className="fa-solid fa-chevron-left"
                onClick={handlePageDecrement}
              ></i>
            </li>

            {page > 1 && (
              <li className="page__numbers" onClick={handlePageDecrement}>
                {page - 1}
              </li>
            )}
            <li className="page__numbers active">{page}</li>
            {page < totalPages && (
              <>
                <li className="page__numbers" onClick={handlePageIncrement}>
                  {page + 1}
                </li>

                <li className="page__dots">...</li>
                <li
                  className="page__numbers"
                  onClick={() => setPage(totalPages)}
                >
                  {totalPages}
                </li>
              </>
            )}

            <li className="page__btn" onClick={handlePageIncrement}>
              <i onClick={handlePageIncrement} className="fa-solid fa-chevron-right"></i>
            </li>
          </ul>
        </div>
      </div>
      {showDeleteModal && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onRequestClose={() => setShowDeleteModal(false)}
          onDelete={confirmDelete}
        />
      )}
     
    </div>
  );
}

export default AllUsers;
