export default function Alert({ msg }) {
  if (!msg) return null;
  return (
    <div className={`message ${msg.type}`} role="alert">
      {msg.text}
    </div>
  );
}
