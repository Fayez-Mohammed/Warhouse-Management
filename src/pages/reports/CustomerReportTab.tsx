import { useState } from "react";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { API, authHeaders, apiFetch } from "../../lib/api";
import { formatDate } from "../../lib/utils";
import { useLang } from "../../lib/i18n";
import { ReportCard } from "../../components/reports/ReportCard";
import { InvoiceTable } from "../../components/reports/InvoiceTable";
import { PersonAutocomplete } from "../../components/autocomplete/PersonAutocomplete";
import type { Invoice } from "../../types";

export function CustomerReportTab() {
  const { t } = useLang();
  const [query, setQuery] = useState("");
  const [data, setData] = useState<Record<string,unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch(name: string) {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await apiFetch(`${API}/api/Reports/customer-report?customerName=${encodeURIComponent(name)}`, { headers: authHeaders() });
      setData(await res.json());
    } catch { toast.error("Failed to load customer report."); }
    finally { setLoading(false); }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex gap-3 items-end max-w-md">
        <div className="flex-1 space-y-1">
          <label className="text-xs text-muted-foreground">{t("lbl_customerName")}</label>
          <PersonAutocomplete value={query} onChange={v => setQuery(v)} endpoint="/api/Orders/customers/autocomplete" placeholder={t("placeholder_searchCustomer")} />
        </div>
        <button onClick={() => handleSearch(query)} disabled={loading || !query.trim()} className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg transition-all">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}{t("btn_search")}
        </button>
      </div>

      {loading && <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>}

      {!loading && data && (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-lg font-semibold text-foreground">{data.customername as string}</p>
            <span className="text-xs text-muted-foreground font-mono" dir="ltr">{data.phonenumber as string}</span>
            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground" dir="ltr">#{data.usernumber as number}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ReportCard label={t("rc_orders")}        value={data.totalorderscount as number} />
            <ReportCard label={t("rc_totalSales")}   value={`$${(data.totalsalesamount as number).toLocaleString()}`}  color="text-emerald-600 dark:text-emerald-400" />
            <ReportCard label={t("rc_totalPaid")}    value={`$${(data.totalpaid as number).toLocaleString()}`}         color="text-primary" />
            <ReportCard label={t("rc_totalDebt")}    value={`$${(data.totaldebt as number).toLocaleString()}`}         color="text-destructive" />
            <ReportCard label={t("rc_returns")}       value={data.totalreturnscount as number} />
            <ReportCard label={t("rc_returnsAmt")}   value={`$${(data.totalreturnsamount as number).toLocaleString()}`} color="text-amber-500" />
            <ReportCard label={t("rc_unpaidReturns")}value={`$${(data.totalremainingunpaidreturns as number).toLocaleString()}`} color="text-amber-500" />
            <ReportCard label={t("rc_netDebt")}      value={`$${(data.totalnetdebt as number).toLocaleString()}`}      color="text-destructive" sub={`${t("report_lastOrder")}: ${formatDate(data.lastorderdate as string)}`} />
          </div>
          <InvoiceTable title={t("report_unpaidInvoices")} rows={(data.unpaidinvoices as Invoice[]) ?? []} />
          <InvoiceTable title={t("report_unpaidReturns")}  rows={(data.unpaidreturns  as Invoice[]) ?? []} />
        </>
      )}
    </div>
  );
}
