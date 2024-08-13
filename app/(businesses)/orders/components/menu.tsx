"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Loader, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateOrderAction } from "../actions";
import { cn } from "@/lib/utils";

export default function Menu({ orderId }: { orderId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button aria-haspopup="true" size="icon" variant="ghost">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={async () => {
            setIsLoading(true);
            const formData = new FormData();
            formData.append("order_id", orderId);
            formData.append("status", "completed");

            await updateOrderAction(formData);
            setIsLoading(false);
          }}
          className={cn("cursor-pointer", isLoading && "cursor-not-allowed")}
          disabled={isLoading}
        >
          {isLoading ? <Loader className="h-4 w-4 mr-2" /> : "Complete"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
