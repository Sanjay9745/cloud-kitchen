import Modal from "react-modal";

Modal.setAppElement("#root"); // Set the root element

// eslint-disable-next-line react/prop-types
function DeleteConfirmationModal({ isOpen, onRequestClose, onDelete }) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Delete Confirmation"
    >
      <div     style={{ marginLeft: "40px" }}>
        <h2>Confirm Deletion</h2>
        <p>Are you sure you want to delete this user?</p>
        <button
          className="btn btn-danger"
          style={{ marginRight: "40px" }}
          onClick={onDelete}
        >
          Yes
        </button>
        <button className="btn" onClick={onRequestClose}>
          No
        </button>
      </div>
    </Modal>
  );
}

export default DeleteConfirmationModal;
