import { createContext, useContext, useEffect, useRef, useState } from "react";

const BankContext = createContext();

const DATA_KEY = "bank_data";       // users + transactions localStorage me
const SESSION_KEY = "bank_session"; // kaun login hai

// ---------- Helper functions ----------
function makeAccountNumber() {
  return "PK" + Math.floor(1000000000 + Math.random() * 9000000000);
}

// Unique reference: pehle se maujood transactions ke refs se kabhi match nahi karega
function makeRef(existing = []) {
  let ref;
  do {
    ref = "TXN" + Date.now().toString().slice(-7) + Math.floor(100 + Math.random() * 900);
  } while (existing.some((t) => t.ref === ref));
  return ref;
}

function newTx(fields) {
  return {
    id: Date.now() + Math.random(),
    date: new Date().toISOString(),
    status: "Success",
    otherName: "",
    otherAccount: "",
    ...fields,
  };
}

function checkAmount(value) {
  const n = Number(value);
  if (value === "" || value === null || isNaN(n) || n <= 0) {
    return { ok: false, message: "Please enter a valid amount greater than 0." };
  }
  if (n > 10000000) {
    return { ok: false, message: "Amount is too large (max Rs. 10,000,000)." };
  }
  return { ok: true, amount: Math.round(n * 100) / 100 };
}

// Password ko SHA-256 hash me badalta hai (plain text save nahi hota)
async function hashPassword(email, password) {
  const bytes = new TextEncoder().encode(email + ":" + password);
  const buffer = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function fail(message) {
  return { ok: false, message };
}

// ---------- Sample data (pehli dafa app khulne par) ----------
const sampleUsers = [
  { id: 1, name: "Ali Khan", email: "ali@test.com", password: "857c70d6e6327372fa0fbd7617ac164edb9939baab19091bb2e2d761ba3d498d", phone: "03001234567", accountNumber: "PK1000000001", balance: 50000, joined: "2026-01-10T09:00:00.000Z" },
  { id: 2, name: "Sara Ahmed", email: "sara@test.com", password: "9a3914e88a7df800fcbc779b31acb629528a8e1de8eff03b4c135b661eeb9c5a", phone: "03111234567", accountNumber: "PK1000000002", balance: 75000, joined: "2026-02-05T09:00:00.000Z" },
  { id: 3, name: "Usman Raza", email: "usman@test.com", password: "70d11d334e7edded273c6cddf58530a7aebd793f91abbeda41ec80a27f3dae93", phone: "03211234567", accountNumber: "PK1000000003", balance: 20000, joined: "2026-03-15T09:00:00.000Z" },
];

function loadData() {
  try {
    const saved = localStorage.getItem(DATA_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.log("localStorage read error", e);
  }
  const transactions = [];
  sampleUsers.forEach((u) => {
    transactions.push(
      newTx({ ref: makeRef(transactions), type: "deposit", amount: u.balance, userId: u.id, balanceAfter: u.balance, date: u.joined })
    );
  });
  const fresh = { users: sampleUsers, transactions };
  localStorage.setItem(DATA_KEY, JSON.stringify(fresh));
  return fresh;
}

// ---------- Provider ----------
export function BankProvider({ children }) {
  const [data, setData] = useState(loadData);
  const dataRef = useRef(data); // hamesha latest data (double click safety)
  const [sessionId, setSessionId] = useState(() => Number(localStorage.getItem(SESSION_KEY)) || null);
  const [toast, setToast] = useState(null);

  // Har operation se pehle localStorage se latest data lo (dusre tab ki changes bhi mil jayen)
  function latest() {
    try {
      const saved = localStorage.getItem(DATA_KEY);
      if (saved) dataRef.current = JSON.parse(saved);
    } catch (e) {
      console.log("localStorage read error", e);
    }
    return dataRef.current;
  }

  // Dusre browser tab me data badle to is tab me bhi update ho jaye
  useEffect(() => {
    function onStorage(e) {
      if (e.key === DATA_KEY && e.newValue) {
        const newData = JSON.parse(e.newValue);
        dataRef.current = newData;
        setData(newData);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const currentUser = data.users.find((u) => u.id === sessionId) || null;

  // Data ek hi dafa save hota hai (state + localStorage)
  function save(newData) {
    dataRef.current = newData;
    setData(newData);
    localStorage.setItem(DATA_KEY, JSON.stringify(newData));
  }

  // ----- Toast -----
  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  // ----- Auth -----
  async function register({ name, email, password, phone }) {
    const cleanEmail = email.trim().toLowerCase();
    const hashed = await hashPassword(cleanEmail, password);
    const d = latest();
    if (d.users.some((u) => u.email === cleanEmail)) {
      return fail("This email is already registered.");
    }
    const user = {
      id: Date.now(),
      name: name.trim(),
      email: cleanEmail,
      password: hashed,
      phone,
      accountNumber: makeAccountNumber(),
      balance: 0,
      joined: new Date().toISOString(),
    };
    save({ ...d, users: [...d.users, user] });
    localStorage.setItem(SESSION_KEY, user.id);
    setSessionId(user.id);
    return { ok: true };
  }

  async function login(email, password) {
    const cleanEmail = email.trim().toLowerCase();
    const hashed = await hashPassword(cleanEmail, password);
    const d = latest();
    // u.password === password sirf purane (plain) data ke liye hai
    const user = d.users.find((u) => u.email === cleanEmail && (u.password === hashed || u.password === password));
    if (!user) return fail("Incorrect email or password.");
    if (user.password !== hashed) {
      // Purana plain password mila: ab hash me badal do
      save({ ...d, users: d.users.map((u) => (u.id === user.id ? { ...u, password: hashed } : u)) });
    }
    localStorage.setItem(SESSION_KEY, user.id);
    setSessionId(user.id);
    return { ok: true };
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setSessionId(null);
  }

  function updateProfile(name, phone) {
    const d = latest();
    const users = d.users.map((u) => (u.id === sessionId ? { ...u, name: name.trim(), phone } : u));
    save({ ...d, users });
    return { ok: true, message: "Profile updated." };
  }

  // ----- Deposit -----
  function deposit(value) {
    const check = checkAmount(value);
    if (!check.ok) return check;

    const d = latest();
    const user = d.users.find((u) => u.id === sessionId);
    if (!user) return fail("Please login first.");

    const newBalance = user.balance + check.amount;
    const users = d.users.map((u) => (u.id === user.id ? { ...u, balance: newBalance } : u));
    const tx = newTx({ ref: makeRef(d.transactions), type: "deposit", amount: check.amount, userId: user.id, balanceAfter: newBalance });

    save({ users, transactions: [tx, ...d.transactions] });
    return { ok: true, message: "Deposit successful." };
  }

  // ----- Withdraw -----
  function withdraw(value) {
    const check = checkAmount(value);
    if (!check.ok) return check;

    const d = latest();
    const user = d.users.find((u) => u.id === sessionId);
    if (!user) return fail("Please login first.");

    if (check.amount > user.balance) {
      const failedTx = newTx({ ref: makeRef(d.transactions), type: "withdraw", amount: check.amount, userId: user.id, balanceAfter: user.balance, status: "Failed" });
      save({ ...d, transactions: [failedTx, ...d.transactions] });
      return fail("Insufficient balance.");
    }

    const newBalance = user.balance - check.amount;
    const users = d.users.map((u) => (u.id === user.id ? { ...u, balance: newBalance } : u));
    const tx = newTx({ ref: makeRef(d.transactions), type: "withdraw", amount: check.amount, userId: user.id, balanceAfter: newBalance });

    save({ users, transactions: [tx, ...d.transactions] });
    return { ok: true, message: "Withdrawal successful." };
  }

  // ----- Transfer -----
  // Sender ka debit aur receiver ka credit ek hi save() me hota hai,
  // is liye aisa nahi ho sakta ke sirf ek taraf paisay change hon.
  function transfer(accountNumber, value) {
    const check = checkAmount(value);
    if (!check.ok) return check;
    if (!accountNumber) return fail("Please select a recipient.");

    const d = latest();
    const sender = d.users.find((u) => u.id === sessionId);
    const receiver = d.users.find((u) => u.accountNumber === accountNumber);

    if (!sender) return fail("Please login first.");
    if (!receiver) return fail("Recipient account not found.");
    if (receiver.id === sender.id) return fail("You cannot transfer money to yourself.");

    const ref = makeRef(d.transactions);

    if (check.amount > sender.balance) {
      const failedTx = newTx({
        ref, type: "transfer_sent", amount: check.amount, userId: sender.id,
        otherName: receiver.name, otherAccount: receiver.accountNumber,
        balanceAfter: sender.balance, status: "Failed",
      });
      save({ ...d, transactions: [failedTx, ...d.transactions] });
      return fail("Insufficient balance.");
    }

    const senderBalance = sender.balance - check.amount;
    const receiverBalance = receiver.balance + check.amount;

    const users = d.users.map((u) => {
      if (u.id === sender.id) return { ...u, balance: senderBalance };
      if (u.id === receiver.id) return { ...u, balance: receiverBalance };
      return u;
    });

    const sentTx = newTx({
      ref, type: "transfer_sent", amount: check.amount, userId: sender.id,
      otherName: receiver.name, otherAccount: receiver.accountNumber, balanceAfter: senderBalance,
    });
    const receivedTx = newTx({
      ref, type: "transfer_received", amount: check.amount, userId: receiver.id,
      otherName: sender.name, otherAccount: sender.accountNumber, balanceAfter: receiverBalance,
    });

    save({ users, transactions: [sentTx, receivedTx, ...d.transactions] });
    return { ok: true, message: "Transfer successful. Ref: " + ref };
  }

  // Sirf logged-in user ki transactions
  const myTransactions = currentUser ? data.transactions.filter((t) => t.userId === currentUser.id) : [];

  // Dusre users ki list (sirf naam aur account number, password nahi)
  const otherUsers = currentUser
    ? data.users.filter((u) => u.id !== currentUser.id).map((u) => ({ id: u.id, name: u.name, accountNumber: u.accountNumber }))
    : [];

  const value = {
    currentUser, myTransactions, otherUsers, toast,
    register, login, logout, updateProfile,
    deposit, withdraw, transfer, showToast,
  };

  return <BankContext.Provider value={value}>{children}</BankContext.Provider>;
}

export function useBank() {
  return useContext(BankContext);
}
