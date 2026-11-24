import { cva, type VariantProps } from "class-variance-authority";
import { ChevronRight } from "lucide-react";
import { useId, useState, type ComponentProps, type MouseEventHandler, type ReactNode } from "react";
import { cn } from "./cn";
import { radiusVariants } from "./radius";

const treeStyles = cva("space-y-0.5");
const treeBranchRowStyles = cva(
  "flex min-h-8 items-stretch font-semibold hover:bg-ui-hover data-[highlighted=true]:bg-ui-hover data-[selected=true]:bg-ui-hover data-[selected=true]:inset-ring-1 data-[selected=true]:inset-ring-ui-keyboard",
  {
    variants: { radius: radiusVariants },
    defaultVariants: { radius: "md" },
  },
);
const treeToggleStyles = cva(
  "flex cursor-pointer items-center rounded-sm focus-visible:outline-2 focus-visible:outline-ui-keyboard aria-expanded:[&>svg:first-child]:rotate-90",
  {
    variants: { iconOnly: { true: "w-7 shrink-0 justify-center", false: "flex-1 gap-2 px-1.5 text-start" } },
  },
);
const treeSelectStyles = cva(
  "flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-sm ps-0.5 pe-1.5 text-start focus-visible:outline-2 focus-visible:outline-ui-keyboard",
);
const treeGroupStyles = cva("ms-3.5 border-s border-ui-line ps-3");
const treeItemStyles = cva("flex min-h-7 items-center gap-2 px-1.5");

function TreeRoot({ className, ...props }: ComponentProps<"ul">) {
  return <ul {...props} className={cn(treeStyles(), className)} />;
}

type TreeBranchProps = Omit<ComponentProps<"li">, "onSelect"> &
  VariantProps<typeof treeBranchRowStyles> & {
    label: ReactNode;
    highlighted?: boolean;
    labelPointerEvents?: Pick<ComponentProps<"button">, "onPointerEnter" | "onPointerLeave">;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  } & (
    | { onSelect: MouseEventHandler<HTMLButtonElement>; selected: boolean; toggleLabel: string }
    | { onSelect?: undefined; selected?: never; toggleLabel?: never }
  );

function TreeBranch({
  children, label, radius, onSelect, selected, highlighted, toggleLabel,
  labelPointerEvents, open, onOpenChange, ...props
}: TreeBranchProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const expanded = open ?? internalOpen;
  const contentId = useId();
  return (
    <li {...props}>
      <div className={treeBranchRowStyles({ radius })} data-selected={selected} data-highlighted={highlighted}>
        <button
          {...(!onSelect ? labelPointerEvents : undefined)}
          type="button"
          className={treeToggleStyles({ iconOnly: Boolean(onSelect) })}
          aria-label={toggleLabel}
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={() => {
            const next = !expanded;
            if (open === undefined) setInternalOpen(next);
            onOpenChange?.(next);
          }}
        >
          <ChevronRight aria-hidden="true" className="text-ui-muted" />
          {!onSelect && label}
        </button>
        {onSelect && (
          <button {...labelPointerEvents} type="button" className={treeSelectStyles()} aria-pressed={selected} onClick={onSelect}>
            {label}
          </button>
        )}
      </div>
      <div id={contentId} hidden={!expanded}>{children}</div>
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
