import { useState } from "react";
import { X, Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { API, authHeaders, apiFetch } from "../../lib/api";
import { useLang } from "../../lib/i18n";
import { Overlay } from "../../components/Overlay";
import type { InvoiceListItem } from "../../types";
import { getInvoiceType } from "./invoiceTypes";

export function PaySupplierModal({ invoice, onClose, onDone }: {
  invoice: InvoiceListItem; onClose: () => void; onDone: () => void;
}) {
  const { t } = useLang();
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const typeConfig = getInvoiceType(invoice.type);

  const max = invoice.remainingamount;
  const parsed = parseFloat(amount);
  const valid = !isNaN(parsed) && parsed > 0 && parsed <= max;

  async function handlePay() {
    if (!valid) return;
    setLoading(true);
    try {
      const res = await apiFetch(
        `${API}/api/Invoices/supplier/pay?SupplierInvoiceId=${invoice.id}&PayiedAmount=${parsed}`,
        { method: "PUT", headers: authHeaders() }
      );
      const data = await res.json();
      if (data.statusCode === 200) {
        toast.success(`Paid $${parsed.toLocaleString()} to ${data.supplier ?? invoice.recipientname}. Remaining: $${data.remainingamount?.toLocaleString()}`);
        onDone();
      } else {
        toast.error(data.message || "Payment failed.");
      }
    } catch { toast.error("Request failed."); }
    finally { setLoading(false); }
  }

  return (
    <Overlay onClose={onClose}>
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${typeConfig.bg} ${typeConfig.color}`}>
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">{t("modal_paySupplier")}</h2>
              <p className="text-xs text-muted-foreground">Invoice #{invoice.code} · {invoice.recipientname}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <div className="bg-muted/30 rounded-xl p-3.5 border border-border grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-muted-foreground">{t("lbl_invoiceAmount")}</p>
            <p className="font-mono text-sm font-medium text-foreground">${invoice.amount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("lbl_paidBalance")}</p>
            <p className="font-mono text-sm font-medium text-emerald-600 dark:text-emerald-400">${invoice.paidamount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("lbl_remainingAmount")}</p>
            <p className="font-mono text-sm font-medium text-destructive">${max.toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground/80">{t("lbl_paymentAmount")}</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
            <input
              type="number" min="0.01" max={max} step="0.01"
              value={amount} onChange={e => setAmount(e.target.value)}
              placeholder={`Max ${max.toLocaleString()}`}
              className="w-full bg-input-background border border-border rounded-lg pl-7 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>
          {amount && !valid && (
            <p className="text-xs text-destructive">Enter a valid amount between $0.01 and ${max.toLocaleString()}</p>
          )}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-border text-muted-foreground hover:text-foreground rounded-lg py-2.5 text-sm font-medium transition-all">{t("btn_cancel")}</button>
          <button
            onClick={handlePay} disabled={loading || !valid}
            className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : `${t("btn_pay")} $${valid ? parsed.toLocaleString() : "—"}`}
          </button>
        </div>
      </div>
    </Overlay>
  );
}
