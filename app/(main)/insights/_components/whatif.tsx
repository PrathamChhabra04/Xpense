"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { defaultCategories } from "@/data/categories";
import { generateWhatIfInsights } from "@/actions/insights";
import { toast } from "sonner";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
ChartJS.register(ChartDataLabels);

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function WhatIfSimulator() {
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
  const [category, setCategory] = useState<string | undefined>();
  const [adjustment, setAdjustment] = useState<number>(0);
  const [direction, setDirection] = useState<string | undefined>();
  interface SimulationResult {
    total_budget_change?: number;
    current_savings?: number;
    new_savings?: number;
    recommendations: string[];
    impact?: Record<string, unknown>;
  }

  const [simulationResult, setSimulationResult] = useState<
    SimulationResult | undefined
  >(undefined);
  const [loading, setLoading] = useState<boolean>(false);

  const rawCategories = defaultCategories;
  const categories = rawCategories.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (category: any) => category.type === "EXPENSE"
  );

  const handleSimulation = async () => {
    if (!category || !direction) {
      toast.error("Please select a category and direction.");
      return;
    }

    setLoading(true);
    try {
      // Directly call the backend logic function
      const insights = await generateWhatIfInsights(
        category,
        adjustment,
        direction
      );
      setSimulationResult(insights);
    } catch (error) {
      console.error("Simulation Error:", error);
      toast.error("Unable to perform simulation. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl md:mx-auto md:space-y-6">
      <Card className="p-6">
        <h2 className="text-xl md:text-2xl font-bold mb-4">
          What-If Simulator
        </h2>
        <div className="space-y-4">
          {/* Category Selector */}
          <Select onValueChange={setCategory} defaultValue={category}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Direction Selector */}
          <Select onValueChange={setDirection} defaultValue={direction}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Increase or Decrease?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Increase">Increase</SelectItem>
              <SelectItem value="Decrease">Decrease</SelectItem>
            </SelectContent>
          </Select>

          {/* Adjustment Slider */}
          <div>
            <p className="mb-2 text-gray-600">Adjust by: {adjustment}%</p>
            <Slider
              defaultValue={[adjustment]}
              max={50}
              step={1}
              onValueChange={(value) => setAdjustment(value[0])}
            />
          </div>

          {/* Simulate Button */}
          <Button
            className="w-full"
            onClick={handleSimulation}
            disabled={loading}
          >
            {loading ? "Simulating..." : "Simulate"}
          </Button>
        </div>
      </Card>

      {/* Simulation Result */}
      {simulationResult && (
        <>
          <Card className="p-6 mt-4">
            <h3 className="text-lg font-semibold mb-4">Simulation Results</h3>
            <p className="text-gray-600">
              If you {direction?.toLowerCase()} spending on {category} by{" "}
              {adjustment}%:
            </p>
            <div className="mt-2 md:mt-4 flex items-center justify-center text-xl md:text-2xl">
              {(simulationResult.new_savings ?? 0) >
              (simulationResult.current_savings ?? 0) ? (
                <>
                  <ArrowUpRight className="text-green-500 mr-1" size={20} />
                  <p className="text-green-600 font-semibold">
                    ${simulationResult.total_budget_change}
                  </p>
                </>
              ) : (
                <>
                  <ArrowDownRight className="text-red-500 mr-1" size={20} />
                  <p className="text-red-600 font-semibold">
                    ${simulationResult.total_budget_change?.toFixed(2)}
                  </p>
                </>
              )}
            </div>
            {/* Bar Chart */}
            <div className="mt-5 md:mt-6">
              <Bar
                data={{
                  labels: ["Current Savings", "New Savings"],
                  datasets: [
                    {
                      label: "Savings Impact",
                      data: [
                        simulationResult.current_savings?.toFixed(2) || 0,
                        simulationResult.new_savings?.toFixed(2) || 0,
                      ],
                      backgroundColor: ["#4F46E5", "#10B981"],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    datalabels: {
                      color: "#FFFFFF", // Change the color of data labels
                      font: {
                        size: isMobile ? 10 : 14, // Adjust font size
                        weight: "bold", // Adjust font weight
                      },
                      anchor: "center", // Position of the labels
                      align: "start", // Alignment of the labels
                      formatter: (value) => `$${value}`, // Custom formatter for labels
                    },
                  },
                }}
              />
            </div>
          </Card>

          {/* Gemini Insights */}
          <Card className="p-6 mt-4">
            <h3 className="text-lg md:text-xl font-semibold mb-4 text-blue-600">
              Your Personalized Insights
            </h3>
            <ul className="space-y-2">
              {simulationResult.recommendations.map((insight, index) => (
                <li
                  key={index}
                  className="flex items-start space-x-2 text-gray-700 text-sm md:text-base"
                >
                  <span className="text-green-500 font-semibold">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
