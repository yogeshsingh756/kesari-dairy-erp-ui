import axios from './axios';
const auth = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export interface AssignProductToEmployeeRequest {
  employeeId: number;
  productTypeId: number;
  quantity: number;
  sellingPricePerUnit: number;
  totalAmount: number;
  assignmentDate: string;
  remarks?: string;
}

export interface EmployeeStockAssignment {
  employeeId: number;
  employeeName: string;
  productTypeId: number;
  productName: string;
  totalQuantityAssigned: number;
  lastAssignedDate: string;
  lastAssignmentId: number;
}

export interface EmployeeStockAssignmentDetail {
  assignmentDate: string;
  quantityAssigned: number;
  sellingPricePerUnit: number;
  totalAmount: number;
  remarks: string;
  assignmentType: string;
}

export interface FinishedProductStock {
  productTypeId: number;
  productName: string;
  variant: string;
  unit: string;
  quantityAvailable: number;
  isPackaged: boolean;
}

export interface Employee {
  id: number;
  fullName: string;
  username: string;
  mobileNumber: string | null;
  email: string;
  role: string;
  isActive: boolean;
}

export interface ClawbackStockRequest {
  employeeId: number;
  productTypeId: number;
  quantity: number;
  clawbackDate: string;
  remarks?: string;
}

// Assign product to employee
export const assignProductToEmployee = async (request: AssignProductToEmployeeRequest) => {
  const response = await axios.post('/employee-stock/assign', request, auth());
  return response.data;
};

// Get assignment list/history
export const getEmployeeStockAssignments = async (
  pageNumber = 1,
  pageSize = 10,
  employeeId?: number,
  fromDate?: string,
  toDate?: string
) => {
  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  if (employeeId) {
    params.append('employeeId', employeeId.toString());
  }

  if (fromDate) {
    params.append('fromDate', fromDate);
  }

  if (toDate) {
    params.append('toDate', toDate);
  }

  const response = await axios.get(`/employee-stock/assignments?${params}`,auth());
  // Return in consistent format with data property
  return { data: response.data };
};

// Get assignment details for specific employee and product
export const getEmployeeStockAssignmentDetails = async (
  employeeId: number,
  productTypeId: number,
  pageNumber = 1,
  pageSize = 10
) => {
  const params = new URLSearchParams({
    employeeId: employeeId.toString(),
    productTypeId: productTypeId.toString(),
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });

  const response = await axios.get(`/employee-stock/assignments/details?${params}`, auth());
  // Return in consistent format with data property
  return { data: response.data };
};

// Get finished product stock for assignment
export const getFinishedProductStock = async () => {
  const response = await axios.get('/inventory/finished-product-stock', auth());
  // Handle both wrapped and direct array responses
  const data = response.data;
  return Array.isArray(data) ? { data } : response;
};

// Get employees for assignment
export const getEmployeesForAssignment = async () => {
  const response = await axios.get('/users/byRoleName?roleName=Employee',auth());
  return response.data;
};

// Clawback stock from employee
export const clawbackStock = async (request: ClawbackStockRequest) => {
  const response = await axios.post('/employee-stock/clawback', request, auth());
  return response.data;
};
