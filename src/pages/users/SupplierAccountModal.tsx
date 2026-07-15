import { useState, useEffect } from "react";
import { X, Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { API, authHeaders, apiFetch } from "../../lib/api";
import { useLang } from "../../lib/i18n";
import { Overlay } from "../../components/Overlay";
import { formatDate } from "../../lib/utils";
import { getInvoiceType } from "../invoices/invoiceTypes";
import { PaySupplierModal } from "../invoices/PaySupplierModal";
import type { AppUser, SupplierAccountSummary, SupplierSummaryInvoice, InvoiceListItem } from "../../types";

function SummaryBlock({ label, count, total, paid, remaining, color }: {
  label: string; count: number; total: number; paid: number; remaining: number; color: string;
}) {
  return (
    <div className={`rounded-xl border border-border p-4 space-y-2 ${color}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className="font-mono text-xs text-muted-foreground">{count} invoices</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="font-mono text-sm font-semibold text-foreground">${total.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Paid</p>
          <p className="font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">${paid.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Remaining</p>
          <p className={`font-mono text-sm font-semibold ${remaining > 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}>
            ${remaining.toLocaleString()}
          </p>
        </div>
      </div>
      {total > 0 && (
        <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min((paid / total) * 100, 100)}%` }} />
        </div>
      )}
    </div>
  );
}

function toListItem(inv: SupplierSummaryInvoice): InvoiceListItem {
  return {
    id: inv.id, code: inv.code, type: inv.type,
    recipientname: inv.suppliername, amount: inv.amount,
    paidamount: inv.paidamount, remainingamount: inv.remainingamount,
    generateddate: inv.generateddate, orderid: null, ordercode: null, returnrequestid: null,
  };
}

export function SupplierAccountModal({ user, onClose }: { user: AppUser; onClose: () => void }) {
  const { t } = useLang();
  const [summary, setSummary] = useState<SupplierAccountSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [payingInvoice, setPayingInvoice] = useState<InvoiceListItem | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await apiFetch(`${API}/api/Invoices/supplier/summary?supplierId=${user.id}`, { headers: authHeaders() });
      const data = await res.json();
      setSummary(data);
    } catch { toast.error("Failed to load account summary."); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [user.id]); // eslint-disable-line

  function afterPay() {
    setPayingInvoice(null);
    load();
  }

  return (
    <>
      <Overlay onClose={onClose}>
        <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-base font-semibold text-foreground">{user.fullname}</h2>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">Supplier #{user.usernumber} · {user.phonenumber}</p>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-4 h-4" /></button>
          </div>

          <div className="flex-1 overflow-auto p-6 space-y-5">
            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : !summary ? (
              <p className="text-center text-muted-foreground text-sm py-12">No data available.</p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <SummaryBlock
                    label={t("lbl_supplyCount")} count={summary.supplycount}
                    total={summary.supplytotalamount} paid={summary.supplypaidamount} remaining={summary.supplyremainingamount}
                    color="bg-amber-500/5"
                  />
                  <SummaryBlock
                    label={t("lbl_returnsCount")} count={summary.returnscount}
                    total={summary.returnstotalamount} paid={summary.returnspaidamount} remaining={summary.returnsremainingamount}
                    color="bg-rose-500/5"
                  />
                </div>

                {/* Net position */}
                <div className="bg-muted/30 rounded-xl p-4 border border-border flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{t("lbl_netPayable")}</span>
                  <span className={`font-mono text-lg font-semibold ${
                    (summary.supplyremainingamount - summary.returnsremainingamount) > 0
                      ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"
                  }`}>
                    ${(summary.supplyremainingamount - summary.returnsremainingamount).toLocaleString()}
                  </span>
                </div>

                {/* Invoice list */}
                {summary.invoices.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Invoice History</h3>
                    <div className="rounded-xl border border-border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border bg-muted/20">
                            {["#", t("col_type"), t("col_amount"), t("col_paid"), t("col_remaining"), t("col_date"), ""].map(h => (
                              <th key={h} className="text-left py-2.5 px-2.5 text-xs font-medium text-muted-foreground font-mono tracking-wider">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {summary.invoices.map(inv => {
                            const tc = getInvoiceType(inv.type);
                            return (
                              <tr key={inv.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors group">
                                <td className="py-2.5 px-2.5 font-mono text-xs text-muted-foreground">#{inv.code}</td>
                                <td className="py-2.5 px-2.5">
                                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border whitespace-nowrap ${tc.bg} ${tc.color} ${tc.border}`}>
                                    {tc.label}
                                  </span>
                                </td>
                                <td className="py-2.5 px-2.5 font-mono text-xs">${inv.amount.toLocaleString()}</td>
                                <td className="py-2.5 px-2.5 font-mono text-xs text-emerald-600 dark:text-emerald-400">${inv.paidamount.toLocaleString()}</td>
                                <td className={`py-2.5 px-2.5 font-mono text-xs ${inv.remainingamount > 0 ? "text-destructive" : "text-muted-foreground"}`}>
                                  ${inv.remainingamount.toLocaleString()}
                                </td>
                                <td className="py-2.5 px-2.5 font-mono text-xs text-muted-foreground">{formatDate(inv.generateddate)}</td>
                                <td className="py-2.5 px-2.5">
                                  {inv.remainingamount > 0 && (
                                    <button
                                      onClick={() => setPayingInvoice(toListItem(inv))}
                                      className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 transition-all"
                                      title="Pay"
                                    >
                                      <CreditCard className="w-3 h-3" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
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

      {payingInvoice && (
        <PaySupplierModal invoice={payingInvoice} onClose={() => setPayingInvoice(null)} onDone={afterPay} />
      )}
    </>
  );
}
