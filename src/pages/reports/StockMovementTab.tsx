import { useState } from "react";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { API, authHeaders, apiFetch } from "../../lib/api";
import { useLang } from "../../lib/i18n";
import { ReportCard } from "../../components/reports/ReportCard";
import { ProductNameAutocomplete } from "../../components/autocomplete/ProductNameAutocomplete";

export function StockMovementTab() {
  const { t } = useLang();
  const [query, setQuery] = useState("");
  const [data, setData] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch(name: string) {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await apiFetch(
        `${API}/api/Reports/stock-movement?productName=${encodeURIComponent(name)}`,
        { headers: authHeaders() },
      );
      setData(await res.json());
    } catch {
      toast.error("Failed to load stock movement.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <div className="flex gap-3 items-end max-w-md">
        <div className="flex-1 space-y-1">
          <label className="text-xs text-muted-foreground">
            {t("lbl_productName")}
          </label>
          <ProductNameAutocomplete
            value={query}
            onChange={(v) => {
              setQuery(v);
            }}
          />
        </div>
        <button
          onClick={() => handleSearch(query)}
          disabled={loading || !query.trim()}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg transition-all"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          {t("btn_search")}
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && data && (
        <>
          <div className="flex items-center gap-3">
            <p className="text-lg font-semibold text-foreground">
              {data.productname as string}
            </p>
            <span
              className="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded"
              dir="ltr"
            >
              {t("lbl_current")}: {data.currentstock as number}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <ReportCard
              label={t("rc_currentStock")}
              value={data.currentstock as number}
              color="text-primary"
            />
            <ReportCard
              label={t("rc_totalIn")}
              value={data.totalin as number}
              color="text-emerald-600 dark:text-emerald-400"
            />
            <ReportCard
              label={t("rc_totalOut")}
              value={data.totalout as number}
              color="text-destructive"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl p-5 space-y-3">
              <p className="text-sm font-semibold text-foreground text-emerald-600 dark:text-emerald-400">
                {t("report_stockInBreakdown")}
              </p>
              {[
                {
                  label: t("sm_purchased"),
                  val: data.totalinpurchased as number,
                },
                {
                  label: t("sm_returnedFromSales"),
                  val: data.totalinreturned as number,
                },
                {
                  label: t("sm_adjustedPlus"),
                  val: data.totalinadjusted as number,
                },
                {
                  label: t("sm_updatedByEmployee"),
                  val: data.totalinupdatedbyemployee as number,
                },
              ].map((r) => (
                <div
                  key={r.label}
                  className="flex justify-between items-center py-2 border-b border-border/40 last:border-0"
                >
                  <span className="text-sm text-muted-foreground">
                    {r.label}
                  </span>
                  <span className="font-mono text-sm font-semibold text-foreground">
                    <span dir="ltr" className="inline-block">
                      {r.val}
                    </span>
                  </span>
                </div>
              ))}
            </div>
            <div className="bg-card border border-border rounded-xl p-5 space-y-3">
              <p className="text-sm font-semibold text-destructive">
                {t("report_stockOutBreakdown")}
              </p>
              {[
                {
                  label: t("sm_sold"),
                  val: data.totaloutsold as number,
                },
                {
                  label: t("sm_adjustedMinus"),
                  val: data.totaloutadjusted as number,
                },
                {
                  label: t("sm_updatedByEmployee"),
                  val: data.totaloutupdatedbyemployee as number,
                },
                {
                  label: t("sm_returnedToSupplier"),
                  val: data.totaloutreturned as number,
                },
              ].map((r) => (
                <div
                  key={r.label}
                  className="flex justify-between items-center py-2 border-b border-border/40 last:border-0"
                >
                  <span className="text-sm text-muted-foreground">
                    {r.label}
                  </span>
                  <span className="font-mono text-sm font-semibold text-foreground">
                    <span dir="ltr" className="inline-block">
                      {r.val}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}