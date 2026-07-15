import { useState } from "react";
import type React from "react";
import { FileText, Activity, PackageSearch, Users, UserCheck, Truck } from "lucide-react";
import { SalesReportTab } from "./SalesReportTab";
import { StockMovementTab } from "./StockMovementTab";
import { CustomerReportTab } from "./CustomerReportTab";
import { SalesRepReportTab } from "./SalesRepReportTab";
import { SupplierReportTab } from "./SupplierReportTab";
import { useLang } from "../../lib/i18n";
import type { ReportTab } from "../../types";

const REPORT_TABS: { value: ReportTab; labelKey: string; icon: React.ReactNode }[] = [
  { value: "sales",    labelKey: "tab_salesReport",   icon: <Activity className="w-4 h-4" /> },
  { value: "stock",    labelKey: "tab_stockMovement", icon: <PackageSearch className="w-4 h-4" /> },
  { value: "customer", labelKey: "tab_customer",       icon: <Users className="w-4 h-4" /> },
  { value: "salesrep", labelKey: "tab_salesRep",      icon: <UserCheck className="w-4 h-4" /> },
  { value: "supplier", labelKey: "tab_supplier",      icon: <Truck className="w-4 h-4" /> },
];

export function ReportsPage() {
  const { t } = useLang();
  const [tab, setTab] = useState<ReportTab>("sales");
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="border-b border-border px-8 py-5 shrink-0">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-lg font-semibold text-foreground">{t("reports_title")}</h1>
        </div>
        <div className="flex gap-1 flex-wrap">
          {REPORT_TABS.map(rt => (
            <button key={rt.value} onClick={() => setTab(rt.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === rt.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
              {rt.icon}{t(rt.labelKey)}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {tab === "sales"    && <SalesReportTab />}
        {tab === "stock"    && <StockMovementTab />}
        {tab === "customer" && <CustomerReportTab />}
        {tab === "salesrep" && <SalesRepReportTab />}
        {tab === "supplier" && <SupplierReportTab />}
      </div>
    </div>
  );
}
