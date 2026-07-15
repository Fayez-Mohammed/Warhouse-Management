import { formatDate } from "../../lib/utils";
import { useLang } from "../../lib/i18n";
import type { Invoice } from "../../types";

export function InvoiceTable({ title, rows }: { title: string; rows: Invoice[] }) {
  const { t } = useLang();
  if (!rows.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border">
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </div>
      <table className="w-full text-sm">
        <thead><tr className="border-b border-border/50">{[t("col_invNo"),t("col_original"),t("col_remaining"),t("col_date")].map(h=><th key={h} className="text-start py-2.5 px-4 text-xs font-medium text-muted-foreground font-mono">{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={i} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
              <td className="text-start py-3 px-4"><span className="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded" dir="ltr">#{r.invoicecode}</span></td>
              <td className="text-start py-3 px-4 font-mono text-sm"><span dir="ltr" className="inline-block">${r.originalamount.toLocaleString()}</span></td>
              <td className="text-start py-3 px-4 font-mono text-sm text-destructive font-semibold"><span dir="ltr" className="inline-block">${r.remainingamount.toLocaleString()}</span></td>
              <td className="text-start py-3 px-4 text-xs text-muted-foreground font-mono"><span dir="ltr" className="inline-block">{formatDate(r.invoicedate)}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
