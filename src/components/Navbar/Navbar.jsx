import Dropdown from "react-bootstrap/Dropdown";
import { NavLink } from "react-router-dom";
import styles from "./Navbar.module.css";
import { useDispatch, useSelector } from "react-redux";
import { signout } from "../../api/internal";
import { resetUser } from "../../store/userSlice";
import { FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.user.auth);
  const userPhoto = useSelector((state) => state.user.photoPath);
  const name = useSelector((state) => state.user.name);
  const navigate = useNavigate();

  const handleSignout = async () => {
    await signout();
    dispatch(resetUser());
    navigate("/");
  };

  return (
    <>
      <nav className={styles.navbar}>
        <NavLink to="/" className={`${styles.logo} ${styles.inActiveStyle}`}>
          CoinBounce
        </NavLink>
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? styles.activeStyle : styles.inActiveStyle
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/crypto"
          className={({ isActive }) =>
            isActive ? styles.activeStyle : styles.inActiveStyle
          }
        >
          Cryptocurrencies
        </NavLink>
        <NavLink
          to="/blogs"
          className={({ isActive }) =>
            isActive ? styles.activeStyle : styles.inActiveStyle
          }
        >
          Blog
        </NavLink>
        <NavLink
          to="/submit"
          className={({ isActive }) =>
            isActive ? styles.activeStyle : styles.inActiveStyle
          }
        >
          Submit a blog
        </NavLink>
        {isAuthenticated ? (
          <Dropdown align="end">
            <Dropdown.Toggle as="button" className={styles.profileButton}>
              <img src={userPhoto} alt="User" className={styles.userPhoto} />

              <div className={styles.userInfo}>
                <span className={styles.profileName}>{name}</span>
              </div>
            </Dropdown.Toggle>

            <Dropdown.Menu className={styles.dropdownMenu}>
              <Dropdown.Item href="/profile" className={styles.dropdownItem}>
                <FaUser className={styles.icon} />
                My Profile
              </Dropdown.Item>

              <Dropdown.Item href="/settings" className={styles.dropdownItem}>
                <FaCog className={styles.icon} />
                Settings
              </Dropdown.Item>

              <Dropdown.Divider />

              <Dropdown.Item
                onClick={handleSignout}
                className={styles.dropdownItem}
              >
                <FaSignOutAlt className={styles.icon} />
                Sign Out
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        ) : (
          <div>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                isActive ? styles.activeStyle : styles.inActiveStyle
              }
            >
              <button className={styles.logInButton}>Log In</button>
            </NavLink>

            <NavLink
              to="/register"
              className={({ isActive }) =>
                isActive ? styles.activeStyle : styles.inActiveStyle
              }
            >
              <button className={styles.signUpButton}>Sign Up</button>
            </NavLink>
          </div>
        )}
      </nav>

      <div className={styles.separator}></div>
    </>
  );
}

export default Navbar;
