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
