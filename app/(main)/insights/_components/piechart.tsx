"use client";

import { FC } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  DoughnutController,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  Title,
  DoughnutController,
  ChartDataLabels
);

interface Transaction {
  accountId: string;
  amount: number;
  category: string;
  type: "EXPENSE" | "INCOME";
  date: string;
}

interface CategoryOverviewProps {
  accounts: { id: string; isDefault: boolean }[];
  transactions: Transaction[];
}

const CategoryOverview: FC<CategoryOverviewProps> = ({
  accounts,
  transactions,
}) => {
  const selectedAccountId =
    accounts.find((a) => a.isDefault)?.id || accounts[0]?.id || "";
  const accountTransactions = transactions.filter(
    (t) => t.accountId === selectedAccountId
  );

  const currentDate = new Date();
  const currentMonthExpenses = accountTransactions.filter((t) => {
    const transactionDate = new Date(t.date);
    return (
      t.type === "EXPENSE" &&
      transactionDate.getMonth() === currentDate.getMonth() &&
      transactionDate.getFullYear() === currentDate.getFullYear()
    );
  });

  const expensesByCategory = currentMonthExpenses.reduce(
    (acc, transaction) => {
      const category = transaction.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += transaction.amount;
      return acc;
    },
    {} as Record<string, number>
  );

  const totalExpense = Object.values(expensesByCategory).reduce(
    (sum, value) => sum + value,
    0
  );

  const pieChartData = Object.entries(expensesByCategory).map(
    ([category, amount]) => ({
      name: category,
      value: amount,
    })
  );

  const labels = pieChartData.map((item) => item.name);
  const values = pieChartData.map((item) => item.value);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#9ffe3e",
          "#b08e34",
          "#9a4df2",
        ],
        hoverBackgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#9ffe3e",
          "#b08e34",
          "#9a4df2",
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: (tooltipItem: any) => {
            const label = tooltipItem.label;
            const value = tooltipItem.raw;
            const percentage = ((value / totalExpense) * 100).toFixed(2);
            return `${label}: $${value.toFixed(2)} (${percentage}%)`;
          },
        },
      },
      legend: {
        position: "top" as const,
        labels: {
          font: {
            weight: "bold" as const,
          },
        },
      },
      datalabels: {
        formatter: (value: number) => {
          const percentage = ((value / totalExpense) * 100).toFixed(1);
          return `${percentage}%`;
        },
        color: "#fff",
        font: {
          weight: "bold" as const,
          size: 12,
        },
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "400px", margin: "0 auto" }}>
      {pieChartData.length > 0 ? (
        <Pie data={chartData} options={chartOptions} />
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default CategoryOverview;
