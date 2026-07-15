import styles from "./profile.module.css";
import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import { updateProfile, changePassword } from "../../api/internal";
import { updateUser } from "../../store/userSlice";
import { MdPhotoCamera } from "react-icons/md";

function Profile() {
  const dispatch = useDispatch();
  const userPhoto = useSelector((state) => state.user.photoPath);
  const userName = useSelector((state) => state.user.name);
  const userEmail = useSelector((state) => state.user.email);

  // Profile form state
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [photo, setPhoto] = useState(userPhoto);
  const [photoFile, setPhotoFile] = useState(null);
  
  // Password form state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        // Store the base64 string
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const updateData = {
        name: name,
        email: email,
      };

      // Only include photo if it was changed and is in base64 format
      if (photoFile && photo.startsWith("data:image")) {
        updateData.photo = photo;
      }

      console.log("Sending update data:", {
        name,
        email,
        hasPhoto: !!updateData.photo,
      });

      const response = await updateProfile(updateData);

      console.log("Update response:", response);

      if (response.status === 200 || response.status === 201) {
        setSuccess(true);
        dispatch(
          updateUser({
            name: response.data.user?.name || name,
            email: response.data.user?.email || email,
            photoPath: response.data.user?.photoPath || photo,
          }),
        );
        setPhotoFile(null);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const errorMessage =
          response.data?.message || "Failed to update profile";
        setError(errorMessage);
        console.error("Update error:", errorMessage);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Something went wrong while updating profile";
      setError(errorMsg);
      console.error("Error details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    // Validation
    if (!oldPassword.trim()) {
      setError("Current password is required");
      return;
    }

    if (!newPassword.trim()) {
      setError("New password is required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    // Check password pattern: at least one uppercase, one lowercase, one special character
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,25}$/;
    if (!passwordPattern.test(newPassword)) {
      setError("Password must contain uppercase, lowercase, and special characters");
      return;
    }

    if (oldPassword === newPassword) {
      setError("New password must be different from current password");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const passwordData = {
        oldPassword: oldPassword,
        newPassword: newPassword,
      };

      const response = await changePassword(passwordData);

      if (response.status === 200 || response.status === 201) {
        setSuccess(true);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordForm(false);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const errorMessage =
          response.data?.message || "Failed to change password";
        setError(errorMessage);
        console.error("Password change error:", errorMessage);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Something went wrong while changing password";
      setError(errorMsg);
      console.error("Error details:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.main}>
          {/* Profile Update Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Profile Settings</h2>
            
            <div className={styles.photoContainer}>
              <img src={photo} alt="User" className={styles.userPhoto} />
              <label htmlFor="photoInput" className={styles.photoLabel}>
                <MdPhotoCamera />
              </label>
              <input
                type="file"
                id="photoInput"
                accept="image/*"
                onChange={handlePhotoChange}
                className={styles.hiddenInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
                placeholder="Enter your name"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                placeholder="Enter your email"
              />
            </div>

            <button
              onClick={handleUpdateProfile}
              disabled={loading}
              className={styles.updateButton}
            >
              {loading && !showPasswordForm ? "Updating..." : "Update Profile"}
            </button>
          </div>

          {/* Password Change Section */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Security</h2>
            
            {!showPasswordForm ? (
              <button
                onClick={() => setShowPasswordForm(true)}
                className={styles.toggleButton}
              >
                Change Password
              </button>
            ) : (
              <div className={styles.passwordForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="oldPassword">Current Password</label>
                  <input
                    type="password"
                    id="oldPassword"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className={styles.input}
                    placeholder="Enter your current password"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={styles.input}
                    placeholder="Enter new password"
                  />
                  <p className={styles.passwordHint}>
                    At least 8 characters with uppercase, lowercase, and special character
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={styles.input}
                    placeholder="Confirm new password"
                  />
                </div>

                <div className={styles.buttonGroup}>
                  <button
                    onClick={handleChangePassword}
                    disabled={loading}
                    className={styles.updateButton}
                  >
                    {loading && showPasswordForm ? "Changing..." : "Change Password"}
                  </button>
                  <button
                    onClick={() => {
                      setShowPasswordForm(false);
                      setOldPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setError(null);
                    }}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          {error && <div className={styles.error}>{error}</div>}
          {success && (
            <div className={styles.success}>
              {showPasswordForm ? "Password changed successfully!" : "Profile updated successfully!"}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Profile;
