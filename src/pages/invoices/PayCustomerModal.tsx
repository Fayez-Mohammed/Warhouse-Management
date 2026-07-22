import { useState } from "react";
import { X, Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { API, authHeaders, apiFetch } from "../../lib/api";
import { useLang } from "../../lib/i18n";
import { Overlay } from "../../components/Overlay";
import type { InvoiceListItem } from "../../types";
import { getInvoiceType } from "./invoiceTypes";

// type 2 = Commission → paid by SalesRep; types 1 & 4 → paid by Customer
function payerRole(type: number): "Customer" | "SalesRep" {
  return type === 2 ? "SalesRep" : "Customer";
}

export function PayCustomerModal({
  invoice,
  onClose,
  onDone,
}: {
  invoice: InvoiceListItem;
  onClose: () => void;
  onDone: () => void;
}) {
  const { t } = useLang();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const typeConfig = getInvoiceType(invoice.type);

  const max = invoice.remainingamount;
  const parsed = parseFloat(amount);
  const valid = !isNaN(parsed) && parsed > 0 && parsed <= max;

  async function handlePay() {
    if (!valid) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        customerOrSalesRep: payerRole(invoice.type),
        orderId: invoice.id,
        PayiedAmount: String(parsed),
      });
      const res = await apiFetch(
        `${API}/api/Invoices/customer/pay?${params}`,
        { method: "PUT", headers: authHeaders() },
      );
      const data = await res.json();
      if (data.statusCode === 200) {
        toast.success(
          `${t("btn_pay")} $${parsed.toLocaleString()} — ${data.customername ?? invoice.recipientname}. ${t("lbl_remainingAmount")}: $${data.remainingamount?.toLocaleString()}`,
        );
        onDone();
      } else {
        toast.error(data.message || t("error_paymentFailed"));
      }
    } catch {
      toast.error(t("error_paymentFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Overlay onClose={onClose}>
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${typeConfig.bg} ${typeConfig.color}`}>
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                {t("modal_collectPayment")}
              </h2>
              <p className="text-xs text-muted-foreground">
                {t("col_code")} #{invoice.code} · {invoice.recipientname}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Invoice summary */}
        <div className="bg-muted/30 rounded-xl p-3.5 border border-border grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-muted-foreground">{t("lbl_invoiceAmount")}</p>
            <p className="font-mono text-sm font-medium text-foreground">
              <span dir="ltr" className="inline-block">${invoice.amount.toLocaleString()}</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("lbl_paidBalance")}</p>
            <p className="font-mono text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <span dir="ltr" className="inline-block">${invoice.paidamount.toLocaleString()}</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("lbl_remainingAmount")}</p>
            <p className="font-mono text-sm font-medium text-destructive">
              <span dir="ltr" className="inline-block">${max.toLocaleString()}</span>
            </p>
          </div>
        </div>

        {/* Amount input */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground/80">
            {t("lbl_paymentAmount")}
          </label>
          <div className="relative">
            <span className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
            <input
              type="number"
              min="0.01"
              max={max}
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Max ${max.toLocaleString()}`}
              className="w-full bg-input-background border border-border rounded-lg ps-7 pe-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>
          {amount && !valid && (
            <p className="text-xs text-destructive">
              {t("error_validAmount")} $0.01 – ${max.toLocaleString()}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-border text-muted-foreground hover:text-foreground rounded-lg py-2.5 text-sm font-medium transition-all"
          >
            {t("btn_cancel")}
          </button>
          <button
            onClick={handlePay}
            disabled={loading || !valid}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-all"
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : `${t("btn_pay")} $${valid ? parsed.toLocaleString() : "—"}`}
          </button>
        </div>
      </div>
    </Overlay>
  );
}
