"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/mango-ui/button";

export default function XrpButton() {
  const [messages, setMessages] = useState<Array<string>>([]);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  const startStreaming = () => {
    if (eventSource) {
      // If there's an existing connection, close it
      eventSource.close();
    }

    const newEventSource = new EventSource("https://mangosqueezy.com/api/xumm");

    newEventSource.onmessage = event => {
      const newMessage = event.data;
      setMessages(prevMessages => [...prevMessages, newMessage]);
    };

    newEventSource.onerror = () => {
      newEventSource.close();
      setEventSource(null);
    };

    setEventSource(newEventSource);
  };

  useEffect(() => {
    console.log({ messages });
  }, [messages]);

  return (
    <Button
      type="button"
      color="orange"
      className="w-full px-4 py-3 my-8 cursor-pointer"
      onClick={startStreaming}
      disabled={!!eventSource}
    >
      Pay
    </Button>
  );
}
