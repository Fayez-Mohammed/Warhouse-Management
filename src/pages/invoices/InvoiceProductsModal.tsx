import { useState, useEffect } from "react";
import { X, Loader2, Package } from "lucide-react";
import { toast } from "sonner";
import { API, authHeaders, apiFetch } from "../../lib/api";
import { useLang } from "../../lib/i18n";
import { Overlay } from "../../components/Overlay";
import type { InvoiceListItem, SupplierInvoiceProduct } from "../../types";
import { getInvoiceType } from "./invoiceTypes";
import { formatDate } from "../../lib/utils";

export function InvoiceProductsModal({ invoice, onClose }: { invoice: InvoiceListItem; onClose: () => void }) {
  const { t } = useLang();
  const [products, setProducts] = useState<SupplierInvoiceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const typeConfig = getInvoiceType(invoice.type);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch(`${API}/api/Invoices/supplier/products?invoiceId=${invoice.id}`, { headers: authHeaders() });
        const data = await res.json();
        setProducts(data.value ?? []);
      } catch { toast.error("Failed to load invoice products."); }
      finally { setLoading(false); }
    }
    load();
  }, [invoice.id]);

  const total = products.reduce((s, p) => s + p.totalprice, 0);

  return (
    <Overlay onClose={onClose}>
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 border-b border-border flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-base font-semibold text-foreground">{t("modal_invoiceProducts")} #{invoice.code}</h2>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${typeConfig.bg} ${typeConfig.color} ${typeConfig.border}`}>
                {typeConfig.label}
              </span>
              <span className="text-xs text-muted-foreground">{invoice.recipientname}</span>
              <span className="text-xs text-muted-foreground font-mono">{formatDate(invoice.generateddate)}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors shrink-0 ml-4">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : products.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-12">{t("lbl_noData")}</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["#", t("col_product"), t("col_qty"), t("lbl_buyPrice"), t("col_total")].map(h => (
                    <th key={h} className="text-left py-2.5 px-2 text-xs font-medium text-muted-foreground font-mono tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.productid} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-2 font-mono text-xs text-muted-foreground">{p.productcode}</td>
                    <td className="py-3 px-2 font-medium text-foreground">{p.productname}</td>
                    <td className="py-3 px-2 text-foreground">{p.quantity}</td>
                    <td className="py-3 px-2 font-mono text-sm">${p.buyprice.toLocaleString()}</td>
                    <td className="py-3 px-2 font-mono text-sm font-medium text-foreground">${p.totalprice.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border">
                  <td colSpan={4} className="py-3 px-2 text-xs font-medium text-muted-foreground text-right">{t("col_total")}</td>
                  <td className="py-3 px-2 font-mono font-semibold text-foreground">${total.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>

        <div className="px-6 py-3 border-t border-border bg-muted/20 rounded-b-2xl shrink-0">
          <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
            <span>{t("lbl_invoiceAmount")}: <span className="text-foreground">${invoice.amount.toLocaleString()}</span></span>
            <span>{t("lbl_paidBalance")}: <span className="text-emerald-600 dark:text-emerald-400">${invoice.paidamount.toLocaleString()}</span></span>
            <span>{t("lbl_remainingAmount")}: <span className={invoice.remainingamount > 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}>${invoice.remainingamount.toLocaleString()}</span></span>
          </div>
        </div>
      </div>
    </Overlay>
  );
}
