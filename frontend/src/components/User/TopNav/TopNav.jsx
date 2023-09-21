import { Link } from "react-router-dom";
import "./TopNav.css";
function TopNav() {
  return (
    <>
      <nav>
        <ul className="nav-links">
       <li>
        <Link to="/">Home</Link>
       </li>
       <li>
        <Link to="/pause">Pause</Link>
       </li>
       <li>
        <Link to="/change">Change</Link>
       </li>
       <li>
        <Link onClick={()=>{
          localStorage.removeItem("token");
        }} to="/login">Logout</Link>
       </li>
        </ul>
      </nav>
    </>
  );
}

export default TopNav;
