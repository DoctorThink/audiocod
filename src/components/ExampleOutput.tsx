const ExampleOutput = () => {
  return (
    <div className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-primary-900">
          Analysis Results
        </h2>
        
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 font-mono text-sm">
          <div className="space-y-4">
            <div>
              <p className="text-primary-500 mb-1">[Analyzing audio file...]</p>
              <p className="text-primary-500 mb-1">[Detecting speakers...]</p>
              <p className="text-primary-500 mb-4">[Processing speech patterns...]</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-gray-800">
                Speaker 1 &lt;voice: male, age-range: 30-40, confidence: 92%&gt; 
                <span className="text-primary-600">"This quarterly report shows significant progress."</span>
              </p>
              <p className="text-gray-500">[speech_clarity: 95%, background_noise: low]</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-gray-800">
                Speaker 2 &lt;voice: female, age-range: 25-35, confidence: 89%&gt; 
                <span className="text-primary-600">"I agree, the metrics are very promising."</span>
              </p>
              <p className="text-gray-500">[speech_clarity: 92%, background_noise: low]</p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-primary-500">[Audio_Quality_Score: 88/100]</p>
            <p className="text-primary-500">[Speaker_Recognition_Confidence: High]</p>
            <p className="text-primary-500">[Background_Noise_Level: 0.2dB]</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExampleOutput;