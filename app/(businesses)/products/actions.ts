"use server";

import {
	createProduct,
	deleteProductById,
	updateProductById,
} from "@/models/products";
import type { PriceType } from "@/prisma/app/generated/prisma/client";
import { createClient } from "@supabase/supabase-js";
import { decode } from "base64-arraybuffer";
import { revalidatePath } from "next/cache";
import { uuid } from "uuidv4";
import type { TFormInitialState } from "./components/product";

export async function createProductAction(formData: FormData) {
	try {
		const name = formData.get("name") as string;
		const price = formData.get("price") as string;
		const description = formData.get("description") as string;
		const imageReferenceFile = formData.get("image-reference-file") as string;
		const imageReferenceFileName = formData.get(
			"image-reference-file-name",
		) as string;
		const businessId = formData.get("business-id") as string;
		const htmlDescription = formData.get("html-description") as string;
		const priceType = formData.get("price-type") as string;
		const isShippable = formData.get("is-shippable") as string;

		const supabase = createClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL as string,
			process.env.SUPABASE_KEY as string,
		);
		const { data } = await supabase.storage
			.from("mangosqueezy")
			.upload(
				`${uuid()}-${imageReferenceFileName}`,
				decode(imageReferenceFile),
				{
					contentType: "image/png",
					cacheControl: "3600",
					upsert: false,
				},
			);

		const parsedImageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/mangosqueezy/${data?.path}`;

		await createProduct(
			name,
			price,
			description,
			parsedImageUrl,
			businessId,
			htmlDescription,
			priceType,
			isShippable,
		);

		revalidatePath("/products");

		return "success";
	} catch (error) {
		return "error";
	}
}

export async function updateProductAction(
	_: TFormInitialState,
	formData: FormData,
) {
	try {
		const productId = formData.get("product-id") as string;
		const productName = formData.get("product-name") as string;
		const productDescription = formData.get("product-description") as string;
		const productPrice = formData.get("product-price") as string;
		const productImageUrl = formData.get("product-image-url") as string;
		const productHtmlDescription = formData.get(
			"product-html-description",
		) as string;
		const parsedProductPrice = Number.parseFloat(productPrice);
		const productPriceType = formData.get("product-price-type") as string;
		const productIsShippable = formData.get("product-is-shippable") as string;

		await updateProductById(
			Number.parseInt(productId),
			productName,
			parsedProductPrice,
			productDescription,
			productImageUrl,
			productHtmlDescription,
			productPriceType as PriceType,
			productIsShippable === "true",
		);

		revalidatePath("/products");
		return {
			success: "updated successfully",
			errors: {
				message: null,
				name: null,
				price: null,
				description: null,
				productImage: null,
				htmlDescription: null,
				priceType: null,
				isShippable: null,
			},
		};
	} catch (error) {
		return {
			success: "",
			errors: {
				message: "something went wrong",
				name: null,
				price: null,
				description: null,
				productImage: null,
				htmlDescription: null,
				priceType: null,
				isShippable: null,
			},
		};
	}
}

export async function deleteProductAction(
	_: TFormInitialState,
	formData: FormData,
) {
	try {
		const productId = formData.get("product-id") as string;

		await deleteProductById(Number.parseInt(productId));

		revalidatePath("/products");
		return {
			success: "deleted successfully",
			errors: {
				message: null,
				name: null,
				price: null,
				description: null,
				productImage: null,
				htmlDescription: null,
				priceType: null,
				isShippable: null,
			},
		};
	} catch (error) {
		return {
			success: "",
			errors: {
				message: "something went wrong",
				name: null,
				price: null,
				description: null,
				productImage: null,
				htmlDescription: null,
				priceType: null,
				isShippable: null,
			},
		};
	}
}
