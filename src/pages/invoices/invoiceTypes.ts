export interface InvoiceTypeConfig {
    labelKey: string; // تغيير label إلى labelKey لدعم الترجمة
    color: string;
    bg: string;
    border: string;
}

export const INVOICE_TYPE_MAP: Record<number, InvoiceTypeConfig> = {
    1: { labelKey: "type_customerInvoice", color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" },
    2: { labelKey: "type_commission", color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
    3: { labelKey: "type_supplierInvoice", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    4: { labelKey: "type_returnInvoice", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    5: { labelKey: "type_supplierReturn", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
};

export function getInvoiceType(type: number): InvoiceTypeConfig {
    return INVOICE_TYPE_MAP[type] ?? {
        labelKey: "lbl_noData", // قيمة افتراضية مترجمة في حال عدم وجود النوع
        color: "text-muted-foreground",
        bg: "bg-muted",
        border: "border-border"
    };
}