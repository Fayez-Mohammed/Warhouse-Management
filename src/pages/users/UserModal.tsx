import { useState } from "react";
import type React from "react";
import { X, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { API, authHeaders, apiFetch } from "../../lib/api";
import { useLang } from "../../lib/i18n";
import { Overlay } from "../../components/Overlay";
import { ALLOWED_USER_TYPES } from "../../types";
import type { AppUser, AllowedUserType } from "../../types";

export function UserModal({
  user,
  defaultType,
  onClose,
  onDone,
}: {
  user?: AppUser;
  defaultType: AllowedUserType;
  onClose: () => void;
  onDone: () => void;
}) {
  const { t } = useLang();
  const isEdit = !!user;

  const TYPE_LABELS: Record<AllowedUserType, string> = {
    Customer: t("tab_customers").replace(/s$/, ""),
    SalesRep: t("tab_salesReps").replace(/s$/, ""),
    Supplier: t("tab_suppliers").replace(/s$/, ""),
  };

  const [fullname, setFullname] = useState(
    user?.fullname ?? "",
  );
  const [phonenumber, setPhonenumber] = useState(
    user?.phonenumber ?? "",
  );
  const [usertype, setUsertype] = useState<AllowedUserType>(
    (ALLOWED_USER_TYPES as readonly string[]).includes(
      user?.usertype ?? "",
    )
      ? (user!.usertype as AllowedUserType)
      : defaultType,
  );
  const [isactive, setIsactive] = useState(
    user?.isactive ?? true,
  );
  const [loading, setLoading] = useState(false);

  const inputCls =
    "w-full bg-input-background border border-border rounded-lg px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        const res = await apiFetch(
          `${API}/api/users/update?id=${user!.id}`,
          {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify({
              fullname,
              phonenumber,
              usertype,
              isactive,
            }),
          },
        );
        const data = await res.json();
        if (data.statusCode === 200) {
          toast.success("User updated.");
          onDone();
        } else toast.error(data.message || "Update failed.");
      } else {
        const res = await apiFetch(
          `${API}/api/users/create?userType=${usertype}`,
          {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify({ fullname, phonenumber }),
          },
        );
        const data = await res.json();
        if (data.statusCode === 200) {
          toast.success(`${TYPE_LABELS[usertype]} created.`);
          onDone();
        } else toast.error(data.message || "Create failed.");
      }
    } catch {
      toast.error("Request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Overlay onClose={onClose}>
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {isEdit
                ? t("modal_editUser")
                : `${t("btn_new")} ${TYPE_LABELS[defaultType]}`}
            </h2>
            {isEdit && (
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                #{user!.usernumber}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isEdit && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">
                {t("lbl_userType")}
              </label>
              <div className="flex gap-2">
                {ALLOWED_USER_TYPES.map((tp) => (
                  <button
                    key={tp}
                    type="button"
                    onClick={() => setUsertype(tp)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                      usertype === tp
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {TYPE_LABELS[tp]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/80">
              {t("col_name")}
            </label>
            <input
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              required
              placeholder="e.g. Ahmed Mohamed"
              className={inputCls}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/80">
              {t("lbl_phone")}
            </label>
            <input
              value={phonenumber}
              onChange={(e) => setPhonenumber(e.target.value)}
              required
              placeholder="01XXXXXXXXX"
              className={inputCls}
            />
          </div>

          {isEdit && (
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                onClick={() => setIsactive((v) => !v)}
                className={`w-10 h-5.5 relative rounded-full transition-colors ${isactive ? "bg-emerald-500" : "bg-border"}`}
                style={{ height: 22 }}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isactive ? "translate-x-5" : "translate-x-0.5"}`}
                />
              </div>
              <span className="text-sm text-foreground/80">
                {isactive
                  ? t("status_active")
                  : t("status_inactive")}
              </span>
            </label>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-border text-muted-foreground hover:text-foreground rounded-lg py-2.5 text-sm font-medium transition-all"
            >
              {t("btn_cancel")}
            </button>
            <button
              type="submit"
              disabled={
                loading ||
                !fullname.trim() ||
                !phonenumber.trim()
              }
              className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {isEdit
                    ? t("btn_saveChanges")
                    : t("lbl_createItem")}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Overlay>
  );
}