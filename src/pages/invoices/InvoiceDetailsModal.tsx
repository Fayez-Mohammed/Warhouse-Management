import { useState, useEffect } from "react";
import { X, Loader2, Receipt, Printer } from "lucide-react";
import { toast } from "sonner";
import { API, authHeaders, apiFetch } from "../../lib/api";
import { useLang } from "../../lib/i18n";
import { Overlay } from "../../components/Overlay";
import type { InvoiceListItem, InvoiceDetails } from "../../types";
import { getInvoiceType } from "./invoiceTypes";
import { formatDate } from "../../lib/utils";

// Customer endpoint for CustomerInvoice (1), CommissionInvoice (2) & ReturnInvoice (4).
// Supplier endpoint for SupplierInvoice (3) & SupplierReturnInvoice (5).
function detailsUrl(invoice: InvoiceListItem): string {
  const isSupplier = invoice.type === 3 || invoice.type === 5;
  const segment = isSupplier ? "supplier" : "customer";
  return `${API}/api/Invoices/${segment}/${invoice.id}/details`;
}

export function InvoiceDetailsModal({
  invoice,
  onClose,
}: {
  invoice: InvoiceListItem;
  onClose: () => void;
}) {
  const { t } = useLang();
  const [details, setDetails] = useState<InvoiceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const typeConfig = getInvoiceType(invoice.type);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch(detailsUrl(invoice), {
          headers: authHeaders(),
        });
        const data = await res.json();
        setDetails(data);
      } catch {
        toast.error("Failed to load invoice details.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [invoice.id]); // eslint-disable-line

  const code = details?.code ?? invoice.code;
  const name = details?.recipientorsuppliername ?? invoice.recipientname;
  const date = details?.dateofcreation ?? invoice.generateddate;
  const totalAmount = details?.totalamount ?? invoice.amount;
  const paidAmount = details?.paidamount ?? invoice.paidamount;
  const remainingAmount =
    details?.remainingamount ?? invoice.remainingamount;

  return (
    <Overlay onClose={onClose}>
      <div className="print-document w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 border-b border-border flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Receipt className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-base font-semibold text-foreground">
                {t("modal_invoiceDetails")}{" "}
                <span dir="ltr" className="inline-block">
                  #{code}
                </span>
              </h2>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full border ${typeConfig.bg} ${typeConfig.color} ${typeConfig.border}`}
              >
                {t(typeConfig.labelKey)}
              </span>
              <span className="text-xs text-muted-foreground">
                {name}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                <span dir="ltr" className="inline-block">
                  {formatDate(date)}
                </span>
              </span>
            </div>
          </div>
          <div className="print-hidden flex items-center gap-2 shrink-0 ms-4">
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

        <div className="print-scroll flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : !details || details.items.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-12">
              {t("lbl_noData")}
            </p>
          ) : (
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="border-b border-border">
                  {[
                    { key: "idx", label: "#" },
                    { key: "product", label: t("col_product") },
                    { key: "category", label: t("col_category") },
                    { key: "qty", label: t("col_qty") },
                    { key: "unit", label: t("col_unitPrice") },
                    { key: "total", label: t("col_total") },
                  ].map((h) => (
                    <th
                      key={h.key}
                      className="text-start py-2.5 px-2 text-xs font-medium text-muted-foreground font-mono tracking-wider"
                    >
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {details.items.map((it, i) => (
                  <tr
                    key={`${it.productname}-${i}`}
                    className="border-b border-border/40 hover:bg-muted/20 transition-colors"
                  >
                    <td className="text-start py-3 px-2 font-mono text-xs text-muted-foreground">
                      <span dir="ltr" className="inline-block">
                        {i + 1}
                      </span>
                    </td>
                    <td className="text-start py-3 px-2 font-medium text-foreground">
                      {it.productname}
                    </td>
                    <td className="text-start py-3 px-2 text-muted-foreground text-xs">
                      {it.categoryname}
                    </td>
                    <td className="text-start py-3 px-2 text-foreground">
                      <span dir="ltr" className="inline-block">
                        {it.quantity}
                      </span>
                    </td>
                    <td className="text-start py-3 px-2 font-mono text-sm">
                      <span dir="ltr" className="inline-block">
                        ${it.priceorcost.toLocaleString()}
                      </span>
                    </td>
                    <td className="text-start py-3 px-2 font-mono text-sm font-medium text-foreground">
                      <span dir="ltr" className="inline-block">
                        ${it.total.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-6 py-3 border-t border-border bg-muted/20 rounded-b-2xl shrink-0">
          <div className="flex items-center justify-between text-xs font-mono text-muted-foreground gap-2 flex-wrap">
            <span>
              {t("lbl_invoiceAmount")}:{" "}
              <span dir="ltr" className="inline-block text-foreground">
                ${totalAmount.toLocaleString()}
              </span>
            </span>
            <span>
              {t("lbl_paidBalance")}:{" "}
              <span
                dir="ltr"
                className="inline-block text-emerald-600 dark:text-emerald-400"
              >
                ${paidAmount.toLocaleString()}
              </span>
            </span>
            <span>
              {t("lbl_remainingAmount")}:{" "}
              <span
                dir="ltr"
                className={`inline-block ${remainingAmount > 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}
              >
                ${remainingAmount.toLocaleString()}
              </span>
            </span>
          </div>
        </div>
      </div>
    </Overlay>
  );
}
