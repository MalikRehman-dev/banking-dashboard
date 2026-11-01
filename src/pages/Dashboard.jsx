import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBank } from "../context/BankContext";
import { formatMoney } from "../utils/format";
import StatCard from "../components/StatCard";
import Modal from "../components/Modal";
import AmountForm from "../components/AmountForm";
import TransactionTable from "../components/TransactionTable";

export default function Dashboard() {
  const { currentUser, myTransactions, otherUsers } = useBank();
  const navigate = useNavigate();
  const [modal, setModal] = useState(null); // null, "deposit" ya "withdraw"

  // Sirf successful transactions ka total
  function total(type) {
    return myTransactions
      .filter((t) => t.type === type && t.status === "Success")
      .reduce((sum, t) => sum + t.amount, 0);
  }

  return (
    <div>
      <div className="balance-card">
        <div>
          <p>Current balance</p>
          <h1>{formatMoney(currentUser.balance)}</h1>
          <span className="acc-no">Account: {currentUser.accountNumber}</span>
        </div>
        <div className="balance-actions">
          <button className="btn btn-gold" onClick={() => setModal("deposit")}>+ Deposit</button>
          <button className="btn btn-outline-light" onClick={() => setModal("withdraw")}>Withdraw</button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard title="Total deposited" value={formatMoney(total("deposit"))} color="green" />
        <StatCard title="Total withdrawn" value={formatMoney(total("withdraw"))} color="red" />
        <StatCard title="Total transferred" value={formatMoney(total("transfer_sent"))} color="blue" />
      </div>

      <section className="panel">
        <h3>Recent transactions</h3>
        <TransactionTable transactions={myTransactions.slice(0, 5)} />
      </section>

      <section className="panel">
        <h3>Send money to</h3>
        {otherUsers.length === 0 ? (
          <p className="empty">No other users yet.</p>
        ) : (
          <div className="users-grid">
            {otherUsers.map((u) => (
              <div className="user-card" key={u.id}>
                <div className="avatar">{u.name.charAt(0).toUpperCase()}</div>
                <div className="user-info">
                  <strong>{u.name}</strong>
                  <span>{u.accountNumber}</span>
                </div>
                <button className="btn btn-small" onClick={() => navigate("/transfer", { state: { account: u.accountNumber } })}>
                  Send
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {modal && (
        <Modal title={modal === "deposit" ? "Deposit money" : "Withdraw money"} onClose={() => setModal(null)}>
          <AmountForm type={modal} onDone={() => setModal(null)} />
        </Modal>
      )}
    </div>
  );
}
