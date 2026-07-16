import { useState } from "react";
import type React from "react";
import { X, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { API, authHeaders, apiFetch } from "../../lib/api";
import { useLang } from "../../lib/i18n";
import { Overlay } from "../../components/Overlay";
import type { Category } from "../../types";

export function CategoryModal({
  category,
  onClose,
  onDone,
}: {
  category?: Category;
  onClose: () => void;
  onDone: () => void;
}) {
  const { t } = useLang();
  const isEdit = !!category;
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(
    category?.description ?? "",
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const url = isEdit
        ? `${API}/api/Categories/UpdateCategory`
        : `${API}/api/Categories/CreateCategory`;
      const method = isEdit ? "PUT" : "POST";
      const body = isEdit
        ? { id: category!.id, name, description }
        : { name, description };
      const res = await apiFetch(url, {
        method,
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.statusCode === 200) {
        toast.success(
          isEdit ? "Category updated." : "Category created.",
        );
        onDone();
      } else {
        toast.error(data.message || "Something went wrong.");
      }
    } catch {
      toast.error("Request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Overlay onClose={onClose}>
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            {isEdit
              ? t("modal_editCategory")
              : t("modal_newCategory")}
          </h2>
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
              {t("lbl_name")}
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Electronics"
              className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/80">
              {t("lbl_description")}{" "}
              <span className="text-muted-foreground font-normal text-xs">
                ({t("lbl_optional")})
              </span>
            </label>
            <textarea
              value={description ?? ""}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Short description…"
              className="w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all resize-none"
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
              disabled={loading || !name.trim()}
              className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {isEdit
                    ? t("btn_saveChanges")
                    : t("lbl_createItem")}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Overlay>
  );
}