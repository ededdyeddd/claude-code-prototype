export function HiddenRadio({ id, value, checked = false }) {
  return (
    <input
      id={id}
      tabIndex={-1}
      type="radio"
      value={value}
      style={{
        clipPath: "inset(50%)",
        overflow: "hidden",
        whiteSpace: "nowrap",
        border: "0px",
        padding: "0px",
        width: "1px",
        height: "1px",
        margin: "-1px",
        position: "fixed",
        top: "0px",
        left: "0px",
      }}
      {...(checked
        ? {
            defaultChecked: true,
          }
        : {})}
    />
  );
}
