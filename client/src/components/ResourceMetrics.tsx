import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Metric {
  id: string;
  botId: string;
  cpuPercent: number;
  memoryMb: number;
  diskMb: number;
  collectedAt: Date;
}

export function ResourceMetrics({ botId }: { botId: string }) {
  const { data: metrics = [] } = useQuery<Metric[]>({
    queryKey: ["/api/bots", botId, "metrics"],
    enabled: !!botId,
    refetchInterval: 15000,
  });

  const latestMetric = metrics[0];

  if (!latestMetric) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resource Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No metrics available yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resource Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">CPU</span>
              <span className="text-sm text-muted-foreground">
                {latestMetric.cpuPercent?.toFixed(1)}%
              </span>
            </div>
            <Progress value={latestMetric.cpuPercent || 0} />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Memory</span>
              <span className="text-sm text-muted-foreground">
                {latestMetric.memoryMb?.toFixed(0)} MB
              </span>
            </div>
            <Progress value={Math.min(100, (latestMetric.memoryMb || 0) / 5)} />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Disk</span>
              <span className="text-sm text-muted-foreground">
                {latestMetric.diskMb?.toFixed(0)} MB
              </span>
            </div>
            <Progress value={Math.min(100, (latestMetric.diskMb || 0) / 100)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
