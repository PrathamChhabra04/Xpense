"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Function to combine current expenses and AI-recommended budget
export async function getCombinedCategoryData() {
  try {
    // Get the last 30 days statistics
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) {
      throw new Error("User not found");
    }
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0
    );
    const stats = await getStats(startOfMonth, endOfMonth, user.id);

    // Get the AI-generated budget recommendations
    const insights = await generateCategoryInsights({
      totalIncome: stats.totalIncome,
      totalExpenses: stats.totalExpenses,
      byCategory: stats.byCategory,
    });
    // Select 4 insights (can be randomized or fixed for simplicity)
    const selectedInsights = insights.insights.slice(0, 4); // Limit to 4 insights for display
    return {
      insights: selectedInsights,
      totalRecommendedBudget: insights.totalRecommendedBudget,
      savingsComparedToLastMonth:
        stats.totalIncome - insights.totalRecommendedBudget,
    };
  } catch (error) {
    console.error("Error combining category data:", error);
    return {
      insights: [],
      totalRecommendedBudget: 0,
      savingsComparedToLastMonth: 0,
    };
  }
}

export async function generateCategoryInsights(stats: {
  totalIncome: number;
  totalExpenses: number;
  byCategory: { [key: string]: number };
}) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `You are a professional financial analyst specializing in budget management. Based on the user's financial data from the last 30 days, analyze their income and expenses to provide actionable budget recommendations.

Financial Data:

Total Income: $${stats.totalIncome}
Total Expenses: $${stats.totalExpenses}
Expense Categories: ${Object.entries(stats.byCategory)
    .map(([category, amount]) => `${category}: $${amount}`)
    .join(", ")}
Generate the following insights and recommendations:

Four actionable insights focusing on saving opportunities, areas to cut back, and ways to optimize spending for better budget management.
A total recommended budget for the upcoming month, based on income, expenses, and spending patterns.
A comparison of this month's expenses to last month's, highlighting potential savings.
Output the response strictly in JSON format as follows:
{
  "insights": [
    "Insight 1",
    "Insight 2",
    "Insight 3",
    "Insight 4"
  ],
  "totalRecommendedBudget": <calculated budget>,
}
Keep the insights concise and relevant  
`;
  try {
    const result = await model.generateContent(prompt);
    const rawResponse = result.response.text(); // Get raw response text

    // Use regex to extract JSON block
    const jsonMatch = rawResponse.match(/\{(?:.|\n)*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in the response.");
    }

    const cleanedText = jsonMatch[0].trim(); // Extract matched JSON block

    return JSON.parse(cleanedText); // Parse the cleaned JSON
  } catch (error) {
    console.error("Error generating insights:", error);
    return {
      recommendations: [],
      insights:
        "Unable to generate budget recommendations from AI. Invalid JSON.",
    };
  }
}

// Function to get the statistics for the last 30 days
export async function getStats(startDate: Date, endDate: Date, userId: string) {
  // Fetch transactions from the last 30 days
  const transactions = await db.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  return transactions.reduce(
    (
      stats: {
        totalExpenses: number;
        totalIncome: number;
        byCategory: { [key: string]: number };
        transactionCount: number;
      },
      t
    ) => {
      const amount = t.amount.toNumber();
      if (t.type === "EXPENSE") {
        stats.totalExpenses += amount;
        stats.byCategory[t.category] =
          (stats.byCategory[t.category] || 0) + amount;
      } else {
        stats.totalIncome += amount;
      }
      return stats;
    },
    {
      totalExpenses: 0,
      totalIncome: 0,
      byCategory: {},
      transactionCount: transactions.length,
    }
  );
}

export async function generateWhatIfInsights(
  category: string,
  adjustment: number,
  direction: string
) {
  try {
    // Get the last 30 days statistics
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) {
      throw new Error("User not found");
    }

    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    // Fetch stats for the last 30 days
    const statsData = await getStats(startOfMonth, endOfMonth, user.id);
    const stats = {
      totalIncome: statsData.totalIncome,
      totalExpenses: statsData.totalExpenses,
      byCategory: statsData.byCategory,
    };

    // Prepare the data for the AI prompt
    const data = {
      category: category,
      adjustment: adjustment,
      direction: direction,
    };

    // Fetch AI insights
    const insights = await whatIfAi(stats, data);
    const impact = insights.impact || {};
    const { total_budget_change } = impact;
    const recommendations = insights.recommendations || [];

    // Ensure that insights contain the expected properties
    if (!insights || !insights.impact) {
      throw new Error("Invalid AI response");
    }
    // Check for missing values in AI response
    if (total_budget_change === undefined || recommendations === undefined) {
      throw new Error("Missing essential data in AI response");
    }

    // Calculate savings and return the response
    const current_savings = stats.totalIncome - stats.totalExpenses;
    const new_savings = current_savings - total_budget_change;

    return {
      total_budget_change: Math.abs(total_budget_change),
      current_savings: current_savings,
      new_savings: new_savings,
      recommendations: recommendations,
    };
  } catch (error) {
    console.error("Error providing what-if insights:", error);
    return {
      total_budget_change: 0, // Default to 0 if there is an error
      current_savings: 0,
      new_savings: 0,
      recommendations: ["Unable to generate insights at this time."],
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function whatIfAi(stats: any, data: any) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const budget = await getBudgetNow();
  const prompt = `
    You are an AI assistant specializing in personal finance and budgeting. Your role is to analyze changes in spending patterns and provide insights on how they impact the user's overall budget, savings, and other expense categories.

    - Total Income: $${stats.totalIncome}
    - Total Expenses: $${stats.totalExpenses}
    - Expense Categories: ${Object.entries(stats.byCategory)
      .map(([category, amount]) => `${category}: $${amount}`)
      .join(", ")}
    - Current Budget: $${budget}
    Proposed Change: ${data.direction} ${data.category} spending by ${data.adjustment}%.
      NOTE: Keep the recommendations concise and relevant
      Also mention the total_budget_change with sign(positive,negative)
    Return the response strictly as JSON:
    {
      "impact": {
        "total_budget_change": 0,
      },
      "recommendations": [
        "Provide actionable insights for the user based on spending changes."
      ]
    }`;

  try {
    const result = await model.generateContent(prompt);

    // Get raw response text
    const rawResponse = await result.response.text();
    // Extract JSON using regex
    const jsonMatch = rawResponse.match(/\{(?:.|\n)*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in the response.");
    }

    const cleanedText = jsonMatch[0].trim();

    // Validate JSON structure before parsing
    const parsedJSON = JSON.parse(cleanedText);
    return parsedJSON;
  } catch (error) {
    console.error("Error generating insights:", error);

    // Provide a fallback response
    return {
      impact: {
        total_budget_change: 0,
        current_savings: stats.totalIncome - stats.totalExpenses,
        new_savings: stats.totalIncome - stats.totalExpenses, // No change
      },
      recommendations: ["Unable to generate detailed insights at this time."],
    };
  }
}

export async function getBudgetNow() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const budget = await db.budget.findFirst({
      where: {
        userId: user.id,
      },
    });
    return { budget: budget };
  } catch (error) {
    console.error("Error fetching budget:", error);
    throw error;
  }
}
