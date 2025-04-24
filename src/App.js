import React, { useState, useRef } from 'react';
import './App.css';

function App() {
  const [fileType, setFileType] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileTypeChange = (e) => {
    setFileType(e.target.value);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length) {
      console.log("Dropped file:", files[0]);
      // You can add file handling logic here
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleUploadBoxClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Selected file:", file);
      // You can handle the file here
    }
  };

  return (
    <div className="App">
      <h1>Astral Brands Form Upload</h1>
      <form>
        <label htmlFor="fileType" className="form-label">
          Select type of form:
        </label>
        <select
          id="fileType"
          value={fileType}
          onChange={handleFileTypeChange}
          className="file-type-select"
        >
          <option value="">(select one)</option>
          <option value="sampleOrder">Sample Order Form</option>
          <option value="intOrder">International Order Form</option>
          <option value="carstockOrder">Carstock Order Form</option>
          <option value="itemUpload">Product Add Form</option>
        </select>
      </form>

      <div
        className={`file-upload-area ${isDragging ? 'drag-over' : ''}`}
        onClick={handleUploadBoxClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <p>Click or drag file to upload</p>
        <input
          type="file"
          ref={fileInputRef}
          className="file-input"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}

export default App;
