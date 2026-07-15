import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus, Search, X, Loader2, ChevronLeft, ChevronRight,
  Pencil, RefreshCw, ArrowDownLeft, ArrowUpRight, CheckCircle,
  XCircle, Clock, Banknote, Ban,
} from "lucide-react";
import { toast } from "sonner";
import { API, authHeaders, apiFetch } from "../../lib/api";
import { useLang } from "../../lib/i18n";
import { formatDate } from "../../lib/utils";
import { ChequeModal } from "./ChequeModal";
import { ChequeStatusModal } from "./ChequeStatusModal";
import type { Cheque } from "../../types";

// ─── Config ────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  Pending:   { label: "Pending",   color: "text-amber-600 dark:text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20",   icon: <Clock className="w-3 h-3" /> },
  Collected: { label: "Collected", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: <CheckCircle className="w-3 h-3" /> },
  Paid:      { label: "Paid",      color: "text-sky-600 dark:text-sky-400",        bg: "bg-sky-500/10",     border: "border-sky-500/20",     icon: <Banknote className="w-3 h-3" /> },
  Rejected:  { label: "Rejected",  color: "text-destructive",                      bg: "bg-destructive/10", border: "border-destructive/20", icon: <XCircle className="w-3 h-3" /> },
  Cancelled: { label: "Cancelled", color: "text-muted-foreground",                 bg: "bg-muted",          border: "border-border",         icon: <Ban className="w-3 h-3" /> },
};

type ModalState =
  | { type: "create" }
  | { type: "edit"; cheque: Cheque }
  | { type: "status"; cheque: Cheque };

// ─── Component ─────────────────────────────────────────────────────────────────

export function ChequesPage() {
  const { t, isRTL } = useLang();
  const [cheques, setCheques] = useState<Cheque[]>([]);
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [dirFilter, setDirFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [modal, setModal] = useState<ModalState | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  const fetchCheques = useCallback(async (s: number, q: string, dir: string, status: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ skip: String(s), take: String(PAGE_SIZE) });
      if (q.trim()) params.set("searchName", q.trim());
      if (dir) params.set("direction", dir);
      if (status) params.set("status", status);
      const res = await apiFetch(`${API}/api/Cheques/list?${params}`, { headers: authHeaders() });
      const data = await res.json();
      const items: Cheque[] = data.value ?? [];
      setCheques(items);
      setHasMore(items.length === PAGE_SIZE);
    } catch { toast.error("Failed to load cheques."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    setSkip(0);
    fetchCheques(0, search, dirFilter, statusFilter);
  }, [dirFilter, statusFilter, fetchCheques]);

  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSkip(0);
      fetchCheques(0, search, dirFilter, statusFilter);
    }, 300);
    return () => clearTimeout(searchTimer.current);
  }, [search]); // eslint-disable-line

  function goPage(dir: "prev" | "next") {
    const s = dir === "next" ? skip + PAGE_SIZE : Math.max(0, skip - PAGE_SIZE);
    setSkip(s); fetchCheques(s, search, dirFilter, statusFilter);
  }

  function afterMutation() {
    setModal(null);
    fetchCheques(skip, search, dirFilter, statusFilter);
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-border px-8 py-5 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-semibold text-foreground">{t("cheques_title")}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{t("cheques_subtitle")}</p>
        </div>
        <button
          onClick={() => setModal({ type: "create" })}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg transition-all"
        >
          <Plus className="w-4 h-4" />{t("btn_newCheque")}
        </button>
      </div>

      {/* Filter bar */}
      <div className="px-8 py-3.5 border-b border-border shrink-0 flex items-center gap-3 flex-wrap">
        <div className="relative w-52">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t("lbl_searchName")}
            className="w-full bg-input-background border border-border rounded-lg ps-8 pe-8 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Direction pills */}
        <div className="flex items-center gap-1 bg-muted/40 rounded-lg p-1 border border-border">
          {([["", t("dir_all")], ["Incoming", t("dir_incomingShort")], ["Outgoing", t("dir_outgoingShort")]] as const).map(([v, lbl]) => (
            <button key={v} onClick={() => setDirFilter(v)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                dirFilter === v ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {v === "Incoming" && <ArrowDownLeft className="w-3 h-3 text-sky-500" />}
              {v === "Outgoing" && <ArrowUpRight className="w-3 h-3 text-amber-500" />}
              {lbl}
            </button>
          ))}
        </div>

        {/* Status pills */}
        <div className="flex items-center gap-1 bg-muted/40 rounded-lg p-1 border border-border">
          {["", "Pending", "Collected", "Paid", "Rejected", "Cancelled"].map(v => (
            <button key={v} onClick={() => setStatusFilter(v)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                statusFilter === v ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {v ? t(`status_${v.toLowerCase()}`) : t("dir_all")}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-8 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : cheques.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground text-lg font-bold">✓</div>
            <p className="text-muted-foreground text-sm">{t("lbl_noData")}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {[
                  { key: "hash", label: "#" },
                  { key: "col_direction", label: t("col_direction") },
                  { key: "col_chequeNo", label: t("col_chequeNo") },
                  { key: "col_person", label: t("col_person") },
                  { key: "col_bank", label: t("col_bank") },
                  { key: "col_amount", label: t("col_amount") },
                  { key: "col_dueDate", label: t("col_dueDate") },
                  { key: "col_status", label: t("col_status") },
                  { key: "col_issued", label: t("col_issued") },
                  { key: "actions", label: "" },
                ].map(h => (
                  <th key={h.key} className="text-start py-3 px-2.5 text-xs font-medium text-muted-foreground font-mono tracking-wider">{h.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cheques.map((c, i) => {
                const sc = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.Pending;
                const isPending = c.status === "Pending";
                return (
                  <tr key={c.id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors group ${i % 2 === 0 ? "" : "bg-card/30"}`}>
                    <td className="text-start py-3.5 px-2.5">
                      <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground" dir="ltr">#{c.code}</span>
                    </td>
                    <td className="text-start py-3.5 px-2.5">
                      {c.isincoming
                        ? <span className="flex items-center gap-1 text-xs text-sky-600 dark:text-sky-400"><ArrowDownLeft className="w-3.5 h-3.5" />{t("dir_in")}</span>
                        : <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400"><ArrowUpRight className="w-3.5 h-3.5" />{t("dir_out")}</span>
                      }
                    </td>
                    <td className="text-start py-3.5 px-2.5 font-mono text-xs text-foreground"><span dir="ltr" className="inline-block">{c.checknumber}</span></td>
                    <td className="text-start py-3.5 px-2.5 font-medium text-foreground max-w-[140px] truncate">{c.relatedname}</td>
                    <td className="text-start py-3.5 px-2.5 text-xs text-muted-foreground">{c.bankname}</td>
                    <td className="text-start py-3.5 px-2.5 font-mono text-sm font-medium text-foreground"><span dir="ltr" className="inline-block">${c.amount.toLocaleString()}</span></td>
                    <td className="text-start py-3.5 px-2.5 font-mono text-xs text-muted-foreground whitespace-nowrap"><span dir="ltr" className="inline-block">{formatDate(c.duedate)}</span></td>
                    <td className="text-start py-3.5 px-2.5">
                      <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border w-fit ${sc.bg} ${sc.color} ${sc.border}`}>
                        {sc.icon}{t(`status_${c.status.toLowerCase()}`)}
                      </span>
                    </td>
                    <td className="text-start py-3.5 px-2.5 font-mono text-xs text-muted-foreground whitespace-nowrap"><span dir="ltr" className="inline-block">{formatDate(c.issuedate)}</span></td>
                    <td className="py-3.5 px-2.5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        {isPending && (
                          <>
                            <button onClick={() => setModal({ type: "edit", cheque: c })}
                              title={t("lbl_editItem")} className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setModal({ type: "status", cheque: c })}
                              title={t("btn_updateStatus")} className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && (
        <div className="border-t border-border px-8 py-3.5 flex items-center justify-between shrink-0">
          <p className="text-xs text-muted-foreground font-mono">{t("pagination_showing")} {skip + 1}–{skip + cheques.length}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => goPage("prev")} disabled={skip === 0} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted/50 transition-all">
              {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <span className="text-xs text-muted-foreground px-2 font-mono">{t("pagination_page")} {Math.floor(skip / PAGE_SIZE) + 1}</span>
            <button onClick={() => goPage("next")} disabled={!hasMore} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted/50 transition-all">
              {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {modal?.type === "create" && <ChequeModal onClose={() => setModal(null)} onDone={afterMutation} />}
      {modal?.type === "edit" && <ChequeModal cheque={modal.cheque} onClose={() => setModal(null)} onDone={afterMutation} />}
      {modal?.type === "status" && <ChequeStatusModal cheque={modal.cheque} onClose={() => setModal(null)} onDone={afterMutation} />}
    </div>
  );
}
