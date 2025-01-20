"use client";

import { Room } from "@/app/Room";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LineChart, ShoppingBag, Users2, Wallet } from "lucide-react";
import { CollaborativeApp } from "./CollaborativeApp";

export default function AffiliatesPage() {
	return (
		<div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
			{/* Profile Header Card */}
			<Card className="p-6 bg-white shadow-sm">
				<div className="flex flex-col md:flex-row items-start md:items-center gap-6">
					{/* Profile Image */}
					<div className="relative">
						<div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
							<Users2 className="w-12 h-12 text-gray-400" />
						</div>
					</div>

					{/* Profile Info */}
					<div className="flex-1">
						<h1 className="text-2xl font-bold text-gray-900">
							Affiliate Dashboard
						</h1>
						<p className="text-gray-500 mt-1">
							Manage and track your affiliate performance
						</p>
					</div>
				</div>

				<Separator className="my-6" />

				{/* Stats Grid */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
					{/* Total Earnings */}
					<div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
						<Wallet className="w-8 h-8 text-blue-500 mb-2" />
						<span className="text-2xl font-bold text-gray-900">$2,451</span>
						<span className="text-sm text-gray-500">Total Earnings</span>
					</div>

					{/* Active Campaigns */}
					<div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
						<ShoppingBag className="w-8 h-8 text-green-500 mb-2" />
						<span className="text-2xl font-bold text-gray-900">12</span>
						<span className="text-sm text-gray-500">Active Campaigns</span>
					</div>

					{/* Conversion Rate */}
					<div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
						<LineChart className="w-8 h-8 text-purple-500 mb-2" />
						<span className="text-2xl font-bold text-gray-900">3.2%</span>
						<span className="text-sm text-gray-500">Conversion Rate</span>
					</div>

					{/* Total Referrals */}
					<div className="flex flex-col items-center p-4 bg-orange-50 rounded-lg">
						<Users2 className="w-8 h-8 text-orange-500 mb-2" />
						<span className="text-2xl font-bold text-gray-900">847</span>
						<span className="text-sm text-gray-500">Total Referrals</span>
					</div>
				</div>
			</Card>

			<div className="bg-gray-50 border rounded-lg p-4 mt-6">
				<Room>
					<CollaborativeApp />
				</Room>
			</div>
		</div>
	);
}
