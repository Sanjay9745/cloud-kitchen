import { Link } from "react-router-dom"
import "./SideBar.css"
import { useState } from "react"


function SideBar() {
  const [active, setActive] = useState(false)
  return (
    <>
    <div className="sidebar">
        <i className="fa-solid fa-bars" onClick={()=>setActive((prev)=>!prev)}></i>
        <nav className={active?"active":""}> 
            <ul>
            
                <li><Link to="/admin/all-users">All Users</Link></li>
                <li><Link to="/admin/add-user">Add User</Link></li>
                <li><Link to="/admin/orders"> Orders</Link></li>
                <li><Link to="/admin/notifications">Change Request</Link></li>
                <li><Link to="/admin/pause-list">Pause List</Link></li>
                <li><Link to="/admin/add-package">Package</Link></li>
                <li><Link to="/admin/add-locations">Add Locations</Link></li>
                </ul>
        </nav>
    </div>
    </>
  )
}

export default SideBar