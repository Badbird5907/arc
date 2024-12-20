"use client";

import { ErrorPage } from "@/components/pages/error";

export default function Error({ error, reset }: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorPage code={"500"} errorData={{ error, reset }} />
}