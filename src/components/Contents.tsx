export function Contents({ cowork = false }) {
  return cowork ? (
    <div
      data-kind="cowork"
      className="contents"
      style={{
        display: "none",
      }}
    />
  ) : (
    <div className="contents" />
  );
}
