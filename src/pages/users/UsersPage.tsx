import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  Users,
  Plus,
  Search,
  X,
  Pencil,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  PowerOff,
  UserCheck,
  Truck,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import type React from "react";
import { API, authHeaders, apiFetch } from "../../lib/api";
import { useLang } from "../../lib/i18n";
import { formatDate } from "../../lib/utils";
import { UserModal } from "./UserModal";
import { UserDeleteModal } from "./UserDeleteModal";
import { CustomerAccountModal } from "./CustomerAccountModal";
import { SupplierAccountModal } from "./SupplierAccountModal";
import type { AppUser, AllowedUserType } from "../../types";

// ─── Tab config ────────────────────────────────────────────────────────────────

interface TabConfig {
  type: AllowedUserType;
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
}

const TABS: TabConfig[] = [
  {
    type: "Customer",
    label: "Customers",
    icon: <Users className="w-4 h-4" />,
    color: "text-sky-500",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
  },
  {
    type: "SalesRep",
    label: "Sales Reps",
    icon: <UserCheck className="w-4 h-4" />,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  {
    type: "Supplier",
    label: "Suppliers",
    icon: <Truck className="w-4 h-4" />,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
];

const PAGE_SIZE = 20;

type ModalState =
  | { type: "create" }
  | { type: "edit"; user: AppUser }
  | { type: "delete"; user: AppUser }
  | { type: "account-customer"; user: AppUser }
  | { type: "account-supplier"; user: AppUser };

// ─── Component ────────────────────────────────────────────────────────────────

const TAB_LABEL_KEY: Record<AllowedUserType, string> = {
  Customer: "tab_customers",
  SalesRep: "tab_salesReps",
  Supplier: "tab_suppliers",
};

export function UsersPage() {
  const { t, isRTL } = useLang();
  const tabLabel = (type: AllowedUserType) =>
    t(TAB_LABEL_KEY[type]);
  const [activeTab, setActiveTab] =
    useState<AllowedUserType>("Customer");
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<
    boolean | undefined
  >(undefined);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(
    null,
  );
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  const tab = TABS.find((t) => t.type === activeTab)!;

  const fetchUsers = useCallback(
    async (
      p: number,
      q: string,
      active: boolean | undefined,
      type: AllowedUserType,
    ) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          userType: type,
          page: String(p),
          pageSize: String(PAGE_SIZE),
        });
        if (q.trim()) params.set("search", q.trim());
        if (active !== undefined)
          params.set("isActive", String(active));

        const res = await apiFetch(
          `${API}/api/users/list?${params}`,
          { headers: authHeaders() },
        );
        const data = await res.json();
        setUsers(data.users ?? []);
        setTotalCount(data.filteredcount ?? 0);
      } catch {
        toast.error("Failed to load users.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Refetch when tab or filter changes (immediate)
  useEffect(() => {
    setPage(1);
    setSearch("");
    fetchUsers(1, "", filterActive, activeTab);
  }, [activeTab, filterActive, fetchUsers]);

  // Debounce search input
  useEffect(() => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      fetchUsers(1, search, filterActive, activeTab);
    }, 300);
    return () => clearTimeout(searchTimer.current);
  }, [search]); // eslint-disable-line

  function goPage(dir: "prev" | "next") {
    const next = dir === "next" ? page + 1 : page - 1;
    setPage(next);
    fetchUsers(next, search, filterActive, activeTab);
  }

  async function toggleActive(user: AppUser) {
    setTogglingId(user.id);
    try {
      const res = await apiFetch(
        `${API}/api/users/toggle-active?id=${user.id}`,
        {
          method: "PATCH",
          headers: authHeaders(),
        },
      );
      const data = await res.json();
      if (data.statusCode === 200) {
        toast.success(
          `${user.fullname} is now ${user.isactive ? "inactive" : "active"}.`,
        );
        fetchUsers(page, search, filterActive, activeTab);
      } else {
        toast.error(data.message || "Toggle failed.");
      }
    } catch {
      toast.error("Request failed.");
    } finally {
      setTogglingId(null);
    }
  }

  function afterMutation() {
    setModal(null);
    fetchUsers(page, search, filterActive, activeTab);
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background/50">
      {/* Page header */}
      <div className="border-b border-border px-4 sm:px-8 py-5 flex items-center justify-between shrink-0 bg-background">
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            {t("users_title")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("users_subtitle")}
          </p>
        </div>
        <button
          onClick={() => setModal({ type: "create" })}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          {t("modal_newUser")}
        </button>
      </div>

      {/* Tab bar */}
      <div className="px-4 sm:px-8 pt-4 border-b border-border shrink-0 bg-background">
        <div className="flex gap-1">
          {TABS.map((tb) => (
            <button
              key={tb.type}
              onClick={() => setActiveTab(tb.type)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium border-b-2 transition-all ${
                activeTab === tb.type
                  ? `${tb.color} border-current`
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              {tb.icon}
              {tabLabel(tb.type)}
            </button>
          ))}
        </div>
      </div>

      {/* Toolbar: search + active filter */}
      <div className="px-4 sm:px-8 py-3.5 border-b border-border shrink-0 flex items-center gap-3 flex-wrap bg-background">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("lbl_searchName")}
            className="w-full bg-input-background border border-border rounded-lg ps-9 pe-9 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Active filter pills */}
        <div className="flex items-center gap-1.5 bg-muted/40 rounded-lg p-1 border border-border">
          {([undefined, true, false] as const).map((v) => (
            <button
              key={String(v)}
              onClick={() => setFilterActive(v)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                filterActive === v
                  ? "bg-card text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {v === undefined
                ? t("filter_all")
                : v
                  ? t("filter_active")
                  : t("filter_inactive")}
            </button>
          ))}
        </div>

        {totalCount > 0 && (
          <span
            className={`text-xs font-mono px-2.5 py-1 rounded-full border ${tab.bg} ${tab.color} ${tab.border}`}
          >
            {totalCount} {t("unit_users")}
          </span>
        )}
      </div>

      {/* Table Container with White Card Design */}
      <div className="flex-1 overflow-auto px-4 sm:px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : users.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-24 flex flex-col items-center justify-center gap-3 shadow-sm">
            <div
              className={`w-12 h-12 rounded-xl ${tab.bg} flex items-center justify-center ${tab.color}`}
            >
              {tab.icon}
            </div>
            <p className="text-muted-foreground text-sm">
              {t("lbl_noData")}
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-x-auto shadow-sm">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/10">
                  {[
                    { key: "hash", label: "#" },
                    { key: "col_name", label: t("col_name") },
                    { key: "col_phone", label: t("col_phone") },
                    {
                      key: "col_status",
                      label: t("col_status"),
                    },
                    {
                      key: "col_created",
                      label: t("col_created"),
                    },
                  ].map((h) => (
                    <th
                      key={h.key}
                      className="text-start py-3.5 px-5 text-xs font-semibold text-muted-foreground font-mono tracking-wider"
                    >
                      {h.label}
                    </th>
                  ))}
                  <th className="py-3.5 px-5 w-16" />
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr
                    key={u.id}
                    className={`border-b border-border/50 hover:bg-muted/20 transition-colors group ${i === users.length - 1 ? "border-b-0" : ""}`}
                  >
                    <td className="text-start py-3.5 px-5">
                      <span
                        className={`font-mono text-xs px-2 py-0.5 rounded ${tab.bg} ${tab.color}`}
                        dir="ltr"
                      >
                        #{u.usernumber}
                      </span>
                    </td>
                    <td className="text-start py-3.5 px-5 font-medium text-foreground">
                      {u.fullname}
                    </td>
                    <td className="text-start py-3.5 px-5 font-mono text-xs text-muted-foreground">
                      <span dir="ltr" className="inline-block">
                        {u.phonenumber || "—"}
                      </span>
                    </td>
                    <td className="text-start py-3.5 px-5">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                          u.isactive
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        {u.isactive
                          ? t("status_active")
                          : t("status_inactive")}
                      </span>
                    </td>
                    <td className="text-start py-3.5 px-5 font-mono text-xs text-muted-foreground">
                      <span dir="ltr" className="inline-block">
                        {formatDate(u.dateofcreation)}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        {/* Account summary for Customer/Supplier */}
                        {(activeTab === "Customer" ||
                          activeTab === "Supplier") && (
                          <button
                            onClick={() =>
                              setModal({
                                type:
                                  activeTab === "Customer"
                                    ? "account-customer"
                                    : "account-supplier",
                                user: u,
                              })
                            }
                            title={t("tooltip_viewAccount")}
                            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-sky-500 hover:bg-sky-500/10 transition-all"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {/* Toggle active */}
                        <button
                          onClick={() => toggleActive(u)}
                          disabled={togglingId === u.id}
                          title={
                            u.isactive
                              ? t("tooltip_deactivate")
                              : t("tooltip_activate")
                          }
                          className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${
                            u.isactive
                              ? "text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10"
                              : "text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10"
                          }`}
                        >
                          {togglingId === u.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <PowerOff className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() =>
                            setModal({ type: "edit", user: u })
                          }
                          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setModal({
                              type: "delete",
                              user: u,
                            })
                          }
                          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="border-t border-border px-4 sm:px-8 py-3.5 flex items-center justify-between shrink-0 bg-background">
          <p className="text-xs text-muted-foreground font-mono">
            {t("pagination_page")} {page} {t("pagination_of")}{" "}
            {totalPages} — {totalCount} {tabLabel(activeTab)}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => goPage("prev")}
              disabled={page === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted/50 transition-all"
            >
              {isRTL ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
            <span className="text-xs text-muted-foreground px-2 font-mono">
              {page}
            </span>
            <button
              onClick={() => goPage("next")}
              disabled={page >= totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted/50 transition-all"
            >
              {isRTL ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {modal?.type === "create" && (
        <UserModal
          defaultType={activeTab}
          onClose={() => setModal(null)}
          onDone={afterMutation}
        />
      )}
      {modal?.type === "edit" && (
        <UserModal
          user={modal.user}
          defaultType={activeTab}
          onClose={() => setModal(null)}
          onDone={afterMutation}
        />
      )}
      {modal?.type === "delete" && (
        <UserDeleteModal
          user={modal.user}
          onClose={() => setModal(null)}
          onDone={afterMutation}
        />
      )}
      {modal?.type === "account-customer" && (
        <CustomerAccountModal
          user={modal.user}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === "account-supplier" && (
        <SupplierAccountModal
          user={modal.user}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}