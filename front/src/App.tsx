import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useEffect, useRef, useState } from "react";
import { cn } from "./lib/utils";

interface Message {
  name: string;
  content: string;
}

type Status = "open" | "connecting" | "closed";

const statusClassMap = {
  open: "bg-green-200",
  connecting: "bg-yellow-200",
  closed: "bg-gray-200",
};

function App() {
  const [name, setName] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);

  const connection = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<Status>("closed");

  const [retryCounter, setRetryCounter] = useState<number>(0);

  useEffect(() => {
    if (connection.current) {
      console.log("connection already established");
      return;
    }

    console.log("running websocket initialisation");

    const socket = new WebSocket("ws://localhost:8080/api/echo");
    setStatus("connecting");

    // Connection opened
    socket.addEventListener("open", () => {
      setStatus("open");
      setRetryCounter(0);
      console.log("Connection established!");
    });

    // Listen for messages
    socket.addEventListener("message", (event) => {
      console.log("Message from server ", event.data);
      const message: Message = JSON.parse(event.data) as Message;
      setMessages((prev) => [...prev, message]);
    });

    const closeEventListener = (event) => {
      setStatus("closed");
      connection.current = null;
      console.log(`OnClose: ${event.code} ${event.reason}`);
      setTimeout(
        () => {
          console.log("retrying");
          setRetryCounter((prev) => prev + 1);
        },
        (1 + retryCounter) * 1000,
      );
    };

    socket.addEventListener("close", closeEventListener);

    connection.current = socket;

    return () => {
      console.log("running cleanup");
      if (connection.current) {
        console.log("running close");
        connection.current.removeEventListener("close", closeEventListener);
        connection.current.close();
        connection.current = null;
      }
    };
  }, [retryCounter]);

  const onSend = () => {
    if (!connection.current) return;

    connection.current.send(JSON.stringify({ name, content }));
    setContent("");
  };

  return (
    <div className="relative min-h-dvh bg-linear-to-b from-muted/60 via-background to-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.85_0.12_140/0.25),transparent)]"
      />
      <div className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 py-6 sm:max-w-xl sm:px-6 sm:py-8">
        <Card className="flex min-h-0 flex-1 flex-col overflow-hidden shadow-lg ring-1 ring-border/60">
          <CardHeader className="gap-4 border-b border-border/80 bg-card/80 pb-4 backdrop-blur-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg tracking-tight sm:text-xl">
                  Lobby chat
                </CardTitle>
                <CardDescription>
                  Visual shell only — hook up sockets when you’re ready.
                </CardDescription>
              </div>
            </div>
            <div
              className={cn("w-4 h-4 rounded-full", statusClassMap[status])}
            />
            <div className="flex flex-col gap-2 sm:max-w-xs">
              <Label htmlFor="display-name">Display name</Label>
              <Input
                id="display-name"
                name="display-name"
                autoComplete="nickname"
                defaultValue="Guest"
                placeholder="How you appear to others"
                className="bg-background/80"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
              />
            </div>
          </CardHeader>

          <CardContent className="flex min-h-0 flex-1 flex-col gap-0 px-0 pt-0">
            <Separator />
            <ScrollArea className="min-h-[min(52vh,420px)] flex-1 px-4 py-4 sm:min-h-[min(48vh,480px)]">
              <ul className="flex flex-col gap-3 pr-2 pb-1">
                {messages.map((msg, i) => (
                  <li key={i} className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium tracking-tight text-muted-foreground">
                      {msg.name}
                    </span>
                    <div className="rounded-xl border border-border/70 bg-background/90 px-3.5 py-2.5 text-sm leading-relaxed text-foreground shadow-sm ring-1 ring-black/3 dark:ring-white/6">
                      {msg.content}
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>

          <CardFooter className="flex-col gap-3 border-t border-border/80 bg-muted/30 sm:flex-row sm:items-end">
            <div className="flex w-full flex-1 flex-col gap-2">
              <Label htmlFor="message-input" className="sr-only">
                Message
              </Label>
              <Input
                id="message-input"
                name="message"
                defaultValue=""
                placeholder="Type a message…"
                className="min-h-9 bg-background"
                value={content}
                onChange={(e) => setContent(e.currentTarget.value)}
              />
            </div>
            <Button
              type="button"
              className="w-full shrink-0 gap-2 sm:w-auto"
              onClick={onSend}
            >
              Send
              <Send className="size-4" aria-hidden />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default App;
