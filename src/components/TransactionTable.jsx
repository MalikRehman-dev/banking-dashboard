import { formatDate, formatMoney, isIncoming, typeLabels } from "../utils/format";

export default function TransactionTable({ transactions }) {
  if (transactions.length === 0) {
    return <p className="empty">No transactions yet. Make a deposit to get started.</p>;
  }

  return (
    <div className="table-wrap">
      <table className="tx-table">
        <thead>
          <tr>
            <th>Reference</th>
            <th>Type</th>
            <th>Details</th>
            <th>Amount</th>
            <th>Date & time</th>
            <th>Status</th>
            <th>Balance after</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => {
            const incoming = isIncoming(t.type);
            return (
              <tr key={t.id}>
                <td data-label="Reference">{t.ref}</td>
                <td data-label="Type">
                  <span className={incoming ? "badge badge-in" : "badge badge-out"}>
                    {incoming ? "↓" : "↑"} {typeLabels[t.type]}
                  </span>
                </td>
                <td data-label="Details">
                  {t.otherName ? (
                    <span>
                      {(t.type === "transfer_sent" ? "To " : "From ") + t.otherName}
                      <br /><small className="sub">{t.otherAccount}</small>
                    </span>
                  ) : "—"}
                </td>
                <td data-label="Amount" className={incoming ? "amount-in" : "amount-out"}>
                  {incoming ? "+" : "−"} {formatMoney(t.amount)}
                </td>
                <td data-label="Date & time">{formatDate(t.date)}</td>
                <td data-label="Status">
                  <span className={t.status === "Success" ? "status status-ok" : "status status-fail"}>{t.status}</span>
                </td>
                <td data-label="Balance after">{formatMoney(t.balanceAfter)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
