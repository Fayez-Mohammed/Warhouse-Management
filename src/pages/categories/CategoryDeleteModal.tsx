import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { API, authHeaders, apiFetch } from "../../lib/api";
import { useLang } from "../../lib/i18n";
import { Overlay } from "../../components/Overlay";
import type { Category } from "../../types";

export function CategoryDeleteModal({
  category,
  onClose,
  onDone,
}: {
  category: Category;
  onClose: () => void;
  onDone: () => void;
}) {
  const { t } = useLang();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await apiFetch(
        `${API}/api/Categories/DeleteCategory?id=${category.id}`,
        { method: "DELETE", headers: authHeaders() },
      );
      const data = await res.json();
      if (data.statusCode === 200) {
        toast.success("Category deleted.");
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
          <Trash2 className="w-5 h-5 text-destructive" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">
            {t("modal_deleteCategory")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("modal_deleteCategoryMsg")}{" "}
            <span className="text-foreground font-medium">
              "{category.name}"
            </span>
            ? {t("modal_deleteCannotUndo")}
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