"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const tabsListVariants = cva(
  "inline-flex items-center justify-center text-muted-foreground",
  {
    variants: {
      variant: {
        default: "h-9 rounded-lg bg-muted p-1 text-muted-foreground",
        line:
          "h-auto w-full justify-start gap-0 rounded-none border-b border-neutral-200 bg-transparent p-0 text-neutral-500 dark:border-neutral-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const tabsTriggerVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground",
  {
    variants: {
      variant: {
        default:
          "rounded-md px-3 py-1 text-sm data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        line:
          "relative rounded-none border-b-2 border-transparent bg-transparent px-4 py-2.5 text-[13px] text-neutral-600 shadow-none transition-colors hover:text-neutral-900 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-neutral-900 data-[state=active]:shadow-none dark:text-neutral-400 dark:hover:text-neutral-100 dark:data-[state=active]:text-neutral-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const TabsVariantContext = React.createContext<"default" | "line">("default");

const Tabs = TabsPrimitive.Root;

type TabsListProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>;

const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, TabsListProps>(
  ({ className, variant, children, ...props }, ref) => (
    <TabsVariantContext.Provider value={variant ?? "default"}>
      <TabsPrimitive.List
        ref={ref}
        data-slot="tabs-list"
        className={cn(tabsListVariants({ variant }), className)}
        {...props}
      >
        {children}
      </TabsPrimitive.List>
    </TabsVariantContext.Provider>
  ),
);
TabsList.displayName = TabsPrimitive.List.displayName;

type TabsTriggerProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> &
  VariantProps<typeof tabsTriggerVariants>;

const TabsTrigger = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>, TabsTriggerProps>(
  ({ className, variant, ...props }, ref) => {
    const listVariant = React.useContext(TabsVariantContext);
    const v = variant ?? listVariant;
    return (
      <TabsPrimitive.Trigger
        ref={ref}
        data-slot="tabs-trigger"
        className={cn(tabsTriggerVariants({ variant: v }), className)}
        {...props}
      />
    );
  },
);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
