import { useState, useEffect } from "react";
import {
  X,
  Check,
  Loader2,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { API, authHeaders, apiFetch } from "../../lib/api";
import { Overlay } from "../../components/Overlay";
import type { OrderReturnItem } from "../../types";

interface ReturnRow {
  productname: string;
  maxQty: number;
  quantity: string;
  reason: string;
  selected: boolean;
}

export function CustomerReturnModal({
  orderId,
  orderCode,
  onClose,
  onDone,
}: {
  orderId: string;
  orderCode: number;
  onClose: () => void;
  onDone: () => void;
}) {
  const [items, setItems] = useState<ReturnRow[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    async function load() {
      setLoadingItems(true);
      setFetchError(null);
      try {
        const res = await apiFetch(
          `${API}/api/Returns/OrderItemsByOrderId?orderId=${orderId}&skip=0&take=50`,
          { headers: authHeaders() },
        );
        const data = await res.json();
        const raw: OrderReturnItem[] = data.value ?? [];
        if (raw.length === 0) {
          setFetchError(
            "No returnable items found for this order.",
          );
        } else {
          setItems(
            raw.map((r) => ({
              productname: r.productname,
              maxQty: r.quantity,
              quantity: String(r.quantity),
              reason: "",
              selected: true,
            })),
          );
        }
      } catch {
        setFetchError("Failed to load order items.");
      } finally {
        setLoadingItems(false);
      }
    }
    load();
  }, [orderId]);

  function update(
    i: number,
    field: keyof ReturnRow,
    val: string | boolean,
  ) {
    setItems((rows) =>
      rows.map((row, idx) =>
        idx === i ? { ...row, [field]: val } : row,
      ),
    );
  }

  const selectedRows = items.filter((r) => r.selected);
  const isValid =
    selectedRows.length > 0 &&
    selectedRows.every(
      (r) =>
        Number(r.quantity) > 0 &&
        Number(r.quantity) <= r.maxQty &&
        r.reason.trim(),
    );

  async function handleSubmit() {
    if (!isValid) return;
    setSubmitting(true);
    try {
      const body = {
        orderid: orderId,
        items: selectedRows.map((r) => ({
          productname: r.productname,
          quantity: Number(r.quantity),
          reason: r.reason.trim(),
        })),
      };
      const res = await apiFetch(`${API}/api/Returns`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.statusCode === 200) {
        toast.success("Return submitted and approved.");
        onDone();
      } else {
        toast.error(data.message || "Return failed.");
      }
    } catch {
      toast.error("Request failed.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls =
    "bg-input-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all";

  return (
    <Overlay onClose={onClose}>
      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-500" />
              Customer Return
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
              Order #{orderCode}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto px-6 py-4">
          {loadingItems && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {!loadingItems && fetchError && (
            <div className="flex items-center gap-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{fetchError}</span>
            </div>
          )}

          {!loadingItems && !fetchError && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground font-mono tracking-widest mb-4">
                SELECT ITEMS TO RETURN
              </p>
              {items.map((row, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-xl border transition-all ${row.selected ? "bg-muted/30 border-border" : "bg-muted/10 border-border/40 opacity-50"}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={row.selected}
                      onChange={(e) =>
                        update(i, "selected", e.target.checked)
                      }
                      className="w-4 h-4 accent-primary cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-foreground">
                        {row.productname}
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground font-mono">
                        max {row.maxQty} units
                      </span>
                    </div>
                  </div>

                  {row.selected && (
                    <div className="grid grid-cols-3 gap-3 ml-7">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={row.maxQty}
                          value={row.quantity}
                          onChange={(e) =>
                            update(
                              i,
                              "quantity",
                              e.target.value,
                            )
                          }
                          className={inputCls}
                        />
                        {Number(row.quantity) > row.maxQty && (
                          <p className="text-xs text-destructive">
                            Max {row.maxQty}
                          </p>
                        )}
                      </div>
                      <div className="col-span-2 space-y-1">
                        <label className="text-xs text-muted-foreground">
                          Reason *
                        </label>
                        <input
                          value={row.reason}
                          onChange={(e) =>
                            update(i, "reason", e.target.value)
                          }
                          placeholder="e.g. damaged, not needed…"
                          className={inputCls + " w-full"}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {!loadingItems && !fetchError && (
          <div className="flex gap-3 px-6 py-4 border-t border-border shrink-0">
            <button
              onClick={onClose}
              className="flex-1 border border-border text-muted-foreground hover:text-foreground rounded-lg py-2.5 text-sm font-medium transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !isValid}
              className="flex-1 bg-amber-500 hover:bg-amber-500/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-all"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Submit Return
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </Overlay>
  );
}