import { SiteHeader } from "@/components/header";
import { ErrorPage } from "@/components/pages/error";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <ErrorPage code={"404"} />
    </>
  )
}