import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useBank } from "../context/BankContext";
import { formatMoney } from "../utils/format";
import FormInput from "../components/FormInput";
import Modal from "../components/Modal";
import useBusy from "../hooks/useBusy";

export default function Transfer() {
  const { currentUser, otherUsers, transfer, showToast } = useBank();
  const location = useLocation();
  const [account, setAccount] = useState(location.state?.account || "");
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, run] = useBusy();

  // Jo account number likha hai uska user dhoondo
  const recipient = otherUsers.find((u) => u.accountNumber === account.trim().toUpperCase());

  // Step 1: form check karke confirm popup kholo
  function handleSubmit(e) {
    e.preventDefault();
    const newErrors = {};
    if (!account.trim()) newErrors.account = "Select a user or type an account number.";
    if (!amount || Number(amount) <= 0) newErrors.amount = "Enter an amount greater than 0.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setConfirmOpen(true);
  }

  // Step 2: confirm par asli transfer
  function handleConfirm() {
    run(() => {
      const result = transfer(account.trim().toUpperCase(), amount);
      setConfirmOpen(false);
      if (result.ok) {
        showToast(result.message, "success");
        setAmount("");
        setAccount("");
        setErrors({});
      } else {
        // Galat account, apna account, kam balance, sab ke errors yahan dikhte hain
        const msg = result.message.toLowerCase();
        const key = msg.includes("amount") || msg.includes("insufficient") ? "amount" : "account";
        setErrors({ [key]: result.message });
      }
    });
  }

  return (
    <div>
      <h2 className="page-title">Transfer money</h2>

      <div className="transfer-grid">
        <div className="panel">
          <p className="muted">Available balance: <strong>{formatMoney(currentUser.balance)}</strong></p>

          <form onSubmit={handleSubmit}>
            <FormInput label="Recipient account number" placeholder="e.g. PK1000000002"
              value={account} onChange={(e) => setAccount(e.target.value)} error={errors.account} />
            {recipient && <p className="recipient-ok">✔ {recipient.name}</p>}

            <FormInput label="Amount (Rs.)" type="number" step="0.01" placeholder="e.g. 2500"
              value={amount} onChange={(e) => setAmount(e.target.value)} error={errors.amount} />

            <button className="btn btn-primary btn-full">Continue</button>
          </form>
        </div>

        <div className="panel">
          <h3>Registered users</h3>
          {otherUsers.length === 0 ? (
            <p className="empty">No other users yet.</p>
          ) : (
            <div className="pick-list">
              {otherUsers.map((u) => (
                <button type="button" key={u.id}
                  className={u.accountNumber === account ? "pick-item picked" : "pick-item"}
                  onClick={() => setAccount(u.accountNumber)}>
                  <span className="avatar">{u.name.charAt(0).toUpperCase()}</span>
                  <span className="pick-text">
                    <strong>{u.name}</strong>
                    <small>{u.accountNumber}</small>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {confirmOpen && (
        <Modal title="Confirm transfer" onClose={() => !busy && setConfirmOpen(false)}>
          <div className="detail"><span>To</span><strong>{recipient ? recipient.name : "Unknown account"}</strong></div>
          <div className="detail"><span>Account</span><strong>{account.trim().toUpperCase()}</strong></div>
          <div className="detail"><span>Amount</span><strong>{formatMoney(amount)}</strong></div>
          <button className="btn btn-primary btn-full confirm-btn" onClick={handleConfirm} disabled={busy}>
            {busy ? "Sending..." : "Confirm & send"}
          </button>
        </Modal>
      )}
    </div>
  );
}
