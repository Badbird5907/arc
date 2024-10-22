"use client";

import { ErrorCode, ErrorPage } from "@/components/pages/error";

const Page = ({ searchParams: { code } }: { searchParams: { code: ErrorCode } }) => {
  const effectiveCode = code ?? "500";
  return <ErrorPage code={effectiveCode} />;
}
export default Page;