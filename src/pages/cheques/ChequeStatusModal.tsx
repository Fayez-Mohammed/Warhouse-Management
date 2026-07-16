import { useState } from "react";
import {
  X,
  Loader2,
  CheckCircle,
  XCircle,
  Ban,
  Banknote,
} from "lucide-react";
import { toast } from "sonner";
import { API, authHeaders, apiFetch } from "../../lib/api";
import { useLang } from "../../lib/i18n";
import { Overlay } from "../../components/Overlay";
import type { Cheque } from "../../types";

interface StatusOption {
  value: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  style: string;
}

function getTransitions(
  cheque: Cheque,
  t: (k: string) => string,
): StatusOption[] {
  if (cheque.isincoming) {
    return [
      {
        value: "Collected",
        label: t("status_collected"),
        description:
          "Cheque has been banked and funds received.",
        icon: <CheckCircle className="w-5 h-5" />,
        style:
          "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:border-emerald-500/60 hover:bg-emerald-500/15",
      },
      {
        value: "Rejected",
        label: t("status_rejected"),
        description:
          "Cheque bounced or was returned by the bank.",
        icon: <XCircle className="w-5 h-5" />,
        style:
          "border-destructive/40 bg-destructive/10 text-destructive hover:border-destructive/60 hover:bg-destructive/15",
      },
      {
        value: "Cancelled",
        label: t("status_cancelled"),
        description:
          "Cheque is voided and will not be processed.",
        icon: <Ban className="w-5 h-5" />,
        style:
          "border-border text-muted-foreground hover:border-border/80 hover:bg-muted/30 hover:text-foreground",
      },
    ];
  } else {
    return [
      {
        value: "Paid",
        label: t("status_paid"),
        description:
          "Cheque has been paid and supplier funds disbursed.",
        icon: <Banknote className="w-5 h-5" />,
        style:
          "border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:border-sky-500/60 hover:bg-sky-500/15",
      },
      {
        value: "Rejected",
        label: t("status_rejected"),
        description: "Cheque was rejected or returned.",
        icon: <XCircle className="w-5 h-5" />,
        style:
          "border-destructive/40 bg-destructive/10 text-destructive hover:border-destructive/60 hover:bg-destructive/15",
      },
      {
        value: "Cancelled",
        label: t("status_cancelled"),
        description:
          "Cheque is voided and will not be processed.",
        icon: <Ban className="w-5 h-5" />,
        style:
          "border-border text-muted-foreground hover:border-border/80 hover:bg-muted/30 hover:text-foreground",
      },
    ];
  }
}

export function ChequeStatusModal({
  cheque,
  onClose,
  onDone,
}: {
  cheque: Cheque;
  onClose: () => void;
  onDone: () => void;
}) {
  const { t } = useLang();
  const [loading, setLoading] = useState<string | null>(null);
  const transitions = getTransitions(cheque, t);

  async function handleTransition(newStatus: string) {
    setLoading(newStatus);
    try {
      const res = await apiFetch(
        `${API}/api/Cheques/update-status?cheqId=${cheque.id}&newStatus=${newStatus}`,
        { method: "PUT", headers: authHeaders() },
      );
      const data = await res.json();
      if (data.statusCode === 200) {
        toast.success(
          `Cheque #${cheque.code} marked as ${newStatus}.`,
        );
        onDone();
      } else {
        toast.error(data.message || "Status update failed.");
      }
    } catch {
      toast.error("Request failed.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <Overlay onClose={onClose}>
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {t("btn_updateStatus")}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              #{cheque.code} · {cheque.checknumber} ·{" "}
              {cheque.relatedname}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">
            Current:
          </span>
          <span className="font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-xs">
            {t(`status_${cheque.status.toLowerCase()}`)}
          </span>
          <span className="text-muted-foreground">→</span>
        </div>

        <div className="space-y-2">
          {transitions.map((tr) => (
            <button
              key={tr.value}
              onClick={() => handleTransition(tr.value)}
              disabled={!!loading}
              className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl border-2 text-left transition-all disabled:opacity-60 disabled:cursor-not-allowed ${tr.style}`}
            >
              <div className="shrink-0">
                {loading === tr.value ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  tr.icon
                )}
              </div>
              <div>
                <p className="font-medium text-sm">
                  {tr.label}
                </p>
                <p className="text-xs opacity-75 mt-0.5">
                  {tr.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full border border-border text-muted-foreground hover:text-foreground rounded-lg py-2.5 text-sm font-medium transition-all"
        >
          {t("status_pending")}
        </button>
      </div>
    </Overlay>
  );
}