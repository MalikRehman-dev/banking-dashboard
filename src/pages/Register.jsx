import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useBank } from "../context/BankContext";
import FormInput from "../components/FormInput";
import useBusy from "../hooks/useBusy";

export default function Register() {
  const { register, currentUser } = useBank();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [busy, run] = useBusy();

  if (currentUser) return <Navigate to="/" replace />;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function validate() {
    const e = {};
    if (form.name.trim().length < 3) e.name = "Name must be at least 3 characters.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = "Enter a valid email address.";
    if (!/^\d{10,13}$/.test(form.phone)) e.phone = "Phone must be 10 to 13 digits.";
    if (form.password.length < 6) e.password = "Password must be at least 6 characters.";
    if (form.confirm !== form.password) e.confirm = "Passwords do not match.";
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    run(async () => {
      const result = await register(form);
      if (result.ok) navigate("/");
      else setErrors({ email: result.message });
    });
  }

  return (
    <div className="auth-page">
      <div className="auth-side">
        <h1>Open your account</h1>
        <p>It takes less than a minute. A unique account number is created for you.</p>
      </div>

      <div className="auth-box">
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <FormInput label="Full name" name="name" placeholder="Your name" value={form.name} onChange={handleChange} error={errors.name} />
          <FormInput label="Email" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} error={errors.email} />
          <FormInput label="Phone" name="phone" placeholder="03001234567" value={form.phone} onChange={handleChange} error={errors.phone} />
          <FormInput label="Password" type="password" name="password" placeholder="At least 6 characters" value={form.password} onChange={handleChange} error={errors.password} />
          <FormInput label="Confirm password" type="password" name="confirm" placeholder="Type password again" value={form.confirm} onChange={handleChange} error={errors.confirm} />
          <button className="btn btn-primary btn-full" disabled={busy}>
            {busy ? "Creating account..." : "Create account"}
          </button>
        </form>
        <p className="auth-link">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
}
