import { useState, useEffect, useRef } from "react";
import {
  Loader2,
  Search,
  ChevronDown,
  BarChart3,
  PackageOpen,
  TrendingUp,
  TrendingDown,
  CheckSquare,
  Square,
} from "lucide-react";
import { toast } from "sonner";
import { API, authHeaders, apiFetch } from "../../lib/api";
import { useLang } from "../../lib/i18n";
import { ReportCard } from "../../components/reports/ReportCard";
import { CategoryAutocomplete } from "../../components/autocomplete/CategoryAutocomplete";

interface LookupProduct {
  id: string;
  name: string;
}

interface ProductSummary {
  productid: string;
  productname: string;
  sku: string;
  currentstock: number;
  totalin: number;
  totalout: number;
}

interface StockMovementResult {
  groupname: string;
  totalproductscount: number;
  totalcurrentstock: number;
  totalin: number;
  totalout: number;
  totalinpurchased: number;
  totalinreturned: number;
  totalinadjusted: number;
  totalinupdatedbyemployee: number;
  totaloutsold: number;
  totaloutreturned: number;
  totaloutadjusted: number;
  totaloutupdatedbyemployee: number;
  productssummary: ProductSummary[];
}

// Default to last 30 days
function defaultDates() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export function StockMovementTab() {
  const { t } = useLang();
  const defaults = defaultDates();

  // Filter state
  const [categoryName, setCategoryName] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [products, setProducts] = useState<LookupProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [productSearch, setProductSearch] = useState("");
  const [fromDate, setFromDate] = useState(defaults.from);
  const [toDate, setToDate] = useState(defaults.to);
  const [productPanelOpen, setProductPanelOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Report state
  const [result, setResult] = useState<StockMovementResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch products when category changes
  useEffect(() => {
    if (!categoryId) {
      setProducts([]);
      setSelectedIds(new Set());
      return;
    }
    setProductsLoading(true);
    apiFetch(
      `${API}/api/Reports/lookup?CategoryId=${categoryId}&PageSize=100`,
      { headers: authHeaders() },
    )
      .then((r) => r.json())
      .then((data) => {
        const items: LookupProduct[] = data.items ?? [];
        setProducts(items);
        setSelectedIds(new Set(items.map((p) => p.id)));
      })
      .catch(() => toast.error(t("error_loadFailed")))
      .finally(() => setProductsLoading(false));
  }, [categoryId]);

  // Close panel on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setProductPanelOpen(false);
      }
    }
    if (productPanelOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [productPanelOpen]);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()),
  );

  function toggleProduct(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)));
    }
  }

  async function handleRunReport() {
    setLoading(true);
    setResult(null);
    try {
      const body: Record<string, unknown> = {
        fromdate: fromDate ? new Date(fromDate).toISOString() : undefined,
        todate: toDate ? new Date(toDate + "T23:59:59").toISOString() : undefined,
      };
      if (categoryId) body.categoryid = categoryId;
      if (selectedIds.size > 0 && products.length > 0) {
        body.productids = Array.from(selectedIds);
      }

      const res = await apiFetch(`${API}/api/Reports/stock-movement-advanced`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.statusCode === 200 || data.productssummary) {
        setResult(data);
      } else {
        toast.error(data.message || t("error_loadFailed"));
      }
    } catch {
      toast.error(t("error_loadFailed"));
    } finally {
      setLoading(false);
    }
  }

  const allSelected = products.length > 0 && selectedIds.size === products.length;

  const productButtonLabel = () => {
    if (!categoryId) return t("sm_allProducts");
    if (productsLoading) return "…";
    if (products.length === 0) return t("sm_allProducts");
    if (selectedIds.size === 0) return t("sm_allProducts");
    if (selectedIds.size === products.length) return t("sm_allProducts");
    return `${selectedIds.size} ${t("sm_productsSelected")}`;
  };

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* ── Filter Panel ─────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          {t("tab_stockMovement")}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {t("sm_filterCategory")}
            </label>
            <CategoryAutocomplete
              value={categoryName}
              onChange={(name, id) => {
                setCategoryName(name);
                if (id) {
                  setCategoryId(id);
                  setSelectedIds(new Set());
                  setProductSearch("");
                } else if (!name) {
                  setCategoryId("");
                  setProducts([]);
                  setSelectedIds(new Set());
                }
              }}
              placeholder={t("sm_allProducts")}
            />
          </div>

          {/* Product multi-select */}
          <div className="space-y-1.5" ref={panelRef}>
            <label className="text-xs font-medium text-muted-foreground">
              {t("sm_filterProducts")}
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => categoryId && setProductPanelOpen((v) => !v)}
                disabled={!categoryId || productsLoading}
                className="w-full flex items-center justify-between gap-2 bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-start text-foreground disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
              >
                <span className={selectedIds.size > 0 && selectedIds.size < products.length ? "text-primary font-medium" : "text-muted-foreground"}>
                  {productsLoading ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      {t("sm_allProducts")}
                    </span>
                  ) : (
                    productButtonLabel()
                  )}
                </span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${productPanelOpen ? "rotate-180" : ""}`} />
              </button>

              {productPanelOpen && products.length > 0 && (
                <div className="absolute z-50 top-full mt-1 w-full bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                  {/* Search */}
                  <div className="p-2 border-b border-border">
                    <div className="relative">
                      <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder={t("sm_searchProducts")}
                        className="w-full bg-input-background border border-border rounded-lg ps-8 pe-3 py-1.5 text-xs focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                      />
                    </div>
                  </div>
                  {/* Select All */}
                  <button
                    type="button"
                    onClick={toggleAll}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-primary hover:bg-muted/40 transition-colors border-b border-border/50"
                  >
                    {allSelected ? (
                      <CheckSquare className="w-3.5 h-3.5" />
                    ) : (
                      <Square className="w-3.5 h-3.5" />
                    )}
                    {allSelected ? t("sm_deselectAll") : t("sm_selectAll")}
                  </button>
                  {/* Product list */}
                  <ul className="max-h-48 overflow-y-auto">
                    {filteredProducts.length === 0 ? (
                      <li className="px-3 py-3 text-xs text-muted-foreground text-center">
                        {t("sm_noProductsInCategory")}
                      </li>
                    ) : (
                      filteredProducts.map((p) => (
                        <li key={p.id}>
                          <button
                            type="button"
                            onClick={() => toggleProduct(p.id)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/40 transition-colors"
                          >
                            {selectedIds.has(p.id) ? (
                              <CheckSquare className="w-3.5 h-3.5 text-primary shrink-0" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            )}
                            <span className="text-start text-foreground">{p.name}</span>
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* From date */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {t("date_from")}
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>

          {/* To date */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {t("date_to")}
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>
        </div>

        {/* Run Report */}
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-muted-foreground">
            {categoryId && products.length > 0
              ? `${selectedIds.size === products.length || selectedIds.size === 0 ? products.length : selectedIds.size} / ${products.length} ${t("sm_productsSelected")}`
              : t("sm_allProducts")}
          </p>
          <button
            onClick={handleRunReport}
            disabled={loading}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <BarChart3 className="w-4 h-4" />
            )}
            {t("sm_runReport")}
          </button>
        </div>
      </div>

      {/* ── Loading ─────────────────────────────────── */}
      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-7 h-7 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* ── Results ─────────────────────────────────── */}
      {!loading && result && (
        <div className="space-y-6">
          {/* Group name header */}
          <div className="flex items-center gap-3">
            <PackageOpen className="w-5 h-5 text-primary shrink-0" />
            <h2 className="text-lg font-semibold text-foreground">
              {result.groupname}
            </h2>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <ReportCard
              label={t("sm_totalProducts")}
              value={result.totalproductscount}
              color="text-primary"
            />
            <ReportCard
              label={t("rc_currentStock")}
              value={result.totalcurrentstock}
              color="text-primary"
            />
            <ReportCard
              label={t("rc_totalIn")}
              value={result.totalin}
              color="text-emerald-600 dark:text-emerald-400"
            />
            <ReportCard
              label={t("rc_totalOut")}
              value={result.totalout}
              color="text-destructive"
            />
          </div>

          {/* IN / OUT breakdown panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* IN breakdown */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-1">
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4" />
                {t("report_stockInBreakdown")}
              </p>
              {[
                { label: t("sm_purchased"), val: result.totalinpurchased },
                { label: t("sm_returnedFromSales"), val: result.totalinreturned },
                { label: t("sm_adjustedPlus"), val: result.totalinadjusted },
                { label: t("sm_updatedByEmployee"), val: result.totalinupdatedbyemployee },
              ].map((r) => (
                <div
                  key={r.label}
                  className="flex justify-between items-center py-2.5 border-b border-border/40 last:border-0"
                >
                  <span className="text-sm text-muted-foreground">{r.label}</span>
                  <span className="font-mono text-sm font-semibold text-foreground">
                    <span dir="ltr" className="inline-block">{r.val.toLocaleString()}</span>
                  </span>
                </div>
              ))}
            </div>

            {/* OUT breakdown */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-1">
              <p className="text-sm font-semibold text-destructive flex items-center gap-2 mb-3">
                <TrendingDown className="w-4 h-4" />
                {t("report_stockOutBreakdown")}
              </p>
              {[
                { label: t("sm_sold"), val: result.totaloutsold },
                { label: t("sm_returnedToSupplier"), val: result.totaloutreturned },
                { label: t("sm_adjustedMinus"), val: result.totaloutadjusted },
                { label: t("sm_updatedByEmployee"), val: result.totaloutupdatedbyemployee },
              ].map((r) => (
                <div
                  key={r.label}
                  className="flex justify-between items-center py-2.5 border-b border-border/40 last:border-0"
                >
                  <span className="text-sm text-muted-foreground">{r.label}</span>
                  <span className="font-mono text-sm font-semibold text-foreground">
                    <span dir="ltr" className="inline-block">{r.val.toLocaleString()}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Per-product table */}
          {result.productssummary.length > 0 && (
            <div className="bg-card border border-border rounded-2xl overflow-x-auto">
              <div className="px-5 py-4 border-b border-border">
                <p className="text-sm font-semibold text-foreground">
                  {t("col_product")} ({result.productssummary.length})
                </p>
              </div>
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {[
                      { key: "name", label: t("col_product") },
                      { key: "sku", label: t("col_sku") },
                      { key: "stock", label: t("rc_currentStock") },
                      { key: "in", label: t("rc_totalIn") },
                      { key: "out", label: t("rc_totalOut") },
                    ].map((h) => (
                      <th
                        key={h.key}
                        className="text-start px-4 py-3 text-xs font-medium text-muted-foreground tracking-wider"
                      >
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.productssummary.map((p) => (
                    <tr
                      key={p.productid}
                      className="border-b border-border/40 hover:bg-muted/20 transition-colors last:border-0"
                    >
                      <td className="text-start px-4 py-3 font-medium text-foreground">
                        {p.productname}
                      </td>
                      <td className="text-start px-4 py-3 font-mono text-xs text-muted-foreground">
                        <span dir="ltr" className="inline-block">{p.sku || "—"}</span>
                      </td>
                      <td className="text-start px-4 py-3 font-mono text-sm font-semibold text-primary">
                        <span dir="ltr" className="inline-block">{p.currentstock.toLocaleString()}</span>
                      </td>
                      <td className="text-start px-4 py-3 font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        <span dir="ltr" className="inline-block">+{p.totalin.toLocaleString()}</span>
                      </td>
                      <td className="text-start px-4 py-3 font-mono text-sm font-semibold text-destructive">
                        <span dir="ltr" className="inline-block">-{p.totalout.toLocaleString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
