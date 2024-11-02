import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface VoiceMetricsProps {
  speakerProfile: {
    confidence: number;
    characteristics: {
      voiceQuality: number;
    };
  };
}

const VoiceMetrics = ({ speakerProfile }: VoiceMetricsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Voice Characteristics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Speaker Confidence</span>
            <span>{(speakerProfile.confidence * 100).toFixed(1)}%</span>
          </div>
          <Progress value={speakerProfile.confidence * 100} />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Voice Quality</span>
            <span>{(speakerProfile.characteristics.voiceQuality * 100).toFixed(1)}%</span>
          </div>
          <Progress value={speakerProfile.characteristics.voiceQuality * 100} />
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceMetrics;