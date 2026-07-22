import { useState } from "react";
import type React from "react";
import {
  X,
  Check,
  Plus,
  Loader2,
  UserCheck,
  Phone,
  Percent,
} from "lucide-react";
import { toast } from "sonner";
import { API, authHeaders, apiFetch } from "../../lib/api";
import { useLang } from "../../lib/i18n";
import { Overlay } from "../../components/Overlay";
import { PersonAutocomplete } from "../../components/autocomplete/PersonAutocomplete";
import { ProductNameAutocomplete } from "../../components/autocomplete/ProductNameAutocomplete";

interface OrderItem {
  productname: string;
  quantity: string;
}

export function CreateDirectOrderModal({
  onClose,
  onDone,
}: {
  onClose: () => void;
  onDone: () => void;
}) {
  const { t } = useLang();
  const [salesrepname, setSalesrepname] = useState("");
  const [customername, setCustomername] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [commission, setCommission] = useState("1.75");
  const [items, setItems] = useState<OrderItem[]>([
    { productname: "", quantity: "" },
  ]);
  const [loading, setLoading] = useState(false);

  function updateItem(
    i: number,
    k: keyof OrderItem,
    v: string,
  ) {
    setItems((arr) =>
      arr.map((item, idx) =>
        idx === i ? { ...item, [k]: v } : item,
      ),
    );
  }
  function addItem() {
    setItems((arr) => [
      ...arr,
      { productname: "", quantity: "" },
    ]);
  }
  function removeItem(i: number) {
    setItems((arr) => arr.filter((_, idx) => idx !== i));
  }

  const inputCls =
    "w-full bg-input-background border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        salesrepname: salesrepname || null,
        customername,
        phonenumber,
        items: items.map((it) => ({
          productname: it.productname,
          quantity: Number(it.quantity),
        })),
      };
      const res = await apiFetch(
        `${API}/api/Orders/create-direct?CommissionPercentage=${encodeURIComponent(commission)}`,
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(body),
        },
      );
      const data = await res.json();
      if (data.statusCode === 200) {
        toast.success(
          `Order created — code: ${data.ordercode?.slice(0, 8)}…`,
        );
        onDone();
      } else
        toast.error(data.message || "Order creation failed.");
    } catch {
      toast.error("Request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Overlay onClose={onClose}>
      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {t("modal_newDirectSale")}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Saves order, dispatches stock, and issues invoice
              in one step
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-border shrink-0 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  {t("lbl_tabCustomer")} *
                </label>
                <PersonAutocomplete
                  value={customername}
                  onChange={setCustomername}
                  endpoint="/api/Orders/customers/autocomplete"
                  placeholder="Customer name…"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  {t("lbl_phone")}
                </label>
                <input
                  value={phonenumber}
                  onChange={(e) =>
                    setPhonenumber(e.target.value)
                  }
                  placeholder="01XXXXXXXXX"
                  className={inputCls}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  {t("lbl_tabSalesRep")}{" "}
                  <span className="opacity-50">
                    ({t("lbl_optional")})
                  </span>
                </label>
                <PersonAutocomplete
                  value={salesrepname}
                  onChange={setSalesrepname}
                  endpoint="/api/Orders/salesrep/autocomplete"
                  placeholder="Rep name…"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5" />
                  {t("col_commission")} %
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={commission}
                  onChange={(e) =>
                    setCommission(e.target.value)
                  }
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto px-6 py-4 space-y-3">
            <p className="text-xs font-medium text-muted-foreground font-mono tracking-widest">
              ITEMS
            </p>
            {items.map((item, i) => (
              <div
                key={i}
                className="grid grid-cols-5 gap-2 items-end p-3 bg-muted/30 rounded-xl border border-border/50"
              >
                <div className="col-span-3 space-y-1">
                  <label className="text-xs text-muted-foreground">
                    {t("col_product")} *
                  </label>
                  <ProductNameAutocomplete
                    value={item.productname}
                    onChange={(v) =>
                      updateItem(i, "productname", v)
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">
                    {t("col_qty")} *
                  </label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(i, "quantity", e.target.value)
                    }
                    required
                    placeholder="0"
                    min="1"
                    className={inputCls}
                  />
                </div>
                <div className="flex items-end">
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addItem}
              className="w-full border border-dashed border-border rounded-xl py-2.5 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t("lbl_addRow")}
            </button>
          </div>

          <div className="flex gap-3 px-6 py-4 border-t border-border shrink-0">
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
                !customername.trim()
              }
              className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {t("btn_confirm")}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Overlay>
  );
}