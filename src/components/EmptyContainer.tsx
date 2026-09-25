export function EmptyContainer({ pointerEventsAuto = false }) {
  return pointerEventsAuto ? <div className="pointer-events-auto" /> : <div />;
}
