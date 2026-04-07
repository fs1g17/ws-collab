import { Send } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { cn } from "@/lib/utils";

/** Static copy for layout only — replace with real messages when you wire WebSockets. */
const PLACEHOLDER_MESSAGES = [
  {
    id: "m1",
    author: "Alex",
    initials: "A",
    time: "10:02",
    text: "Hey everyone — is the server up?",
    isSelf: false,
  },
  {
    id: "m2",
    author: "Jordan",
    initials: "J",
    time: "10:03",
    text: "Yep, I’m connected from the lobby room.",
    isSelf: false,
  },
  {
    id: "m3",
    author: "You",
    initials: "Y",
    time: "10:04",
    text: "Nice. I’ll try reconnecting on my side.",
    isSelf: true,
  },
  {
    id: "m4",
    author: "Sam",
    initials: "S",
    time: "10:05",
    text: "If anyone sees duplicate messages, ping me — might be a client bug.",
    isSelf: false,
  },
  {
    id: "m5",
    author: "Alex",
    initials: "A",
    time: "10:06",
    text: "Sounds good. Rolling out a small UI tweak after lunch.",
    isSelf: false,
  },
  {
    id: "m6",
    author: "You",
    initials: "Y",
    time: "10:07",
    text: "👍",
    isSelf: true,
  },
] as const;

function App() {
  return (
    <div className="relative min-h-dvh bg-gradient-to-b from-muted/60 via-background to-background">
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
            <div className="flex flex-col gap-2 sm:max-w-xs">
              <Label htmlFor="display-name">Display name</Label>
              <Input
                id="display-name"
                name="display-name"
                autoComplete="nickname"
                defaultValue="Guest"
                placeholder="How you appear to others"
                className="bg-background/80"
              />
            </div>
          </CardHeader>

          <CardContent className="flex min-h-0 flex-1 flex-col gap-0 px-0 pt-0">
            <Separator />
            <ScrollArea className="min-h-[min(52vh,420px)] flex-1 px-4 py-4 sm:min-h-[min(48vh,480px)]">
              <ul className="flex flex-col gap-3 pr-2 pb-1">
                {PLACEHOLDER_MESSAGES.map((msg) => (
                  <li
                    key={msg.id}
                    className={cn(
                      "flex gap-2.5",
                      msg.isSelf ? "flex-row-reverse" : "flex-row",
                    )}
                  >
                    <Avatar size="sm" className="mt-0.5">
                      <AvatarFallback className="bg-muted text-xs font-medium">
                        {msg.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        "flex max-w-[min(100%,18rem)] flex-col gap-1 sm:max-w-[20rem]",
                        msg.isSelf ? "items-end" : "items-start",
                      )}
                    >
                      <div
                        className={cn(
                          "flex items-baseline gap-2 text-xs text-muted-foreground",
                          msg.isSelf && "flex-row-reverse",
                        )}
                      >
                        <span className="font-medium text-foreground">
                          {msg.author}
                        </span>
                        <span>{msg.time}</span>
                      </div>
                      <div
                        className={cn(
                          "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ring-1 ring-black/5 dark:ring-white/10",
                          msg.isSelf
                            ? "rounded-tr-md bg-primary text-primary-foreground"
                            : "rounded-tl-md bg-muted text-foreground",
                        )}
                      >
                        {msg.text}
                      </div>
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
              />
            </div>
            <Button type="button" className="w-full shrink-0 gap-2 sm:w-auto">
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
