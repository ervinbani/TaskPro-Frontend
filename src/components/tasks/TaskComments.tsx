import { useState } from "react";
import styles from "./TaskComments.module.css";

interface TaskCommentsProps {
  comments: string[];
  onAddComment: (comment: string) => void;
  onEditComment: (index: number, newComment: string) => void;
  onDeleteComment: (index: number) => void;
}

const TaskComments = ({
  comments,
  onAddComment,
  onEditComment,
  onDeleteComment,
}: TaskCommentsProps) => {
  const [newComment, setNewComment] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment("");
    }
  };

  const handleStartEdit = (index: number, currentComment: string) => {
    setEditingIndex(index);
    setEditText(currentComment);
  };

  const handleSaveEdit = (index: number) => {
    if (editText.trim()) {
      onEditComment(index, editText.trim());
      setEditingIndex(null);
      setEditText("");
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditText("");
  };

  return (
    <div className={styles.commentsSection}>
      <h4 className={styles.commentsTitle}>
        Comments ({comments?.length || 0})
      </h4>

      {/* Comments list */}
      <div className={styles.commentsList}>
        {comments && comments.length > 0 ? (
          comments.map((comment, index) => (
            <div key={index} className={styles.commentItem}>
              {editingIndex === index ? (
                <div className={styles.editCommentForm}>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className={styles.editTextarea}
                    autoFocus
                  />
                  <div className={styles.editActions}>
                    <button
                      onClick={() => handleSaveEdit(index)}
                      className={styles.saveBtn}
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className={styles.cancelBtn}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className={styles.commentText}>{comment}</p>
                  <div className={styles.commentActions}>
                    <button
                      onClick={() => handleStartEdit(index, comment)}
                      className={styles.editBtn}
                      title="Edit comment"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this comment?",
                          )
                        ) {
                          onDeleteComment(index);
                        }
                      }}
                      className={styles.deleteBtn}
                      title="Delete comment"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <p className={styles.noComments}>No comments yet</p>
        )}
      </div>

      {/* Add new comment */}
      <div className={styles.addCommentForm}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className={styles.commentInput}
          rows={3}
        />
        <button onClick={handleAddComment} className={styles.addBtn}>
          Add Comment
        </button>
      </div>
    </div>
  );
};

export default TaskComments;
