import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import ExampleOutput from "../components/ExampleOutput";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <HowItWorks />
      <ExampleOutput />
    </div>
  );
};

export default Index;