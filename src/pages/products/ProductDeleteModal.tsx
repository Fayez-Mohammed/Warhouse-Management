import { useState } from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { API, authHeaders, apiFetch } from "../../lib/api";
import { useLang } from "../../lib/i18n";
import { Overlay } from "../../components/Overlay";
import type { Product } from "../../types";

export function ProductDeleteModal({
  product,
  onClose,
  onDone,
}: {
  product: Product;
  onClose: () => void;
  onDone: () => void;
}) {
  const { t } = useLang();
  const [loading, setLoading] = useState(false);
  const canDelete = product.quantity === 0;

  async function handleDelete() {
    if (!canDelete) return;
    setLoading(true);
    try {
      const res = await apiFetch(
        `${API}/api/Inventory/products?id=${product.productid}`,
        { method: "DELETE", headers: authHeaders() },
      );
      const data = await res.json();
      if (data.statusCode === 200) {
        toast.success("Product deleted.");
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
            {t("modal_deleteProduct")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t("modal_deleteCategoryMsg")}{" "}
            <span className="text-foreground font-medium">
              "{product.productname}"
            </span>
            ?
          </p>
          {!canDelete && (
            <div className="mt-3 flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2.5">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>
                Cannot delete — current quantity is{" "}
                <strong>{product.quantity}</strong>. Settle
                stock to 0 first.
              </span>
            </div>
          )}
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
            disabled={loading || !canDelete}
            className="flex-1 bg-destructive hover:bg-destructive/90 disabled:opacity-40 disabled:cursor-not-allowed text-destructive-foreground rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-all"
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