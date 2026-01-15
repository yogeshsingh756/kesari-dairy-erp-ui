import axios from './axios';
const auth = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export interface Customer {
  id: number;
  name: string;
  mobile: string;
  address?: string;
}

export interface ProductForEmployee {
  id: number;
  name: string;
}

export interface EmployeeStock {
  productTypeId: number;
  productName: string;
  quantityAvailable: number;
}

export interface SaleRequest {
  customerId?: number; // For existing customers
  // New customer details (alternative to customerId)
  createNewCustomer?: boolean; // Flag to indicate new customer creation
  customerName?: string;
  customerMobile?: string;
  customerAddress?: string;
  // Sale details
  productTypeId: number;
  quantity: number;
  sellingPricePerUnit: number;
  discountAmount: number;
  paymentMode: string;
  paidAmount: number;
  saleDate: string;
}

export interface CreateCustomerRequest {
  fullName: string;
  mobileNumber: string;
  address?: string;
}

// Get customers for sales
export const getCustomers = async () => {
  const response = await axios.get('/customers', auth());
  return { data: response.data };
};


// Get products available for employee sales
export const getProductsForEmployee = async () => {
  const response = await axios.get('/product-types/employeeWiseDropdown', auth());
  return { data: response.data };
};

// Get employee stock for all products
export const getEmployeeStock = async () => {
  const response = await axios.get('/employee-stock', auth());
  return { data: response.data };
};

// Create sale
export const createSale = async (request: SaleRequest) => {
  const response = await axios.post('/sales', request, auth());
  return response.data;
};

// Get sales with filters and pagination
export const getSales = async (
  pageNumber: number = 1,
  pageSize: number = 10,
  employeeId?: number,
  fromDate?: string,
  toDate?: string
) => {
  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  if (employeeId) params.append('employeeId', employeeId.toString());
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);

  const response = await axios.get(`/sales?${params.toString()}`, auth());
  return response.data;
};

export interface SalesRecord {
  saleId: number;
  saleDate: string;
  employeeName: string;
  customerName: string;
  productName: string;
  sellingPricePerUnit: number;
  quantity: number;
  netAmount: number;
  paidAmount: number;
  balanceAmount: number;
  discountAmount: number;
}

export interface SalesResponse {
  items: SalesRecord[];
  totalRecords: number;
};

// Customer Ledger View interfaces
export interface CustomerLedgerRecord {
  customerId: number;
  customerName: string;
  mobile: string;
  totalSales: number;
  totalPaid: number;
  outstandingAmount: number;
  lastTransactionDate: string;
}

export interface CustomerLedgerResponse {
  items: CustomerLedgerRecord[];
  totalRecords: number;
}

// Get customer outstanding amounts with pagination and optional customer filter
export const getCustomerOutstanding = async (
  pageNumber: number = 1,
  pageSize: number = 10,
  customerId?: number
) => {
  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  if (customerId) params.append('customerId', customerId.toString());

  const response = await axios.get(`/customers/customer-outstanding?${params.toString()}`, auth());
  return response.data;
};

// Customer Ledger Detail interfaces
export interface CustomerLedgerDetail {
  entryDate: string;
  referenceType: string;
  referenceId: number;
  debitAmount: number;
  creditAmount: number;
  balanceAfter: number;
}

export interface CustomerLedgerDetailResponse {
  items: CustomerLedgerDetail[];
  totalRecords: number;
}

// Get customer ledger details with pagination
export const getCustomerLedgerDetails = async (
  customerId: number,
  pageNumber: number = 1,
  pageSize: number = 10
) => {
  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  const response = await axios.get(`/customers/${customerId}/ledger?${params.toString()}`, auth());
  return response.data;
};

// Payment collection interface
export interface CollectPaymentRequest {
  customerId: number;
  amountPaid: number;
  paymentMode: string;
  paymentDate: string;
  remarks: string;
}

// Collect payment from customer
export const collectPayment = async (request: CollectPaymentRequest) => {
  const response = await axios.post('/sales/collect', request, auth());
  return response.data;
};
