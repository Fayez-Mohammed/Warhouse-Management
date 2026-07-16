import { useState, useRef, useEffect, useCallback } from "react";
import { Tag, Plus, Search, Pencil, Trash2, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { API, authHeaders, apiFetch } from "../../lib/api";
import { useLang } from "../../lib/i18n";
import { formatDate } from "../../lib/utils";
import { CategoryModal } from "./CategoryModal";
import { CategoryDeleteModal } from "./CategoryDeleteModal";
import type { Category, AutocompleteItem } from "../../types";

interface ModalState {
    type: "create" | "edit" | "delete";
    category?: Category;
}

const PAGE_SIZE = 10;

export function CategoriesPage() {
    const { t, isRTL } = useLang();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [skip, setSkip] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [search, setSearch] = useState("");
    const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [modal, setModal] = useState<ModalState | null>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    const acTimer = useRef<ReturnType<typeof setTimeout>>();

    const fetchCategories = useCallback(async (s = 0) => {
        setLoading(true);
        try {
            const res = await apiFetch(`${API}/api/Categories/GetAllCategories?skip=${s}&take=${PAGE_SIZE}`, { headers: authHeaders() });
            const data = await res.json();
            const items: Category[] = data.value ?? [];
            setCategories(items);
            setHasMore(items.length === PAGE_SIZE);
        } catch { toast.error("Failed to load categories."); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchCategories(0); }, [fetchCategories]);

    useEffect(() => {
        clearTimeout(acTimer.current);
        if (!search.trim()) { setSuggestions([]); return; }
        acTimer.current = setTimeout(async () => {
            try {
                const res = await apiFetch(`${API}/api/Categories/autocomplete?term=${encodeURIComponent(search)}`, { headers: authHeaders() });
                const data = await res.json();
                setSuggestions(data.value ?? []);
                setShowSuggestions(true);
            } catch { /* silent */ }
        }, 280);
    }, [search]);

    useEffect(() => {
        function handler(e: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSuggestions(false);
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    async function handleSearchSelect(name: string) {
        setSearch(name);
        setShowSuggestions(false);
        setLoading(true);
        try {
            const res = await apiFetch(`${API}/api/Categories/GetCategoryByName?name=${encodeURIComponent(name)}`, { headers: authHeaders() });
            const data = await res.json();
            if (data.id) setCategories([data as Category]);
            else toast.error("Category not found.");
        } catch { toast.error("Search failed."); }
        finally { setLoading(false); }
    }

    function clearSearch() {
        setSearch("");
        setSuggestions([]);
        setSkip(0);
        fetchCategories(0);
    }

    function handlePageChange(dir: "prev" | "next") {
        const newSkip = dir === "next" ? skip + PAGE_SIZE : Math.max(0, skip - PAGE_SIZE);
        setSkip(newSkip);
        fetchCategories(newSkip);
    }

    function afterMutation() {
        setModal(null);
        setSkip(0);
        fetchCategories(0);
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-background/50">
            {/* رأس الصفحة والمكونات العلوية */}
            <div className="border-b border-border px-8 py-5 flex items-center justify-between shrink-0 bg-background">
                <div>
                    <h1 className="text-lg font-semibold text-foreground">{t("categories_title")}</h1>
                    <p className="text-xs text-muted-foreground mt-0.5">{t("categories_subtitle")}</p>
                </div>
                <button onClick={() => setModal({ type: "create" })} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg transition-all">
                    <Plus className="w-4 h-4" /><span>{t("btn_newCategory")}</span>
                </button>
            </div>

            {/* شريط البحث */}
            <div className="px-8 py-4 border-b border-border shrink-0 bg-background">
                <div className="relative max-w-sm" ref={searchRef}>
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        value={search}
                        onChange={e => { setSearch(e.target.value); setShowSuggestions(true); }}
                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                        placeholder={t("lbl_search")}
                        className="w-full bg-input-background border border-border rounded-lg ps-9 pe-9 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                    />
                    {search && (
                        <button onClick={clearSearch} className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"><X className="w-3.5 h-3.5" /></button>
                    )}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-full mt-1 left-0 right-0 bg-card border border-border rounded-lg shadow-2xl z-50 overflow-hidden">
                            {suggestions.map(s => (
                                <button key={s.id} onClick={() => handleSearchSelect(s.name)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-start hover:bg-muted/50 transition-colors">
                                    <span className="font-mono text-xs text-muted-foreground w-6" dir="ltr">#{s.code}</span>
                                    <span className="text-foreground">{s.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* منطقة عرض الجدول بداخل بطاقة بيضاء دائرية الحواف (Card Design) */}
            <div className="flex-1 overflow-auto px-8 py-6">
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : categories.length === 0 ? (
                    <div className="bg-card border border-border rounded-2xl p-24 flex flex-col items-center justify-center gap-3 shadow-sm">
                        <Tag className="w-10 h-10 text-muted-foreground/40" />
                        <p className="text-muted-foreground text-sm">{t("empty_categories")}</p>
                    </div>
                ) : (
                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/10">
                                    <th className="text-start py-3.5 px-6 text-xs font-semibold text-muted-foreground font-mono tracking-wider">{t("col_code")}</th>
                                    <th className="text-start py-3.5 px-6 text-xs font-semibold text-muted-foreground font-mono tracking-wider">{t("col_name")}</th>
                                    <th className="text-start py-3.5 px-6 text-xs font-semibold text-muted-foreground font-mono tracking-wider">{t("col_description")}</th>
                                    <th className="text-start py-3.5 px-6 text-xs font-semibold text-muted-foreground font-mono tracking-wider">{t("col_created")}</th>
                                    <th className="py-3.5 px-6 w-20" />
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((cat, i) => (
                                    <tr key={cat.id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors group ${i === categories.length - 1 ? "border-b-0" : ""}`}>
                                        <td className="text-start py-3.5 px-6">
                                            <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded" dir="ltr">#{cat.code}</span>
                                        </td>
                                        <td className="text-start py-3.5 px-6 font-medium text-foreground">{cat.name}</td>
                                        <td className="text-start py-3.5 px-6 text-muted-foreground">{cat.description ?? <span className="italic text-muted-foreground/40">—</span>}</td>
                                        <td className="text-start py-3.5 px-6 text-muted-foreground font-mono text-xs"><span dir="ltr" className="inline-block">{formatDate(cat.dateofcreation)}</span></td>
                                        <td className="py-3.5 px-6">
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                                                <button onClick={() => setModal({ type: "edit", category: cat })} className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"><Pencil className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => setModal({ type: "delete", category: cat })} className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ترقيم الصفحات (Pagination) */}
            {!loading && !search && (
                <div className="border-t border-border px-8 py-3.5 flex items-center justify-between shrink-0 bg-background">
                    <p className="text-xs text-muted-foreground font-mono">
                        {t("pagination_showing")} {skip + 1}–{skip + categories.length}
                    </p>
                    <div className="flex items-center gap-1">
                        <button onClick={() => handlePageChange("prev")} disabled={skip === 0} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted/50 transition-all">{isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}</button>
                        <span className="text-xs text-muted-foreground px-2 font-mono">{t("pagination_page")} {Math.floor(skip / PAGE_SIZE) + 1}</span>
                        <button onClick={() => handlePageChange("next")} disabled={!hasMore} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted/50 transition-all">{isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</button>
                    </div>
                </div>
            )}

            {modal?.type === "create" && <CategoryModal onClose={() => setModal(null)} onDone={afterMutation} />}
            {modal?.type === "edit" && modal.category && <CategoryModal category={modal.category} onClose={() => setModal(null)} onDone={afterMutation} />}
            {modal?.type === "delete" && modal.category && <CategoryDeleteModal category={modal.category} onClose={() => setModal(null)} onDone={afterMutation} />}
        </div>
    );
}