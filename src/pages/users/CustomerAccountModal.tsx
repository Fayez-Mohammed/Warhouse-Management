import { useState, useEffect } from "react";
import { X, Loader2, Printer, Eye } from "lucide-react";
import { toast } from "sonner";
import { API, authHeaders, apiFetch } from "../../lib/api";
import { useLang } from "../../lib/i18n";
import { Overlay } from "../../components/Overlay";
import { formatDate } from "../../lib/utils";
import { getInvoiceType } from "../invoices/invoiceTypes";
import { InvoiceDetailsModal } from "../invoices/InvoiceDetailsModal";
import type {
  AppUser,
  CustomerAccountSummary,
  CustomerSummaryInvoice,
  InvoiceListItem,
} from "../../types";

function SummaryRow({
  label,
  count,
  total,
  paid,
  remaining,
  color,
}: {
  label: string;
  count: number;
  total: number;
  paid: number;
  remaining: number;
  color: string;
}) {
  const { t } = useLang();

  return (
    <div
      className={`rounded-xl border border-border p-4 space-y-2 ${color}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <span className="font-mono text-xs text-muted-foreground">
          {count} {t("unit_invoices")}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-[10px] uppercase font-semibold text-muted-foreground/75">
            {t("col_amount")}
          </p>
          <p className="font-mono text-sm font-semibold text-foreground">
            ${total.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-semibold text-muted-foreground/75">
            {t("col_paid")}
          </p>
          <p className="font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            ${paid.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase font-semibold text-muted-foreground/75">
            {t("col_remaining")}
          </p>
          <p
            className={`font-mono text-sm font-semibold ${remaining > 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}
          >
            ${remaining.toLocaleString()}
          </p>
        </div>
      </div>
      {total > 0 && (
        <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500"
            style={{
              width: `${Math.min((paid / total) * 100, 100)}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}

function InvoiceRow({
  inv,
  onView,
}: {
  inv: CustomerSummaryInvoice;
  onView: (inv: CustomerSummaryInvoice) => void;
}) {
  const { t } = useLang();
  const tc = getInvoiceType(inv.type);

  return (
    <tr className="border-b border-border/40 hover:bg-muted/20 transition-colors group">
      <td className="py-2.5 px-2.5">
        <span className="font-mono text-xs text-muted-foreground">
          #{inv.code}
        </span>
      </td>
      <td className="py-2.5 px-2.5">
        {/* تم التعديل لعرض اسم نوع الفاتورة المترجم بدلاً من كونه بالإنجليزية فقط */}
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap ${tc.bg} ${tc.color} ${tc.border}`}
        >
          {t(tc.labelKey)}
        </span>
      </td>
      <td className="py-2.5 px-2.5 font-mono text-xs text-foreground">
        ${inv.amount.toLocaleString()}
      </td>
      <td className="py-2.5 px-2.5 font-mono text-xs text-emerald-600 dark:text-emerald-400">
        ${inv.paidamount.toLocaleString()}
      </td>
      <td
        className={`py-2.5 px-2.5 font-mono text-xs ${inv.remainingamount > 0 ? "text-destructive" : "text-muted-foreground"}`}
      >
        ${inv.remainingamount.toLocaleString()}
      </td>
      <td className="py-2.5 px-2.5 font-mono text-xs text-muted-foreground">
        {formatDate(inv.generateddate)}
      </td>
      {inv.ordercode && (
        <td className="py-2.5 px-2.5">
          <span className="font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
            ord #{inv.ordercode}
          </span>
        </td>
      )}
      <td className="print-hidden py-2.5 px-2.5">
        <button
          onClick={() => onView(inv)}
          title={t("tooltip_viewDetails")}
          className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
        >
          <Eye className="w-3 h-3" />
        </button>
      </td>
    </tr>
  );
}

export function CustomerAccountModal({
  user,
  onClose,
}: {
  user: AppUser;
  onClose: () => void;
}) {
  const { t } = useLang();
  const [summary, setSummary] =
    useState<CustomerAccountSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] =
    useState<InvoiceListItem | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch(
          `${API}/api/Invoices/customer/summary?customerId=${user.id}`,
          { headers: authHeaders() },
        );
        const data = await res.json();
        setSummary(data);
      } catch {
        toast.error("Failed to load account summary.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user.id]);

  return (
    <>
    <Overlay onClose={onClose}>
      <div className={`${viewing ? "" : "print-document "}w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh]`}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {user.fullname}
            </h2>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              {t("tab_customers")} #{user.usernumber} ·{" "}
              {user.phonenumber}
            </p>
          </div>
          <div className="print-hidden flex items-center gap-2">
            <button
              onClick={() => window.print()}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-foreground hover:bg-muted/50 disabled:opacity-50 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              {t("btn_print")}
            </button>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="print-scroll flex-1 overflow-auto p-6 space-y-5">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !summary ? (
            <p className="text-center text-muted-foreground text-sm py-12">
              {t("lbl_noData")}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <SummaryRow
                  label={t("lbl_customerOrders")}
                  count={summary.salescount}
                  total={summary.salestotalamount}
                  paid={summary.salespaidamount}
                  remaining={summary.salesremainingamount}
                  color="bg-sky-500/5"
                />
                <SummaryRow
                  label={t("lbl_customerReturns")}
                  count={summary.returnscount}
                  total={summary.returnstotalamount}
                  paid={summary.returnspaidamount}
                  remaining={summary.returnsremainingamount}
                  color="bg-orange-500/5"
                />
              </div>

              {/* Net position */}
              <div className="bg-muted/30 rounded-xl p-4 border border-border flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  {t("lbl_netReceivable")}
                </span>
                <span
                  className={`font-mono text-lg font-semibold ${
                    summary.salesremainingamount -
                      summary.returnsremainingamount >
                    0
                      ? "text-destructive"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  $
                  {(
                    summary.salesremainingamount -
                    summary.returnsremainingamount
                  ).toLocaleString()}
                </span>
              </div>

              {/* Invoice list */}
              {summary.invoices.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    {t("invoices_title")}
                  </h3>
                  <div className="rounded-xl border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted/20">
                          {[
                            "#",
                            t("col_type"),
                            t("col_amount"),
                            t("col_paid"),
                            t("col_remaining"),
                            t("col_date"),
                          ].map((h) => (
                            <th
                              key={h}
                              className="text-left py-2.5 px-2.5 text-xs font-semibold text-muted-foreground font-mono tracking-wider"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {summary.invoices.map((inv) => (
                          <InvoiceRow
                            key={inv.id}
                            inv={inv}
                            onView={(v) => setViewing(v)}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Overlay>

    {viewing && (
      <InvoiceDetailsModal
        invoice={viewing}
        onClose={() => setViewing(null)}
      />
    )}
    </>
  );
}