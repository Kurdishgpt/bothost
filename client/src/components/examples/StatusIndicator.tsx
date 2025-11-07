import { StatusIndicator } from "../StatusIndicator";

export default function StatusIndicatorExample() {
  return (
    <div className="p-8 space-y-4">
      <StatusIndicator status="online" />
      <StatusIndicator status="offline" />
      <StatusIndicator status="starting" />
      <StatusIndicator status="error" />
    </div>
  );
}
