import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Affiliate_Business } from "@prisma/client";
import Link from "next/link";

export default async function OrdersPage() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  const userId = data?.user?.id as string;
  const user = await getUserById(userId);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Card>
        <CardHeader>
          <CardTitle>Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Link</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {user &&
                user?.affiliate_business.map(
                  (affiliate: Affiliate_Business, index: number) =>
                    affiliate.affiliate_link && (
                      <TableRow key={`table-row-${index}`}>
                        <TableCell className="font-medium">{affiliate.affiliate_link}</TableCell>
                        <TableCell className="flex justify-end">
                          <Button asChild>
                            <Link href={`/metrics/${affiliate.affiliate_link_key}`}>View</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
