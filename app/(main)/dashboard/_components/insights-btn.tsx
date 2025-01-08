"use client";

import { ChartNoAxesColumnIncreasing } from "lucide-react";
import { useRouter } from "next/navigation";

const InsightsButton = () => {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("/insights")}
      className="flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg shadow-md hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
    >
      <ChartNoAxesColumnIncreasing color="#f3e8ff" /> {/* Icon */}
      <span className="hidden md:inline">View Insights</span>{" "}
      {/* Text for larger screens */}
    </button>
  );
};

export default InsightsButton;
