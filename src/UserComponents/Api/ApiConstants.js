export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


export const USER_LOGIN_URL = `${API_BASE_URL}/user/login`;

// Retail Bill URL
export const NEW_BILL_GENERATE_URL = `${API_BASE_URL}/user/billRequest`;
export const BILL_FETCH_URL = `${API_BASE_URL}/user/getBill`;
export const ITEM_RETURN_URL = `${API_BASE_URL}/user/return_stock/bill`;
export const DEFECT_ITEM_RETURN= `${API_BASE_URL}/user/stock/defect`;
export const DELETE_BILL_URL= `${API_BASE_URL}/user/cancelBill`;


// Invoice
export const CUSTOMER_BILL_DETAILED_INVOICE = `${API_BASE_URL}/invoice/getBill`;



// Store URL
export const FETCH_STORES_URL = `${API_BASE_URL}/store/getAllStores`;
export const FETCH_STORE_USER_URL= `${API_BASE_URL}/user/getUserByStore`;

// Transaction Daily Cash
export const CREATE_TRANSACTION_URL = `${API_BASE_URL}/user/daily/create`;
