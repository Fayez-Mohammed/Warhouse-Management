import { useState } from "react";
import type React from "react";
import { X, Check, Plus, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { API, authHeaders, apiFetch } from "../../lib/api";
import { Overlay } from "../../components/Overlay";
import { SupplierAutocomplete } from "../../components/autocomplete/SupplierAutocomplete";
import { ProductNameAutocomplete } from "../../components/autocomplete/ProductNameAutocomplete";

interface ReturnRow { productname: string; quantity: string; reason: string; }

const emptyRow = (): ReturnRow => ({ productname: "", quantity: "", reason: "" });

export function ReturnToSupplierModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [supplierName, setSupplierName] = useState("");
  const [rows, setRows] = useState<ReturnRow[]>([emptyRow()]);
  const [loading, setLoading] = useState(false);

  function updateRow(i: number, k: keyof ReturnRow, v: string) {
    setRows(r => r.map((row, idx) => idx === i ? { ...row, [k]: v } : row));
  }
  function addRow() { setRows(r => [...r, emptyRow()]); }
  function removeRow(i: number) { setRows(r => r.filter((_, idx) => idx !== i)); }

  const inputCls = "w-full bg-input-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true);
    try {
      const body = {
        suppliername: supplierName,
        items: rows.map(r => ({
          productname: r.productname,
          quantity: Number(r.quantity),
          reason: r.reason.trim(),
        })),
      };
      const res = await apiFetch(`${API}/api/Returns/returntosupplier`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.statusCode === 200) {
        const refund = data.details?.totalvaluerefunded;
        const inv = data.details?.newinvoicecode;
        toast.success(
          refund != null
            ? `Return processed. Refund: ${refund.toLocaleString()} EGP — Invoice #${inv}`
            : "Return to supplier processed."
        );
        onDone();
      } else {
        toast.error(data.message || "Return failed.");
      }
    } catch { toast.error("Request failed."); }
    finally { setLoading(false); }
  }

  return (
    <Overlay onClose={onClose}>
      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-500" />
              Return to Supplier
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Send stock back to supplier — deducts inventory & generates credit invoice</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Supplier */}
          <div className="px-6 py-4 border-b border-border shrink-0">
            <div className="space-y-1.5 max-w-xs">
              <label className="text-sm font-medium text-foreground/80">Supplier Name</label>
              <SupplierAutocomplete value={supplierName} onChange={setSupplierName} />
            </div>
          </div>

          {/* Item rows */}
          <div className="flex-1 overflow-auto px-6 py-4 space-y-3">
            {rows.map((row, i) => (
              <div key={i} className="grid grid-cols-5 gap-2 items-end p-3 bg-muted/30 rounded-xl border border-border/50">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs text-muted-foreground">Product Name *</label>
                  <ProductNameAutocomplete value={row.productname} onChange={v => updateRow(i, "productname", v)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Qty *</label>
                  <input type="number" min={1} value={row.quantity} onChange={e => updateRow(i, "quantity", e.target.value)} required placeholder="0" className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Reason *</label>
                  <input value={row.reason} onChange={e => updateRow(i, "reason", e.target.value)} required placeholder="e.g. defective…" className={inputCls} />
                </div>
                <div className="flex items-end justify-end">
                  {rows.length > 1 && (
                    <button type="button" onClick={() => removeRow(i)} className="w-8 h-9 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button type="button" onClick={addRow} className="w-full border border-dashed border-border rounded-xl py-2.5 text-sm text-muted-foreground hover:text-foreground hover:border-amber-500/40 transition-all flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />Add another item
            </button>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-border shrink-0">
            <button type="button" onClick={onClose} className="flex-1 border border-border text-muted-foreground hover:text-foreground rounded-lg py-2.5 text-sm font-medium transition-all">Cancel</button>
            <button
              type="submit"
              disabled={loading || !supplierName.trim()}
              className="flex-1 bg-amber-500 hover:bg-amber-500/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" />Confirm Return</>}
            </button>
          </div>
        </form>
      </div>
    </Overlay>
  );
}
