import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Messages } from "@prisma/client";
import { useMail } from "@/app/(businesses)/inbox/use-mail";

interface MailListProps {
  items: Messages[];
}

export function MailList({ items }: MailListProps) {
  const [mail, setMail] = useMail();

  return (
    <ScrollArea className="h-screen">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {items.map(item => (
          <button
            key={item.id}
            className={cn(
              "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
              mail.selected === item.id && "bg-muted"
            )}
            onClick={() =>
              setMail({
                ...mail,
                selected: item.id,
              })
            }
          >
            <div className="flex w-full flex-col gap-1">
              <div className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{item.name}</div>
                </div>
                <div
                  className={cn(
                    "ml-auto text-xs",
                    mail.selected === item.id ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {formatDistanceToNow(new Date(item.sent_at), {
                    addSuffix: true,
                  })}
                </div>
              </div>
              <div className="text-xs font-medium">{item.subject}</div>
            </div>
            <div className="line-clamp-2 text-xs text-muted-foreground">
              {item.message.substring(0, 300)}
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}
