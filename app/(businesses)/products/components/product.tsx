"use client";
import { useState } from "react";
import { useFormState } from "react-dom";
import type { Products, Business } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import toast, { Toaster } from "react-hot-toast";
import { CustomToast } from "@/components/mango-ui/custom-toast";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import {
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from "../actions";
import { z } from "zod";

export type TBusiness = Pick<Business, "id"> & {
  products: Array<Products>;
};

const initialStateSchema = z.object({
  success: z.string(),
  errors: z.object({
    message: z.string().nullable(),
    name: z.string().nullable(),
    price: z.string().nullable(),
    description: z.string().nullable(),
    productImage: z.string().nullable(),
  }),
});

// Infer the TypeScript type from the Zod schema
export type TFormInitialState = z.infer<typeof initialStateSchema>;

// The initial state object, matching the schema
const initialState: TFormInitialState = {
  success: "",
  errors: {
    message: null,
    name: null,
    price: null,
    description: null,
    productImage: null,
  },
};

export default function Product({
  user,
}: {
  user: TBusiness | null | undefined;
}) {
  const [open, setOpen] = useState(false);
  const [state, productAction] = useFormState(
    createProductAction,
    initialState,
  );
  const [updateFormState, updateAction] = useFormState(
    updateProductAction,
    initialState,
  );
  const [deleteFormState, deleteAction] = useFormState(
    deleteProductAction,
    initialState,
  );
  const [editProductInfo, setEditProductInfo] = useState({
    id: 0,
    name: "",
    price: "",
    description: "",
    imageUrl: "",
  });
  const [openEditProductDialog, setOpenEditProductDialog] = useState(false);
  const [profilePhotoInfo, setProfilePhotoInfo] = useState({
    name: "",
    fileDetails: "",
    url: "",
  });

  if (state?.success === "updated successfully") {
    toast.custom((t) => (
      <CustomToast
        t={t}
        message="Information updated successfully!"
        variant="success"
      />
    ));
  } else if (updateFormState?.success === "updated successfully") {
    toast.custom((t) => (
      <CustomToast
        t={t}
        message="Product updated successfully!"
        variant="success"
      />
    ));
  } else if (deleteFormState?.success === "deleted successfully") {
    toast.custom((t) => (
      <CustomToast
        t={t}
        message="Product deleted successfully!"
        variant="success"
      />
    ));
  } else if (
    state?.errors?.message ||
    updateFormState?.errors?.message ||
    deleteFormState?.errors?.message
  ) {
    toast.custom((t) => (
      <CustomToast
        t={t}
        message="Something went wrong. Please try again later!"
        variant="error"
      />
    ));
  }

  const uploadProflePhoto = (event: any) => {
    const reader = new FileReader();
    reader.onload = async function () {
      /* Base64 is a binary-to-text encoding scheme used to
          transport data. The encoding is necessary when the transfer
          medium is not able to handle binary data.
          This binary data is then translated to a text representation (base64) and transferred as text. */

      // base64 is an algorithm for encoding and decoding an object to ASCII format.
      /* eslint-disable  @typescript-eslint/no-explicit-any */
      const base64String: any = reader?.result;

      setProfilePhotoInfo({
        name: event.target.files[0].name,
        fileDetails: base64String.split(",")[1],
        url: base64String,
      });
      const fileInput: any = document.getElementById(
        "image-reference-file-name",
      );
      fileInput.value = ""; // Reset the file input element
    };

    reader.readAsDataURL(event.target.files[0]);
  };

  return (
    <>
      <Toaster position="top-right" />

      <div className="flex min-h-screen w-full flex-col">
        <div className="ml-auto flex items-center gap-2 mb-5">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button size="sm" className="h-8 gap-1">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Product
                </span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <form method="POST" action={productAction}>
                <input
                  type="text"
                  name="business-id"
                  id="business-id"
                  readOnly
                  value={user?.id}
                  className="hidden"
                />

                <input
                  type="text"
                  name="image-reference-file"
                  id="image-reference-file"
                  readOnly
                  value={profilePhotoInfo.fileDetails}
                  className="hidden"
                />

                <input
                  type="text"
                  name="image-reference-file-name"
                  id="image-reference-file-name"
                  readOnly
                  value={profilePhotoInfo.name}
                  className="hidden"
                />
                <SheetHeader>
                  <SheetTitle>Product details</SheetTitle>
                  <SheetDescription>
                    Add product details. Click save when you're done.
                  </SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Product name"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="price" className="text-right">
                      Price
                    </Label>
                    <Input
                      type="number"
                      id="price"
                      name="price"
                      placeholder="Product price"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Enter your product description."
                      className="min-h-32 col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="picture" className="text-right">
                      Picture
                    </Label>
                    <Input
                      id="picture"
                      type="file"
                      className="col-span-3"
                      onChange={(event) => {
                        uploadProflePhoto(event);
                      }}
                    />
                  </div>
                </div>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button type="submit">Save changes</Button>
                  </SheetClose>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>Manage your products.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="hidden md:table-cell">Price</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Image Url
                  </TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user?.products &&
                  user?.products.map((product: Products) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell className="font-medium">
                        <Badge variant="outline" className="text-green-500">
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{product.description}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {product.price}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <a
                          href={product.image_url || ""}
                          className="text-orange-500 flex"
                          target="_blank"
                          rel="noreferrer"
                        >
                          product image
                          <ArrowTopRightOnSquareIcon className="ml-2 h-5 w-5" />
                        </a>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditProductInfo({
                                  id: product.id,
                                  name: product.name,
                                  description: product.description,
                                  price: product.price.toString(),
                                  imageUrl: product.image_url || "",
                                });
                                setOpenEditProductDialog(true);
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={async () => {
                                const formData = new FormData();
                                formData.append(
                                  "product-id",
                                  product.id.toString(),
                                );
                                deleteAction(formData);
                              }}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={openEditProductDialog}
        onOpenChange={() => setOpenEditProductDialog(!openEditProductDialog)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={editProductInfo.name}
                onChange={(event) => {
                  setEditProductInfo({
                    ...editProductInfo,
                    name: event.target.value,
                  });
                }}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={editProductInfo.description}
                onChange={(event) => {
                  setEditProductInfo({
                    ...editProductInfo,
                    description: event.target.value,
                  });
                }}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price
              </Label>
              <Input
                id="price"
                value={editProductInfo.price}
                onChange={(event) => {
                  setEditProductInfo({
                    ...editProductInfo,
                    price: event.target.value,
                  });
                }}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="picture" className="text-right">
                Picture
              </Label>
              <Input
                id="picture"
                type="file"
                className="col-span-3"
                onChange={(event) => {
                  uploadProflePhoto(event);
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={async () => {
                const formData = new FormData();
                formData.append("product-id", editProductInfo.id.toString());
                formData.append("product-name", editProductInfo.name);
                formData.append(
                  "product-description",
                  editProductInfo.description,
                );
                formData.append("product-price", editProductInfo.price);
                formData.append("product-image-url", editProductInfo.imageUrl);

                updateAction(formData);
                setOpenEditProductDialog(false);
              }}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
