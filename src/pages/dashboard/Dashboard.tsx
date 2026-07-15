import { useState, useEffect } from "react";
import {
  Warehouse, LogOut, Tag, Package, LayoutGrid, ClipboardList,
  BarChart2, ClipboardCheck, Users, Receipt, Landmark, Wallet,
  PanelLeftClose, PanelLeftOpen,
} from "lucide-react";
import { NavItem } from "../../components/NavItem";
import { ThemeToggle } from "../../components/ThemeToggle";
import { LangSwitcher } from "../../components/LangSwitcher";
import { useLang } from "../../lib/i18n";
import { OverviewPage } from "../overview/OverviewPage";
import { CategoriesPage } from "../categories/CategoriesPage";
import { ProductsPage } from "../products/ProductsPage";
import { OrdersPage } from "../orders/OrdersPage";
import { ReportsPage } from "../reports/ReportsPage";
import { InventoryCheckPage } from "../inventory-check/InventoryCheckPage";
import { UsersPage } from "../users/UsersPage";
import { InvoicesPage } from "../invoices/InvoicesPage";
import { ChequesPage } from "../cheques/ChequesPage";
import { ExpensesPage } from "../expenses/ExpensesPage";
import type { UserInfo, Page } from "../../types";

const SIDEBAR_EXPANDED = 240;
const SIDEBAR_COLLAPSED = 56;

export function Dashboard({
  user, onLogout, dark, toggleTheme,
}: {
  user: UserInfo; onLogout: () => void; dark: boolean; toggleTheme: () => void;
}) {
  const { t, isRTL } = useLang();
  const [activePage, setActivePage] = useState<Page>("overview");
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem("sidebar-collapsed") === "true"; }
    catch { return false; }
  });

  useEffect(() => {
    try { localStorage.setItem("sidebar-collapsed", String(collapsed)); }
    catch { /* ignore */ }
  }, [collapsed]);

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  const NAV_SECTIONS = [
    {
      key: "inventory",
      label: t("section_inventory"),
      items: [
        { page: "overview" as Page,        icon: <LayoutGrid className="w-4 h-4" />,     label: t("nav_overview") },
        { page: "categories" as Page,      icon: <Tag className="w-4 h-4" />,             label: t("nav_categories") },
        { page: "products" as Page,        icon: <Package className="w-4 h-4" />,         label: t("nav_products") },
        { page: "orders" as Page,          icon: <ClipboardList className="w-4 h-4" />,   label: t("nav_orders") },
        { page: "reports" as Page,         icon: <BarChart2 className="w-4 h-4" />,       label: t("nav_reports") },
      ],
    },
    {
      key: "operations",
      label: t("section_operations"),
      items: [
        { page: "inventory-check" as Page, icon: <ClipboardCheck className="w-4 h-4" />, label: t("nav_inventoryCheck") },
      ],
    },
    {
      key: "finance",
      label: t("section_finance"),
      items: [
        { page: "invoices" as Page,        icon: <Receipt className="w-4 h-4" />,         label: t("nav_invoices") },
        { page: "cheques" as Page,         icon: <Landmark className="w-4 h-4" />,        label: t("nav_cheques") },
        { page: "expenses" as Page,        icon: <Wallet className="w-4 h-4" />,          label: t("nav_expenses") },
      ],
    },
    {
      key: "contacts",
      label: t("section_contacts"),
      items: [
        { page: "users" as Page,           icon: <Users className="w-4 h-4" />,           label: t("nav_users") },
      ],
    },
  ];

  return (
    <div
      className="min-h-screen bg-background flex"
      style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "'Outfit', sans-serif" }}
    >

      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside
        className="shrink-0 flex flex-col bg-card overflow-hidden"
        style={{
          width: sidebarWidth,
          transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          borderRight: isRTL ? "none" : "1px solid var(--border)",
          borderLeft: isRTL ? "1px solid var(--border)" : "none",
          order: isRTL ? 2 : 0,
        }}
      >
        {/* Logo row */}
        <div
          className="flex items-center border-b border-border shrink-0"
          style={{
            padding: collapsed ? "20px 0" : "20px",
            justifyContent: collapsed ? "center" : "space-between",
            transition: "padding 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Warehouse className="w-4 h-4 text-white" />
            </div>
            <span
              className="text-foreground font-semibold text-sm overflow-hidden whitespace-nowrap transition-all duration-200"
              style={{ maxWidth: collapsed ? 0 : 120, opacity: collapsed ? 0 : 1 }}
            >
              WarehouseOS
            </span>
          </div>

          <button
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? t("sidebar_expand") : t("sidebar_collapse")}
            className={`shrink-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60
                        transition-all duration-200 flex items-center justify-center w-7 h-7 ${
              collapsed ? "absolute left-1/2 -translate-x-1/2 bottom-[-18px] z-10 bg-card border border-border shadow-sm" : ""
            }`}
            style={collapsed ? { position: "relative", transform: "none", bottom: "auto" } : {}}
          >
            {collapsed
              ? <PanelLeftOpen className="w-3.5 h-3.5" />
              : <PanelLeftClose className="w-3.5 h-3.5" />
            }
          </button>
        </div>

        {/* Nav */}
        <nav
          className="flex-1 overflow-y-auto overflow-x-hidden py-3"
          style={{ padding: collapsed ? "12px 6px" : "12px" }}
        >
          {NAV_SECTIONS.map(section => (
            <div key={section.key} className="mb-4">
              {!collapsed && (
                <p className="text-xs font-semibold text-muted-foreground/50 tracking-widest px-2 mb-1.5 font-mono overflow-hidden whitespace-nowrap">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map(item => (
                  <NavItem
                    key={item.page}
                    icon={item.icon}
                    label={item.label}
                    active={activePage === item.page}
                    onClick={() => setActivePage(item.page)}
                    collapsed={collapsed}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div
          className="border-t border-border shrink-0 transition-all duration-200"
          style={{ padding: collapsed ? "12px 6px" : "16px" }}
        >
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <div
                title={user.username}
                className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center text-primary text-xs font-semibold font-mono cursor-default"
              >
                {user.username.slice(0, 2).toUpperCase()}
              </div>
              <ThemeToggle dark={dark} toggle={toggleTheme} />
              <button
                onClick={onLogout}
                title={t("btn_signOut")}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center text-primary text-xs font-semibold font-mono shrink-0">
                {user.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <p
                  className="text-xs font-medium text-foreground truncate whitespace-nowrap transition-all duration-200"
                  style={{ opacity: collapsed ? 0 : 1 }}
                >
                  {user.username}
                </p>
                <p
                  className="text-xs text-muted-foreground font-mono transition-all duration-200"
                  style={{ opacity: collapsed ? 0 : 1 }}
                >
                  {user.usertype}
                </p>
              </div>
              <ThemeToggle dark={dark} toggle={toggleTheme} />
              <button
                onClick={onLogout}
                title={t("btn_signOut")}
                className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar with language switcher */}
        <div className="shrink-0 flex items-center justify-end px-6 py-2 border-b border-border bg-card/50">
          <LangSwitcher />
        </div>

        {activePage === "overview"         && <OverviewPage />}
        {activePage === "categories"       && <CategoriesPage />}
        {activePage === "products"         && <ProductsPage />}
        {activePage === "orders"           && <OrdersPage />}
        {activePage === "reports"          && <ReportsPage />}
        {activePage === "inventory-check"  && <InventoryCheckPage />}
        {activePage === "invoices"         && <InvoicesPage />}
        {activePage === "cheques"          && <ChequesPage />}
        {activePage === "expenses"         && <ExpensesPage />}
        {activePage === "users"            && <UsersPage />}
      </main>
    </div>
  );
}
