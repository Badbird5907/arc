import { Breadcrumbs } from "@/app/(admin)/admin/@breadcrumbs/[...catchAll]/breadcrumbs"

type Props = {
  params: Promise<{
    catchAll: string[]
  }>
}
export default async function BreadcrumbSlot({ params }: Props) {
  const { catchAll } = await params
  return <Breadcrumbs routes={catchAll} />
}