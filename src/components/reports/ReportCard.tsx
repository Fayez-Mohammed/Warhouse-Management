export function ReportCard({ label, value, sub, color = "text-foreground" }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-xs text-muted-foreground font-mono tracking-wider">{label}</p>
      <p className={`text-2xl font-semibold mt-1.5 ${color}`}><span dir="ltr" className="inline-block">{value}</span></p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}
