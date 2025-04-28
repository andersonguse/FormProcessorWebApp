import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx'; // Importing SheetJS
import './App.css';

function App() {
  const [fileType, setFileType] = useState('');
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [darkMode, setDarkMode] = useState(true);  // Set default to true (dark mode)
  const fileInputRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  useEffect(() => {
    // Check if dark mode preference is stored in localStorage and apply it
    const storedMode = localStorage.getItem('darkMode');
    if (storedMode) {
      setDarkMode(storedMode === 'true');
    }
  }, []);

  useEffect(() => {
    // Store the dark mode preference in localStorage
    localStorage.setItem('darkMode', darkMode);
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  const handleFileTypeChange = (e) => {
    setFileType(e.target.value);
  };

  const handleDrop = (event) => {
    event.preventDefault(); // Very important!
    setIsDragging(false);
  
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      setFileName(droppedFile.name);
      fileInputRef.current.files = event.dataTransfer.files; // **<- also important**
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

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name); // Store the file name
    }
  };
  

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleSubmit = () => {
    // Check if a form type has been selected
    if (!fileType) {
      setErrorMessage('No Form option selected! Please select one to submit.');
      return; // Prevent submission if no form type is selected
    }
    
    // Check if a file has been uploaded
    const file = fileInputRef.current.files[0];
    if (!file) {
      setErrorMessage('No file uploaded! Please upload a file to submit.');
      return; // Prevent submission if no file is uploaded
    }
  
    // If both the form type and file are selected, process the file
    console.log(`Form Type: ${fileType}, File Name: ${file.name}`);
  
    // Handle form-specific logic (add logic for each form type)
    if (fileType === 'sampleOrder') {
      console.log("Processing Sample Order Form...");
      handleSampleOrderForm(file); // Call your sample order form handling function
    } else if (fileType === 'intOrder') {
      console.log("Processing International Order Form...");
      handleIntOrderForm(file); // Handle International Order Form logic here
    } else if (fileType === 'carstockOrder') {
      console.log("Processing Carstock Order Form...");
      handleCarstockOrderForm(file); // Handle Carstock Order Form logic here
    } else if (fileType === 'itemUpload') {
      console.log("Processing Product Add Form...");
      handleProductAddForm(file); // Handle Product Add Form logic here
    }
  
    // Clear error message (if any)
    setErrorMessage('');
  };
  
  const handleSampleOrderForm = async (file) => {
    
    setIsProcessing(true);
    setProcessingMessage('File processing...');
    
    try {
      // Step 1: Read the file
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
  
      // Step 2: Get the first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const columns = ['A', 'B', 'C', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
      const isRow7Missing = columns.some(col => {
        const cell = worksheet[`${col}7`];
        return !cell || cell.v === undefined || cell.v === null || cell.v === '';
      });

      // Example code below on how to access cell
      // const cellA6 = worksheet['A6'];
  
      if(isRow7Missing){
        //go to next page with error message of you are missing one of the first required rows! Please populate whatever row was missing.
      }

      await sleep(1000);
  
    } catch (error) {
      console.error('Error reading file:', error);
    }
  
    setIsProcessing(false);
    
  };

  const handleIntOrderForm = (file) => {
    // For now, just log a message. You can replace this with actual file handling logic.
    
  };
  const handleCarstockOrderForm = (file) => {
    // For now, just log a message. You can replace this with actual file handling logic.
    
  };
  const handleProductAddForm = (file) => {
    // For now, just log a message. You can replace this with actual file handling logic.
    
  };

  return (
    <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
      {isProcessing && (
        <div className={`processing-modal ${darkMode ? 'processing-modal-dark' : ''}`}>
          <div className="spinner"></div> {/* Loading spinner */}
          <p>{processingMessage}</p>
        </div>
      )}
      <div className="dark-mode-toggle">
        <span>Dark Mode</span>
        <label className="switch">
          <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
          <span className="slider"></span>
        </label>
      </div>

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

    {fileName && (
      <div className="file-name">
        <strong>Uploaded File:</strong> {fileName}
      </div>
    )}


    {/* Error Message Display */}
    {errorMessage && (
      <div className={`error-message ${errorMessage ? 'show' : ''}`}>
        {errorMessage}
      </div>
    )}

    <button type="button" onClick={handleSubmit} className='submit-btn'>
      Submit
    </button>

    </div>
  );
}

export default App;
