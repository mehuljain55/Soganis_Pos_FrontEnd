export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


export const USER_LOGIN_URL = `${API_BASE_URL}/user/login`;

// Retail Bill URL
export const NEW_BILL_GENERATE_URL = `${API_BASE_URL}/user/billRequest`;
export const BILL_FETCH_URL = `${API_BASE_URL}/user/getBill`;
export const ITEM_RETURN_URL = `${API_BASE_URL}/user/return_stock/bill`;
export const DEFECT_ITEM_RETURN= `${API_BASE_URL}/user/stock/defect`;
export const DELETE_BILL_URL= `${API_BASE_URL}/user/cancelBill`;


// Invoice
export const CUSTOMER_DETAILED_INVOICE = `${API_BASE_URL}/invoice/getBill`;
export const INVOICE_LIST_BY_DATE = `${API_BASE_URL}/invoice/getBillByDate`;


// Store URL
export const FETCH_STORES_URL = `${API_BASE_URL}/store/getAllStores`;
export const FETCH_STORE_USER_URL= `${API_BASE_URL}/user/getUserByStore`;

// Transaction Daily Cash
export const CREATE_TRANSACTION_URL = `${API_BASE_URL}/user/daily/create`;
export const FETCH_CASH_BALANCE_URL = `${API_BASE_URL}/user/daily/balance`;


// Custom Cloth 
export const CUSTOM_CLOTH_PANA_SIZE = `${API_BASE_URL}/user/item/cloth/distinctPanaSize`;
export const FIND_CLOTH = `${API_BASE_URL}/user/item/cloth/findCloth`;

export const FIND_TRANSACTION_BILL_NO = `${API_BASE_URL}/user/transaction/findTransactionByBillNo`;
export const UPDATE_TRANSACTION_BILL_NO = `${API_BASE_URL}/user/transaction/updateBillTransaction`;

export const FETCH_TRANSACTION_BY_DATE_URL = `${API_BASE_URL}/user/transaction/viewTransactionList`;