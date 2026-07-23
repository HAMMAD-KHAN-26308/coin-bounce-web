import Cropper from "react-easy-crop";
import styles from "./profile.module.css";
import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import { updateProfile, changePassword } from "../../api/internal";
import { updateUser } from "../../store/userSlice";
import { MdPhotoCamera } from "react-icons/md";

// Helper function to create a cropped image - THIS MUST BE INCLUDED
const createCroppedImage = (imageSrc, croppedAreaPixels) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = imageSrc;

    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Set canvas size to cropped area dimensions
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      // Draw the cropped portion
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
      );

      // Convert to base64
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to create image blob"));
            return;
          }

          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error("Failed to read blob"));
          reader.readAsDataURL(blob);
        },
        "image/jpeg",
        0.95,
      );
    };

    image.onerror = () => reject(new Error("Failed to load image"));
  });
};

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

  // Cropper state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setError("Please select a valid image file");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      e.target.value = "";
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setImageSrc(reader.result);
      setShowCropper(true);
      setError(null);
    };

    reader.onerror = () => {
      setError("Failed to read image file");
    };

    reader.readAsDataURL(file);
    // Clear the input so the same file can be selected again
    e.target.value = "";
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const cropImageNow = async () => {
    if (!imageSrc) {
      setError("No image to crop");
      return;
    }

    if (!croppedAreaPixels) {
      setError("Please select an area to crop");
      return;
    }

    try {
      setIsCropping(true);
      setError(null);

      // Actually crop the image
      const croppedImage = await createCroppedImage(
        imageSrc,
        croppedAreaPixels,
      );

      // Update the photo state with the cropped image
      setPhoto(croppedImage);
      setPhotoFile(croppedImage); // Store the base64 data

      // Close cropper and reset states
      setShowCropper(false);
      setImageSrc(null);
      setCroppedAreaPixels(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } catch (err) {
      setError("Failed to crop image: " + err.message);
      console.error("Crop error:", err);
    } finally {
      setIsCropping(false);
    }
  };

  const cancelCropper = () => {
    setShowCropper(false);
    setImageSrc(null);
    setCroppedAreaPixels(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setError(null);
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
        name: name.trim(),
        email: email.trim(),
      };

      // Only include photo if it was changed
      if (
        photoFile &&
        typeof photoFile === "string" &&
        photoFile.startsWith("data:image")
      ) {
        updateData.photo = photoFile;
      }

      const response = await updateProfile(updateData);

      if (response.status === 200 || response.status === 201) {
        setSuccess(true);
        // Update Redux state with the new photo
        dispatch(
          updateUser({
            name: response.data.user?.name || name,
            email: response.data.user?.email || email,
            photoPath: response.data.user?.photoPath || photo,
          }),
        );
        setPhotoFile(null); // Reset after successful update
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const errorMessage =
          response.data?.message || "Failed to update profile";
        setError(errorMessage);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Something went wrong while updating profile";
      setError(errorMsg);
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
      setError(
        "Password must contain uppercase, lowercase, and special characters",
      );
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
        oldPassword: oldPassword.trim(),
        newPassword: newPassword.trim(),
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
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Something went wrong while changing password";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.main}>
        {/* Profile Update Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Profile Settings</h2>

          <div className={styles.photoContainer}>
            <img
              src={photo || "/default-avatar.png"}
              alt="User"
              className={styles.userPhoto}
            />
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

          {/* Cropper Modal */}
          {showCropper && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0,0,0,0.85)",
                zIndex: 9999,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: "500px",
                  height: "400px",
                  background: "#1a1a1a",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  
                />
              </div>

              <div
                style={{
                  marginTop: "20px",
                  width: "100%",
                  maxWidth: "500px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "15px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    width: "100%",
                    padding: "0 20px",
                  }}
                >
                  <span style={{ color: "white", fontSize: "14px" }}>Zoom</span>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    style={{
                      flex: 1,
                      height: "6px",
                      borderRadius: "3px",
                      background: "#4CAF50",
                      outline: "none",
                    }}
                  />
                  <span
                    style={{
                      color: "white",
                      fontSize: "14px",
                      minWidth: "40px",
                    }}
                  >
                    {zoom.toFixed(1)}x
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    width: "100%",
                    justifyContent: "center",
                    padding: "0 20px",
                  }}
                >
                  <button
                    onClick={cropImageNow}
                    disabled={isCropping}
                    style={{
                      padding: "12px 30px",
                      background: isCropping ? "#666" : "#4CAF50",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: isCropping ? "not-allowed" : "pointer",
                      fontSize: "16px",
                      fontWeight: "600",
                      flex: 1,
                      maxWidth: "200px",
                      transition: "background 0.3s",
                    }}
                  >
                    {isCropping ? "Cropping..." : "Crop Image"}
                  </button>

                  <button
                    onClick={cancelCropper}
                    disabled={isCropping}
                    style={{
                      padding: "12px 30px",
                      background: "#f44336",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "16px",
                      fontWeight: "600",
                      flex: 1,
                      maxWidth: "200px",
                      transition: "background 0.3s",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

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
            disabled={loading && !showPasswordForm}
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
                  At least 8 characters with uppercase, lowercase, and special
                  character
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
                  disabled={loading && showPasswordForm}
                  className={styles.updateButton}
                >
                  {loading && showPasswordForm
                    ? "Changing..."
                    : "Change Password"}
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
            {showPasswordForm
              ? "Password changed successfully!"
              : "Profile updated successfully!"}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
