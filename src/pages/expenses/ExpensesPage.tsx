import { useState, useEffect, useCallback } from "react";
import type React from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { API, authHeaders, apiFetch } from "../../lib/api";
import { formatDate } from "../../lib/utils";
import { useLang } from "../../lib/i18n";
import { Overlay } from "../../components/Overlay";
import type { Expense } from "../../types";

const PAGE_SIZE = 10;

// ─── Expense modal (create + edit) ────────────────────────────────────────────

function ExpenseModal({
  expense,
  onClose,
  onDone,
}: {
  expense?: Expense;
  onClose: () => void;
  onDone: () => void;
}) {
  const { t } = useLang();
  const isEdit = !!expense;
  const [amount, setAmount] = useState(
    expense ? String(expense.amount) : "",
  );
  const [description, setDescription] = useState(
    expense?.description ?? "",
  );
  const [loading, setLoading] = useState(false);

  const inputCls =
    "w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        amount: parsed,
        description,
      };
      if (isEdit) body.id = expense!.id;
      const res = await apiFetch(`${API}/api/Expenses`, {
        method: isEdit ? "PUT" : "POST",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.statusCode === 200) {
        toast.success(
          isEdit
            ? "Expense updated."
            : `Expense #${data.expense?.code} added.`,
        );
        onDone();
      } else {
        toast.error(data.message || "Failed.");
      }
    } catch {
      toast.error("Request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Overlay onClose={onClose}>
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                {isEdit
                  ? t("expense_editTitle")
                  : t("expense_newTitle")}
              </h2>
              {isEdit && (
                <p className="text-xs text-muted-foreground font-mono">
                  #{expense!.code}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/80">
              {t("lbl_amount")}
            </label>
            <div className="relative">
              <span className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                $
              </span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                placeholder="0.00"
                className={inputCls + " ps-7"}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/80">
              {t("lbl_expenseDesc")}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              placeholder={t("placeholder_expenseDesc")}
              className={inputCls + " resize-none"}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-border text-muted-foreground hover:text-foreground rounded-lg py-2.5 text-sm font-medium transition-all"
            >
              {t("btn_cancel")}
            </button>
            <button
              type="submit"
              disabled={
                loading || !description.trim() || !amount
              }
              className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {isEdit ? t("btn_save") : t("btn_addExpense")}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Overlay>
  );
}

// ─── Delete confirm ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function DeleteModal({
  expense,
  onClose,
  onDone,
}: {
  expense: Expense;
  onClose: () => void;
  onDone: () => void;
}) {
  const { t } = useLang();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await apiFetch(
        `${API}/api/Expenses?id=${expense.id}`,
        { method: "DELETE", headers: authHeaders() },
      );
      const data = await res.json();
      if (data.statusCode === 200) {
        toast.success("Expense deleted.");
        onDone();
      } else toast.error(data.message || "Delete failed.");
    } catch {
      toast.error("Request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Overlay onClose={onClose}>
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-5">
        <div className="w-10 h-10 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-destructive" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">
            {t("expense_deleteTitle")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("modal_deleteCannotUndo")}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-border text-muted-foreground hover:text-foreground rounded-lg py-2.5 text-sm font-medium transition-all"
          >
            {t("btn_cancel")}
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 bg-destructive hover:bg-destructive/90 disabled:opacity-50 text-destructive-foreground rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              t("btn_delete")
            )}
          </button>
        </div>
      </div>
    </Overlay>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

type ModalState =
  | { type: "create" }
  | { type: "edit"; expense: Expense }
  | { type: "delete"; expense: Expense };

export function ExpensesPage() {
  const { t, isRTL } = useLang();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [modal, setModal] = useState<ModalState | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pageTotal, setPageTotal] = useState(0);

  const fetchExpenses = useCallback(async (s: number) => {
    setLoading(true);
    try {
      const res = await apiFetch(
        `${API}/api/Expenses/GetAll?skip=${s}&take=${PAGE_SIZE}`,
        { headers: authHeaders() },
      );
      const data = await res.json();
      const items: Expense[] = data.value ?? [];
      setExpenses(items);
      setHasMore(items.length === PAGE_SIZE);
      setPageTotal((prev) => (s === 0 ? items.length : prev));
    } catch {
      toast.error("Failed to load expenses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses(0);
  }, [fetchExpenses]);

  function goPage(dir: "prev" | "next") {
    const s =
      dir === "next"
        ? skip + PAGE_SIZE
        : Math.max(0, skip - PAGE_SIZE);
    setSkip(s);
    fetchExpenses(s);
  }

  function afterMutation() {
    setModal(null);
    fetchExpenses(skip);
  }

  const runningTotal = expenses.reduce(
    (s, e) => s + e.amount,
    0,
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background/50">
      {/* Header */}
      <div className="border-b border-border px-4 sm:px-8 py-5 flex items-center justify-between shrink-0 bg-background">
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            {t("expenses_title")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("expenses_subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {expenses.length > 0 && (
            <div className="text-end">
              <p className="text-xs text-muted-foreground">
                {t("lbl_pageTotal")}
              </p>
              <p className="font-mono text-sm font-semibold text-rose-600 dark:text-rose-400">
                <span dir="ltr" className="inline-block">
                  ${runningTotal.toLocaleString()}
                </span>
              </p>
            </div>
          )}
          <button
            onClick={() => setModal({ type: "create" })}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            {t("btn_newExpense")}
          </button>
        </div>
      </div>

      {/* Table Container with White Card Design */}
      <div className="flex-1 overflow-auto px-4 sm:px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : expenses.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-24 flex flex-col items-center justify-center gap-3 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <p className="text-muted-foreground text-sm">
              {t("empty_expenses")}
            </p>
            <button
              onClick={() => setModal({ type: "create" })}
              className="text-sm text-primary hover:underline"
            >
              {t("btn_addExpense")}
            </button>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-x-auto shadow-sm">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/10">
                  {[
                    { key: "#", label: "#" },
                    {
                      key: "desc",
                      label: t("col_description"),
                    },
                    { key: "amt", label: t("col_amount") },
                    { key: "rec", label: t("col_accountant") },
                    { key: "date", label: t("col_date") },
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
                {expenses.map((e, i) => (
                  <tr
                    key={e.id}
                    className={`border-b border-border/50 hover:bg-muted/20 transition-colors group ${i === expenses.length - 1 ? "border-b-0" : ""}`}
                  >
                    <td className="text-start py-3.5 px-5">
                      <span
                        className="font-mono text-xs bg-rose-500/10 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded"
                        dir="ltr"
                      >
                        #{e.code}
                      </span>
                    </td>
                    <td className="text-start py-3.5 px-5 text-foreground max-w-xs">
                      {e.description}
                    </td>
                    <td className="text-start py-3.5 px-5 font-mono text-sm font-semibold text-rose-600 dark:text-rose-400">
                      <span dir="ltr" className="inline-block">
                        ${e.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="text-start py-3.5 px-5 text-xs text-muted-foreground">
                      {e.accountantname}
                    </td>
                    <td className="text-start py-3.5 px-5 font-mono text-xs text-muted-foreground whitespace-nowrap">
                      <span dir="ltr" className="inline-block">
                        {formatDate(e.createdat)}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        <button
                          onClick={() =>
                            setModal({
                              type: "edit",
                              expense: e,
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
                              expense: e,
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
      {!loading && expenses.length > 0 && (
        <div className="border-t border-border px-4 sm:px-8 py-3.5 flex items-center justify-between shrink-0 bg-background">
          <p className="text-xs text-muted-foreground font-mono">
            <span dir="ltr" className="inline-block">
              {t("pagination_showing")} {skip + 1}–
              {skip + expenses.length}
            </span>
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => goPage("prev")}
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
              onClick={() => goPage("next")}
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
        <ExpenseModal
          onClose={() => setModal(null)}
          onDone={afterMutation}
        />
      )}
      {modal?.type === "edit" && (
        <ExpenseModal
          expense={modal.expense}
          onClose={() => setModal(null)}
          onDone={afterMutation}
        />
      )}
      {modal?.type === "delete" && (
        <DeleteModal
          expense={modal.expense}
          onClose={() => setModal(null)}
          onDone={afterMutation}
        />
      )}
    </div>
  );
}