import React from "react";
import AddTransactionForm from "../_components/transaction-form";
import { getUserAccounts } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import { getTransaction } from "@/actions/transaction";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AddTransactionPage = async ({ searchParams }: any) => {
  const accounts = await getUserAccounts();
  const params = await searchParams;
  const editId = params?.edit;

  let initialData = null;
  if (editId) {
    const transaction = await getTransaction(editId);
    initialData = transaction;
  }

  return (
    <div className="max-w-3xl mx-auto px-5 mt-10">
      <div className="flex justify-center md:justify-normal mb-6">
        <h1 className="text-5xl gradient-title ">
          {editId ? "Edit" : "Add"} Transaction
        </h1>
      </div>
      <AddTransactionForm
        accounts={accounts}
        categories={defaultCategories}
        editMode={!!editId} // i did this to check for undefined or null values
        initialData={initialData}
      />
    </div>
  );
};

export default AddTransactionPage;
