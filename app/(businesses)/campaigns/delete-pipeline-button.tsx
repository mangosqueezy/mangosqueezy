"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { deletePipelineAction } from "./actions";

interface DeletePipelineButtonProps {
	pipelineId: number;
}

export function DeletePipelineButton({
	pipelineId,
}: DeletePipelineButtonProps) {
	const [isPending, startTransition] = useTransition();

	const handleDelete = () => {
		startTransition(async () => {
			try {
				const result = await deletePipelineAction(pipelineId);

				if (result.success) {
					toast.success("Pipeline deleted successfully");
				} else {
					toast.error(result.error || "Failed to delete pipeline");
				}
			} catch (error) {
				toast.error("An error occurred while deleting the pipeline");
			}
		});
	};

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
					disabled={isPending}
				>
					<Trash2 className="h-4 w-4" />
					<span className="sr-only">Delete pipeline</span>
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete Pipeline</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to delete this pipeline? This action cannot be
						undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleDelete}
						className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
					>
						{isPending ? "Deleting..." : "Delete"}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
