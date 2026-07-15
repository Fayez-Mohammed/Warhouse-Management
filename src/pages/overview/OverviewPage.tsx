import { useState, useEffect, useCallback } from "react";
import { Loader2, TrendingUp, DollarSign, ShoppingCart, AlertTriangle, Calendar, Package } from "lucide-react";
import { toast } from "sonner";
import { API, authHeaders, apiFetch } from "../../lib/api";
import { useLang } from "../../lib/i18n";
import { StatCard } from "../../components/StatCard";
import type { DashboardStats, DashboardPeriod } from "../../types";

const PERIODS: { value: DashboardPeriod; labelKey: string }[] = [
  { value: "Today", labelKey: "period_today" },
  { value: "ThisWeek", labelKey: "period_week" },
  { value: "ThisMonth", labelKey: "period_month" },
  { value: "Custom", labelKey: "period_custom" },
];

export function OverviewPage() {
  const { t } = useLang();
  const [period, setPeriod] = useState<DashboardPeriod>("Today");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async (p: DashboardPeriod, from?: string, to?: string) => {
    setLoading(true);
    try {
      let url = `${API}/api/Dashboard/stats?period=${p}`;
      if (p === "Custom" && from && to) {
        url += `&fromDate=${encodeURIComponent(new Date(from).toISOString())}&toDate=${encodeURIComponent(new Date(to).toISOString())}`;
      }
      const res = await apiFetch(url, { headers: authHeaders() });
      const data = await res.json();
      setStats(data);
    } catch { toast.error("Failed to load dashboard stats."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (period !== "Custom") fetchStats(period);
  }, [period, fetchStats]);

  function handleCustomApply() {
    if (fromDate && toDate) fetchStats("Custom", fromDate, toDate);
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <div className="border-b border-border px-8 py-5 flex items-start justify-between shrink-0 gap-4 flex-wrap">
        <div>
          <h1 className="text-lg font-semibold text-foreground">{t("overview_title")}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{t("overview_subtitle")}</p>
        </div>
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 border border-border">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${period === p.value ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t(p.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {period === "Custom" && (
        <div className="px-8 py-4 border-b border-border flex items-end gap-3 flex-wrap shrink-0">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3 h-3" />{t("date_from")}</label>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="bg-input-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3 h-3" />{t("date_to")}</label>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="bg-input-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all" />
          </div>
          <button onClick={handleCustomApply} disabled={!fromDate || !toDate} className="bg-primary hover:bg-primary/90 disabled:opacity-40 text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg transition-all">
            {t("btn_apply")}
          </button>
        </div>
      )}

      <div className="flex-1 px-8 py-6 space-y-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                label={t("stat_totalSales")}
                value={`$${stats.totalsales.toLocaleString()}`}
                icon={<DollarSign className="w-5 h-5" />}
                color="text-emerald-500"
                bg="bg-emerald-500/10"
              />
              <StatCard
                label={t("stat_totalProfit")}
                value={`$${stats.totalprofit.toLocaleString()}`}
                icon={<TrendingUp className="w-5 h-5" />}
                color="text-primary"
                bg="bg-primary/10"
              />
              <StatCard
                label={t("stat_approvedOrders")}
                value={stats.approvedorderscount.toLocaleString()}
                icon={<ShoppingCart className="w-5 h-5" />}
                color="text-accent"
                bg="bg-accent/10"
              />
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <h3 className="text-sm font-semibold text-foreground">{t("lowStock_title")}</h3>
                </div>
                <span className="text-xs font-mono bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  {stats.lowstockproducts.length} {t("unit_items")}
                </span>
              </div>
              {stats.lowstockproducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center"><Package className="w-5 h-5 text-emerald-500" /></div>
                  <p className="text-sm text-muted-foreground">{t("lowStock_allGood")}</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-start py-3 px-5 text-xs font-medium text-muted-foreground font-mono tracking-wider">{t("col_code")}</th>
                      <th className="text-start py-3 px-5 text-xs font-medium text-muted-foreground font-mono tracking-wider">{t("col_product")}</th>
                      <th className="text-start py-3 px-5 text-xs font-medium text-muted-foreground font-mono tracking-wider">{t("col_sku")}</th>
                      <th className="text-end py-3 px-5 text-xs font-medium text-muted-foreground font-mono tracking-wider">{t("col_qty")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.lowstockproducts.map((p, i) => (
                      <tr key={p.productid} className={`border-b border-border/30 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                        <td className="text-start py-3.5 px-5">
                          <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded" dir="ltr">#{p.productcode}</span>
                        </td>
                        <td className="text-start py-3.5 px-5 font-medium text-foreground">{p.productname}</td>
                        <td className="text-start py-3.5 px-5 text-muted-foreground font-mono text-xs">{p.sku?.trim() || "—"}</td>
                        <td className="text-end py-3.5 px-5">
                          <span className={`font-mono text-sm font-semibold ${p.currentquantity <= 5 ? "text-destructive" : "text-amber-500"}`}>
                            {p.currentquantity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
