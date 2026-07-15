import { useState } from "react";
import type React from "react";
import { X, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { API, authHeaders, apiFetch } from "../../lib/api";
import { useLang } from "../../lib/i18n";
import { Overlay } from "../../components/Overlay";
import type { Product } from "../../types";

export function ProductEditModal({ product, onClose, onDone }: { product: Product; onClose: () => void; onDone: () => void }) {
  const { t } = useLang();
  const [form, setForm] = useState({ productname: product.productname, sellprice: String(product.saleprice), quantity: String(product.quantity), sku: product.sku ?? "", description: product.description ?? "", categoryname: product.categoryname });
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const inputCls = "w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      const res = await apiFetch(`${API}/api/Inventory/productsWithCategoryName`, {
        method: "PUT", headers: authHeaders(),
        body: JSON.stringify({ productid: product.productid, productname: form.productname, sellprice: Number(form.sellprice), quantity: Number(form.quantity), sku: form.sku, description: form.description, categoryname: form.categoryname }),
      });
      const data = await res.json();
      if (data.statusCode === 200) { toast.success("Product updated."); onDone(); }
      else toast.error(data.message || "Update failed.");
    } catch { toast.error("Request failed."); }
    finally { setLoading(false); }
  }

  return (
    <Overlay onClose={onClose}>
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div><h2 className="text-base font-semibold text-foreground">{t("modal_editProduct")}</h2><p className="text-xs text-muted-foreground mt-0.5 font-mono">#{product.code}</p></div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{t("col_product")}</label><input value={form.productname} onChange={e => set("productname", e.target.value)} required className={inputCls} /></div>
            <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{t("lbl_sellPrice")}</label><input type="number" value={form.sellprice} onChange={e => set("sellprice", e.target.value)} required className={inputCls} /></div>
            <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{t("col_qty")}</label><input type="number" value={form.quantity} onChange={e => set("quantity", e.target.value)} required className={inputCls} /><p className="text-xs text-muted-foreground/70 mt-1">Difference auto-recorded as stock adjustment</p></div>
            <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{t("col_category")}</label><input value={form.categoryname} onChange={e => set("categoryname", e.target.value)} required className={inputCls} /></div>
            <div className="space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{t("col_sku")}</label><input value={form.sku} onChange={e => set("sku", e.target.value)} className={inputCls} /></div>
            <div className="col-span-2 space-y-1.5"><label className="text-xs font-medium text-muted-foreground">{t("lbl_description")}</label><textarea value={form.description} onChange={e => set("description", e.target.value)} rows={2} className={`${inputCls} resize-none`} /></div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-border text-muted-foreground hover:text-foreground rounded-lg py-2.5 text-sm font-medium transition-all">{t("btn_cancel")}</button>
            <button type="submit" disabled={loading} className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-all">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" />{t("btn_saveChanges")}</>}
            </button>
          </div>
        </form>
      </div>
    </Overlay>
  );
}
