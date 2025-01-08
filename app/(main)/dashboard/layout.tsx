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
    <div className="px-[90px] mt-10">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-6xl font-bold tracking-tight gradient-title">
          Dashboard
        </h1>
        <InsightsButton />
      </div>

      <Suspense fallback={<BarLoaderClient {...loaderProps} />}>
        <DashboardPage />
      </Suspense>
    </div>
  );
}
