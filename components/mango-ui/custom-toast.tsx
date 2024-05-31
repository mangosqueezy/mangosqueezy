"use client";
import * as React from "react";
import type { Toast } from "react-hot-toast";
import toast from "react-hot-toast";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const customToastVariants = cva(
  "max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5",
  {
    variants: {
      variant: {
        default: "bg-white",
        info: "bg-blue-100 text-blue-500",
        error: "bg-red-100 text-red-500",
        success: "bg-green-100 text-green-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type CustomToastProps = {
  t: Toast;
  message: string;
} & VariantProps<typeof customToastVariants> &
  React.HTMLAttributes<HTMLDivElement>;

const CustomToast = React.forwardRef<HTMLDivElement, CustomToastProps>(
  ({ className, variant, t, message, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          customToastVariants({
            variant,
            className: [
              className,
              t.visible ? "animate-enter" : "animate-leave",
            ],
          }),
        )}
        {...props}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">{message}</p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-300">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    );
  },
);

CustomToast.displayName = "CustomToast";

export { CustomToast, customToastVariants };
