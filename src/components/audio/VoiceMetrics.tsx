import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface VoiceMetricsProps {
  speakerProfile: {
    confidence: number;
    characteristics: {
      voiceQuality: number;
      clarity: number;
      stability: number;
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
            <span>Voice Quality</span>
            <span>{(speakerProfile.characteristics.voiceQuality * 100).toFixed(1)}%</span>
          </div>
          <Progress value={speakerProfile.characteristics.voiceQuality * 100} />
          <p className="text-xs text-muted-foreground">
            Overall measure of voice quality based on clarity, stability, and energy
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Clarity</span>
            <span>{(speakerProfile.characteristics.clarity * 100).toFixed(1)}%</span>
          </div>
          <Progress value={speakerProfile.characteristics.clarity * 100} />
          <p className="text-xs text-muted-foreground">
            Measure of voice clarity and consistency in energy levels
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Stability</span>
            <span>{(speakerProfile.characteristics.stability * 100).toFixed(1)}%</span>
          </div>
          <Progress value={speakerProfile.characteristics.stability * 100} />
          <p className="text-xs text-muted-foreground">
            Measure of pitch stability and control
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceMetrics;