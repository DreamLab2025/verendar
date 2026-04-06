"use client";

import dynamic from "next/dynamic";

export const AwsGrabMapLazy = dynamic(
  () => import("./aws-grab-map").then((m) => m.AwsGrabMap),
  {
    ssr: false,
    loading: () => <div className="h-[min(50vh,420px)] animate-pulse rounded-xl bg-muted" />,
  },
);
