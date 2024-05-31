"use server";

import isEmpty from "lodash/isEmpty";
import { createClient } from "@supabase/supabase-js";
import { decode } from "base64-arraybuffer";
import { uuid } from "uuidv4";
import {
  createProduct,
  deleteProductById,
  updateProductById,
} from "@/models/products";
import type { TFormInitialState } from "./components/product";
import { revalidatePath } from "next/cache";

export async function createProductAction(
  _: TFormInitialState,
  formData: FormData,
) {
  try {
    const name: any = formData.get("name");
    const price: any = formData.get("price");
    const description: any = formData.get("description");
    const imageReferenceFile: any = formData.get("image-reference-file");
    const imageReferenceFileName: any = formData.get(
      "image-reference-file-name",
    );
    const businessId: any = formData.get("business-id");

    if (isEmpty(name)) {
      return {
        success: "",
        errors: {
          message: "something went wrong",
          name: "Product name is empty",
          price: null,
          description: null,
          productImage: null,
        },
      };
    }
    if (isEmpty(price)) {
      return {
        success: "",
        errors: {
          message: "something went wrong",
          name: null,
          price: "Product price is empty",
          description: null,
          productImage: null,
        },
      };
    }
    if (isEmpty(description)) {
      return {
        success: "",
        errors: {
          message: "something went wrong",
          name: null,
          price: null,
          description: "Product description is empty",
          productImage: null,
        },
      };
    }
    if (isEmpty(imageReferenceFile)) {
      return {
        success: "",
        errors: {
          message: "something went wrong",
          name: null,
          price: null,
          description: null,
          productImage: "Product image is empty",
        },
      };
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.SUPABASE_KEY as string,
    );
    const { data }: any = await supabase.storage
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

    const parsedImageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/mangosqueezy/${data.path}`;

    await createProduct(name, price, description, parsedImageUrl, businessId);

    revalidatePath("/products");

    return {
      success: "updated successfully",
      errors: {
        message: null,
        name: null,
        price: null,
        description: null,
        productImage: null,
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
      },
    };
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

    const parsedProductPrice = parseFloat(productPrice);
    await updateProductById(
      parseInt(productId),
      productName,
      parsedProductPrice,
      productDescription,
      productImageUrl,
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

    await deleteProductById(parseInt(productId));

    revalidatePath("/products");
    return {
      success: "deleted successfully",
      errors: {
        message: null,
        name: null,
        price: null,
        description: null,
        productImage: null,
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
      },
    };
  }
}
