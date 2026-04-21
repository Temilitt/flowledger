export const TRANSACTION_CATEGORIES = {
  INCOME: [
    "Salary",
    "Freelance",
    "Business",
    "Investment",
    "Rental",
    "Gift",
    "Refund",
    "Other Income",
  ],
  EXPENSE: [
    "Housing",
    "Transportation",
    "Food & Dining",
    "Utilities",
    "Healthcare",
    "Entertainment",
    "Shopping",
    "Education",
    "Travel",
    "Insurance",
    "Savings",
    "Other Expense",
  ],
};

export const ALL_CATEGORIES = [
  ...TRANSACTION_CATEGORIES.INCOME,
  ...TRANSACTION_CATEGORIES.EXPENSE,
];

export const CURRENCY_OPTIONS = [
  { label: "US Dollar (USD)", value: "USD", symbol: "$" },
  { label: "Euro (EUR)", value: "EUR", symbol: "€" },
  { label: "British Pound (GBP)", value: "GBP", symbol: "£" },
  { label: "Nigerian Naira (NGN)", value: "NGN", symbol: "₦" },
  { label: "Canadian Dollar (CAD)", value: "CAD", symbol: "CA$" },
  { label: "Australian Dollar (AUD)", value: "AUD", symbol: "A$" },
  { label: "Japanese Yen (JPY)", value: "JPY", symbol: "¥" },
  { label: "South African Rand (ZAR)", value: "ZAR", symbol: "R" },
];

export const INVOICE_STATUS = {
  PENDING: "PENDING",
  PAID: "PAID",
  OVERDUE: "OVERDUE",
  CANCELLED: "CANCELLED",
} as const;

export const INVOICE_STATUS_LABELS = {
  PENDING: "Pending",
  PAID: "Paid",
  OVERDUE: "Overdue",
  CANCELLED: "Cancelled",
};

export const INVOICE_STATUS_COLORS = {
  PENDING: "warning",
  PAID: "success",
  OVERDUE: "danger",
  CANCELLED: "default",
} as const;

export const NAV_LINKS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
  },
  {
    label: "Transactions",
    href: "/transactions",
    icon: "ArrowLeftRight",
  },
  {
    label: "Invoices",
    href: "/invoices",
    icon: "FileText",
  },
  {
    label: "Budgets",
    href: "/budgets",
    icon: "PieChart",
  },
  {
    label: "Reports",
    href: "/reports",
    icon: "BarChart2",
  },
];

export const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

export const TAX_RATES = [
  { label: "No Tax (0%)", value: 0 },
  { label: "5%", value: 5 },
  { label: "10%", value: 10 },
  { label: "15%", value: 15 },
  { label: "20%", value: 20 },
  { label: "25%", value: 25 },
];