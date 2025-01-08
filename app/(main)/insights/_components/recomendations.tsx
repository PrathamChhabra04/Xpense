"use client";
import { useState, useEffect } from "react";
import { getCombinedCategoryData } from "@/actions/insights"; // Adjust import path as per your structure
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { updateBudget } from "@/actions/budget";
import useFetch from "@/hooks/useFetch";
import BarLoaderClient from "@/components/Loader";
import SpinLoaderClient from "@/components/SpinLoader";
import { toast } from "sonner";

export default function BudgetInsights() {
  const [newBudget, setNewBudget] = useState(0);
  const {
    loading: insightsLoading,
    fn: insightsFn,
    data: insightsData,
  } = useFetch(getCombinedCategoryData);
  useEffect(() => {
    insightsFn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  function handleNewBudget() {
    setNewBudget(insightsData?.totalRecommendedBudget);
  }

  useEffect(() => {
    if (newBudget > 0) {
      updateFn(newBudget); // Proceed with the update after the budget state changes
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newBudget]);
  const loaderProps = {
    width: "100%",
    color: "#9333ea",
  };
  const {
    loading: updateLoading,
    fn: updateFn,
    data: updatedResult,
    error,
  } = useFetch(updateBudget);
  useEffect(() => {
    if (updatedResult?.success) {
      toast.success("Budget updated successfully");
    }
  }, [updatedResult]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update budget");
    }
  }, [error]);
  return insightsLoading ? (
    <BarLoaderClient {...loaderProps} />
  ) : (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Budget Insights</h2>
          <div className="space-y-4">
            {insightsData?.insights?.map((insight: string, index: number) => (
              <div key={index} className="flex items-center">
                <span className="text-sm text-gray-600">• {insight}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Total Budget & Savings */}
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6">
            <p className="text-lg font-semibold">Total Recommended Budget</p>
            <p className="text-2xl font-bold text-orange-600">
              ${insightsData?.totalRecommendedBudget.toFixed(2)}
            </p>
          </Card>

          <Card className="p-6">
            <p className="text-lg font-semibold">
              Savings Compared to Last Month
            </p>
            <p className="text-2xl font-bold text-green-600">
              ${insightsData?.savingsComparedToLastMonth.toFixed(2)}
            </p>
          </Card>
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <Button
          className="w-auto hover:scale-105 transition-transform duration-300 ease-in-out
hover:shadow-md"
          onClick={handleNewBudget}
          disabled={updateLoading}
        >
          {/* Accept Recommendations */}
          {updateLoading ? (
            <>
              <SpinLoaderClient />
              {"Updating..."}
            </>
          ) : (
            "Accept Recommendations"
          )}
        </Button>
      </div>
    </div>
  );
}
