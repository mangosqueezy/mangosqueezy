"use client";
import { useChat } from "@ai-sdk/react";
import { CornerDownLeft, User, BotMessageSquare, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/mango-ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Chat({
  profile,
  video,
  webpagesData,
}: {
  profile: any;
  video: any;
  webpagesData: any;
}) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    body: {
      profile,
      video,
      webpagesData,
    },
    streamMode: "text",
  });

  return (
    <>
      <Badge color="lime" className="absolute right-3 top-3">
        Output
      </Badge>
      <ScrollArea className="h-full w-full">
        <div className="flex flex-col rounded-xl">
          {messages.map(message => (
            <div key={message.id} className="py-3 px-2">
              <div className="grid grid-cols-12 items-center">
                {message.role === "user" ? (
                  <User className="size-5 col-span-1 text-blue-500" />
                ) : (
                  <BotMessageSquare className="size-5 col-span-1 text-orange-500" />
                )}
                <p className="ml-2 text-sm font-medium col-span-11 selection:bg-yellow-200">
                  {message.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="flex justify-center py-5">
        {isLoading && <Loader className="size-5 animate-spin" />}
      </div>

      <form
        className="relative overflow-hidden rounded-lg border pb-5 bg-background focus-within:ring-1 focus-within:ring-ring"
        onSubmit={handleSubmit}
      >
        <Label htmlFor="message" className="sr-only">
          Message
        </Label>
        <Textarea
          id="message"
          placeholder="Type your message here..."
          value={input}
          onChange={handleInputChange}
          className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
        />
        <div className="flex items-center p-3 pt-0">
          <Button type="submit" size="sm" className="ml-auto gap-1.5">
            Send Message
            <CornerDownLeft className="size-3.5" />
          </Button>
        </div>
      </form>
    </>
  );
}
