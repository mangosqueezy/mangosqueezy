"use client";
import { useState, useCallback, useRef } from "react";
import { experimental_useObject as useObject } from "ai/react";
import { CornerDownLeft, User, BotMessageSquare, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/mango-ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { chatSchema } from "@/app/api/chat/schema";

export default function Chat({
  profile,
  video,
  webpagesData,
}: {
  profile: any;
  video: any;
  webpagesData: any;
}) {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }> | []>([]);
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const { submit, isLoading, object } = useObject({
    api: "/api/chat",
    schema: chatSchema,
    onFinish({ object }) {
      if (object != null) {
        //setMessages(messages => [...messages, { role: "assistant", content: object.chat.message }]);

        if (ref.current) {
          ref.current.value = "";
        }
      }
    },
  });

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const input = ref?.current?.value;
      setMessages(messages => [
        ...messages,
        { role: "assistant", content: object?.chat?.message as string },
        { role: "user", content: input! },
      ]);
      submit({ chat: input, profile, video, webpagesData });
    },
    [submit, profile, video, webpagesData, object?.chat?.message]
  );

  return (
    <>
      <Badge color="lime" className="absolute right-3 top-3">
        Output
      </Badge>
      <ScrollArea className="h-full w-full">
        <div className="flex flex-col rounded-xl">
          {messages.map((message, index) => (
            <div key={`message-id-${index}`} className="py-3 px-2">
              <div className="grid grid-cols-12 items-center">
                {message.role === "user" ? (
                  <User className="size-5 col-span-1 text-blue-500" />
                ) : (
                  <BotMessageSquare className="size-5 col-span-1 text-orange-500" />
                )}
                <p className="ml-2 text-sm font-medium col-span-11 selection:bg-yellow-200">
                  {message.content.split("\n").map((message, index) => (
                    <p
                      key={`message-paragraph-${index}`}
                      className="ml-2 mb-3 text-sm font-medium col-span-11 selection:bg-yellow-200"
                    >
                      {message}
                    </p>
                  ))}
                </p>
              </div>
            </div>
          ))}
        </div>

        {object?.chat?.message && (
          <div key={`stream-message`} className="py-3 px-2">
            <div className="grid grid-cols-12 items-center">
              <BotMessageSquare className="size-5 col-span-1 text-orange-500" />
              <p className="ml-2 text-sm font-medium col-span-11 selection:bg-yellow-200">
                {object.chat.message.split("\n").map((message, index) => (
                  <p
                    key={`stream-message-paragraph-${index}`}
                    className="ml-2 mb-3 text-sm font-medium col-span-11 selection:bg-yellow-200"
                  >
                    {message}
                  </p>
                ))}
              </p>
            </div>
          </div>
        )}
      </ScrollArea>

      <div className="flex justify-center py-5">
        {isLoading && <Loader className="size-5 animate-spin" />}
      </div>

      <form
        className="relative overflow-hidden rounded-lg border pb-5 bg-background focus-within:ring-1 focus-within:ring-ring"
        onSubmit={(event: React.FormEvent<HTMLFormElement>) => handleSubmit(event)}
      >
        <Label htmlFor="message" className="sr-only">
          Message
        </Label>
        <Textarea
          id="message"
          name="chat"
          placeholder="Type your message here..."
          className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
          ref={ref}
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
