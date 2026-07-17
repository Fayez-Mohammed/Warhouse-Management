import { useState, useEffect } from "react";
import { Loader2, Search } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { toast } from "sonner";
import { API, authHeaders, apiFetch } from "../../lib/api";
import { useLang } from "../../lib/i18n";
import { ReportCard } from "../../components/reports/ReportCard";

export function SalesReportTab() {
  const { t } = useLang();
  const defaultFrom = new Date(Date.now() - 30 * 86400000)
    .toISOString()
    .slice(0, 10);
  const defaultTo = new Date().toISOString().slice(0, 10);
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [data, setData] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetch_() {
    setLoading(true);
    try {
      let url = `${API}/api/Reports/Full-sales-report`;
      if (from && to)
        url += `?fromDate=${encodeURIComponent(new Date(from).toISOString())}&toDate=${encodeURIComponent(new Date(to).toISOString())}`;
      const res = await apiFetch(url, {
        headers: authHeaders(),
      });
      setData(await res.json());
    } catch {
      toast.error("Failed to load sales report.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetch_();
  }, []); // eslint-disable-line

  const inputCls =
    "bg-input-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all";

  type DailyEntry = {
    date: string;
    revenue: number;
    profit: number;
    ordercount: number;
  };
  type RankEntry = {
    name: string;
    totalvalue: number;
    count: number;
  };
  const trend = (data?.dailytrend as DailyEntry[]) ?? [];
  const topProds =
    (data?.topsellingproducts as RankEntry[]) ?? [];
  const topCust = (data?.topcustomers as RankEntry[]) ?? [];
  const chartData = trend.map((d, i) => ({
    id: i,
    date: d.date.slice(0, 10),
    revenue: d.revenue,
    profit: d.profit,
  }));

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <div className="flex items-end gap-3 flex-wrap">
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">
            {t("date_from")}
          </label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className={inputCls}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">
            {t("date_to")}
          </label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className={inputCls}
          />
        </div>
        <button
          onClick={fetch_}
          disabled={loading}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg transition-all"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          {t("btn_apply")}
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <ReportCard
              label={t("rc_totalOrders")}
              value={(data.totalorders as number) ?? 0}
            />
            <ReportCard
              label={t("rc_revenue")}
              value={`$${((data.totalrevenue as number) ?? 0).toLocaleString()}`}
              color="text-emerald-600 dark:text-emerald-400"
            />
            <ReportCard
              label={t("rc_totalCost")}
              value={`$${((data.totalcost as number) ?? 0).toLocaleString()}`}
              color="text-muted-foreground"
            />
            <ReportCard
              label={t("rc_netProfit")}
              value={`$${((data.netprofit as number) ?? 0).toLocaleString()}`}
              color="text-primary"
            />
            <ReportCard
              label={t("rc_profitMargin")}
              value={`${(data.profitmargin as number) ?? 0}%`}
              color={
                (data.profitmargin as number) > 20
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-500"
              }
            />
          </div>

          {chartData.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-sm font-semibold text-foreground mb-4">
                {t("report_dailyTrend")}
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart
                  data={chartData}
                  margin={{
                    top: 4,
                    right: 8,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid
                    key="grid"
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                  />
                  <XAxis
                    key="xaxis"
                    dataKey="date"
                    tick={{
                      fontSize: 11,
                      fill: "var(--muted-foreground)",
                    }}
                  />
                  <YAxis
                    key="yaxis"
                    tick={{
                      fontSize: 11,
                      fill: "var(--muted-foreground)",
                    }}
                  />
                  <Tooltip
                    key="tooltip"
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Line
                    key="revenue"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    name={t("chart_revenue")}
                  />
                  <Line
                    key="profit"
                    type="monotone"
                    dataKey="profit"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    name={t("chart_profit")}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topProds.length > 0 && (
              <div className="bg-card border border-border rounded-xl overflow-x-auto">
                <div className="px-5 py-3.5 border-b border-border">
                  <p className="text-sm font-semibold text-foreground">
                    {t("report_topProducts")}
                  </p>
                </div>
                <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      {[
                        t("col_product"),
                        t("col_value"),
                        t("col_units"),
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-start py-2.5 px-4 text-xs font-medium text-muted-foreground font-mono"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {topProds.map((p, i) => (
                      <tr
                        key={i}
                        className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                      >
                        <td className="text-start py-3 px-4 font-medium text-foreground">
                          {p.name}
                        </td>
                        <td className="text-start py-3 px-4 font-mono text-sm text-emerald-600 dark:text-emerald-400">
                          <span
                            dir="ltr"
                            className="inline-block"
                          >
                            ${p.totalvalue.toLocaleString()}
                          </span>
                        </td>
                        <td className="text-start py-3 px-4 font-mono text-sm text-muted-foreground">
                          <span
                            dir="ltr"
                            className="inline-block"
                          >
                            {p.count}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            )}
            {topCust.length > 0 && (
              <div className="bg-card border border-border rounded-xl overflow-x-auto">
                <div className="px-5 py-3.5 border-b border-border">
                  <p className="text-sm font-semibold text-foreground">
                    {t("report_topCustomers")}
                  </p>
                </div>
                <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      {[
                        t("col_customer"),
                        t("col_value"),
                        t("col_orders"),
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-start py-2.5 px-4 text-xs font-medium text-muted-foreground font-mono"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {topCust.map((c, i) => (
                      <tr
                        key={i}
                        className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                      >
                        <td className="text-start py-3 px-4 font-medium text-foreground">
                          {c.name}
                        </td>
                        <td className="text-start py-3 px-4 font-mono text-sm text-emerald-600 dark:text-emerald-400">
                          <span
                            dir="ltr"
                            className="inline-block"
                          >
                            ${c.totalvalue.toLocaleString()}
                          </span>
                        </td>
                        <td className="text-start py-3 px-4 font-mono text-sm text-muted-foreground">
                          <span
                            dir="ltr"
                            className="inline-block"
                          >
                            {c.count}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}