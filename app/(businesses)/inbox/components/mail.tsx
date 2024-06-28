"use client";

import * as React from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MailDisplay } from "@/app/(businesses)/inbox/components/mail-display";
import { MailList } from "@/app/(businesses)/inbox/components/mail-list";
import { type Mail } from "@/app/(businesses)/inbox/data";
import { useMail } from "@/app/(businesses)/inbox/use-mail";

interface MailProps {
  mails: Mail[];
}

export function Mail({ mails }: MailProps) {
  const [mail] = useMail();

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout=${JSON.stringify(sizes)}`;
        }}
        className="h-full max-h-[860px] items-stretch"
      >
        <ResizablePanel defaultSize={265} minSize={20}>
          <MailList items={mails} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={655}>
          <MailDisplay mail={mails.find(item => item.id === mail.selected) || null} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
}
