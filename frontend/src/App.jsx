import { Route, Routes } from "react-router-dom";
import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminLogin from "./components/Admin/AdminLogin/AdminLogin";
import AllUsers from "./components/Admin/AdminDashboard/AllUsers/AllUsers";
import AddUser from "./components/Admin/AdminDashboard/AddUser/AddUser";
import Orders from "./components/Admin/AdminDashboard/Orders/Orders";
import Notifications from "./components/Admin/AdminDashboard/Notifications/Notifications";
import ImportUsers from "./components/Admin/AdminDashboard/ImportUsers/ImportUsers";
import Login from "./components/User/Login/Login";
import SingleUserView from "./components/Admin/AdminDashboard/SingleUserView/SingleUserView";
import EditUser from "./components/Admin/AdminDashboard/EditUser/EditUser";
import AddPackage from "./components/Admin/AdminDashboard/AddPackage/AddPackage";
import AddChange from "./components/Admin/AdminDashboard/AddChange/AddChange";
import AddPause from "./components/Admin/AdminDashboard/AddPause/AddPause";
import Dashboard from "./components/User/Dasboard/Dashboard";
import AddPauseUser from "./components/User/AddPauseUser/AddPauseUser";
import AddChangeUser from "./components/User/AddChangeUser/AddChangeUser";
import ForgotPassword from "./components/Admin/AdminDashboard/ForgotPassword/ForgotPassword";
import ResetPassword from "./components/Admin/AdminDashboard/ResetPassword/ResetPassword";
import PauseList from "./components/Admin/AdminDashboard/PauseList/PauseList";
import DownloadWithFromAndToDate from "./components/Admin/DownloadWithFromAndToDate/DownloadWithFromAndToDate";
import AddLocation from "./components/Admin/AddLocations/AddLocation";

function App() {
  return (
    <>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/all-users" element={<AllUsers />} />
        <Route path="/admin/add-user" element={<AddUser />} />
        <Route path="/admin/orders" element={<Orders />} />
        <Route path="/admin/notifications" element={<Notifications />} />
        <Route path="/admin/import-users" element={<ImportUsers />} />
        <Route path="/admin/single-user/:id" element={<SingleUserView />} />
        <Route path="/admin/edit-user/:id" element={<EditUser />} />
        <Route path="/admin/add-package" element={<AddPackage />} />
        <Route path="/admin/add-change/:id" element={<AddChange />} />
        <Route path="/admin/add-pause/:id" element={<AddPause />} />
        <Route path="/admin/pause-list" element={<PauseList />} />
        <Route
          path="/admin/from-and-to-date/:id"
          element={<DownloadWithFromAndToDate />}
        />
        <Route
          path="/admin/forgot-password/:email"
          element={<ForgotPassword />}
        />
        <Route path="/admin/reset-password" element={<ResetPassword />} />
        <Route path="/admin/add-locations" element={<AddLocation />} />

        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/pause" element={<AddPauseUser />} />
        <Route path="/change" element={<AddChangeUser />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
      <ToastContainer />
    </>
  );
}

export default App;
