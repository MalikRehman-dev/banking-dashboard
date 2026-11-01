import { useState } from "react";
import { useBank } from "../context/BankContext";
import useBusy from "../hooks/useBusy";
import FormInput from "./FormInput";

// type = "deposit" ya "withdraw"
export default function AmountForm({ type, onDone }) {
  const { deposit, withdraw, showToast } = useBank();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [busy, run] = useBusy();

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    run(() => {
      const result = type === "deposit" ? deposit(amount) : withdraw(amount);
      if (result.ok) {
        showToast(result.message, "success");
        onDone();
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormInput label="Amount (Rs.)" type="number" step="0.01" placeholder="e.g. 5000"
        value={amount} onChange={(e) => setAmount(e.target.value)} error={error} />
      <button className="btn btn-primary btn-full" disabled={busy}>
        {busy ? "Processing..." : type === "deposit" ? "Deposit money" : "Withdraw money"}
      </button>
    </form>
  );
}
