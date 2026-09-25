export function HiddenInput() {
  return (
    <input
      id="base-ui-_r_gm_-hidden-input"
      tabIndex={-1}
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
    />
  );
}
