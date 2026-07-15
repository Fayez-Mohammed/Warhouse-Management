import { useState, useEffect } from "react";
import { X, Loader2, CreditCard, Users, BadgeDollarSign } from "lucide-react";
import { toast } from "sonner";
import { API, authHeaders, apiFetch } from "../../lib/api";
import { useLang } from "../../lib/i18n";
import { Overlay } from "../../components/Overlay";
import type { Order } from "../../types";

interface PaymentInfo {
  total: number;
  paidamount: number;
  remainingamount: number;
  name: string;
}

export function CollectPaymentModal({ order, onClose, onDone }: {
  order: Order; onClose: () => void; onDone: () => void;
}) {
  const { t } = useLang();
  const [tab, setTab] = useState<"Customer" | "SalesRep">("Customer");
  const [customerInfo, setCustomerInfo] = useState<PaymentInfo | null>(null);
  const [salesRepInfo, setSalesRepInfo] = useState<PaymentInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [amount, setAmount] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    async function load() {
      setLoadingInfo(true);
      try {
        const [cRes, sRes] = await Promise.all([
          apiFetch(`${API}/api/Invoices/customer/remaining-amount?orderId=${order.id}`, { headers: authHeaders() }),
          apiFetch(`${API}/api/Invoices/salesrep/remaining-amount?orderId=${order.id}`, { headers: authHeaders() }),
        ]);
        const cData = await cRes.json();
        const sData = await sRes.json();
        if (cData.statusCode === 200) {
          setCustomerInfo({ total: cData.total, paidamount: cData.paidamount, remainingamount: cData.remainingamount, name: cData.customername ?? order.customername });
        }
        if (sData.statusCode === 200) {
          setSalesRepInfo({ total: sData.total, paidamount: sData.paidamount, remainingamount: sData.remainingamount, name: sData.salesrepname ?? order.salesrepname ?? "Sales Rep" });
        }
      } catch { toast.error("Failed to load payment info."); }
      finally { setLoadingInfo(false); }
    }
    load();
  }, [order.id]); // eslint-disable-line

  const activeInfo = tab === "Customer" ? customerInfo : salesRepInfo;
  const max = activeInfo?.remainingamount ?? 0;
  const parsed = parseFloat(amount);
  const valid = !isNaN(parsed) && parsed > 0 && parsed <= max;

  async function handlePay() {
    if (!valid) return;
    setPaying(true);
    try {
      const res = await apiFetch(
        `${API}/api/Invoices/customer/pay?customerOrSalesRep=${tab}&orderId=${order.id}&PayiedAmount=${parsed}`,
        { method: "PUT", headers: authHeaders() }
      );
      const data = await res.json();
      if (data.statusCode === 200) {
        const name = tab === "Customer" ? (data.customername ?? order.customername) : (data.salesrepname ?? order.salesrepname);
        toast.success(`$${parsed.toLocaleString()} collected from ${name}. Remaining: $${data.remainingamount?.toLocaleString()}`);
        onDone();
      } else {
        toast.error(data.message || "Payment failed.");
      }
    } catch { toast.error("Request failed."); }
    finally { setPaying(false); }
  }

  return (
    <Overlay onClose={onClose}>
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
              <BadgeDollarSign className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">{t("modal_collectPayment")}</h2>
              <p className="text-xs text-muted-foreground">{t("lbl_orderCode")} #{order.code}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-4 h-4" /></button>
        </div>

        {/* Tab: Customer / Sales Rep */}
        <div className="flex rounded-lg border border-border overflow-hidden">
          {(["Customer", "SalesRep"] as const).map(tb => (
            <button
              key={tb}
              onClick={() => { setTab(tb); setAmount(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-all ${
                tab === tb ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tb === "Customer" ? <Users className="w-3.5 h-3.5" /> : <CreditCard className="w-3.5 h-3.5" />}
              {tb === "Customer" ? t("lbl_tabCustomer") : t("lbl_tabSalesRep")}
            </button>
          ))}
        </div>

        {loadingInfo ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : !activeInfo ? (
          <p className="text-center text-sm text-muted-foreground py-4">No invoice data found.</p>
        ) : (
          <>
            <div className="bg-muted/30 rounded-xl p-3.5 border border-border space-y-2">
              <p className="text-xs font-medium text-muted-foreground">{activeInfo.name}</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">{t("lbl_totalBalance")}</p>
                  <p className="font-mono text-sm font-medium text-foreground">${activeInfo.total.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("lbl_paidBalance")}</p>
                  <p className="font-mono text-sm font-medium text-emerald-600 dark:text-emerald-400">${activeInfo.paidamount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t("lbl_remainingAmount")}</p>
                  <p className={`font-mono text-sm font-medium ${activeInfo.remainingamount > 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}>
                    ${activeInfo.remainingamount.toLocaleString()}
                  </p>
                </div>
              </div>
              {activeInfo.total > 0 && (
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${Math.min((activeInfo.paidamount / activeInfo.total) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>

            {activeInfo.remainingamount <= 0 ? (
              <div className="text-center py-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                Fully paid ✓
              </div>
            ) : (
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
            )}
          </>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-border text-muted-foreground hover:text-foreground rounded-lg py-2.5 text-sm font-medium transition-all">{t("btn_cancel")}</button>
          {activeInfo && activeInfo.remainingamount > 0 && (
            <button
              onClick={handlePay} disabled={paying || !valid}
              className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-all"
            >
              {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : `${t("btn_pay")} $${valid ? parsed.toLocaleString() : "—"}`}
            </button>
          )}
        </div>
      </div>
    </Overlay>
  );
}
