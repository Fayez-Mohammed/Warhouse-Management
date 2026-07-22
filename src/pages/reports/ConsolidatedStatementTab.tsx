import { useState } from "react";
import { Loader2, Search, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { API, authHeaders, apiFetch } from "../../lib/api";
import { useLang } from "../../lib/i18n";
import { ReportCard } from "../../components/reports/ReportCard";
import { InvoiceTable } from "../../components/reports/InvoiceTable";
import { SupplierAutocomplete } from "../../components/autocomplete/SupplierAutocomplete";
import type { Invoice } from "../../types";

interface ConsolidatedInvoice {
  invoiceid: string;
  code: number;
  date: string;
  amount: number;
  paid: number;
  remaining: number;
}

interface ConsolidatedStatement {
  statusCode: number;
  message: string;
  userid: string;
  name: string;
  totalsalesamount: number;
  totalsalespaid: number;
  totalsalesremaining: number;
  totalsupplyamount: number;
  totalsupplypaid: number;
  totalsupplyremaining: number;
  netremainingbalance: number;
  customerinvoices: ConsolidatedInvoice[];
  supplierinvoices: ConsolidatedInvoice[];
}

function mapToInvoice(r: ConsolidatedInvoice): Invoice {
  return {
    invoiceid: r.invoiceid,
    invoicecode: r.code,
    originalamount: r.amount,
    remainingamount: r.remaining,
    invoicedate: r.date,
  };
}

export function ConsolidatedStatementTab() {
  const { t } = useLang();
  const [query, setQuery] = useState("");
  const [data, setData] = useState<ConsolidatedStatement | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch(name: string) {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await apiFetch(
        `${API}/api/Reports/consolidated-statement?supplierName=${encodeURIComponent(name)}`,
        { headers: authHeaders() },
      );
      setData(await res.json());
    } catch {
      toast.error(t("error_loadFailed"));
    } finally {
      setLoading(false);
    }
  }

  function reload() {
    if (query.trim()) handleSearch(query);
  }

  const netPositive = data ? data.netremainingbalance >= 0 : false;

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* Search */}
      <div className="flex gap-3 items-end max-w-md">
        <div className="flex-1 space-y-1">
          <label className="text-xs text-muted-foreground">
            {t("lbl_supplierName")}
          </label>
          <SupplierAutocomplete
            value={query}
            onChange={(v) => setQuery(v)}
          />
        </div>
        <button
          onClick={() => handleSearch(query)}
          disabled={loading || !query.trim()}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
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
          {/* Name */}
          <p className="text-lg font-semibold text-foreground">{data.name}</p>

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <ReportCard
              label={t("rc_salesAmount")}
              value={`$${data.totalsalesamount.toLocaleString()}`}
              color="text-primary"
            />
            <ReportCard
              label={t("rc_salesPaid")}
              value={`$${data.totalsalespaid.toLocaleString()}`}
              color="text-emerald-600 dark:text-emerald-400"
            />
            <ReportCard
              label={t("rc_salesRemaining")}
              value={`$${data.totalsalesremaining.toLocaleString()}`}
              color={data.totalsalesremaining > 0 ? "text-destructive" : "text-muted-foreground"}
            />
            <ReportCard
              label={t("rc_supplyAmount")}
              value={`$${data.totalsupplyamount.toLocaleString()}`}
              color="text-amber-500"
            />
            <ReportCard
              label={t("rc_totalPaid")}
              value={`$${data.totalsupplypaid.toLocaleString()}`}
              color="text-emerald-600 dark:text-emerald-400"
            />
            <ReportCard
              label={t("rc_totalDebt")}
              value={`$${data.totalsupplyremaining.toLocaleString()}`}
              color={data.totalsupplyremaining > 0 ? "text-destructive" : "text-muted-foreground"}
            />
          </div>

          {/* Net balance */}
          <div className={`flex items-center justify-between rounded-xl border p-5 ${netPositive ? "border-emerald-500/30 bg-emerald-500/5" : "border-destructive/30 bg-destructive/5"}`}>
            <div className="flex items-center gap-3">
              {netPositive
                ? <TrendingUp className="w-5 h-5 text-emerald-500" />
                : <TrendingDown className="w-5 h-5 text-destructive" />}
              <span className="text-sm font-semibold text-foreground">
                {t("rc_netBalance")}
              </span>
            </div>
            <span
              className={`font-mono text-xl font-bold ${netPositive ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}
              dir="ltr"
            >
              ${Math.abs(data.netremainingbalance).toLocaleString()}
              {netPositive ? " ←" : " →"}
            </span>
          </div>

          {/* Invoice tables — use shared InvoiceTable for actions */}
          <InvoiceTable
            title={t("report_customerInvoices")}
            rows={data.customerinvoices.map(mapToInvoice)}
            invoiceType={1}
            recipientName={data.name}
            onPaymentDone={reload}
          />
          <InvoiceTable
            title={t("report_supplierInvoices")}
            rows={data.supplierinvoices.map(mapToInvoice)}
            invoiceType={3}
            recipientName={data.name}
            onPaymentDone={reload}
          />
        </>
      )}
    </div>
  );
}
