"use client";;
import { use } from "react";

import { ErrorCode, ErrorPage } from "@/components/pages/error";

const Page = (props: { searchParams: Promise<{ code: ErrorCode }> }) => {
  const searchParams = use(props.searchParams);

  const {
    code
  } = searchParams;

  const effectiveCode = code ?? "500";
  return <ErrorPage code={effectiveCode} />;
}
export default Page;