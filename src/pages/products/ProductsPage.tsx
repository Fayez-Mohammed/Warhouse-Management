import {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import {
  Package,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { API, authHeaders, apiFetch } from "../../lib/api";
import { useLang } from "../../lib/i18n";
import { ProductCreateModal } from "./ProductCreateModal";
import { ProductEditModal } from "./ProductEditModal";
import { StockInModal } from "./StockInModal";
import { ProductDeleteModal } from "./ProductDeleteModal";
import { ReturnToSupplierModal } from "./ReturnToSupplierModal";
import type { Product, ProductAutocomplete } from "../../types";

type ProductModalState =
  | { type: "create" }
  | { type: "edit"; product: Product }
  | { type: "stockin" }
  | { type: "return-supplier" }
  | { type: "delete"; product: Product };

const PAGE_SIZE = 10;

export function ProductsPage() {
  const { t, isRTL } = useLang();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<
    ProductAutocomplete[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [modal, setModal] = useState<ProductModalState | null>(
    null,
  );
  const searchRef = useRef<HTMLDivElement>(null);
  const acTimer = useRef<ReturnType<typeof setTimeout>>();

  const fetchProducts = useCallback(async (s = 0) => {
    setLoading(true);
    try {
      const res = await apiFetch(
        `${API}/api/Inventory/GetAllproducts?skip=${s}&take=${PAGE_SIZE}`,
        { headers: authHeaders() },
      );
      const data = await res.json();
      const items: Product[] = data.value ?? [];
      setProducts(items);
      setHasMore(items.length === PAGE_SIZE);
    } catch {
      toast.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(0);
  }, [fetchProducts]);

  useEffect(() => {
    clearTimeout(acTimer.current);
    if (!search.trim()) {
      setSuggestions([]);
      return;
    }
    acTimer.current = setTimeout(async () => {
      try {
        const res = await apiFetch(
          `${API}/api/Inventory/autocomplete?term=${encodeURIComponent(search)}`,
          { headers: authHeaders() },
        );
        const data = await res.json();
        setSuggestions(data.value ?? []);
        setShowSuggestions(true);
      } catch {
        /* silent */
      }
    }, 280);
  }, [search]);

  useEffect(() => {
    function h(e: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target as Node)
      )
        setShowSuggestions(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  async function handleSearchSelect(name: string) {
    setSearch(name);
    setShowSuggestions(false);
    setLoading(true);
    try {
      const res = await apiFetch(
        `${API}/api/Inventory/products?productName=${encodeURIComponent(name)}`,
        { headers: authHeaders() },
      );
      const data = await res.json();
      setProducts(data.value ?? []);
    } catch {
      toast.error("Search failed.");
    } finally {
      setLoading(false);
    }
  }

  // Clear search and reset pagination
  function clearSearch() {
    setSearch("");
    setSuggestions([]);
    setSkip(0);
    fetchProducts(0);
  }

  function handlePageChange(dir: "prev" | "next") {
    const s =
      dir === "next"
        ? skip + PAGE_SIZE
        : Math.max(0, skip - PAGE_SIZE);
    setSkip(s);
    fetchProducts(s);
  }

  function afterMutation() {
    setModal(null);
    setSkip(0);
    fetchProducts(0);
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background/50">
      {/* Header */}
      <div className="border-b border-border px-8 py-5 flex items-center justify-between shrink-0 bg-background">
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            {t("products_title")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("products_subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setModal({ type: "return-supplier" })
            }
            className="flex items-center gap-2 border border-border text-amber-500 border-amber-500/30 text-sm font-medium px-4 py-2 rounded-lg hover:bg-amber-500/10 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            {t("btn_returnSupplier")}
          </button>
          <button
            onClick={() => setModal({ type: "stockin" })}
            className="flex items-center gap-2 border border-border text-foreground text-sm font-medium px-4 py-2 rounded-lg hover:bg-muted/50 transition-all"
          >
            <ArrowRight className="w-4 h-4 rotate-90" />
            {t("btn_stockIn")}
          </button>
          <button
            onClick={() => setModal({ type: "create" })}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            {t("btn_addProducts")}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-8 py-4 border-b border-border shrink-0 bg-background">
        <div className="relative max-w-sm" ref={searchRef}>
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() =>
              suggestions.length > 0 && setShowSuggestions(true)
            }
            placeholder={t("search_productName")}
            className="w-full bg-input-background border border-border rounded-lg ps-9 pe-9 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
          />
          {search && (
            <button
              onClick={clearSearch}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-card border border-border rounded-lg shadow-2xl z-50 overflow-hidden">
              {suggestions.map((s) => (
                <button
                  key={s.productid}
                  onClick={() => handleSearchSelect(s.name)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-start hover:bg-muted/50 transition-colors"
                >
                  <span
                    className="font-mono text-xs text-muted-foreground w-6"
                    dir="ltr"
                  >
                    #{s.code}
                  </span>
                  <span className="text-foreground">
                    {s.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table Container with White Card Design */}
      <div className="flex-1 overflow-auto px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : products.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-24 flex flex-col items-center justify-center gap-3 shadow-sm">
            <Package className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-muted-foreground text-sm">
              {t("empty_products")}
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/10">
                  {[
                    { key: "col_code", label: t("col_code") },
                    {
                      key: "col_product",
                      label: t("col_product"),
                    },
                    {
                      key: "col_category",
                      label: t("col_category"),
                    },
                    {
                      key: "col_salePrice",
                      label: t("col_salePrice"),
                    },
                    {
                      key: "col_buyPrice",
                      label: t("col_buyPrice"),
                    },
                    { key: "col_qty", label: t("col_qty") },
                    { key: "col_sku", label: t("col_sku") },
                  ].map((h) => (
                    <th
                      key={h.key}
                      className="text-start py-3.5 px-5 text-xs font-semibold text-muted-foreground font-mono tracking-wider"
                    >
                      {h.label}
                    </th>
                  ))}
                  <th className="py-3.5 px-5 w-16" />
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr
                    key={p.productid}
                    className={`border-b border-border/50 hover:bg-muted/20 transition-colors group ${i === products.length - 1 ? "border-b-0" : ""}`}
                  >
                    <td className="text-start py-3.5 px-5">
                      <span
                        className="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded"
                        dir="ltr"
                      >
                        #{p.code}
                      </span>
                    </td>
                    <td className="text-start py-3.5 px-5 font-medium text-foreground max-w-[160px] truncate">
                      {p.productname}
                    </td>
                    <td className="text-start py-3.5 px-5 text-muted-foreground text-xs">
                      {p.categoryname}
                    </td>
                    <td className="text-start py-3.5 px-5 font-mono text-sm text-emerald-600 dark:text-emerald-400">
                      <span dir="ltr" className="inline-block">
                        ${p.saleprice.toLocaleString()}
                      </span>
                    </td>
                    <td className="text-start py-3.5 px-5 font-mono text-sm text-muted-foreground">
                      <span dir="ltr" className="inline-block">
                        ${p.buyprice.toLocaleString()}
                      </span>
                    </td>
                    <td className="text-start py-3.5 px-5">
                      <span
                        className={`font-mono text-sm font-semibold ${p.quantity <= 10 ? "text-amber-500" : "text-foreground"}`}
                      >
                        {p.quantity}
                      </span>
                      {p.quantity <= 10 && (
                        <AlertTriangle className="inline w-3 h-3 text-amber-500 mx-1" />
                      )}
                    </td>
                    <td className="text-start py-3.5 px-5 font-mono text-xs text-muted-foreground">
                      {p.sku?.trim() || "—"}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        <button
                          onClick={() =>
                            setModal({
                              type: "edit",
                              product: p,
                            })
                          }
                          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setModal({
                              type: "delete",
                              product: p,
                            })
                          }
                          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && !search && (
        <div className="border-t border-border px-8 py-3.5 flex items-center justify-between shrink-0 bg-background">
          <p className="text-xs text-muted-foreground font-mono">
            {t("pagination_showing")} {skip + 1}–
            {skip + products.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange("prev")}
              disabled={skip === 0}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted/50 transition-all"
            >
              {isRTL ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
            <span className="text-xs text-muted-foreground px-2 font-mono">
              {t("pagination_page")}{" "}
              {Math.floor(skip / PAGE_SIZE) + 1}
            </span>
            <button
              onClick={() => handlePageChange("next")}
              disabled={!hasMore}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted/50 transition-all"
            >
              {isRTL ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}

      {modal?.type === "create" && (
        <ProductCreateModal
          onClose={() => setModal(null)}
          onDone={afterMutation}
        />
      )}
      {modal?.type === "edit" && (
        <ProductEditModal
          product={modal.product}
          onClose={() => setModal(null)}
          onDone={afterMutation}
        />
      )}
      {modal?.type === "stockin" && (
        <StockInModal
          onClose={() => setModal(null)}
          onDone={afterMutation}
        />
      )}
      {modal?.type === "return-supplier" && (
        <ReturnToSupplierModal
          onClose={() => setModal(null)}
          onDone={afterMutation}
        />
      )}
      {modal?.type === "delete" && (
        <ProductDeleteModal
          product={modal.product}
          onClose={() => setModal(null)}
          onDone={afterMutation}
        />
      )}
    </div>
  );
}