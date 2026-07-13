import { useState, useEffect } from "react";
import { getBlogById, updateBlog } from "../../api/internal";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./UpdateBlog.module.css";
import { useSelector } from "react-redux";
import TextInput from "../../components/TextInput/TextInput";

function UpdateBlog() {
  const navigate = useNavigate();
  const params = useParams();
  const blogId = params.id;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [photo, setPhoto] = useState("");
  const [newPhotoSelected, setNewPhotoSelected] = useState(false); // Track if new photo is selected
  const author = useSelector((state) => state.user._id);

  useEffect(() => {
    async function getBlogDetails() {
      const response = await getBlogById(blogId);
      if (response.status === 200) {
        setTitle(response.data.blog.title);
        setContent(response.data.blog.content);
        setPhoto(response.data.blog.photo);
        setNewPhotoSelected(false); // Reset flag
      }
    }
    getBlogDetails();
  }, [blogId]);

  const getPhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setPhoto(reader.result);
        setNewPhotoSelected(true); // Mark that new photo is selected
      };
    }
  };

  const updateHandler = async () => {
    let data;
    
    // If new photo is selected, send it, otherwise don't send photo
    if (newPhotoSelected) {
      data = {
        author,
        title,
        content,
        photo, // Send the new base64 image
        blogId,
      };
    } else {
      // No new photo selected, just update title and content
      data = {
        author,
        title,
        content,
        blogId,
      };
    }

    const response = await updateBlog(data);

    if (response.status === 200) {
      setNewPhotoSelected(false); // Reset flag after successful update
      navigate("/");
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>Edit Your Blog!</div>
      <TextInput
        type="text"
        name="title"
        placeholder="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: "60%" }}
      />
      <textarea
        className={styles.content}
        placeholder="Your content goes here..."
        maxLength={400}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className={styles.photoPrompt}>
        <p>Choose a photo</p>
        <input
          type="file"
          name="photo"
          id="photo"
          accept="image/jpg, image/jpeg, image/png"
          onChange={getPhoto}
        />
        {photo && (
          <img 
            src={photo} 
            width={80} 
            height={80} 
            alt="Blog post image"
            style={{ objectFit: "cover" }}
          />
        )}
      </div>
      <button className={styles.update} onClick={updateHandler}>
        Update
      </button>
    </div>
  );
}

export default UpdateBlog;