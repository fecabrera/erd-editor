import { cva, type VariantProps } from "class-variance-authority";
import { ChevronRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "./cn";
import { radiusVariants } from "./radius";

const treeStyles = cva("space-y-0.5");
const treeBranchStyles = cva("open:[&>summary>svg:first-child]:rotate-90");
const treeSummaryStyles = cva(
  "flex min-h-8 cursor-pointer list-none items-center gap-2 px-1.5 font-semibold hover:bg-ui-hover focus-visible:outline-2 focus-visible:outline-ui-keyboard [&::-webkit-details-marker]:hidden",
  {
    variants: { radius: radiusVariants },
    defaultVariants: { radius: "md" },
  },
);
const treeGroupStyles = cva("ms-3.5 border-s border-ui-line ps-3");
const treeItemStyles = cva("flex min-h-7 items-center gap-2 px-1.5");

function TreeRoot({ className, ...props }: ComponentProps<"ul">) {
  return <ul {...props} className={cn(treeStyles(), className)} />;
}

type TreeBranchProps = ComponentProps<"details"> &
  VariantProps<typeof treeSummaryStyles> & {
    label: ReactNode;
  };

function TreeBranch({ children, className, label, radius, ...props }: TreeBranchProps) {
  return (
    <li>
      <details {...props} className={cn(treeBranchStyles(), className)}>
        <summary className={treeSummaryStyles({ radius })}>
          <ChevronRight aria-hidden="true" className="text-ui-muted" />
          {label}
        </summary>
        {children}
      </details>
    </li>
  );
}

function TreeGroup({ className, ...props }: ComponentProps<"ul">) {
  return <ul {...props} className={cn(treeGroupStyles(), className)} />;
}

function TreeItem({ className, ...props }: ComponentProps<"li">) {
  return <li {...props} className={cn(treeItemStyles(), className)} />;
}

export const Tree = Object.assign(TreeRoot, {
  Branch: TreeBranch,
  Group: TreeGroup,
  Item: TreeItem,
});
