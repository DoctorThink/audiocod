import Hero from "../components/Hero";
import Features from "../components/Features";
import DialogueDemo from "../components/DialogueDemo";
import HowItWorks from "../components/HowItWorks";
import ExampleOutput from "../components/ExampleOutput";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <DialogueDemo />
      <HowItWorks />
      <ExampleOutput />
    </div>
  );
};

export default Index;