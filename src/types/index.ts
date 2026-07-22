// ─── Auth ───────────────────────────────────────────────────────────────────
export interface UserInfo {
  id: string; username: string; email: string; usertype: string; roles: string[];
}
export type AppPhase = "login" | "otp" | "dashboard";

// ─── Categories ─────────────────────────────────────────────────────────────
export interface Category {
  id: string; code: number; name: string; description: string | null; dateofcreation: string;
}
export interface AutocompleteItem { id: string; code: number; name: string; }

// ─── Dashboard shell ─────────────────────────────────────────────────────────
export type Page = "overview" | "categories" | "products" | "orders" | "reports" | "inventory-check" | "users" | "invoices" | "cheques" | "expenses";
export interface Expense {
  id: string; code: number; amount: number; description: string;
  createdat: string; accountantname: string;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export const ALLOWED_USER_TYPES = ["Customer", "SalesRep", "Supplier"] as const;
export type AllowedUserType = typeof ALLOWED_USER_TYPES[number];
export interface AppUser {
  id: string; usernumber: number; fullname: string; phonenumber: string;
  usertype: string; isactive: boolean; dateofcreation: string;
}

// ─── Overview ─────────────────────────────────────────────────────────────────
export type DashboardPeriod = "Today" | "ThisWeek" | "ThisMonth" | "Custom";
export interface LowStockProduct {
  productid: string; productcode: number; productname: string; currentquantity: number; sku: string;
}
export interface DashboardStats {
  totalsales: number; totalprofit: number; approvedorderscount: number;
  lowstockproducts: LowStockProduct[];
}

// ─── Products ──────────────────────────────────────────────────────────────────
export interface Product {
  productid: string; code: number; productname: string;
  saleprice: number; buyprice: number; quantity: number;
  sku: string; description: string; categoryname: string; categoryid: string;
}
export interface ProductAutocomplete { productid: string; code: number; name: string; }

// ─── Autocomplete people/suppliers ──────────────────────────────────────────────
export interface SupplierSuggestion { id: string; usernumber: number; fullname: string; }
export interface PersonSuggestion { id: string; usernumber: number; fullname: string; }

// ─── Orders ─────────────────────────────────────────────────────────────────────
export interface Order {
  id: string; code: number; totalamount: number; commissionamount: number;
  status: string; customername: string; salesrepname: string | null; dateofcreation: string;
}

// ─── Reports ─────────────────────────────────────────────────────────────────────
export type ReportTab = "sales" | "stock" | "customer" | "salesrep" | "supplier" | "consolidated";
export interface Invoice { id?: string; invoiceid?: string; invoicecode: number; originalamount: number; remainingamount: number; invoicedate: string; }

// ─── Returns ─────────────────────────────────────────────────────────────────────
export interface OrderReturnItem {
  productid: string; code: number; productname: string;
  quantity: number; unitprice: number; customerid: string;
}

// ─── Invoices ─────────────────────────────────────────────────────────────────────
export interface InvoiceListItem {
  id: string; code: number; type: number;
  recipientname: string; amount: number; paidamount: number; remainingamount: number;
  generateddate: string; orderid: string | null; ordercode: number | null; returnrequestid: string | null;
}
export interface CustomerSummaryInvoice {
  id: string; code: number; type: number; recipientname: string;
  amount: number; paidamount: number; remainingamount: number;
  generateddate: string; orderid: string | null; ordercode: number | null; returnrequestid: string | null;
}
export interface CustomerAccountSummary {
  salescount: number; salestotalamount: number; salespaidamount: number; salesremainingamount: number;
  returnscount: number; returnstotalamount: number; returnspaidamount: number; returnsremainingamount: number;
  invoices: CustomerSummaryInvoice[];
}
export interface SupplierSummaryInvoice {
  id: string; code: number; type: number; suppliername: string;
  amount: number; paidamount: number; remainingamount: number;
  generateddate: string; supplierid: string;
}
export interface SupplierAccountSummary {
  supplycount: number; supplytotalamount: number; supplypaidamount: number; supplyremainingamount: number;
  returnscount: number; returnstotalamount: number; returnspaidamount: number; returnsremainingamount: number;
  invoices: SupplierSummaryInvoice[];
}
export interface SupplierInvoiceProduct {
  productid: string; productcode: number; productname: string;
  quantity: number; buyprice: number; totalprice: number;
}
// Official invoice details (customer/{id}/details & supplier/{id}/details)
export interface InvoiceDetailItem {
  productname: string; categoryname: string;
  quantity: number; priceorcost: number; total: number;
}
export interface InvoiceDetails {
  code: number; recipientorsuppliername: string; invoicetype: number;
  dateofcreation: string; items: InvoiceDetailItem[];
  totalamount: number; paidamount: number; remainingamount: number;
}

// ─── Cheques ──────────────────────────────────────────────────────────────────────
export interface Cheque {
  id: string; code: number; checknumber: string; amount: number;
  duedate: string; bankname: string; isincoming: boolean;
  status: string; relatedname: string; notes: string;
  issuedate: string; invoiceid: string | null; supplierinvoiceid: string | null;
}

// ─── Inventory Check ─────────────────────────────────────────────────────────────
export interface AdjustResult {
  statusCode: number;
  message: string;
  systemquantity: number;
  newquantity: number | null;
  adjustmentid: string | null;
  financialimpact: string;
  valuedifference: number;
}
