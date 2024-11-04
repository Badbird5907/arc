export const StoreBanner = ({ title = "Store", subTitle }: {
  title?: string | React.ReactNode;
  subTitle?: string | React.ReactNode;
}) => {
  return (
    <div className="w-full h-[40vh] bg-cover bg-center bg-no-repeat text-center" style={{ backgroundImage: 'url(/img/banner.png)' }}>
      <div className="h-full place-content-center gap-2 flex flex-col">
        <h1 className="text-6xl md:text-8xl font-bold">{title ?? "Store"}</h1>
        {subTitle && <p className="text-2xl md:text-4xl">{subTitle}</p>}
      </div>
    </div>
  )
}