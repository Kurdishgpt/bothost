import { StatsCard } from "../StatsCard";
import { Bot } from "lucide-react";

export default function StatsCardExample() {
  return (
    <div className="p-8 max-w-sm">
      <StatsCard
        title="Total Bots"
        value={12}
        icon={Bot}
        description="+2 from last week"
      />
    </div>
  );
}
