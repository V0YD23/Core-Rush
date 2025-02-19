import React from "react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface FeaturesProps {
  features: Feature[];
}

const Features: React.FC<FeaturesProps> = ({ features }) => {
  return (
    <div className="w-full lg:w-1/3 space-y-6">
      {features.map((feature, index) => (
        <div
          key={index}
          className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border-4 border-red-400 hover:scale-105 hover:border-red-300 transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 bg-yellow-300 rounded-lg animate-pulse">
              {feature.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-blue-700">{feature.title}</h3>
              <p className="text-red-500 text-sm font-medium">{feature.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Features;
