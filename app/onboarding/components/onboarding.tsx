"use client";

import { CustomToast } from "@/components/mango-ui/custom-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, CircleCheck, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { updateOnboardingAction } from "../actions";

const steps = ["Personal Info", "Commission", "Description", "Summary"];

export default function ElegantOnboarding({
	userId,
	email,
}: { userId: string; email: string }) {
	const router = useRouter();
	const [currentStep, setCurrentStep] = useState(0);
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		commission: "",
		description: "",
	});

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleStepChange = (direction: "next" | "previous") => {
		setCurrentStep((prev) => (direction === "next" ? prev + 1 : prev - 1));
	};

	const handleSubmit = async () => {
		setIsLoading(true);

		const user = await updateOnboardingAction(userId, {
			first_name: formData.firstName,
			last_name: formData.lastName,
			description: formData.description,
			commission: Number(formData.commission),
			email: email as string,
		});

		if (!user) {
			toast.custom((t) => (
				<CustomToast t={t} message="Something went wrong" variant="error" />
			));
		} else if ("error" in user) {
			toast.custom((t) => (
				<CustomToast t={t} message={user.error} variant="error" />
			));
		} else {
			router.push("/pipeline");
		}
		setIsLoading(false);
	};

	const renderStep = () => {
		switch (currentStep) {
			case 0:
				return (
					<div className="space-y-6">
						<div className="relative">
							<Input
								id="firstName"
								name="firstName"
								value={formData.firstName}
								onChange={handleInputChange}
								placeholder="First Name"
							/>
						</div>
						<div className="relative">
							<Input
								id="lastName"
								name="lastName"
								value={formData.lastName}
								onChange={handleInputChange}
								placeholder="Last Name"
							/>
						</div>
					</div>
				);
			case 1:
				return (
					<div className="relative">
						<Input
							id="commission"
							name="commission"
							type="number"
							value={formData.commission}
							onChange={handleInputChange}
							placeholder="Commission Rate (%)"
						/>
					</div>
				);
			case 2:
				return (
					<div className="relative">
						<Textarea
							id="description"
							name="description"
							value={formData.description}
							onChange={handleInputChange}
							placeholder="Description"
							rows={4}
							className="resize-none"
						/>
					</div>
				);
			case 3:
				return (
					<div className="space-y-4">
						<p>
							<strong>Name:</strong> {formData.firstName} {formData.lastName}
						</p>
						<p>
							<strong>Commission Rate:</strong> {formData.commission}%
						</p>
						<p className="truncate">
							<strong>Description:</strong> {formData.description}
						</p>
					</div>
				);
		}
	};

	return (
		<>
			<Toaster position="top-right" />

			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
				<div className="absolute inset-0 overflow-hidden">
					<div className="absolute left-0 top-0 h-[800px] w-[800px] animate-blob rounded-full bg-gradient-to-r from-purple-300 to-pink-300 opacity-70 mix-blend-multiply blur-xl filter" />
					<div className="animation-delay-2000 absolute right-0 top-0 h-[600px] w-[600px] animate-blob rounded-full bg-gradient-to-r from-yellow-300 to-pink-300 opacity-70 mix-blend-multiply blur-xl filter" />
					<div className="animation-delay-4000 absolute bottom-0 left-20 h-[700px] w-[700px] animate-blob rounded-full bg-gradient-to-r from-blue-300 to-green-300 opacity-70 mix-blend-multiply blur-xl filter" />
				</div>
				<div className="bg-white bg-opacity-80 backdrop-blur-lg rounded-xl shadow-xl overflow-hidden w-full max-w-4xl flex flex-col lg:flex-row relative z-10">
					<div className="bg-gray-900 bg-opacity-90 text-white p-8 lg:w-1/3">
						<h2 className="text-2xl font-bold mb-6">Welcome Aboard</h2>
						<ul className="space-y-4">
							{steps.map((step, index) => (
								<li
									key={`${index}-${step}`}
									className={`flex items-center space-x-2 ${index <= currentStep ? "text-white" : "text-gray-400"}`}
								>
									<div
										className={`w-6 h-6 rounded-full flex items-center justify-center ${index <= currentStep ? "bg-green-600" : "bg-gray-700 animate-pulse"}`}
									>
										{index < currentStep ? (
											<CircleCheck className="h-4 w-4" />
										) : (
											index + 1
										)}
									</div>
									<span>{step}</span>
								</li>
							))}
						</ul>
					</div>
					<div className="p-8 lg:w-2/3">
						<div className="space-y-6 h-48">
							<div className="mb-8">
								<h3 className="text-2xl font-semibold mb-2">
									{steps[currentStep]}
								</h3>
								<div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
									<div
										className="h-full bg-primary transition-all duration-500 ease-out"
										style={{
											width: `${((currentStep + 1) / steps.length) * 100}%`,
										}}
									/>
								</div>
							</div>
							<AnimatePresence mode="wait">
								<motion.div
									key={currentStep}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -20 }}
									transition={{ duration: 0.3 }}
								>
									{renderStep()}
								</motion.div>
							</AnimatePresence>
						</div>
						<div className="py-6 flex justify-between">
							<Button
								type="button"
								onClick={() => handleStepChange("previous")}
								disabled={currentStep === 0}
								variant="outline"
							>
								<ChevronLeft className="mr-2 h-4 w-4" /> Previous
							</Button>
							{currentStep < steps.length - 1 ? (
								<Button type="button" onClick={() => handleStepChange("next")}>
									Next <ChevronRight className="ml-2 h-4 w-4" />
								</Button>
							) : (
								<Button type="button" onClick={handleSubmit}>
									{isLoading ? (
										<span className="flex items-center">
											<Loader className="h-4 w-4 mr-1 text-gray-400 animate-spin" />
											Submitting
										</span>
									) : (
										"Submit"
									)}
								</Button>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
