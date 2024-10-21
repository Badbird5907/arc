import Error from "next/error";

export default function ErrorPage() {
  return <Error statusCode={500} />;
}