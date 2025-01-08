import DashboardPage from "./page";
import { Suspense } from "react";
import BarLoaderClient from "@/components/Loader";
import InsightsButton from "./_components/insights-btn";

export default function Layout() {
  const loaderProps = {
    width: "100%",
    color: "#9333ea",
  };

  return (
    <div className="px-4 sm:px-6 lg:px-[90px] mt-10">
      {" "}
      {/* Responsive padding */}
      {/* Dashboard Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight gradient-title">
          {" "}
          {/* Responsive font size */}
          Dashboard
        </h1>
        <InsightsButton />
      </div>
      {/* Suspense Loader */}
      <Suspense fallback={<BarLoaderClient {...loaderProps} />}>
        <DashboardPage />
      </Suspense>
    </div>
  );
}
