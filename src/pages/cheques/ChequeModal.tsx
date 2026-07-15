import { useState, useEffect, useRef } from "react";
import type React from "react";
import { X, Check, Loader2, ArrowDownLeft, ArrowUpRight, Search, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { API, authHeaders, apiFetch } from "../../lib/api";
import { useLang } from "../../lib/i18n";
import { Overlay } from "../../components/Overlay";
import { formatDate } from "../../lib/utils";
import type { Cheque, InvoiceListItem } from "../../types";

interface PersonSuggestion { id: string | null; usernumber: number; fullname: string; }

function PersonSearch({ value, onChange, onSelect, placeholder }: {
  value: string; onChange: (v: string) => void;
  onSelect: (name: string) => void; placeholder: string;
}) {
  const [suggestions, setSuggestions] = useState<PersonSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    clearTimeout(timer.current);
    if (!value.trim()) { setSuggestions([]); setOpen(false); return; }
    timer.current = setTimeout(async () => {
      try {
        const res = await apiFetch(`${API}/api/Invoices/autocomplete?term=${encodeURIComponent(value)}`, { headers: authHeaders() });
        const data = await res.json();
        setSuggestions(data.value ?? []);
        setOpen(true);
      } catch { /* silent */ }
    }, 250);
    return () => clearTimeout(timer.current);
  }, [value]);

  useEffect(() => {
    function handle(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          value={value}
          onChange={e => { onChange(e.target.value); }}
          placeholder={placeholder}
          className="w-full bg-input-background border border-border rounded-lg pl-8 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
        />
      </div>
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 top-full mt-1 w-full bg-card border border-border rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
          {suggestions.map(s => (
            <li key={s.usernumber}
              onMouseDown={() => { onSelect(s.fullname); onChange(s.fullname); setOpen(false); }}
              className="px-3 py-2.5 text-sm cursor-pointer hover:bg-muted/50 transition-colors flex items-center gap-2"
            >
              <span className="font-mono text-xs text-muted-foreground">#{s.usernumber}</span>
              <span className="text-foreground">{s.fullname}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ChequeModal({ cheque, onClose, onDone }: {
  cheque?: Cheque; onClose: () => void; onDone: () => void;
}) {
  const { t } = useLang();
  const isEdit = !!cheque;

  const [isincoming, setIsincoming] = useState(cheque?.isincoming ?? true);
  const [relatedname, setRelatedname] = useState(cheque?.relatedname ?? "");
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(
    cheque ? (cheque.isincoming ? (cheque.invoiceid ?? "") : (cheque.supplierinvoiceid ?? "")) : ""
  );

  const [checknumber, setChecknumber] = useState(cheque?.checknumber ?? "");
  const [amount, setAmount] = useState(cheque ? String(cheque.amount) : "");
  const [duedate, setDuedate] = useState(cheque ? cheque.duedate.split("T")[0] : "");
  const [bankname, setBankname] = useState(cheque?.bankname ?? "");
  const [notes, setNotes] = useState(cheque?.notes ?? "");
  const [loading, setLoading] = useState(false);

  const inputCls = "w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all";

  async function fetchInvoicesForName(name: string, incoming: boolean) {
    if (!name.trim()) return;
    setLoadingInvoices(true);
    setSelectedInvoiceId("");
    try {
      const typeParam = incoming ? "1" : "3";
      const res = await apiFetch(
        `${API}/api/Invoices/list?recipientName=${encodeURIComponent(name)}&invoiceType=${typeParam}&pageSize=50`,
        { headers: authHeaders() }
      );
      const data = await res.json();
      let items: InvoiceListItem[] = data.items ?? [];
      if (!incoming) {
        const res5 = await apiFetch(
          `${API}/api/Invoices/list?recipientName=${encodeURIComponent(name)}&invoiceType=5&pageSize=50`,
          { headers: authHeaders() }
        );
        const data5 = await res5.json();
        items = [...items, ...(data5.items ?? [])];
      }
      setInvoices(items.sort((a, b) => b.code - a.code));
    } catch { toast.error("Failed to load invoices."); }
    finally { setLoadingInvoices(false); }
  }

  function handlePersonSelect(name: string) { fetchInvoicesForName(name, isincoming); }

  function handleDirectionChange(incoming: boolean) {
    setIsincoming(incoming);
    setInvoices([]);
    setSelectedInvoiceId("");
    if (relatedname.trim()) fetchInvoicesForName(relatedname, incoming);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) { toast.error("Enter a valid amount."); return; }
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        checknumber, amount: parsedAmount,
        duedate: new Date(duedate).toISOString(),
        bankname, isincoming, relatedname, notes,
        invoiceid: isincoming ? selectedInvoiceId : "",
        supplierinvoiceid: !isincoming ? selectedInvoiceId : "",
      };
      let url = `${API}/api/Cheques/add`;
      let method = "POST";
      if (isEdit) { url = `${API}/api/Cheques/update`; method = "PUT"; body.id = cheque!.id; }
      const res = await apiFetch(url, { method, headers: authHeaders(), body: JSON.stringify(body) });
      const data = await res.json();
      if (data.statusCode === 200) {
        toast.success(isEdit ? "Cheque updated." : `Cheque #${data.code} registered.`);
        onDone();
      } else { toast.error(data.message || "Failed."); }
    } catch { toast.error("Request failed."); }
    finally { setLoading(false); }
  }

  const selectedInvoice = invoices.find(inv => inv.id === selectedInvoiceId);
  const canSubmit = checknumber.trim() && amount && duedate && bankname.trim() && relatedname.trim();

  return (
    <Overlay onClose={onClose}>
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-semibold text-foreground">{isEdit ? t("cheques_title") + " — " + t("lbl_editItem") : t("btn_newCheque")}</h2>
            {isEdit && <p className="text-xs text-muted-foreground font-mono mt-0.5">#{cheque!.code} · {cheque!.checknumber}</p>}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/80">{t("lbl_direction")}</label>
            <div className="grid grid-cols-2 gap-2">
              {[true, false].map(incoming => (
                <button key={String(incoming)} type="button"
                  onClick={() => handleDirectionChange(incoming)}
                  className={`flex items-center justify-center gap-2.5 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    isincoming === incoming
                      ? incoming
                        ? "border-sky-500/50 bg-sky-500/10 text-sky-600 dark:text-sky-400"
                        : "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
                  }`}
                >
                  {incoming
                    ? <><ArrowDownLeft className="w-4 h-4" />{t("dir_incoming")}</>
                    : <><ArrowUpRight className="w-4 h-4" />{t("dir_outgoing")}</>
                  }
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/80">
              {isincoming ? t("lbl_tabCustomer") : t("lbl_supplier")}
            </label>
            <PersonSearch
              value={relatedname}
              onChange={v => { setRelatedname(v); setInvoices([]); setSelectedInvoiceId(""); }}
              onSelect={handlePersonSelect}
              placeholder={`${t("lbl_search")} ${isincoming ? t("lbl_tabCustomer") : t("lbl_supplier")}…`}
            />
          </div>

          {relatedname.trim() && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">
                {t("lbl_linkedInvoice")} <span className="text-muted-foreground font-normal">({t("lbl_optional")})</span>
              </label>
              {loadingInvoices ? (
                <div className="flex items-center gap-2 py-2.5 px-3 border border-border rounded-lg text-muted-foreground text-sm">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />{t("lbl_loadingInvoices")}
                </div>
              ) : invoices.length === 0 ? (
                <div className="py-2.5 px-3 border border-border/50 rounded-lg text-muted-foreground text-sm text-center bg-muted/20">
                  {t("lbl_invoiceNoFound")}
                </div>
              ) : (
                <div className="relative">
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  <select
                    value={selectedInvoiceId}
                    onChange={e => setSelectedInvoiceId(e.target.value)}
                    className="w-full bg-input-background border border-border rounded-lg px-3 pr-9 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 appearance-none cursor-pointer"
                  >
                    <option value="">{t("lbl_noLinkedInvoice")}</option>
                    {invoices.map(inv => (
                      <option key={inv.id} value={inv.id}>
                        #{inv.code} · {isincoming ? t("lbl_tabCustomer") : t("lbl_supplier")} · ${inv.amount.toLocaleString()} (due: ${inv.remainingamount.toLocaleString()}) · {formatDate(inv.generateddate)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {selectedInvoice && (
                <div className={`text-xs px-3 py-2 rounded-lg border flex items-center justify-between ${
                  selectedInvoice.remainingamount > 0
                    ? "bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-300"
                    : "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                }`}>
                  <span>Invoice #{selectedInvoice.code} · Total ${selectedInvoice.amount.toLocaleString()}</span>
                  <span>{t("lbl_remainingAmount")}: ${selectedInvoice.remainingamount.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">{t("lbl_chequeNumber")}</label>
              <input value={checknumber} onChange={e => setChecknumber(e.target.value)} required placeholder="e.g. 00123456" className={inputCls} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">{t("lbl_bankName")}</label>
              <input value={bankname} onChange={e => setBankname(e.target.value)} required placeholder="e.g. National Bank" className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">{t("lbl_amount")}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <input type="number" min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="0.00" className={inputCls + " pl-7"} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">{t("lbl_dueDate")}</label>
              <input type="date" value={duedate} onChange={e => setDuedate(e.target.value)} required className={inputCls + " cursor-pointer"} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/80">{t("lbl_notes")} <span className="text-muted-foreground font-normal">({t("lbl_optional")})</span></label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Any additional notes…" className={inputCls + " resize-none"} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-border text-muted-foreground hover:text-foreground rounded-lg py-2.5 text-sm font-medium transition-all">{t("btn_cancel")}</button>
            <button
              type="submit" disabled={loading || !canSubmit}
              className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" />{isEdit ? t("btn_saveChanges") : t("btn_registerCheque")}</>}
            </button>
          </div>
        </form>
      </div>
    </Overlay>
  );
}
