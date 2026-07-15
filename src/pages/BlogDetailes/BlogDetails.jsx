import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  getBlogById,
  deleteBlog,
  postComment,
  getCommentsByID,
  deleteComment,
  updateComment,
} from "../../api/internal";
import Loader from "../../components/Loader/Loader";
import styles from "./BlogDetails.module.css";
import Comment from "../../components/Comment/Comment";
import clsx from "clsx";

function BlogDetails() {
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [ownsBlog, setOwnsBlog] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [reload, setReload] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editComment, setEditComment] = useState({
    edit: false,
    commentId: "",
    content: "",
  });

  const navigate = useNavigate();
  const params = useParams();
  const blogId = params.id;

  const name = useSelector((state) => state.user.username);
  const userId = useSelector((state) => state.user._id);

  const handleCancelEdit = () => {
    setEditComment({
      edit: false,
      commentId: null,
      content: null,
    });
  };

  const postCommentHandler = async () => {
    if (!newComment.trim()) {
      alert("Please write a comment");
      return;
    }

    try {
      const data = {
        author: userId,
        blog: blogId,
        content: newComment,
      };

      const response = await postComment(data);

      if (response.status === 201) {
        setNewComment("");
        setReload(!reload);
      } else {
        setError("Failed to post comment");
      }
    } catch (err) {
      console.error("Comment error:", err);
      setError("Something went wrong while posting comment");
    }
  };

  const deleteBlogHandler = async () => {
    if (!window.confirm("Are you sure you want to delete this blog?")) {
      return;
    }

    try {
      const response = await deleteBlog(blogId);

      if (response.status === 200) {
        navigate("/");
      } else {
        setError("Failed to delete blog");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setError("Something went wrong while deleting blog");
    }
  };

  const refreshComments = async () => {
    try {
      const commentResponse = await getCommentsByID(blogId);
      if (commentResponse.status === 200) {
        const commentData =
          commentResponse.data.data ||
          commentResponse.data.comments ||
          commentResponse.data ||
          [];
        setComments(commentData);
      }
    } catch (err) {
      console.error("Refresh comments error:", err);
    }
  };

  const handleUpdateCommentClick = (commentId, content) => {
    setEditComment({
      edit: true,
      commentId: commentId,
      content: content,
    });
  };

  const handleDeleteComment = async (_id) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      const response = await deleteComment(_id);

      if (response.status === 200) {
        refreshComments();
      } else {
        setError("Failed to delete comment");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setError("Something went wrong while deleting blog");
    }
  };

  const handleUpdateComment = async (id, content) => {
    try {
      const payload = {
        content,
      };
      const response = await updateComment(id, payload);

      if (response.status === 200) {
        refreshComments();
        handleCancelEdit();
      } else {
        setError("Failed to update comment");
      }
    } catch (err) {
      console.error("Update error:", err);
      setError("Something went wrong while updating comment");
    }
  };

  useEffect(() => {
    async function getBlogDetails() {
      try {
        setLoading(true);
        setError(null);

        const commentResponse = await getCommentsByID(blogId);
        if (commentResponse.status === 200) {
          const commentData =
            commentResponse.data.data ||
            commentResponse.data.comments ||
            commentResponse.data ||
            [];
          setComments(commentData);
        }

        const blogResponse = await getBlogById(blogId);
        if (blogResponse.status === 200) {
          const blogData = blogResponse.data.blog || blogResponse.data;
          setBlog(blogData);

          setOwnsBlog(name === blogData.authorUsername);
        } else {
          setError("Blog not found");
        }
      } catch (err) {
        console.error("Error fetching blog details:", err);
        setError("Failed to load blog details");
      } finally {
        setLoading(false);
      }
    }

    getBlogDetails();
  }, [blogId, reload, name]);

  if (loading) {
    return <Loader text="Blog details" />;
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>⚠️ {error}</h2>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className={styles.errorContainer}>
        <h2>Blog not found</h2>
        <button onClick={() => navigate("/")}>Go Back</button>
      </div>
    );
  }

  return (
    <div className={styles.detailsWrapper}>
      {/* Left Section - Blog Details */}
      <div className={styles.left}>
        <h1 className={styles.title}>{blog.title}</h1>

        <div className={styles.meta}>
          <p>
            @{blog.authorUsername} on {new Date(blog.createdAt).toDateString()}
          </p>
        </div>

        {blog.photo && (
          <div className={styles.photo}>
            <img src={blog.photo} alt={blog.title} width={250} height={250} />
          </div>
        )}

        <p className={styles.content}>{blog.content}</p>

        {ownsBlog && (
          <div className={styles.controls}>
            <button
              className={styles.edit}
              onClick={() => navigate(`/blog/update/${blog._id}`)}
            >
              ✏️ EDIT
            </button>
            <button className={styles.delete} onClick={deleteBlogHandler}>
              🗑️ DELETE
            </button>
          </div>
        )}
      </div>

      {/* Right Section - Comments */}
      <div className={styles.right}>
        <div className={styles.commentsWrapper}>
          <h3 className={styles.commentsTitle}>Comments ({comments.length})</h3>

          <div className={styles.commentsList}>
            {comments.length === 0 ? (
              <p className={styles.noComments}>
                No comments yet. Be the first!
              </p>
            ) : (
              comments.map((comment) => (
                <Comment
                  key={comment._id}
                  item={comment}
                  onCommentUpdate={() =>
                    handleUpdateCommentClick(comment._id, comment.content)
                  }
                  onCommentDelete={() => handleDeleteComment(comment._id)}
                />
              ))
            )}
          </div>

          {editComment?.edit ? (
            <div className={styles.postComment}>
              <textarea
                className={styles.input}
                placeholder="Write your comment here..."
                value={editComment.content}
                onChange={(e) =>
                  setEditComment({
                    ...editComment,
                    content: e.target.value,
                  })
                }
                rows="3"
              />
              <div className="d-flex align-items-center gap-2">
                <button
                  className={styles.postCommentButton}
                  onClick={() =>
                    handleUpdateComment(
                      editComment.commentId,
                      editComment.content,
                    )
                  }
                  disabled={!editComment.content.trim()}
                >
                  UPDATE COMMENT
                </button>
                <button
                  className={clsx(styles.postCommentButton, styles.cancelBtn)}
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.postComment}>
              <textarea
                className={styles.input}
                placeholder="Write your comment here..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows="3"
              />
              <button
                className={styles.postCommentButton}
                onClick={postCommentHandler}
                disabled={!newComment.trim()}
              >
                POST COMMENT
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BlogDetails;
