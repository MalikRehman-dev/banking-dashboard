// Label + input + error message ek jagah
export default function FormInput({ label, error, ...props }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <input className={error ? "input input-error" : "input"} {...props} />
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
