import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  numeric,
  timestamp,
  uniqueIndex,
  index,
  jsonb,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─────────────────────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────────────────────

export const finUserRoleEnum = pgEnum("fin_user_role", [
  "owner",
  "admin",
  "accountant",
  "finance_manager",
  "bookkeeper",
  "viewer",
]);

export const accountTypeEnum = pgEnum("fin_account_type", [
  "asset",
  "liability",
  "equity",
  "revenue",
  "expense",
]);

export const accountSubtypeEnum = pgEnum("fin_account_subtype", [
  "current_asset",
  "fixed_asset",
  "current_liability",
  "long_term_liability",
  "owners_equity",
  "retained_earnings",
  "operating_revenue",
  "other_revenue",
  "cost_of_goods_sold",
  "operating_expense",
  "other_expense",
]);

export const transactionTypeEnum = pgEnum("fin_transaction_type", [
  "income",
  "expense",
  "transfer",
  "adjustment",
  "opening_balance",
]);

export const transactionStatusEnum = pgEnum("fin_transaction_status", [
  "draft",
  "posted",
  "voided",
  "reconciled",
]);

export const invoiceStatusEnum = pgEnum("fin_invoice_status", [
  "draft",
  "sent",
  "partially_paid",
  "paid",
  "overdue",
  "voided",
  "cancelled",
]);

export const paymentStatusEnum = pgEnum("fin_payment_status", [
  "pending",
  "completed",
  "failed",
  "refunded",
]);

export const paymentMethodEnum = pgEnum("fin_payment_method", [
  "cash",
  "eft",
  "card",
  "cheque",
  "other",
]);

export const billStatusEnum = pgEnum("fin_bill_status", [
  "draft",
  "received",
  "partially_paid",
  "paid",
  "overdue",
  "voided",
]);

export const budgetPeriodEnum = pgEnum("fin_budget_period", [
  "monthly",
  "quarterly",
  "annual",
]);

export const complianceStatusEnum = pgEnum("fin_compliance_status", [
  "compliant",
  "pending",
  "overdue",
  "not_applicable",
]);

export const auditActionEnum = pgEnum("fin_audit_action", [
  "create",
  "update",
  "delete",
  "void",
  "approve",
  "post",
  "payment",
]);

// ─────────────────────────────────────────────────────────────────────────────
// Core: multi-tenant root
// ─────────────────────────────────────────────────────────────────────────────

export const organizations = pgTable(
  "fin_organizations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    owner_id: text("owner_id").notNull(),
    logo_url: text("logo_url"),
    currency: text("currency").notNull().default("ZAR"),
    timezone: text("timezone").notNull().default("Africa/Johannesburg"),
    financial_year_start: integer("financial_year_start").notNull().default(3),
    phone: text("phone"),
    email: text("email"),
    address: text("address"),
    tax_number: text("tax_number"),
    registration_number: text("registration_number"),
    vat_registered: boolean("vat_registered").notNull().default(false),
    vat_number: text("vat_number"),
    vat_rate: numeric("vat_rate", { precision: 5, scale: 4 }).default("0.15"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("fin_organizations_slug_idx").on(t.slug)]
);

export const users = pgTable(
  "fin_users",
  {
    id: text("id").primaryKey(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    full_name: text("full_name"),
    role: finUserRoleEnum("role").notNull().default("owner"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("fin_users_org_idx").on(t.organization_id),
    uniqueIndex("fin_users_email_org_idx").on(t.email, t.organization_id),
  ]
);

// ─────────────────────────────────────────────────────────────────────────────
// Chart of Accounts
// ─────────────────────────────────────────────────────────────────────────────

export const chartOfAccounts = pgTable(
  "fin_chart_of_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    type: accountTypeEnum("type").notNull(),
    subtype: accountSubtypeEnum("subtype"),
    parent_id: uuid("parent_id"),
    is_system: boolean("is_system").notNull().default(false),
    is_active: boolean("is_active").notNull().default(true),
    balance: numeric("balance", { precision: 15, scale: 2 }).notNull().default("0"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("fin_coa_org_idx").on(t.organization_id),
    uniqueIndex("fin_coa_code_org_idx").on(t.code, t.organization_id),
  ]
);

// ─────────────────────────────────────────────────────────────────────────────
// Financial Periods
// ─────────────────────────────────────────────────────────────────────────────

export const financialPeriods = pgTable(
  "fin_financial_periods",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    start_date: date("start_date").notNull(),
    end_date: date("end_date").notNull(),
    is_closed: boolean("is_closed").notNull().default(false),
    closed_at: timestamp("closed_at", { withTimezone: true }),
    closed_by: text("closed_by"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("fin_periods_org_idx").on(t.organization_id)]
);

// ─────────────────────────────────────────────────────────────────────────────
// Accounts (Bank/Cash accounts)
// ─────────────────────────────────────────────────────────────────────────────

export const accounts = pgTable(
  "fin_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    chart_account_id: uuid("chart_account_id").references(() => chartOfAccounts.id),
    name: text("name").notNull(),
    description: text("description"),
    account_number: text("account_number"),
    bank_name: text("bank_name"),
    branch_code: text("branch_code"),
    currency: text("currency").notNull().default("ZAR"),
    opening_balance: numeric("opening_balance", { precision: 15, scale: 2 }).notNull().default("0"),
    current_balance: numeric("current_balance", { precision: 15, scale: 2 }).notNull().default("0"),
    is_active: boolean("is_active").notNull().default(true),
    is_default: boolean("is_default").notNull().default(false),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("fin_accounts_org_idx").on(t.organization_id)]
);

// ─────────────────────────────────────────────────────────────────────────────
// Expense Categories
// ─────────────────────────────────────────────────────────────────────────────

export const expenseCategories = pgTable(
  "fin_expense_categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    color: text("color").default("#f59e0b"),
    chart_account_id: uuid("chart_account_id").references(() => chartOfAccounts.id),
    is_active: boolean("is_active").notNull().default(true),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("fin_expense_cats_org_idx").on(t.organization_id)]
);

// ─────────────────────────────────────────────────────────────────────────────
// Vendors (Payables)
// ─────────────────────────────────────────────────────────────────────────────

export const vendors = pgTable(
  "fin_vendors",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    contact_name: text("contact_name"),
    email: text("email"),
    phone: text("phone"),
    address: text("address"),
    tax_number: text("tax_number"),
    payment_terms: integer("payment_terms").default(30),
    notes: text("notes"),
    is_active: boolean("is_active").notNull().default(true),
    total_outstanding: numeric("total_outstanding", { precision: 15, scale: 2 }).notNull().default("0"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("fin_vendors_org_idx").on(t.organization_id)]
);

// ─────────────────────────────────────────────────────────────────────────────
// Customers (Receivables)
// ─────────────────────────────────────────────────────────────────────────────

export const customers = pgTable(
  "fin_customers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    contact_name: text("contact_name"),
    email: text("email"),
    phone: text("phone"),
    address: text("address"),
    tax_number: text("tax_number"),
    credit_limit: numeric("credit_limit", { precision: 15, scale: 2 }),
    payment_terms: integer("payment_terms").default(30),
    notes: text("notes"),
    is_active: boolean("is_active").notNull().default(true),
    total_outstanding: numeric("total_outstanding", { precision: 15, scale: 2 }).notNull().default("0"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("fin_customers_org_idx").on(t.organization_id)]
);

// ─────────────────────────────────────────────────────────────────────────────
// Expenses
// ─────────────────────────────────────────────────────────────────────────────

export const expenses = pgTable(
  "fin_expenses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    category_id: uuid("category_id").references(() => expenseCategories.id),
    vendor_id: uuid("vendor_id").references(() => vendors.id),
    account_id: uuid("account_id").references(() => accounts.id),
    reference: text("reference"),
    description: text("description").notNull(),
    amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
    tax_amount: numeric("tax_amount", { precision: 15, scale: 2 }).notNull().default("0"),
    total_amount: numeric("total_amount", { precision: 15, scale: 2 }).notNull(),
    expense_date: date("expense_date").notNull(),
    notes: text("notes"),
    attachment_url: text("attachment_url"),
    is_billable: boolean("is_billable").notNull().default(false),
    created_by: text("created_by").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("fin_expenses_org_idx").on(t.organization_id),
    index("fin_expenses_date_idx").on(t.expense_date),
    index("fin_expenses_category_idx").on(t.category_id),
  ]
);

// ─────────────────────────────────────────────────────────────────────────────
// Invoices
// ─────────────────────────────────────────────────────────────────────────────

export const invoices = pgTable(
  "fin_invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    customer_id: uuid("customer_id").references(() => customers.id),
    invoice_number: text("invoice_number").notNull(),
    reference: text("reference"),
    status: invoiceStatusEnum("status").notNull().default("draft"),
    issue_date: date("issue_date").notNull(),
    due_date: date("due_date").notNull(),
    subtotal: numeric("subtotal", { precision: 15, scale: 2 }).notNull().default("0"),
    tax_amount: numeric("tax_amount", { precision: 15, scale: 2 }).notNull().default("0"),
    discount_amount: numeric("discount_amount", { precision: 15, scale: 2 }).notNull().default("0"),
    total_amount: numeric("total_amount", { precision: 15, scale: 2 }).notNull().default("0"),
    amount_paid: numeric("amount_paid", { precision: 15, scale: 2 }).notNull().default("0"),
    amount_due: numeric("amount_due", { precision: 15, scale: 2 }).notNull().default("0"),
    currency: text("currency").notNull().default("ZAR"),
    notes: text("notes"),
    terms: text("terms"),
    source: text("source").default("novafinance"),
    pdf_url: text("pdf_url"),
    sent_at: timestamp("sent_at", { withTimezone: true }),
    created_by: text("created_by").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("fin_invoices_org_idx").on(t.organization_id),
    index("fin_invoices_customer_idx").on(t.customer_id),
    index("fin_invoices_status_idx").on(t.status),
    index("fin_invoices_due_date_idx").on(t.due_date),
    uniqueIndex("fin_invoices_number_org_idx").on(t.invoice_number, t.organization_id),
  ]
);

export const invoiceItems = pgTable(
  "fin_invoice_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    invoice_id: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    quantity: numeric("quantity", { precision: 10, scale: 3 }).notNull().default("1"),
    unit_price: numeric("unit_price", { precision: 15, scale: 2 }).notNull(),
    tax_rate: numeric("tax_rate", { precision: 5, scale: 4 }).default("0"),
    tax_amount: numeric("tax_amount", { precision: 15, scale: 2 }).notNull().default("0"),
    discount_percent: numeric("discount_percent", { precision: 5, scale: 2 }).default("0"),
    total: numeric("total", { precision: 15, scale: 2 }).notNull(),
    chart_account_id: uuid("chart_account_id").references(() => chartOfAccounts.id),
    sort_order: integer("sort_order").notNull().default(0),
  },
  (t) => [index("fin_invoice_items_invoice_idx").on(t.invoice_id)]
);

// ─────────────────────────────────────────────────────────────────────────────
// Payables (Bills from vendors)
// ─────────────────────────────────────────────────────────────────────────────

export const payables = pgTable(
  "fin_payables",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    vendor_id: uuid("vendor_id").references(() => vendors.id),
    bill_number: text("bill_number"),
    reference: text("reference"),
    status: billStatusEnum("status").notNull().default("draft"),
    issue_date: date("issue_date").notNull(),
    due_date: date("due_date").notNull(),
    subtotal: numeric("subtotal", { precision: 15, scale: 2 }).notNull().default("0"),
    tax_amount: numeric("tax_amount", { precision: 15, scale: 2 }).notNull().default("0"),
    total_amount: numeric("total_amount", { precision: 15, scale: 2 }).notNull().default("0"),
    amount_paid: numeric("amount_paid", { precision: 15, scale: 2 }).notNull().default("0"),
    amount_due: numeric("amount_due", { precision: 15, scale: 2 }).notNull().default("0"),
    notes: text("notes"),
    attachment_url: text("attachment_url"),
    created_by: text("created_by").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("fin_payables_org_idx").on(t.organization_id),
    index("fin_payables_vendor_idx").on(t.vendor_id),
    index("fin_payables_due_date_idx").on(t.due_date),
    index("fin_payables_status_idx").on(t.status),
  ]
);

// ─────────────────────────────────────────────────────────────────────────────
// Payments
// ─────────────────────────────────────────────────────────────────────────────

export const payments = pgTable(
  "fin_payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    invoice_id: uuid("invoice_id").references(() => invoices.id),
    payable_id: uuid("payable_id").references(() => payables.id),
    account_id: uuid("account_id").references(() => accounts.id),
    reference: text("reference"),
    amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
    method: paymentMethodEnum("method").notNull().default("eft"),
    status: paymentStatusEnum("status").notNull().default("completed"),
    payment_date: date("payment_date").notNull(),
    notes: text("notes"),
    created_by: text("created_by").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("fin_payments_org_idx").on(t.organization_id),
    index("fin_payments_invoice_idx").on(t.invoice_id),
    index("fin_payments_payable_idx").on(t.payable_id),
    index("fin_payments_date_idx").on(t.payment_date),
  ]
);

// ─────────────────────────────────────────────────────────────────────────────
// Transactions (General ledger entries)
// ─────────────────────────────────────────────────────────────────────────────

export const transactions = pgTable(
  "fin_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    account_id: uuid("account_id").references(() => accounts.id),
    period_id: uuid("period_id").references(() => financialPeriods.id),
    reference: text("reference"),
    description: text("description").notNull(),
    type: transactionTypeEnum("type").notNull(),
    status: transactionStatusEnum("status").notNull().default("draft"),
    amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("ZAR"),
    transaction_date: date("transaction_date").notNull(),
    posted_at: timestamp("posted_at", { withTimezone: true }),
    invoice_id: uuid("invoice_id").references(() => invoices.id),
    expense_id: uuid("expense_id").references(() => expenses.id),
    payable_id: uuid("payable_id").references(() => payables.id),
    payment_id: uuid("payment_id").references(() => payments.id),
    notes: text("notes"),
    created_by: text("created_by").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("fin_transactions_org_idx").on(t.organization_id),
    index("fin_transactions_account_idx").on(t.account_id),
    index("fin_transactions_date_idx").on(t.transaction_date),
    index("fin_transactions_type_idx").on(t.type),
    index("fin_transactions_status_idx").on(t.status),
  ]
);

// ─────────────────────────────────────────────────────────────────────────────
// Journal Entries (Double-entry bookkeeping)
// ─────────────────────────────────────────────────────────────────────────────

export const journalEntries = pgTable(
  "fin_journal_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    transaction_id: uuid("transaction_id").references(() => transactions.id, { onDelete: "cascade" }),
    entry_number: text("entry_number").notNull(),
    description: text("description").notNull(),
    entry_date: date("entry_date").notNull(),
    is_posted: boolean("is_posted").notNull().default(false),
    posted_at: timestamp("posted_at", { withTimezone: true }),
    reference: text("reference"),
    created_by: text("created_by").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("fin_je_org_idx").on(t.organization_id),
    index("fin_je_date_idx").on(t.entry_date),
  ]
);

export const journalLines = pgTable(
  "fin_journal_lines",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    journal_entry_id: uuid("journal_entry_id")
      .notNull()
      .references(() => journalEntries.id, { onDelete: "cascade" }),
    account_id: uuid("account_id")
      .notNull()
      .references(() => chartOfAccounts.id),
    description: text("description"),
    debit: numeric("debit", { precision: 15, scale: 2 }).notNull().default("0"),
    credit: numeric("credit", { precision: 15, scale: 2 }).notNull().default("0"),
    sort_order: integer("sort_order").notNull().default(0),
  },
  (t) => [index("fin_jl_entry_idx").on(t.journal_entry_id)]
);

// ─────────────────────────────────────────────────────────────────────────────
// Budgets
// ─────────────────────────────────────────────────────────────────────────────

export const budgets = pgTable(
  "fin_budgets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    period: budgetPeriodEnum("period").notNull().default("annual"),
    fiscal_year: integer("fiscal_year").notNull(),
    start_date: date("start_date").notNull(),
    end_date: date("end_date").notNull(),
    total_revenue: numeric("total_revenue", { precision: 15, scale: 2 }).notNull().default("0"),
    total_expenses: numeric("total_expenses", { precision: 15, scale: 2 }).notNull().default("0"),
    is_active: boolean("is_active").notNull().default(true),
    created_by: text("created_by").notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("fin_budgets_org_idx").on(t.organization_id)]
);

export const budgetLines = pgTable(
  "fin_budget_lines",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    budget_id: uuid("budget_id")
      .notNull()
      .references(() => budgets.id, { onDelete: "cascade" }),
    chart_account_id: uuid("chart_account_id")
      .notNull()
      .references(() => chartOfAccounts.id),
    month: integer("month").notNull(),
    year: integer("year").notNull(),
    budgeted_amount: numeric("budgeted_amount", { precision: 15, scale: 2 }).notNull().default("0"),
    actual_amount: numeric("actual_amount", { precision: 15, scale: 2 }).notNull().default("0"),
    variance: numeric("variance", { precision: 15, scale: 2 }).notNull().default("0"),
  },
  (t) => [index("fin_budget_lines_budget_idx").on(t.budget_id)]
);

// ─────────────────────────────────────────────────────────────────────────────
// Cash Flow Forecasts
// ─────────────────────────────────────────────────────────────────────────────

export const cashflowForecasts = pgTable(
  "fin_cashflow_forecasts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    forecast_month: integer("forecast_month").notNull(),
    forecast_year: integer("forecast_year").notNull(),
    opening_balance: numeric("opening_balance", { precision: 15, scale: 2 }).notNull().default("0"),
    projected_inflows: numeric("projected_inflows", { precision: 15, scale: 2 }).notNull().default("0"),
    projected_outflows: numeric("projected_outflows", { precision: 15, scale: 2 }).notNull().default("0"),
    projected_closing: numeric("projected_closing", { precision: 15, scale: 2 }).notNull().default("0"),
    actual_inflows: numeric("actual_inflows", { precision: 15, scale: 2 }).notNull().default("0"),
    actual_outflows: numeric("actual_outflows", { precision: 15, scale: 2 }).notNull().default("0"),
    actual_closing: numeric("actual_closing", { precision: 15, scale: 2 }).notNull().default("0"),
    notes: text("notes"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("fin_cashflow_org_idx").on(t.organization_id),
    uniqueIndex("fin_cashflow_month_org_idx").on(t.organization_id, t.forecast_year, t.forecast_month),
  ]
);

// ─────────────────────────────────────────────────────────────────────────────
// Tax Records
// ─────────────────────────────────────────────────────────────────────────────

export const taxRecords = pgTable(
  "fin_tax_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    tax_type: text("tax_type").notNull(),
    period_start: date("period_start").notNull(),
    period_end: date("period_end").notNull(),
    due_date: date("due_date").notNull(),
    taxable_amount: numeric("taxable_amount", { precision: 15, scale: 2 }).notNull().default("0"),
    tax_amount: numeric("tax_amount", { precision: 15, scale: 2 }).notNull().default("0"),
    status: complianceStatusEnum("status").notNull().default("pending"),
    reference: text("reference"),
    notes: text("notes"),
    submitted_at: timestamp("submitted_at", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("fin_tax_records_org_idx").on(t.organization_id),
    index("fin_tax_records_type_idx").on(t.tax_type),
  ]
);

// ─────────────────────────────────────────────────────────────────────────────
// Compliance Records
// ─────────────────────────────────────────────────────────────────────────────

export const complianceRecords = pgTable(
  "fin_compliance_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    category: text("category").notNull(),
    due_date: date("due_date"),
    status: complianceStatusEnum("status").notNull().default("pending"),
    description: text("description"),
    notes: text("notes"),
    completed_at: timestamp("completed_at", { withTimezone: true }),
    completed_by: text("completed_by"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("fin_compliance_org_idx").on(t.organization_id)]
);

// ─────────────────────────────────────────────────────────────────────────────
// Audit Logs
// ─────────────────────────────────────────────────────────────────────────────

export const auditLogs = pgTable(
  "fin_audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    user_id: text("user_id").notNull(),
    action: auditActionEnum("action").notNull(),
    entity_type: text("entity_type").notNull(),
    entity_id: uuid("entity_id"),
    description: text("description").notNull(),
    before_data: jsonb("before_data"),
    after_data: jsonb("after_data"),
    ip_address: text("ip_address"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("fin_audit_org_idx").on(t.organization_id),
    index("fin_audit_entity_idx").on(t.entity_type, t.entity_id),
    index("fin_audit_user_idx").on(t.user_id),
    index("fin_audit_created_idx").on(t.created_at),
  ]
);

// ─────────────────────────────────────────────────────────────────────────────
// Settings
// ─────────────────────────────────────────────────────────────────────────────

export const settings = pgTable(
  "fin_settings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .unique()
      .references(() => organizations.id, { onDelete: "cascade" }),
    invoice_prefix: text("invoice_prefix").notNull().default("INV"),
    next_invoice_number: integer("next_invoice_number").notNull().default(1001),
    default_payment_terms: integer("default_payment_terms").notNull().default(30),
    default_tax_rate: numeric("default_tax_rate", { precision: 5, scale: 4 }).notNull().default("0.15"),
    invoice_notes: text("invoice_notes"),
    invoice_terms: text("invoice_terms"),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Relations
// ─────────────────────────────────────────────────────────────────────────────

export const organizationsRelations = relations(organizations, ({ many, one }) => ({
  users: many(users),
  accounts: many(accounts),
  chartOfAccounts: many(chartOfAccounts),
  invoices: many(invoices),
  expenses: many(expenses),
  payables: many(payables),
  payments: many(payments),
  transactions: many(transactions),
  budgets: many(budgets),
  cashflowForecasts: many(cashflowForecasts),
  taxRecords: many(taxRecords),
  complianceRecords: many(complianceRecords),
  auditLogs: many(auditLogs),
  settings: one(settings),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  organization: one(organizations, { fields: [invoices.organization_id], references: [organizations.id] }),
  customer: one(customers, { fields: [invoices.customer_id], references: [customers.id] }),
  items: many(invoiceItems),
  payments: many(payments),
  transactions: many(transactions),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  organization: one(organizations, { fields: [expenses.organization_id], references: [organizations.id] }),
  category: one(expenseCategories, { fields: [expenses.category_id], references: [expenseCategories.id] }),
  vendor: one(vendors, { fields: [expenses.vendor_id], references: [vendors.id] }),
  account: one(accounts, { fields: [expenses.account_id], references: [accounts.id] }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  organization: one(organizations, { fields: [transactions.organization_id], references: [organizations.id] }),
  account: one(accounts, { fields: [transactions.account_id], references: [accounts.id] }),
  invoice: one(invoices, { fields: [transactions.invoice_id], references: [invoices.id] }),
  expense: one(expenses, { fields: [transactions.expense_id], references: [expenses.id] }),
  payable: one(payables, { fields: [transactions.payable_id], references: [payables.id] }),
}));
