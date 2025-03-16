import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../Config.js';
import './SchoolSalesReport.css';
import Select from "react-select";


const SalesSchoolReport = () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    const storeId = user?.storeId;

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [popupData, setPopupData] = useState(null); // State for popup data
    const [popupVisible, setPopupVisible] = useState(false); // State for popup visibility
    const[userList,setUserList]=useState([]);
    const[userId,setUserId]=useState('ALL');
    

    const fetchSalesReport = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_BASE_URL}/sales/report/school_name?startDate=${startDate}&endDate=${endDate}&storeId=${storeId}&userId=${userId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }

            const data = await response.json();
            console.log(response)
            const sortedData = data.sort((a, b) => b.sales - a.sales);
            setReportData(sortedData);

       


        } catch (err) {
            console.log(err.message);
            
        } finally {
            setLoading(false);
        }
    };

      useEffect(() => {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0]; // Format to YYYY-MM-DD
        setEndDate(formattedDate); // Set end date to today
    }, []); // Empty dependency array means this runs only on component mount

      const handleExport = async () => {
        if (reportData.length === 0) {
          alert('No data to export.');
          return;
        }
    
        try {
          const response = await fetch(`${API_BASE_URL}/sales/export/schoolWiseSales`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(reportData),
          });
    
          if (!response.ok) {
            throw new Error('Failed to export sales report.');
          }
    
          const blob = await response.blob();
          const url = window.URL.createObjectURL(new Blob([blob]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'Sales Report School Wise.xlsx');
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
        } catch (error) {
          console.error('Error exporting sales report:', error);
        }
      };
    
    

    const fetchDetailedReport = async (schoolName) => {
        try {
            setLoading(true);

            const response = await fetch(`${API_BASE_URL}/sales/report/schoolSalesSummary?schoolName=${schoolName}&startDate=${startDate}&endDate=${endDate}&storeId=${storeId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch detailed report');
            }

            const data = await response.json();
            setPopupData(data);
            setPopupVisible(true);
        } catch (err) {
            console.log(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFetch = () => {
        if (startDate && endDate && storeId) {
            fetchSalesReport();
        } else {
            alert('Please select start and end dates');
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/store/getAllUserByStore?storeId=${storeId}`);
                const data = await response.json(); 
                const options = [{ value: "ALL", label: "ALL" }, ...data.map(user => ({ value: user, label: user }))];
    
                setUserList(options);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
    
        fetchUser();
    }, [API_BASE_URL, storeId]);
    
    
    

    const handleView = (schoolName) => {
        console.log("Handle view")
        fetchDetailedReport(schoolName);
    };

    const closePopup = () => {
        setPopupVisible(false);
        setPopupData(null);
    };

    return (
        <div className="sales-school-report">
            <h2 className="sales-report-title">Sales School Summary</h2>
            <div className="sales-date-inputs">
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="sales-input-date"
                />
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="sales-input-date"
                />

<div>
        
            <Select
                options={userList}
                value={userList.find(option => option.value === userId)}
                onChange={(selectedOption) => setUserId(selectedOption.value)}
                placeholder="Select a user..."
                isSearchable
            />

            
        </div>
                <button onClick={handleFetch} className="sales-fetch-btn">Fetch Report</button>

              

            </div>

         


            {loading && <p className="sales-loading-message">Loading...</p>}
            {error && <p className="sales-error-message">{error}</p>}
            {!loading && reportData.length > 0 && (
                <div className="sales-report-table-wrapper">
                    <table className="sales-report-table">
                        <thead>
                            <tr>
                                <th>School</th>
                                <th>School Sales</th>
                                <th>Other Sales</th>
                                <th>Total Sales</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportData.map((report, index) => (
                                <tr key={index}>
                                    <td>{report.schoolName}</td>
                                    <td>{report.schoolSales}</td>
                                    <td>{report.otherSales}</td>
                                    <td>{report.sales}</td>
                                    <td>
                                    <button
    className="sales-view-btn"
    onClick={() => handleView(report.schoolName)}>
    View
</button>

                                    </td>
                                </tr>
                            ))}



                        </tbody>
                       
                    </table>

                   
                </div>
                
            )}
               {!loading && reportData.length > 0 && (
                <>
                <div className='school-total-sale'>
                <h4>Total Sales:{reportData.reduce((total, report) => total + report.sales, 0)}</h4>
                </div>
                <div className='school-total-sale-export'>
                    <button onClick={handleExport} >
                        Export
                    </button>
                </div>

                </>
               )}

          

          
{popupVisible && popupData && (
    <div className="sales-school-report-popup-overlay">
        <div className="sales-school-report-popup-content">
            <h3>Sales Report Details</h3>
            <div className="sales-detail-table-container">
                <table className="sales-detail-table">
                    <thead>
                        <tr>
                            <th>Item Barcode ID</th>
                            <th>Item Category</th>
                            <th>Item Code</th>
                            <th>Description</th>
                            <th>Type</th>
                            <th>Color</th>
                            <th>Size</th>
                            <th>Price</th>
                            <th>Sell Price</th>
                            <th>Quantity</th>
                            <th>Total Amount</th>
                            <th>Bill Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {popupData.map((item, index) => (
                            <tr key={index}>
                                <td>{item.itemBarcodeID}</td>
                                <td>{item.itemCategory}</td>
                                <td>{item.itemCode}</td>
                                <td>{item.description}</td>
                                <td>{item.itemType}</td>
                                <td>{item.itemColor}</td>
                                <td>{item.itemSize}</td>
                                <td>{item.price}</td>
                                <td>{item.sellPrice}</td>
                                <td>{item.totalQuantity}</td>
                                <td>{item.totalAmount}</td>
                                <td>{item.billType}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button onClick={closePopup} className="sales-school-report-popup-close-btn">Close</button>
        </div>
    </div>
)}
        </div>
    );
};

export default SalesSchoolReport;
