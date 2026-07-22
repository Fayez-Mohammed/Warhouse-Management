import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  Receipt,
  Search,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Package2,
  Filter,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { API, authHeaders, apiFetch } from "../../lib/api";
import { useLang } from "../../lib/i18n";
import { formatDate } from "../../lib/utils";
import { PaySupplierModal } from "./PaySupplierModal";
import { PayCustomerModal } from "./PayCustomerModal";
import { InvoiceProductsModal } from "./InvoiceProductsModal";
import { InvoiceDetailsModal } from "./InvoiceDetailsModal";
import {
  getInvoiceType,
  INVOICE_TYPE_MAP,
} from "./invoiceTypes";
import type { InvoiceListItem } from "../../types";

const PAGE_SIZE = 20;

type ModalState =
  | { type: "pay-supplier"; invoice: InvoiceListItem }
  | { type: "pay-customer"; invoice: InvoiceListItem }
  | { type: "products"; invoice: InvoiceListItem }
  | { type: "details"; invoice: InvoiceListItem };

const PAYMENT_PROGRESS_COLOR = (pct: number) =>
  pct >= 100
    ? "bg-emerald-500"
    : pct > 0
      ? "bg-amber-500"
      : "bg-muted-foreground/30";

export function InvoicesPage() {
  const { t, isRTL } = useLang();
  const [invoices, setInvoices] = useState<InvoiceListItem[]>(
    [],
  );
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [modal, setModal] = useState<ModalState | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  const fetchInvoices = useCallback(
    async (
      p: number,
      q: string,
      type: string,
      from: string,
      to: string,
    ) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(p),
          pageSize: String(PAGE_SIZE),
        });
        if (q.trim()) params.set("search", q.trim());
        if (type) params.set("invoiceType", type);
        if (from) params.set("fromDate", from);
        if (to) params.set("toDate", to);
        const res = await apiFetch(
          `${API}/api/Invoices/list?${params}`,
          { headers: authHeaders() },
        );
        const data = await res.json();
        setInvoices(data.items ?? []);
        setTotal(data.totalitems ?? 0);
      } catch {
        toast.error("Failed to load invoices.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    setPage(1);
    fetchInvoices(1, search, typeFilter, fromDate, toDate);
  }, [typeFilter, fromDate, toDate, fetchInvoices]);

  // Debounce search
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      fetchInvoices(1, search, typeFilter, fromDate, toDate);
    }, 300);
    return () => clearTimeout(searchTimer.current);
  }, [search]); // eslint-disable-line

  function goPage(dir: "prev" | "next") {
    const next = dir === "next" ? page + 1 : page - 1;
    setPage(next);
    fetchInvoices(next, search, typeFilter, fromDate, toDate);
  }

  function afterMutation() {
    setModal(null);
    fetchInvoices(page, search, typeFilter, fromDate, toDate);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function clearFilters() {
    setSearch("");
    setTypeFilter("");
    setFromDate("");
    setToDate("");
    setPage(1);
    fetchInvoices(1, "", "", "", "");
  }

  const hasFilters = search || typeFilter || fromDate || toDate;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background/50">
      {/* Header */}
      <div className="border-b border-border px-4 sm:px-8 py-5 flex items-center justify-between shrink-0 bg-background">
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            {t("invoices_title")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("invoices_subtitle")}
          </p>
        </div>
        {total > 0 && (
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            {total} {t("unit_invoices")}
          </span>
        )}
      </div>

      {/* Filter bar */}
      <div className="px-4 sm:px-8 py-3.5 border-b border-border shrink-0 flex items-center gap-3 flex-wrap bg-background">
        {/* Search */}
        <div className="relative w-52">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("lbl_searchCustomerOrSalesRep")}
            className="w-full bg-input-background border border-border rounded-lg ps-8 pe-8 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Type filter */}
        <div className="relative">
          <Filter className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="ps-8 pe-8 py-2 bg-input-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50 appearance-none cursor-pointer"
          >
            <option value="">{t("filter_allTypes")}</option>
            {Object.entries(INVOICE_TYPE_MAP).map(([k, v]) => (
              <option key={k} value={k}>
                {t(v.labelKey)}
              </option>
            ))}
          </select>
        </div>

        {/* Date range */}
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="py-2 px-3 bg-input-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50 cursor-pointer"
        />
        <span className="text-muted-foreground text-xs">—</span>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="py-2 px-3 bg-input-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary/50 cursor-pointer"
        />

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-2 transition-all hover:bg-muted/30"
          >
            <X className="w-3 h-3" />
            {t("btn_clearFilters")}
          </button>
        )}
      </div>

      {/* Table Container with White Card Design */}
      <div className="flex-1 overflow-auto px-4 sm:px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-24 flex flex-col items-center justify-center gap-3 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
              <Receipt className="w-5 h-5" />
            </div>
            <p className="text-muted-foreground text-sm">
              {t("lbl_noData")}
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-x-auto shadow-sm">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/10">
                  {[
                    { key: "col_code", label: t("col_code") },
                    { key: "col_type", label: t("col_type") },
                    {
                      key: "col_recipient",
                      label: t("col_recipient"),
                    },
                    {
                      key: "col_amount",
                      label: t("col_amount"),
                    },
                    { key: "col_paid", label: t("col_paid") },
                    {
                      key: "col_remaining",
                      label: t("col_remaining"),
                    },
                    {
                      key: "col_progress",
                      label: t("col_progress"),
                    },
                    { key: "col_date", label: t("col_date") },
                    { key: "actions", label: "" },
                  ].map((h) => (
                    <th
                      key={h.key}
                      className="text-start py-3.5 px-5 text-xs font-semibold text-muted-foreground font-mono tracking-wider"
                    >
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, i) => {
                  const tc = getInvoiceType(inv.type);
                  const pct =
                    inv.amount > 0
                      ? (inv.paidamount / inv.amount) * 100
                      : 0;
                  const isSupplierInvoice = inv.type === 3;
                  const isSupplierBill =
                    inv.type === 3 || inv.type === 5;
                  // types 1=Customer, 2=Commission, 4=Return → collect payment from customer/sales-rep
                  const isCustomerBill =
                    (inv.type === 1 || inv.type === 2 || inv.type === 4) &&
                    inv.remainingamount > 0;
                  const hasDetails =
                    inv.type === 1 ||
                    inv.type === 2 ||
                    inv.type === 3 ||
                    inv.type === 4 ||
                    inv.type === 5;

                  return (
                    <tr
                      key={inv.id}
                      className={`border-b border-border/50 hover:bg-muted/20 transition-colors group ${i === invoices.length - 1 ? "border-b-0" : ""}`}
                    >
                      <td className="text-start py-3.5 px-5">
                        <span
                          className="font-mono text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground"
                          dir="ltr"
                        >
                          #{inv.code}
                        </span>
                      </td>
                      <td className="text-start py-3.5 px-5">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${tc.bg} ${tc.color} ${tc.border}`}
                        >
                          {t(tc.labelKey)}
                        </span>
                      </td>
                      <td className="text-start py-3.5 px-5 font-medium text-foreground max-w-[140px] truncate">
                        {inv.recipientname}
                      </td>
                      <td className="text-start py-3.5 px-5 font-mono text-sm text-foreground">
                        <span
                          dir="ltr"
                          className="inline-block"
                        >
                          ${inv.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="text-start py-3.5 px-5 font-mono text-sm text-emerald-600 dark:text-emerald-400">
                        <span
                          dir="ltr"
                          className="inline-block"
                        >
                          ${inv.paidamount.toLocaleString()}
                        </span>
                      </td>
                      <td className="text-start py-3.5 px-5 font-mono text-sm">
                        <span
                          dir="ltr"
                          className={`inline-block ${inv.remainingamount > 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}
                        >
                          $
                          {inv.remainingamount.toLocaleString()}
                        </span>
                      </td>
                      <td className="text-start py-3.5 px-5">
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${PAYMENT_PROGRESS_COLOR(pct)}`}
                            style={{
                              width: `${Math.min(pct, 100)}%`,
                            }}
                          />
                        </div>
                        <p
                          className="text-xs text-muted-foreground font-mono mt-0.5"
                          dir="ltr"
                        >
                          {pct.toFixed(0)}%
                        </p>
                      </td>
                      <td className="text-start py-3.5 px-5 font-mono text-xs text-muted-foreground whitespace-nowrap">
                        <span
                          dir="ltr"
                          className="inline-block"
                        >
                          {formatDate(inv.generateddate)}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                          {hasDetails && (
                            <button
                              onClick={() =>
                                setModal({
                                  type: "details",
                                  invoice: inv,
                                })
                              }
                              title={t("tooltip_viewDetails")}
                              className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {isSupplierInvoice && (
                            <button
                              onClick={() =>
                                setModal({
                                  type: "products",
                                  invoice: inv,
                                })
                              }
                              title={t("tooltip_viewProducts")}
                              className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-all"
                            >
                              <Package2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {isCustomerBill && (
                            <button
                              onClick={() =>
                                setModal({
                                  type: "pay-customer",
                                  invoice: inv,
                                })
                              }
                              title={t("tooltip_collectPayment")}
                              className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 transition-all"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {isSupplierBill &&
                            inv.remainingamount > 0 && (
                              <button
                                onClick={() =>
                                  setModal({
                                    type: "pay-supplier",
                                    invoice: inv,
                                  })
                                }
                                title={t("tooltip_paySupplier")}
                                className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-all"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="border-t border-border px-4 sm:px-8 py-3.5 flex items-center justify-between shrink-0 bg-background">
          <p className="text-xs text-muted-foreground font-mono">
            {t("pagination_page")} {page} {t("pagination_of")}{" "}
            {totalPages} — {total} {t("unit_invoices")}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => goPage("prev")}
              disabled={page === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted/50 transition-all"
            >
              {isRTL ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
            <span className="text-xs text-muted-foreground px-2 font-mono">
              {page}
            </span>
            <button
              onClick={() => goPage("next")}
              disabled={page >= totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted/50 transition-all"
            >
              {isRTL ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}

      {modal?.type === "pay-customer" && (
        <PayCustomerModal
          invoice={modal.invoice}
          onClose={() => setModal(null)}
          onDone={afterMutation}
        />
      )}
      {modal?.type === "pay-supplier" && (
        <PaySupplierModal
          invoice={modal.invoice}
          onClose={() => setModal(null)}
          onDone={afterMutation}
        />
      )}
      {modal?.type === "products" && (
        <InvoiceProductsModal
          invoice={modal.invoice}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === "details" && (
        <InvoiceDetailsModal
          invoice={modal.invoice}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}