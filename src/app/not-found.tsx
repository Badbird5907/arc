import { SiteHeader } from "@/components/header";
import { ErrorPage } from "@/components/pages/error";

const Page = () => {
  return (
    <>
      <SiteHeader />
      <ErrorPage code={"404"} />
    </>
  );
}
export default Page;