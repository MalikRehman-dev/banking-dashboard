// Paisay ko Rs. format me dikhane ke liye
export function formatMoney(amount) {
  return "Rs. " + Number(amount).toLocaleString("en-PK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Date aur time dikhane ke liye
export function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString("en-GB") + ", " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export const typeLabels = {
  deposit: "Deposit",
  withdraw: "Withdrawal",
  transfer_sent: "Transfer Sent",
  transfer_received: "Transfer Received",
};

// Incoming = paisay account me aaye
export function isIncoming(type) {
  return type === "deposit" || type === "transfer_received";
}
