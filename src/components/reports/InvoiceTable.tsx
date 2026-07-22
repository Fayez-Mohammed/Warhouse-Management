import { useState } from "react";
import { Eye, CreditCard } from "lucide-react";

import { formatDate } from "../../lib/utils";
import { useLang } from "../../lib/i18n";
import { InvoiceDetailsModal } from "../../pages/invoices/InvoiceDetailsModal";
import { PayCustomerModal } from "../../pages/invoices/PayCustomerModal";
import { PaySupplierModal } from "../../pages/invoices/PaySupplierModal";
import type { Invoice, InvoiceListItem } from "../../types";

type ModalMode = "details" | "pay";

function resolveId(r: Invoice): string {
  // API may serialize the ID under different field names depending on the endpoint
  return (
    r.invoiceid ??
    r.id ??
    (r as Record<string, unknown>).invoiceId as string ??
    (r as Record<string, unknown>).InvoiceId as string ??
    ""
  );
}

function toListItem(
  r: Invoice,
  type: number,
  recipientName: string,
): InvoiceListItem {
  return {
    id: resolveId(r),
    code: r.invoicecode,
    type,
    recipientname: recipientName,
    amount: r.originalamount,
    paidamount: r.originalamount - r.remainingamount,
    remainingamount: r.remainingamount,
    generateddate: r.invoicedate,
    orderid: null,
    ordercode: null,
    returnrequestid: null,
  };
}

const isCustomerType = (type: number) =>
  type === 1 || type === 2 || type === 4;

export function InvoiceTable({
  title,
  rows,
  invoiceType,
  recipientName = "",
  onPaymentDone,
}: {
  title: string;
  rows: Invoice[];
  invoiceType?: number;
  recipientName?: string;
  onPaymentDone?: () => void;
}) {
  const { t } = useLang();
  const [modal, setModal] = useState<{
    mode: ModalMode;
    item: InvoiceListItem;
  } | null>(null);

  if (!rows.length) return null;

  const showActions = invoiceType !== undefined;
  const canPay = showActions;

  function open(r: Invoice, mode: ModalMode) {
    setModal({
      mode,
      item: toListItem(r, invoiceType ?? 1, recipientName),
    });
  }

  function closeModal() {
    setModal(null);
  }

  function afterPay() {
    setModal(null);
    onPaymentDone?.();
  }

  return (
    <>
      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <div className="px-5 py-3.5 border-b border-border">
          <p className="text-sm font-semibold text-foreground">{title}</p>
        </div>
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-border/50">
              {[
                t("col_invNo"),
                t("col_original"),
                t("col_remaining"),
                t("col_date"),
              ].map((h) => (
                <th
                  key={h}
                  className="text-start py-2.5 px-4 text-xs font-medium text-muted-foreground font-mono"
                >
                  {h}
                </th>
              ))}
              {showActions && <th className="py-2.5 px-4 w-20" />}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={i}
                className="border-b border-border/30 hover:bg-muted/20 transition-colors group"
              >
                <td className="text-start py-3 px-4">
                  <span
                    className="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded"
                    dir="ltr"
                  >
                    #{r.invoicecode}
                  </span>
                </td>
                <td className="text-start py-3 px-4 font-mono text-sm">
                  <span dir="ltr" className="inline-block">
                    ${r.originalamount.toLocaleString()}
                  </span>
                </td>
                <td className="text-start py-3 px-4 font-mono text-sm text-destructive font-semibold">
                  <span dir="ltr" className="inline-block">
                    ${r.remainingamount.toLocaleString()}
                  </span>
                </td>
                <td className="text-start py-3 px-4 text-xs text-muted-foreground font-mono">
                  <span dir="ltr" className="inline-block">
                    {formatDate(r.invoicedate)}
                  </span>
                </td>
                {showActions && (
                  <td className="py-3 px-4">
                    {resolveId(r) && (
                      <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        {/* View details */}
                        <button
                          onClick={() => open(r, "details")}
                          title={t("tooltip_viewDetails")}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Collect / Pay — only when remaining > 0 */}
                        {canPay && r.remainingamount > 0 && (
                          <button
                            onClick={() => open(r, "pay")}
                            title={
                              isCustomerType(invoiceType!)
                                ? t("tooltip_collectPayment")
                                : t("tooltip_paySupplier")
                            }
                            className={`w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground transition-all ${
                              isCustomerType(invoiceType!)
                                ? "hover:text-emerald-500 hover:bg-emerald-500/10"
                                : "hover:text-amber-500 hover:bg-amber-500/10"
                            }`}
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {modal?.mode === "details" && (
        <InvoiceDetailsModal
          invoice={modal.item}
          onClose={closeModal}
        />
      )}
      {modal?.mode === "pay" &&
        modal.item.id &&
        (isCustomerType(modal.item.type) ? (
          <PayCustomerModal
            invoice={modal.item}
            onClose={closeModal}
            onDone={afterPay}
          />
        ) : (
          <PaySupplierModal
            invoice={modal.item}
            onClose={closeModal}
            onDone={afterPay}
          />
        ))}
    </>
  );
}
