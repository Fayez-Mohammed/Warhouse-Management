import type React from "react";

export function StatCard({ label, value, icon, color, bg }: { label: string; value: string; icon: React.ReactNode; color: string; bg: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-start justify-between gap-4">
      <div>
        <p className="text-xs text-muted-foreground font-mono tracking-wide">{label.toUpperCase()}</p>
        <p className="text-2xl font-semibold text-foreground mt-2"><span dir="ltr" className="inline-block">{value}</span></p>
      </div>
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center ${color} shrink-0`}>
        {icon}
      </div>
    </div>
  );
}
