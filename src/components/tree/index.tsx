import * as React from "react"
import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

export type TreeNode = {
  id: string
  parentId: string | null
  children?: TreeNode[]
  defaultOpen?: boolean
  data?: unknown
}

export type TreeProps = React.ComponentPropsWithoutRef<"div"> & {
  data: TreeNode[]
  renderBranch?: (props: TreeBranchProps) => React.ReactNode
  renderLeaf?: (props: TreeLeafProps) => React.ReactNode
}

export type TreeBranchProps = {
  node: TreeNode
  isOpen: boolean
  toggle: () => void
  children: React.ReactNode
}

export type TreeLeafProps = {
  node: TreeNode
}

const TreeBranch = React.forwardRef<HTMLDivElement, TreeBranchProps>(
  ({ node, isOpen, toggle, children, ...props }, ref) => {
    return (
      <div ref={ref} {...props}>
        <div
          className={cn("flex items-center", isOpen && "mb-1")}
          onClick={toggle}
        >
          <ChevronRight
            className={cn(
              "h-4 w-4 shrink-0 transition-transform duration-200",
              isOpen && "rotate-90"
            )}
          />
          <span>{node.id}</span>
        </div>
        {isOpen && <div className="pl-6">{children}</div>}
      </div>
    )
  }
)
TreeBranch.displayName = "TreeBranch"

const TreeLeaf = React.forwardRef<HTMLDivElement, TreeLeafProps>(
  ({ node, ...props }, ref) => {
    return (
      <div ref={ref} {...props}>
        <span>{node.id}</span>
      </div>
    )
  }
)
TreeLeaf.displayName = "TreeLeaf"

const TreeNode: React.FC<{
  node: TreeNode
  renderBranch?: (props: TreeBranchProps) => React.ReactNode
  renderLeaf?: (props: TreeLeafProps) => React.ReactNode
}> = ({ node, renderBranch, renderLeaf }) => {
  const [isOpen, setIsOpen] = React.useState(!!node.defaultOpen)
  const hasChildren = !!node.children;// && node.children.length > 0

  const toggle = React.useCallback(() => {
    if (hasChildren) {
      setIsOpen((prev) => !prev)
    }
  }, [hasChildren])

  if (!hasChildren) {
    return renderLeaf ? (
      renderLeaf({ node })
    ) : (
      <TreeLeaf node={node} />
    )
  }

  const branchProps: TreeBranchProps = {
    node,
    isOpen,
    toggle,
    children: node.children!.map((childNode) => (
      <TreeNode
        key={childNode.id}
        node={childNode}
        renderBranch={renderBranch}
        renderLeaf={renderLeaf}
      />
    )),
  }

  return renderBranch ? (
    renderBranch(branchProps)
  ) : (
    <TreeBranch {...branchProps} />
  )
}

export const Tree = React.forwardRef<HTMLDivElement, TreeProps>(
  ({ data, renderBranch, renderLeaf, className, ...props }, ref) => {
    const rootNodes = React.useMemo(() => {
      if (!Array.isArray(data)) {
        console.warn('Tree component: data prop is not an array')
        return []
      }
      return data.filter((node) => node.parentId === null)
    }, [data])

    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {rootNodes.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            renderBranch={renderBranch}
            renderLeaf={renderLeaf}
          />
        ))}
      </div>
    )
  }
)
Tree.displayName = "Tree"