// components/RouteLoadingProvider.tsx
"use client";

import React, { createContext, useContext, useState } from "react";
import Loading from "./ui/Loading";

const LoadingContext = createContext({
  setLoading: (v: boolean) => {},
});

export const useLoading = () => useContext(LoadingContext);

export default function RouteLoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ setLoading }}>
      {children}

      {loading && <Loading />}
    </LoadingContext.Provider>
  );
}