import { EmptyState } from "../EmptyState";

export default function EmptyStateExample() {
  return (
    <div className="p-8">
      <EmptyState onAddBot={() => console.log("Add bot clicked")} />
    </div>
  );
}
