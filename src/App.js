import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx'; // Importing SheetJS
import './App.css';
import MessageScreen from './MessageScreen';

function App() {
  const [fileType, setFileType] = useState('');
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [darkMode, setDarkMode] = useState(true);  // Set default to true (dark mode)
  const fileInputRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [messageScreenVisible, setMessageScreenVisible] = useState(false);
  const [messageScreenTitle, setMessageScreenTitle] = useState('');
  const [messageScreenMessage, setMessageScreenMessage] = useState('');
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

  const showMessageScreen = (title, message) => {
    setMessageScreenTitle(title);
    setMessageScreenMessage(message);
    setMessageScreenVisible(true);
  };
  
  const handleBack = () => {
    setMessageScreenVisible(false);
    setMessageScreenTitle('');
    setMessageScreenMessage('');
    setIsProcessing(false);
    setFileName(''); // Optional: clears uploaded file name
    setErrorMessage(''); // Optional: clears errors
  };
  

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
    await sleep(1000);
    
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

      const cellB4 = worksheet['B4'];
      const isValidFutureDate = (cellB4) => {
        if (!cellB4 || !cellB4.v) {
          return false; // blank or missing
        }
      
        const dateValue = new Date(cellB4.v);
        if (isNaN(dateValue)) {
          return false; // not a valid date
        }
      
        const today = new Date();
        today.setHours(0, 0, 0, 0); // normalize today to midnight
      
        return dateValue >= today; // true if today or future
      };

      const validateFollowingRows = (worksheet) => {
        for (let row = 8; ; row++) {
          const i = worksheet[`I${row}`];
          const j = worksheet[`J${row}`];
          const k = worksheet[`K${row}`];
          const l = worksheet[`L${row}`];
      
          const cells = [i, j, k, l];
          const filled = cells.filter(cell => cell && cell.v !== undefined && cell.v !== null && cell.v !== '');
      
          // If all blank, assume no more data
          if (filled.length === 0) {
            break;
          }
      
          // If some are filled but not all, that's an error
          if (filled.length > 0 && filled.length < 4) {
            return false; // bad row found
          }
        }
        return true; // all good
      };

      // Example code below on how to access cell
      // const cellA6 = worksheet['A6'];

      if (!file.name.endsWith('.xlsx')) {
        showMessageScreen(
          'Invalid File Type',
          'Please upload a valid .xlsx file.'
        );
        return;
      }

      if (!worksheet['A6'] || worksheet['A6'].v != 'Order Ref') {
        showMessageScreen(
          'Incorrect Form Uploaded',
          'The form you uploaded is not a sample order form. Please check your Form selection and resubmit.'
        );
        return;
      }

      if (!isValidFutureDate(cellB4)) {
        showMessageScreen(
          'Invalid Date',
          'The date in B4 is missing, invalid, or in the past. Please set it to today or a future date.'
        );
        return;
      }
  
      if(isRow7Missing){
        showMessageScreen(
          'Missing Required Fields',
          'You are missing one of the required fields in the header! Please check and populate all necessary cells.'
        );
        return;
      }

      if (!validateFollowingRows(worksheet)) {
        showMessageScreen(
          'Missing Required Fields',
          'After the first row, if any product fields are populated (columns I-L), all must be populated. Please correct the form.'
        );
        return;
      }
  
    } catch (error) {
      console.error('Error reading file:', error);
      showMessageScreen(
        'Unexpected Error',
        'An unexpected error occurred. Please try again.'
      );
    }
  
    setIsProcessing(false);
    
  };

  const handleIntOrderForm = async (file) => {
    
    setIsProcessing(true);
    setProcessingMessage('File processing...');
    await sleep(1000);

    try{

      // Step 1: Read the file
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
  
      // Step 2: Get the first sheet
      const orderSheet = workbook.Sheets[workbook.SheetNames[0]];
      const collateralSheet = workbook.Sheets[workbook.SheetNames[1]];

      if (!file.name.endsWith('.xlsx')) {
        showMessageScreen(
          'Invalid File Type',
          'Please upload a valid .xlsx file.'
        );
        return;
      }

      if (!orderSheet['D3'] || orderSheet['D3'].v != 'CUSTOMER NAME:') { 
        showMessageScreen(
          'Incorrect Form Uploaded',
          'The form you uploaded is not an international order form. Please check your Form selection and resubmit.'
        );
        return;
      }

      if(!orderSheet['E1'] || orderSheet['E1'].v == '' || orderSheet['E1'].v == null)
      {
        showMessageScreen(
          'Brand Missing',
          'The Brand field is empty. Please update your form and resubmit.'
        );
        return;
      }

      if(!orderSheet['E2'] || orderSheet['E2'].v == '' || orderSheet['E2'].v == null)
        {
          showMessageScreen(
            'Customer Number Missing',
            'The customer number field is empty. Please update your form and resubmit.'
          );
          return;
        }

        // Check for zeros in the quantity field in the International Order Form sheet
        for (let row = 20; row <= 300; row++) {
          const quantityCell = orderSheet[`N${row}`];
          const stopMarkerCell = orderSheet[`K${row}`];
        
          // Check if we've reached "TOTAL SAMPLES:"
          if (stopMarkerCell && stopMarkerCell.v == 'TOTAL SAMPLES:') {
            break; // stop checking after this
          }
        
          // Check if quantity is 0 (explicitly)
          if (quantityCell && quantityCell.v == 0) {
            showMessageScreen(
              'Zero in Quantity Field',
              `There is a zero in the quantity field at row ${row} in the International Order Form sheet. X3 does not accept zeros for quantities. Please update your form and resubmit.`
            );
            return;
          }
        }

        // Check for zeros in the quantity field in the Marketing Collateral sheet
        for (let row = 4; row <= 50; row++) {
          const quantityCell = collateralSheet[`D${row}`];
          const stopMarkerCell = collateralSheet[`C${row}`];
        
          // Check if we've reached "TOTAL SAMPLES:"
          if (stopMarkerCell && stopMarkerCell.v == 'TOTAL COLLATERAL:') {
            break; // stop checking after this
          }
        
          // Check if quantity is 0 (explicitly)
          if (quantityCell && quantityCell.v == 0) {
            showMessageScreen(
              'Zero in Quantity Field',
              `There is a zero in the quantity field at row ${row} in the Marketing Collateral sheet. X3 does not accept zeros for quantities. Please update your form and resubmit.`
            );
            return;
          }
        }

    }

    catch (error) {
      console.error('Error reading file:', error);
      showMessageScreen(
        'Unexpected Error',
        'An unexpected error occurred. Please try again.'
      );
    }

    setIsProcessing(false);
    
  };
  const handleCarstockOrderForm = async (file) => {
    
    setIsProcessing(true);
    setProcessingMessage('File processing...');
    await sleep(1000);

    try{

      // Step 1: Read the file
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
  
      // Step 2: Get the first sheet
      const orderSheet = workbook.Sheets[workbook.SheetNames[0]];

      if (!file.name.endsWith('.xlsx')) {
        showMessageScreen(
          'Invalid File Type',
          'Please upload a valid .xlsx file.'
        );
        return;
      }

      if (!orderSheet['B4'] || orderSheet['B4'].v != 'Account #:') {
        showMessageScreen(
          'Incorrect Form Uploaded',
          'The form you uploaded is not a carstock order form. Please check your Form selection and resubmit.'
        );
        return;
      }

      if (!orderSheet['C4'] || orderSheet['C4'] == '') {
        showMessageScreen(
          'Account Number Blank',
          'The form you uploaded has the account number blank. Please check your Form and resubmit.'
        );
        return;
      }

      // Check for zeros in the quantity field in the Order Form sheet
      for (let row = 13; row <= 300; row++) {
        const quantityCell = orderSheet[`E${row}`];
        const stopMarkerCell = orderSheet[`B${row}`];
      
        // Check if we've reached "TOTAL SAMPLES:"
        if (stopMarkerCell && stopMarkerCell.v == 'ORDER TOTAL') {
          break; // stop checking after this
        }
      
        // Check if quantity is 0 (explicitly)
        if (quantityCell && quantityCell.v == 0) {
          showMessageScreen(
            'Zero in Quantity Field',
            `There is a zero in the quantity field at row ${row} in the Marketing Collateral sheet. X3 does not accept zeros for quantities. Please update your form and resubmit.`
          );
          return;
        }
      }

    }

    catch (error) {
      console.error('Error reading file:', error);
      showMessageScreen(
        'Unexpected Error',
        'An unexpected error occurred. Please try again.'
      );
    }

    setIsProcessing(false);
    
  };
  const handleProductAddForm = async (file) => {
    
    setIsProcessing(true);
    setProcessingMessage('File processing...');
    await sleep(1000);
    
  };

  return (
    <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
      {messageScreenVisible ? (
        <MessageScreen
          title={messageScreenTitle}
          message={messageScreenMessage}
          onBackClick={handleBack}
          darkMode={darkMode}
        />
      ) : (
        <>
          {/* START of your normal form screen */}
          {isProcessing && (
            <div className={`processing-modal ${darkMode ? 'processing-modal-dark' : ''}`}>
              <div className="spinner"></div>
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
              <option value="itemUpload" disabled>Product Add Form (coming soon)</option> {/* DISABLED UNTIL FURTHER WORK IS DONE */}
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
  
          <button type="button" onClick={handleSubmit} className="submit-btn">
            Submit
          </button>
          {/* END of your normal form screen */}
        </>
      )}
    </div>
  );
  

  // return (
  //   <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
  //     {isProcessing && (
  //       <div className={`processing-modal ${darkMode ? 'processing-modal-dark' : ''}`}>
  //         <div className="spinner"></div> {/* Loading spinner */}
  //         <p>{processingMessage}</p>
  //       </div>
  //     )}
  //     <div className="dark-mode-toggle">
  //       <span>Dark Mode</span>
  //       <label className="switch">
  //         <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
  //         <span className="slider"></span>
  //       </label>
  //     </div>

  //     <form>
  //       <label htmlFor="fileType" className="form-label">
  //         Select type of form:
  //         </label>
  //       <select
  //         id="fileType"
  //         value={fileType}
  //         onChange={handleFileTypeChange}
  //         className="file-type-select"
  //       >
  //         <option value="">(select one)</option>
  //         <option value="sampleOrder">Sample Order Form</option>
  //         <option value="intOrder">International Order Form</option>
  //         <option value="carstockOrder">Carstock Order Form</option>
  //         <option value="itemUpload">Product Add Form</option>
  //       </select>
  //     </form>

  //   <div
  //     className={`file-upload-area ${isDragging ? 'drag-over' : ''}`}
  //     onClick={handleUploadBoxClick}
  //     onDrop={handleDrop}
  //     onDragOver={handleDragOver}
  //     onDragLeave={handleDragLeave}
  //   >
  //     <p>Click or drag file to upload</p>
  //     <input
  //       type="file"
  //       ref={fileInputRef}
  //       className="file-input"
  //       onChange={handleFileChange}
  //     />
  //   </div>

  //   {fileName && (
  //     <div className="file-name">
  //       <strong>Uploaded File:</strong> {fileName}
  //     </div>
  //   )}


  //   {/* Error Message Display */}
  //   {errorMessage && (
  //     <div className={`error-message ${errorMessage ? 'show' : ''}`}>
  //       {errorMessage}
  //     </div>
  //   )}

  //   <button type="button" onClick={handleSubmit} className='submit-btn'>
  //     Submit
  //   </button>

  //   </div>
  // );
}

export default App;
