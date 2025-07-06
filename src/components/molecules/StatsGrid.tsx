import React from "react";
import { Users, Brain, Heart, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatCard } from "@/components/atoms";

export const StatsGrid: React.FC = () => {
  const navigate = useNavigate();

  const handleStatClick = (type: string) => {
    navigate(`/insights/${type}`);
  };

  const stats = [
    {
      title: "Total Students",
      value: "1,248",
      subtitle: "+12% from last month",
      icon: <Users className="w-6 h-6" />,
      color: "blue" as const,
    },
    {
      title: "Total Anxiety",
      value: "342",
      subtitle: "Students assessed",
      icon: <Brain className="w-6 h-6" />,
      color: "yellow" as const,
      type: "anxiety",
    },
    {
      title: "Total Depression",
      value: "189",
      subtitle: "Students assessed",
      icon: <Heart className="w-6 h-6" />,
      color: "red" as const,
      type: "depression",
    },
    {
      title: "Total Stress",
      value: "567",
      subtitle: "Students assessed",
      icon: <Zap className="w-6 h-6" />,
      color: "purple" as const,
      type: "stress",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          subtitle={stat.subtitle}
          icon={stat.icon}
          color={stat.color}
          clickable={stat.type !== undefined}
          onClick={stat.type ? () => handleStatClick(stat.type) : undefined}
        />
      ))}
    </div>
  );
};
