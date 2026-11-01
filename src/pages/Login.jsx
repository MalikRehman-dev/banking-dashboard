import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useBank } from "../context/BankContext";
import FormInput from "../components/FormInput";
import useBusy from "../hooks/useBusy";

export default function Login() {
  const { login, currentUser } = useBank();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [busy, run] = useBusy();

  if (currentUser) return <Navigate to="/" replace />;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = "Email is required.";
    if (!form.password) newErrors.password = "Password is required.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    run(async () => {
      const result = await login(form.email, form.password);
      if (result.ok) navigate("/");
      else setErrors({ general: result.message });
    });
  }

  return (
    <div className="auth-page">
      <div className="auth-side">
        <h1>PayPak Digital Bank</h1>
        <p>Deposit, withdraw and send money in a few taps.</p>
      </div>

      <div className="auth-box">
        <h2>Login</h2>
        <p className="muted">Enter your details to open your account.</p>

        {errors.general && <div className="alert">{errors.general}</div>}

        <form onSubmit={handleSubmit}>
          <FormInput label="Email" type="email" name="email" placeholder="you@example.com"
            value={form.email} onChange={handleChange} error={errors.email} />
          <FormInput label="Password" type="password" name="password" placeholder="Your password"
            value={form.password} onChange={handleChange} error={errors.password} />
          <button className="btn btn-primary btn-full" disabled={busy}>
            {busy ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-link">New here? <Link to="/register">Create an account</Link></p>
        <p className="hint">Test account: ali@test.com / 123456</p>
      </div>
    </div>
  );
}
