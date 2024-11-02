import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EmotionChartProps {
  emotions: Record<string, number>;
}

const EmotionChart = ({ emotions }: EmotionChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Emotion Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(emotions).map(([emotion, value]) => (
            <div key={emotion} className="text-center">
              <div className="h-24 relative bg-gray-100 rounded">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-primary transition-all duration-500 rounded"
                  style={{ height: `${value * 100}%` }}
                />
              </div>
              <p className="mt-2 text-sm capitalize">{emotion}</p>
              <p className="text-xs text-muted-foreground">{(value * 100).toFixed(0)}%</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmotionChart;