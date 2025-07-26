import React, { useRef, useEffect } from 'react';

const Modal = ({ content, onClose }) => {
  const modalRef = useRef(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-gray-700 p-6 rounded-lg shadow-xl max-w-sm w-full text-center border border-gray-600">
        <p className="text-lg mb-4 text-white">{content}</p>
        <button
          onClick={onClose}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;
