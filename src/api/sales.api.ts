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
}
