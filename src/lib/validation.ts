import { z } from "zod";

export const createAccountSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  type: z.enum(["asset", "liability", "equity", "revenue", "expense"]),
  subtype: z.string().optional(),
  code: z.string().optional(),
  description: z.string().optional(),
  currency: z.string().default("ZAR"),
});

export const createTransactionSchema = z.object({
  date: z.string().min(1, "Date is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["income", "expense", "transfer", "adjustment"]),
  amount: z.coerce.number().positive("Amount must be positive"),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export const createInvoiceSchema = z.object({
  customer_id: z.string().min(1, "Customer is required"),
  invoice_number: z.string().min(1, "Invoice number is required"),
  issue_date: z.string().min(1, "Issue date is required"),
  due_date: z.string().min(1, "Due date is required"),
  notes: z.string().optional(),
  terms: z.string().optional(),
  tax_rate: z.coerce.number().min(0).max(100).default(15),
});

export const createExpenseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  date: z.string().min(1, "Date is required"),
  category_id: z.string().optional(),
  vendor_id: z.string().optional(),
  notes: z.string().optional(),
  is_tax_deductible: z.coerce.boolean().default(false),
});

export const createCustomerSchema = z.object({
  name: z.string().min(1, "Customer name is required"),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  tax_number: z.string().optional(),
  payment_terms: z.coerce.number().min(0).default(30),
  credit_limit: z.coerce.number().min(0).optional(),
});

export const createVendorSchema = z.object({
  name: z.string().min(1, "Vendor name is required"),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  tax_number: z.string().optional(),
  payment_terms: z.coerce.number().min(0).default(30),
});

export const createPayableSchema = z.object({
  vendor_id: z.string().min(1, "Vendor is required"),
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  due_date: z.string().min(1, "Due date is required"),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
});

export const createBudgetSchema = z.object({
  name: z.string().min(1, "Budget name is required"),
  period: z.enum(["monthly", "quarterly", "annual"]),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  notes: z.string().optional(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type CreateVendorInput = z.infer<typeof createVendorSchema>;
export type CreatePayableInput = z.infer<typeof createPayableSchema>;
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
