import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-slate-900 text-slate-50 hover:bg-slate-900/90",
        destructive: "bg-red-500 text-slate-50 hover:bg-red-500/90",
        outline: "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-100/80",
        ghost: "hover:bg-slate-100 hover:text-slate-900",
        link: "text-slate-900 underline-offset-4 hover:underline",
        primary: "bg-primary-700 text-white hover:bg-primary-800",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  loadingSpinnerSize?: "sm" | "md" | "lg" | "xl";
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    asChild = false, 
    loading = false,
    loadingText,
    loadingSpinnerSize = "sm",
    children,
    disabled,
    ...props 
  }, ref) => {
    
    const isDisabled = disabled || loading;
    
    const getSpinnerSize = () => {
      if (loadingSpinnerSize !== "sm") return loadingSpinnerSize;
      
      switch (size) {
        case "sm":
          return "sm";
        case "lg":
          return "md";
        case "icon":
          return "md";
        default:
          return "sm";
      }
    };

    return (
      <button 
        className={cn(buttonVariants({ variant, size, className }))} 
        ref={ref} 
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <>
            <LoadingSpinner 
              size={getSpinnerSize()} 
              className="mr-2" 
              variant="lottie" 
            />
            {loadingText || "Loading..."}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };