import { useState } from "react";
import type React from "react";
import { X, Check, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { API, authHeaders, apiFetch } from "../../lib/api";
import { useLang } from "../../lib/i18n";
import { Overlay } from "../../components/Overlay";
import { SupplierAutocomplete } from "../../components/autocomplete/SupplierAutocomplete";

interface StockInRow { productname: string; buyprice: string; quantity: string; }

export function StockInModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { t } = useLang();
  const [supplierName, setSupplierName] = useState("");
  const [rows, setRows] = useState<StockInRow[]>([{ productname: "", buyprice: "", quantity: "" }]);
  const [loading, setLoading] = useState(false);
  const inputCls = "w-full bg-input-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all";

  function updateRow(i: number, k: keyof StockInRow, v: string) { setRows(r => r.map((row, idx) => idx === i ? { ...row, [k]: v } : row)); }
  function addRow() { setRows(r => [...r, { productname: "", buyprice: "", quantity: "" }]); }
  function removeRow(i: number) { setRows(r => r.filter((_, idx) => idx !== i)); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      const body = rows.map(r => ({ productname: r.productname, buyprice: Number(r.buyprice), quantity: Number(r.quantity) }));
      const res = await apiFetch(`${API}/api/Inventory/Listproducts/stock/in?supplierName=${encodeURIComponent(supplierName)}`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.statusCode === 200) { toast.success("Stock updated successfully."); onDone(); }
      else toast.error(data.message || "Stock-in failed.");
    } catch { toast.error("Request failed."); }
    finally { setLoading(false); }
  }

  return (
    <Overlay onClose={onClose}>
      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-base font-semibold text-foreground">{t("modal_stockIn")}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Add stock to existing products — updates quantity & buy price</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 py-4 border-b border-border shrink-0">
            <div className="space-y-1.5 max-w-xs"><label className="text-sm font-medium text-foreground/80">{t("lbl_supplier")}</label><SupplierAutocomplete value={supplierName} onChange={setSupplierName} /></div>
          </div>
          <div className="flex-1 overflow-auto px-6 py-4 space-y-3">
            {rows.map((row, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 items-end p-3 bg-muted/30 rounded-xl border border-border/50">
                <div className="col-span-2 space-y-1"><label className="text-xs text-muted-foreground">{t("col_product")} *</label><input value={row.productname} onChange={e => updateRow(i, "productname", e.target.value)} required placeholder="Must match existing product" className={inputCls} /></div>
                <div className="space-y-1"><label className="text-xs text-muted-foreground">{t("lbl_buyPrice")} *</label><input type="number" value={row.buyprice} onChange={e => updateRow(i, "buyprice", e.target.value)} required placeholder="0" className={inputCls} /></div>
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-1"><label className="text-xs text-muted-foreground">{t("col_qty")} *</label><input type="number" value={row.quantity} onChange={e => updateRow(i, "quantity", e.target.value)} required placeholder="0" className={inputCls} /></div>
                  {rows.length > 1 && <button type="button" onClick={() => removeRow(i)} className="w-8 h-9 shrink-0 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"><X className="w-3.5 h-3.5" /></button>}
                </div>
              </div>
            ))}
            <button type="button" onClick={addRow} className="w-full border border-dashed border-border rounded-xl py-2.5 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />{t("lbl_addRow")}
            </button>
          </div>
          <div className="flex gap-3 px-6 py-4 border-t border-border shrink-0">
            <button type="button" onClick={onClose} className="flex-1 border border-border text-muted-foreground hover:text-foreground rounded-lg py-2.5 text-sm font-medium transition-all">{t("btn_cancel")}</button>
            <button type="submit" disabled={loading || !supplierName.trim()} className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-all">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" />{t("btn_confirm")} {t("modal_stockIn")}</>}
            </button>
          </div>
        </form>
      </div>
    </Overlay>
  );
}
