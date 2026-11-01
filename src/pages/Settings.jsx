import { useState } from "react";
import { useBank } from "../context/BankContext";
import { formatMoney } from "../utils/format";
import FormInput from "../components/FormInput";

export default function Settings() {
  const { currentUser, updateProfile, showToast } = useBank();
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [errors, setErrors] = useState({});

  function handleSubmit(e) {
    e.preventDefault();
    const newErrors = {};
    if (name.trim().length < 3) newErrors.name = "Name must be at least 3 characters.";
    if (!/^\d{10,13}$/.test(phone)) newErrors.phone = "Phone must be 10 to 13 digits.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const result = updateProfile(name, phone);
    showToast(result.message, "success");
  }

  return (
    <div>
      <h2 className="page-title">Account settings</h2>

      <div className="settings-grid">
        <div className="panel">
          <h3>Account details</h3>
          <div className="detail"><span>Account number</span><strong>{currentUser.accountNumber}</strong></div>
          <div className="detail"><span>Email</span><strong>{currentUser.email}</strong></div>
          <div className="detail"><span>Name</span><strong>{currentUser.name}</strong></div>
          <div className="detail"><span>Phone</span><strong>{currentUser.phone}</strong></div>
          <div className="detail"><span>Account status</span><strong>Active</strong></div>
          <div className="detail"><span>Balance</span><strong>{formatMoney(currentUser.balance)}</strong></div>
          <div className="detail"><span>Member since</span><strong>{new Date(currentUser.joined).toLocaleDateString("en-GB")}</strong></div>
        </div>

        <div className="panel">
          <h3>Edit profile</h3>
          <form onSubmit={handleSubmit}>
            <FormInput label="Full name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
            <FormInput label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} />
            <button className="btn btn-primary">Save changes</button>
          </form>
        </div>
      </div>
    </div>
  );
}
