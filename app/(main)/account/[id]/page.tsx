import { getAccountWithTransactions } from "@/actions/account";
import { notFound } from "next/navigation";
import React, { Suspense } from "react";
import TransactionsTable from "../_components/transactions-table";
import AccountChart from "../_components/account-chart";
import BarLoaderClient from "@/components/Loader";

type Params = {
  id: string;
};
const AccountsPage = async ({ params }: { params: Params }) => {
  const { id } = await params;
  const accountData = await getAccountWithTransactions(id);
  if (!accountData) notFound();
  const { transactions, ...account } = accountData;
  const loaderProps = {
    width: "100%",
    color: "#9333ea",
  };

  return (
    <div className="space-y-8 px-[90px] mt-10">
      <div className="flex gap-4 items-end justify-between">
        <div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight gradient-title capitalize">
            {account.name}
          </h1>
          <p className="text-muted-foreground">
            {account.type.charAt(0) + account.type.slice(1).toLowerCase()}{" "}
            Account
          </p>
        </div>

        <div className="text-right pb-2">
          <div className="text-xl sm:text-2xl font-bold">
            ${parseFloat(account.balance).toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground">
            {account._count.transactions} Transactions
          </p>
        </div>
      </div>
      <Suspense fallback={<BarLoaderClient {...loaderProps} />}>
        <AccountChart transactions={transactions} />
      </Suspense>
      <Suspense fallback={<BarLoaderClient {...loaderProps} />}>
        <TransactionsTable transactions={transactions} />
      </Suspense>
    </div>
  );
};

export default AccountsPage;
