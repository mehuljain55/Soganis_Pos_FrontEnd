import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ItemUpdateHistory.module.css';
import { FIND_ITEM_UPDATE_HISTORT_URL } from '../Api/ApiConstants';

const ItemUpdateHistory = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedItems, setExpandedItems] = useState(new Set());

  const getUserData = () => {
    const user = sessionStorage.getItem('user');
    const token = sessionStorage.getItem('token');

    return {
        user: user ? JSON.parse(user) : null,
        token: token || null
    };
  };

  useEffect(() => {
    // Disable global scrolling
    document.body.style.overflow = 'hidden';
    fetchUpdateHistory();
    
    // Cleanup function to re-enable scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const fetchUpdateHistory = async () => {
    try {
      setLoading(true);
      
      const {user,token}=getUserData();

      const response = await axios.post(`${FIND_ITEM_UPDATE_HISTORT_URL}`, {
        user,token
      });
      
      if (response.data.status === 'success') {
        // Sort data by historyId in descending order
        const sortedData = (response.data.payload || []).sort((a, b) => b.historyId - a.historyId);
        setHistoryData(sortedData);
      } else {
        setError(response.data.message || 'Failed to fetch update history');
      }
    } catch (err) {
      setError('Error fetching update history: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (historyId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(historyId)) {
      newExpanded.delete(historyId);
    } else {
      newExpanded.add(historyId);
    }
    setExpandedItems(newExpanded);
  };

  const formatValues = (values) => {
    if (!values) return [];
    return values.split(',').map(item => item.trim()).filter(item => item);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading update history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
        <button onClick={fetchUpdateHistory} className={styles.retryButton}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Item Update History</h1>
        <button onClick={fetchUpdateHistory} className={styles.refreshButton}>
          Refresh
        </button>
      </div>

      {historyData.length === 0 ? (
        <div className={styles.noData}>No update history found</div>
      ) : (
        <div className={styles.scrollableContent}>
          <div className={styles.historyList}>
            {historyData.map((history) => (
              <div key={history.historyId} className={styles.historyCard}>
                <div className={styles.historyHeader}>
                  <div className={styles.historyInfo}>
                    <h3>{history.description}</h3>
                    <div className={styles.historyMeta}>
                      <span className={styles.date}>Date: {formatDate(history.date)}</span>
                      <span className={styles.totalItems}>
                        Total Items Updated: {history.totalItemUpdated}
                      </span>
                      <span className={styles.userId}>User ID: {history.userId}</span>
                      <span className={styles.historyId}>History ID: {history.historyId}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleExpand(history.historyId)}
                    className={`${styles.expandButton} ${
                      expandedItems.has(history.historyId) ? styles.expanded : ''
                    }`}
                  >
                    {expandedItems.has(history.historyId) ? 'Collapse' : 'Expand'} Details
                  </button>
                </div>

                {expandedItems.has(history.historyId) && (
                  <div className={styles.detailsSection}>
                    <h4>Updated Items Details:</h4>
                    {history.itemUpdateList && history.itemUpdateList.length > 0 ? (
                      <div className={styles.itemsList}>
                        {history.itemUpdateList.map((item) => (
                          <div key={item.itemUpdateDetailId} className={styles.itemDetail}>
                            <div className={styles.itemHeader}>
                              <h5>{item.itemDescription}</h5>
                              <div className={styles.itemCodes}>
                                <span>Barcode: {item.barcodeId}</span>
                                <span>Item Code: {item.itemCode}</span>
                              </div>
                            </div>
                            
                            <div className={styles.fieldsUpdated}>
                              <strong>Fields Updated:</strong> {item.fieldsUpdated}
                            </div>

                            <div className={styles.valuesComparison}>
                              <div className={styles.valueColumn}>
                                <h6>Previous Values:</h6>
                                <div className={styles.valueList}>
                                  {formatValues(item.previousValue).map((value, index) => (
                                    <div key={index} className={styles.valueItem}>
                                      {value}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div className={styles.valueColumn}>
                                <h6>New Values:</h6>
                                <div className={styles.valueList}>
                                  {formatValues(item.newValues).map((value, index) => (
                                    <div key={index} className={styles.valueItem}>
                                      {value}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.noDetails}>No detailed information available</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemUpdateHistory;