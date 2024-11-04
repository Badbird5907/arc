"use client";

import { Spinner } from "@/components/ui/spinner";
import { renderMarkdown } from "@/server/actions/markdown";
import { type Product } from "@/types";
import { mdxComponents } from "@/utils/markdown";
import { run } from "@mdx-js/mdx";
import React, { useEffect, useState } from "react";
import * as runtime from "react/jsx-runtime";

export const ProductMarkdown = ({ product }: { product: Product }) => {
  const [loading, setLoading] = useState(true);
  // Awaited<ReturnType<(typeof run)>>["default"]
  const [content, setMDXContent] = useState<React.ReactNode | undefined>(undefined);
  useEffect(() => {
    if (!product.id) return;
    void renderMarkdown(product.id).then(async (code) => {
      const { default: MDXContent } = await run(code, {
        ...runtime,
        baseUrl: import.meta.url,
      });
      setMDXContent(<MDXContent components={mdxComponents} />);
    }).finally(() => {
      setLoading(false);
    });
  }, [product.id]);

  if (loading) return <Spinner className="place-self-center" />
  return content;
}