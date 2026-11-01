// Loading spinner
export default function Loader({ text = "Loading..." }) {
  return (
    <div className="loader-wrap">
      <div className="spinner"></div>
      <p>{text}</p>
    </div>
  );
}
