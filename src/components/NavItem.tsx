import type React from "react";

export function NavItem({
  icon, label, active, onClick, collapsed,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  collapsed?: boolean;
}) {
  return (
    <div className="relative group/nav">
      <button
        onClick={onClick}
        title={collapsed ? label : undefined}
        className={`w-full flex items-center rounded-lg text-sm transition-all duration-200 ${
          collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2"
        } ${
          active
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        }`}
      >
        <span className="shrink-0">{icon}</span>
        <span
          className="overflow-hidden whitespace-nowrap transition-all duration-200"
          style={{
            maxWidth: collapsed ? 0 : 160,
            opacity: collapsed ? 0 : 1,
          }}
        >
          {label}
        </span>
      </button>

      {/* Tooltip — only when collapsed */}
      {collapsed && (
        <div
          className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 z-50 ml-3
                     opacity-0 group-hover/nav:opacity-100 transition-opacity duration-150"
        >
          <span className="block bg-card border border-border text-foreground text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
            {label}
          </span>
        </div>
      )}
    </div>
  );
}
