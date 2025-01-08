import React from "react";
import { getDashboardData, getUserAccounts } from "@/actions/dashboard";
import CategoryOverview from "./_components/piechart";
import BudgetInsights from "./_components/recomendations";
import WhatIfSimulator from "./_components/whatif";
import { ChartPie, ClipboardCheck, TrendingUp } from "lucide-react";

const InsightsPage: React.FC = async () => {
  const accounts = (await getUserAccounts()) || [];
  const transactions = await getDashboardData();
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-6xl font-bold tracking-tight gradient-title flex items-center justify-center mt-8">
        AI-Powered Spending Insights
      </h1>
      <p className="text-lg text-gray-600 mt-2 text-center mb-8">
        Make smarter decisions with data-driven insights.
      </p>
      {/* Section: Overview */}
      <section className="mb-8 bg-gray-50 p-8 rounded-lg shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <ChartPie color="#ca8a04" />
          <h2 className="text-3xl font-bold text-yellow-600 hover:text-yellow-500 transition-all duration-300">
            Your Financial Snapshot
          </h2>
        </div>
        <p className="text-gray-500 italic text-lg">
          Dive into a clear, visual breakdown of your spending habits.
        </p>
        <div className="mt-6">
          <div className="border rounded-lg p-6 shadow-sm bg-white animate-fade-in">
            <CategoryOverview accounts={accounts} transactions={transactions} />
          </div>
        </div>
      </section>

      {/* Section: Recommendations */}
      <section className="mb-8 bg-gray-50 p-8 rounded-lg shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardCheck color="#0d9488" />
          <h2 className="text-3xl font-bold text-teal-600 hover:text-teal-500 transition-all duration-300">
            Smart Budget Recommendations
          </h2>
        </div>

        <p className="text-gray-500 italic">
          Tailored to your spending history, this budget will guide you toward
          financial success.
        </p>

        <div className="mt-4">
          {/* Placeholder for Budget Recommendations */}
          <div className="border rounded-lg p-6 shadow-sm text-center">
            <BudgetInsights />
          </div>
        </div>
      </section>

      {/* Section: Savings Predictions */}
      <section className="mb-8 bg-gray-50 p-8 rounded-lg shadow-lg">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp color="#ec4899" />
          <h2 className="text-3xl font-bold text-pink-500 hover:text-pink-400 transition-all duration-300">
            Savings Forecast Simulator
          </h2>
        </div>
        <p className="text-gray-500 italic">
          See the future of your finances: Simulate changes, predict savings,
          and plan smarter.
        </p>

        <div className="mt-4">
          {/* Placeholder for Predictions */}
          <div className="border rounded-lg p-6 shadow-sm text-center">
            <WhatIfSimulator />
          </div>
        </div>
      </section>
    </div>
  );
};

export default InsightsPage;
