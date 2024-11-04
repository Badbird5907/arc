export const mdxComponents = {};
const a = {
  h1: (props: React.ComponentProps<"h1">) => <h1 className="text-3xl font-bold" {...props} />,
  h2: (props: React.ComponentProps<"h2">) => <h2 className="text-2xl font-bold" {...props} />,
  h3: (props: React.ComponentProps<"h3">) => <h3 className="text-xl font-bold" {...props} />,
  h4: (props: React.ComponentProps<"h4">) => <h4 className="text-lg font-bold" {...props} />,
  h5: (props: React.ComponentProps<"h5">) => <h5 className="text-base font-bold" {...props} />,
  h6: (props: React.ComponentProps<"h6">) => <h6 className="text-sm font-bold" {...props} />,
  p: (props: React.ComponentProps<"p">) => <p className="text-base" {...props} />,
  a: (props: React.ComponentProps<"a">) => <a className="text-primary" {...props} />,
  strong: (props: React.ComponentProps<"strong">) => <strong className="font-bold" {...props} />,
  ul: (props: React.ComponentProps<"ul">) => <ul className="list-disc pl-4" {...props} />,
  ol: (props: React.ComponentProps<"ol">) => <ol className="list-decimal" {...props} />,
  li: (props: React.ComponentProps<"li">) => <li className="text-base" {...props} />,
  blockquote: (props: React.ComponentProps<"blockquote">) => <blockquote className="border-l-4 border-primary p-4" {...props} />,
  pre: (props: React.ComponentProps<"pre">) => <pre className="p-4 bg-background" {...props} />,
  code: (props: React.ComponentProps<"code">) => <code className="font-mono bg-background" {...props} />,
  inlineCode: (props: React.ComponentProps<"code">) => <code className="font-mono bg-background" {...props} />,
  hr: (props: React.ComponentProps<"hr">) => <hr className="border-primary" {...props} />,
  
  wrapper: ({ children }: { children: React.ReactNode }) => <div className="">{children}</div>,
}