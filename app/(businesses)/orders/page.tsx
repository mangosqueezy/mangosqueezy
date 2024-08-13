import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { getUserById } from "@/models/business";
import { Orders } from "@prisma/client";
import Menu from "./components/menu";

export default async function OrdersPage() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  const userId = data?.user?.id as string;
  const user = await getUserById(userId);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>Manage your products and view their sales performance.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {user &&
                user?.orders.map((order: Orders, index: number) => (
                  <TableRow key={`table-row-${index}`}>
                    <TableCell className="font-medium">{order.customer_email}</TableCell>
                    <TableCell>
                      {user.products.find(product => product.id === order?.product_id)?.name}
                    </TableCell>
                    <TableCell>
                      <Menu orderId={order.id} />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
