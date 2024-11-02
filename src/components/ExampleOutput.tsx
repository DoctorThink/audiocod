const ExampleOutput = () => {
  return (
    <div className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-primary-900">
          Sample Output
        </h2>
        
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 font-mono text-sm">
          <div className="space-y-4">
            <div>
              <p className="text-primary-500 mb-1">[Processing character voices...]</p>
              <p className="text-primary-500 mb-1">[Mapping acoustic environment...]</p>
              <p className="text-primary-500 mb-4">[Generating dialogue...]</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-gray-800">
                Emma &lt;voice: ⇒◎►, professional-feminine, slight-fatigue&gt; 
                <span className="text-primary-600">"Hey David, thanks for meeting me here on such short notice."</span>
                <span className="text-gray-500"> {'{coffee machine whirring in background, quiet chatter}'}</span>
              </p>
              <p className="text-gray-500">[emotional_state: professional+tired, energy: 70%]</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-gray-800">
                David &lt;voice: ⇓○►, soft-masculine, slight-stutter&gt; 
                <span className="text-primary-600">"N-no problem at all. I've been looking f-forward to discussing this actually."</span>
                <span className="text-gray-500"> {'{coffee cup gentle placement}'}</span>
              </p>
              <p className="text-gray-500">[emotional_state: ⌈eager⌉+/nervous/, focus: 85%]</p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-primary-500">[Natural_Flow_Score: 92/100]</p>
            <p className="text-primary-500">[Voice_Pattern_Consistency: Maintained]</p>
            <p className="text-primary-500">[Ambient_Sound_Integration: Appropriate]</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExampleOutput;