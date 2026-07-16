export type InvoiceStatus = "DRAFT" | "SENT" | "PARTIAL" | "PAID" | "OVERDUE" | "CANCELLED";
export type PaymentMethod = "CASH" | "MOBILE_MONEY" | "BANK_TRANSFER" | "CARD" | "OTHER";
export type Currency = "MGA" | "EUR" | "USD";

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  reference: string | null;
  paidAt: string;
}

export interface InvoiceTotals {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  balance: number;
}

export interface Invoice {
  id: string;
  reference: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string | null;
  currency: Currency;
  taxRate: number;
  notes: string | null;
  signatureDataUrl: string | null;
  signedBy: string | null;
  signedAt: string | null;
  client: { id: string; name: string; segment: string };
  project: { id: string; reference: string; title: string } | null;
  items: InvoiceItem[];
  payments: Payment[];
  totals: InvoiceTotals;
}

export interface InvoiceListResponse {
  items: Invoice[];
  total: number;
  page: number;
  pageSize: number;
}

export interface BillingSummary {
  count: number;
  invoiced: number;
  paid: number;
  outstanding: number;
  overdue: number;
}

export interface CreateInvoiceValue {
  clientId: string;
  projectId?: string | null;
  currency: Currency;
  taxRate: number;
  dueDate?: string | null;
  notes?: string | null;
  items: InvoiceItem[];
}

export interface AddPaymentValue {
  amount: number;
  method: PaymentMethod;
  reference?: string | null;
  paidAt?: string;
}

export const INVOICE_STATUSES: InvoiceStatus[] = [
  "DRAFT",
  "SENT",
  "PARTIAL",
  "PAID",
  "OVERDUE",
  "CANCELLED",
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  "MOBILE_MONEY",
  "CASH",
  "BANK_TRANSFER",
  "CARD",
  "OTHER",
];
