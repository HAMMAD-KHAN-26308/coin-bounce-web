import Dropdown from "react-bootstrap/Dropdown";
import styles from "./Comment.module.css";
import clsx from "clsx";
import { useSelector } from "react-redux";

function Comment({ item, onCommentUpdate, onCommentDelete }) {
  const date = new Date(item.createdAt).toDateString();

  const userName = useSelector((state) => state.user.username);

  const isAuthor = userName === item.authorUsername;

  return (
    <div className={styles.comment}>
      
      <div className={clsx(styles.header, "w-100")}>
        <div className="w-100 d-flex align-items-center justify-content-between gap-2">
          <div className={styles.author}>{item.authorUsername}</div>
          {isAuthor && (
            <Dropdown>
              <Dropdown.Toggle></Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item>Edit</Dropdown.Item>
                <Dropdown.Item onClick={() => onCommentDelete(item._id)}>
                  Delete
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>
        <div className={styles.date}>{date}</div>
        <div className={styles.commentText}>{item.content}</div>
      </div>
    </div>
  );
}

export default Comment;
