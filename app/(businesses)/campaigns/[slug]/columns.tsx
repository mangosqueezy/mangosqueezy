import { Button } from "@/components/ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { DataTableColumnHeader } from "./data-table";

// Stripe columns
export type StripeAffiliate = {
	email: string;
	reason: string;
	total_charges: number;
	status: string;
	handle: string;
	onRemove?: (row: StripeAffiliate) => void;
	onView?: (row: StripeAffiliate) => void;
};

export const stripeColumns: ColumnDef<StripeAffiliate>[] = [
	{
		accessorKey: "email",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Email" />
		),
	},
	{
		accessorKey: "reason",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Reason" />
		),
		cell: ({ row }) => (
			<span title={row.original.reason} className="max-w-xs truncate block">
				{row.original.reason}
			</span>
		),
	},
	{
		accessorKey: "total_charges",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Total Charges" />
		),
		cell: ({ row }) => (row.original.total_charges / 100).toLocaleString(),
	},
	{
		accessorKey: "handle",
		header: () => null, // hidden, but needed for actions
		enableHiding: true,
		enableSorting: false,
	},
	{
		id: "actions",
		header: "Actions",
		cell: ({ row }) => (
			<div className="flex gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={() => row.original.onRemove?.(row.original)}
				>
					Remove
				</Button>
				<Button
					variant="default"
					size="sm"
					onClick={() => row.original.onView?.(row.original)}
				>
					View
				</Button>
			</div>
		),
	},
];

// Non-stripe columns
export type Affiliate = {
	avatar: string;
	displayName: string;
	handle: string;
	status: string;
	tag: string;
	reason: string;
	onRemove?: (row: Affiliate) => void;
	onView?: (row: Affiliate) => void;
};

export const affiliateColumns: ColumnDef<Affiliate>[] = [
	{
		accessorKey: "avatar",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Avatar" />
		),
		cell: ({ row }) => (
			<Image
				src={row.original.avatar}
				alt={row.original.displayName}
				className="w-8 h-8 rounded-full border"
				width={32}
				height={32}
			/>
		),
	},
	{
		accessorKey: "displayName",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Name" />
		),
	},
	{
		accessorKey: "handle",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Handle" />
		),
		cell: ({ row }) => `@${row.original.handle}`,
	},
	{
		accessorKey: "status",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Status" />
		),
		cell: ({ row }) => (
			<span
				className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${row.original.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
			>
				{row.original.status}
			</span>
		),
	},
	{
		accessorKey: "tag",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Tag" />
		),
	},
	{
		accessorKey: "reason",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Reason" />
		),
		cell: ({ row }) => (
			<span title={row.original.reason} className="max-w-xs truncate block">
				{row.original.reason}
			</span>
		),
	},
	{
		id: "actions",
		header: "Actions",
		cell: ({ row }) => (
			<div className="flex gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={() => row.original.onRemove?.(row.original)}
				>
					Remove
				</Button>
				<Button
					variant="default"
					size="sm"
					onClick={() => row.original.onView?.(row.original)}
				>
					View
				</Button>
			</div>
		),
	},
];
