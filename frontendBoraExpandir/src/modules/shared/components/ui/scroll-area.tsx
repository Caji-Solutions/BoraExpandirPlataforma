import * as React from "react";
import { cn } from "@/lib/utils";

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
    viewportClassName?: string;
}

export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
    ({ className, children, viewportClassName, ...props }, ref) => {
        return (
            <div ref={ref} className={cn("relative overflow-auto", className)} {...props}>
                <div className={cn("min-w-full", viewportClassName)}>{children}</div>
            </div>
        );
    },
);
ScrollArea.displayName = "ScrollArea";

// Placeholder ScrollBar export for API compatibility
export const ScrollBar: React.FC<{ orientation?: "vertical" | "horizontal"; className?: string }> = () => null;
