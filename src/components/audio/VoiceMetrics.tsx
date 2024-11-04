import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

interface VoiceMetricsProps {
  speakerProfile: {
    confidence: number;
    characteristics: {
      voiceQuality: number;
      clarity: number;
      stability: number;
      pitchMean: number;
      pitchRange: [number, number];
    };
  };
}

const VoiceMetrics = ({ speakerProfile }: VoiceMetricsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Voice Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Voice Quality</span>
              <span>{(speakerProfile.characteristics.voiceQuality * 100).toFixed(1)}%</span>
            </div>
            <Progress value={speakerProfile.characteristics.voiceQuality * 100} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Clarity</span>
              <span>{(speakerProfile.characteristics.clarity * 100).toFixed(1)}%</span>
            </div>
            <Progress value={speakerProfile.characteristics.clarity * 100} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Stability</span>
              <span>{(speakerProfile.characteristics.stability * 100).toFixed(1)}%</span>
            </div>
            <Progress value={speakerProfile.characteristics.stability * 100} className="h-2" />
          </div>
        </motion.div>

        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Average Pitch</p>
              <p className="text-2xl font-bold text-primary-600">
                {speakerProfile.characteristics.pitchMean.toFixed(0)} Hz
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Pitch Range</p>
              <p className="text-sm text-gray-600">
                {speakerProfile.characteristics.pitchRange[0].toFixed(0)} Hz - {speakerProfile.characteristics.pitchRange[1].toFixed(0)} Hz
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceMetrics;