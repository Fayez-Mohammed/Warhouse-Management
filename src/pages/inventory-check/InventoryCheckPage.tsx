import { useState } from "react";
import { Loader2, Search, Check, ClipboardCheck, PackageSearch, TrendingUp, TrendingDown, BadgeCheck, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { API, authHeaders, apiFetch } from "../../lib/api";
import { useLang } from "../../lib/i18n";
import { ProductNameAutocomplete } from "../../components/autocomplete/ProductNameAutocomplete";
import type { AdjustResult } from "../../types";

export function InventoryCheckPage() {
  const { t } = useLang();
  const [productName, setProductName] = useState("");
  const [actualQty, setActualQty] = useState("");
  const [preview, setPreview] = useState<AdjustResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  async function handleSimulate() {
    if (!productName.trim() || !actualQty) return;
    setLoading(true);
    setPreview(null);
    setApplied(false);
    try {
      const res = await apiFetch(`${API}/api/InventoryCheck/Adjust?UpdateStock=false`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ productname: productName.trim(), actualquantity: Number(actualQty) }),
      });
      const data: AdjustResult = await res.json();
      if (data.statusCode === 200) setPreview(data);
      else toast.error(data.message || "Simulation failed.");
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Network error."); }
    finally { setLoading(false); }
  }

  async function handleApply() {
    if (!productName.trim() || !actualQty) return;
    setApplying(true);
    try {
      const res = await apiFetch(`${API}/api/InventoryCheck/Adjust?UpdateStock=true`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ productname: productName.trim(), actualquantity: Number(actualQty) }),
      });
      const data: AdjustResult = await res.json();
      if (data.statusCode === 200) {
        setPreview(data);
        setApplied(true);
        toast.success("Stock adjusted successfully.");
      } else {
        toast.error(data.message || "Adjustment failed.");
      }
    } catch (e: unknown) { toast.error(e instanceof Error ? e.message : "Network error."); }
    finally { setApplying(false); }
  }

  function handleReset() {
    setProductName(""); setActualQty(""); setPreview(null); setApplied(false);
  }

  const diff = preview ? Number(actualQty) - preview.systemquantity : 0;
  const isSurplus = diff > 0;
  const isDeficit = diff < 0;
  const isMatch = diff === 0;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-primary" />
          {t("invCheck_title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">{t("invCheck_subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <h2 className="text-sm font-semibold text-foreground">{t("preview_auditEntry")}</h2>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("lbl_productName")}</label>
            <ProductNameAutocomplete value={productName} onChange={setProductName} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("lbl_actualCount")}</label>
            <input
              type="number"
              min={0}
              value={actualQty}
              onChange={e => { setActualQty(e.target.value); setPreview(null); setApplied(false); }}
              placeholder={t("placeholder_qty")}
              className="w-full px-3 py-2 rounded-lg bg-input-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSimulate}
              disabled={!productName.trim() || !actualQty || loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {t("btn_preview")}
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            >
              {t("btn_reset")}
            </button>
          </div>
        </div>

        <div className={`bg-card border rounded-xl p-6 space-y-5 transition-all ${preview ? "border-border opacity-100" : "border-dashed border-border opacity-60"}`}>
          <h2 className="text-sm font-semibold text-foreground">{t("preview_title")}</h2>

          {!preview && (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
              <PackageSearch className="w-10 h-10 opacity-30" />
              <p className="text-sm">{t("invCheck_hint")}</p>
            </div>
          )}

          {preview && (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{t("lbl_systemQty")}</p>
                  <p className="text-xl font-bold font-mono text-foreground"><span dir="ltr" className="inline-block">{preview.systemquantity}</span></p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{t("lbl_actualCount")}</p>
                  <p className="text-xl font-bold font-mono text-foreground"><span dir="ltr" className="inline-block">{actualQty}</span></p>
                </div>
                <div className={`rounded-lg p-3 text-center ${isSurplus ? "bg-emerald-500/10" : isDeficit ? "bg-destructive/10" : "bg-primary/10"}`}>
                  <p className="text-xs text-muted-foreground mb-1">{t("lbl_difference")}</p>
                  <p className={`text-xl font-bold font-mono ${isSurplus ? "text-emerald-500" : isDeficit ? "text-destructive" : "text-primary"}`}>
                    <span dir="ltr" className="inline-block">{isSurplus ? `+${diff}` : diff}</span>
                  </p>
                </div>
              </div>

              <div className={`flex items-center gap-3 rounded-lg px-4 py-3 ${
                isSurplus ? "bg-emerald-500/10 border border-emerald-500/20" :
                isDeficit ? "bg-destructive/10 border border-destructive/20" :
                "bg-primary/10 border border-primary/20"
              }`}>
                {isSurplus ? <TrendingUp className="w-5 h-5 text-emerald-500 shrink-0" /> :
                 isDeficit ? <TrendingDown className="w-5 h-5 text-destructive shrink-0" /> :
                 <BadgeCheck className="w-5 h-5 text-primary shrink-0" />}
                <div>
                  <p className={`text-sm font-semibold ${isSurplus ? "text-emerald-500" : isDeficit ? "text-destructive" : "text-primary"}`}>
                    {isSurplus ? t("status_surplus") : isDeficit ? t("status_deficit") : t("status_balanced")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{preview.financialimpact}</p>
                </div>
              </div>

              <div className="flex items-center justify-between bg-muted/40 rounded-lg px-4 py-3">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">{t("lbl_financialImpact")}</span>
                <span className={`text-sm font-semibold font-mono ${preview.valuedifference >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                  <span dir="ltr" className="inline-block">{preview.valuedifference >= 0 ? "+" : ""}{preview.valuedifference.toLocaleString()} EGP</span>
                </span>
              </div>

              {applied && preview.adjustmentid && (
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-emerald-500">{t("lbl_stockUpdated")}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5"><span dir="ltr" className="inline-block">{t("invCheck_idLabel")}: {preview.adjustmentid}</span></p>
                  </div>
                </div>
              )}

              {!applied && !isMatch && (
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-all"
                >
                  {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {t("btn_applyAdjustment")}
                </button>
              )}
              {(applied || isMatch) && (
                <button onClick={handleReset} className="w-full px-4 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
                  {t("btn_newCheck")}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
        <div className="text-xs text-muted-foreground space-y-1">
          <p><span className="font-medium text-foreground">{t("invCheck_previewMode")}</span> {t("invCheck_previewModeDesc")}</p>
          <p><span className="font-medium text-foreground">{t("invCheck_applyLabel")}</span> {t("invCheck_applyLabelDesc")}</p>
        </div>
      </div>
    </div>
  );
}
