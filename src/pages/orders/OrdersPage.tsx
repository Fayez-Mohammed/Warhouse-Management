import { useState, useEffect, useCallback } from "react";
import { ClipboardList, Plus, ChevronLeft, ChevronRight, Loader2, RotateCcw, BadgeDollarSign } from "lucide-react";
import { toast } from "sonner";
import { API, authHeaders, apiFetch } from "../../lib/api";
import { useLang } from "../../lib/i18n";
import { formatDate } from "../../lib/utils";
import { CreateDirectOrderModal } from "./CreateDirectOrderModal";
import { CustomerReturnModal } from "./CustomerReturnModal";
import { CollectPaymentModal } from "./CollectPaymentModal";
import type { Order } from "../../types";

const PAGE_SIZE = 10;

export function OrdersPage() {
  const { t, isRTL } = useLang();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [returnOrder, setReturnOrder] = useState<Order | null>(null);
  const [payOrder, setPayOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async (s = 0) => {
    setLoading(true);
    try {
      const res = await apiFetch(`${API}/api/Orders/approved?skip=${s}&take=${PAGE_SIZE}`, { headers: authHeaders() });
      const data = await res.json();
      const items: Order[] = data.value ?? [];
      setOrders(items);
      setHasMore(items.length === PAGE_SIZE);
    } catch { toast.error("Failed to load orders."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchOrders(0); }, [fetchOrders]);

  function handlePageChange(dir: "prev" | "next") {
    const s = dir === "next" ? skip + PAGE_SIZE : Math.max(0, skip - PAGE_SIZE);
    setSkip(s); fetchOrders(s);
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="border-b border-border px-8 py-5 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-semibold text-foreground">{t("orders_title")}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{t("orders_subtitle")}</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg transition-all">
          <Plus className="w-4 h-4" />{t("btn_newDirectSale")}
        </button>
      </div>

      <div className="flex-1 overflow-auto px-8 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <ClipboardList className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-muted-foreground text-sm">{t("empty_orders")}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {[
                  { key: "col_order", label: t("col_order") },
                  { key: "col_customer", label: t("col_customer") },
                  { key: "col_salesRep", label: t("col_salesRep") },
                  { key: "col_total", label: t("col_total") },
                  { key: "col_commission", label: t("col_commission") },
                  { key: "col_status", label: t("col_status") },
                  { key: "col_date", label: t("col_date") },
                  { key: "actions", label: "" },
                ].map(h => (
                  <th key={h.key} className="text-start py-3 px-3 text-xs font-medium text-muted-foreground font-mono tracking-wider">{h.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => (
                <tr key={o.id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-card/30"}`}>
                  <td className="text-start py-3.5 px-3"><span className="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded" dir="ltr">#{o.code}</span></td>
                  <td className="text-start py-3.5 px-3 font-medium text-foreground">{o.customername}</td>
                  <td className="text-start py-3.5 px-3 text-muted-foreground text-xs">{o.salesrepname ?? <span className="italic opacity-50">—</span>}</td>
                  <td className="text-start py-3.5 px-3 font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400"><span dir="ltr" className="inline-block">${o.totalamount.toLocaleString()}</span></td>
                  <td className="text-start py-3.5 px-3 font-mono text-xs text-muted-foreground"><span dir="ltr" className="inline-block">{o.commissionamount > 0 ? `$${o.commissionamount.toFixed(2)}` : "—"}</span></td>
                  <td className="text-start py-3.5 px-3">
                    <span className="text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">{o.status}</span>
                  </td>
                  <td className="text-start py-3.5 px-3 text-muted-foreground font-mono text-xs"><span dir="ltr" className="inline-block">{formatDate(o.dateofcreation)}</span></td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPayOrder(o)}
                        title={t("tooltip_collectPayment")}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-sky-500 hover:bg-sky-500/10 transition-all"
                      >
                        <BadgeDollarSign className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setReturnOrder(o)}
                        title={t("tooltip_processReturn")}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition-all"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && (
        <div className="border-t border-border px-8 py-3.5 flex items-center justify-between shrink-0">
          <p className="text-xs text-muted-foreground font-mono">{t("pagination_showing")} {skip + 1}–{skip + orders.length}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => handlePageChange("prev")} disabled={skip === 0} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted/50 transition-all">{isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}</button>
            <span className="text-xs text-muted-foreground px-2 font-mono">{t("pagination_page")} {Math.floor(skip / PAGE_SIZE) + 1}</span>
            <button onClick={() => handlePageChange("next")} disabled={!hasMore} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted/50 transition-all">{isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</button>
          </div>
        </div>
      )}

      {payOrder && <CollectPaymentModal order={payOrder} onClose={() => setPayOrder(null)} onDone={() => setPayOrder(null)} />}
      {showCreate && <CreateDirectOrderModal onClose={() => setShowCreate(false)} onDone={() => { setShowCreate(false); setSkip(0); fetchOrders(0); }} />}
      {returnOrder && (
        <CustomerReturnModal
          orderId={returnOrder.id}
          orderCode={returnOrder.code}
          onClose={() => setReturnOrder(null)}
          onDone={() => { setReturnOrder(null); toast.success("Return processed."); }}
        />
      )}
    </div>
  );
}
