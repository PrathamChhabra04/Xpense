// components/BarLoaderClient.tsx
"use client";

import React from "react";
import BarLoader from "react-spinners/BarLoader";

type BarLoaderProps = {
  height?: number;
  width?: number | string;
  color?: string;
  loading?: boolean;
};

const BarLoaderClient: React.FC<BarLoaderProps> = ({
  height = 4,
  width = "100%",
  color = "#36d7b7",
  loading = true,
}) => {
  return (
    <BarLoader height={height} width={width} color={color} loading={loading} />
  );
};

export default BarLoaderClient;
