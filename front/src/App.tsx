import { useEffect, useRef, useState } from "react";
import { Textarea } from "./components/ui/textarea";
import useDebounce from "./hooks/useDebounce";
import { cn } from "./lib/utils";

interface Message {
  content: string;
}

type Status = "open" | "connecting" | "closed";

const statusClassMap = {
  open: "bg-green-200",
  connecting: "bg-yellow-200",
  closed: "bg-gray-200",
};

function App() {
  const [content, setContent] = useState<string>("");
  const debounced = useDebounce(content, 1000);

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

    const openEventListener = () => {
      setStatus("open");
      setRetryCounter(0);
      console.log("Connection established!");
    };

    // Connection opened
    socket.addEventListener("open", openEventListener);

    const messageEventListener = (event: MessageEvent<any>) => {
      console.log("Message from server ", event.data);
      const message: Message = JSON.parse(event.data) as Message;
      setContent(message.content);
    };

    // Listen for messages
    socket.addEventListener("message", messageEventListener);

    const closeEventListener = (event: CloseEvent) => {
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
        connection.current.removeEventListener("open", openEventListener);
        connection.current.removeEventListener("message", messageEventListener);
        connection.current.removeEventListener("close", closeEventListener);
        connection.current.close();
        connection.current = null;
      }
    };
  }, [retryCounter]);

  useEffect(() => {
    console.log("inside debounced effect");
    //if (!connection.current) return;
    if (connection.current?.readyState !== WebSocket.OPEN) return;

    connection.current.send(JSON.stringify({ content }));
  }, [debounced]);

  return (
    <div className="relative min-h-dvh bg-linear-to-b from-muted/60 via-background to-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.85_0.12_140/0.25),transparent)]"
      />
      <div className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-8">
        <div className="flex w-full max-w-3xl flex-col gap-3">
          <div className="flex items-center gap-2">
            <div
              className={cn("h-3 w-3 rounded-full", statusClassMap[status])}
            />
            <h1 className="text-2xl font-semibold tracking-tight">
              Collaborative Editor
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Start typing to collaborate in real time.
          </p>
          <Textarea
            className="min-h-[60vh] resize-none rounded-xl bg-background/80 p-4 text-base leading-relaxed shadow-md ring-1 ring-border/60 backdrop-blur-sm focus-visible:ring-2"
            placeholder="Start typing here…"
            value={content}
            onChange={(e) => {
              setContent(e.currentTarget.value);
              // connection.current.send(
              //   JSON.stringify({ content: e.currentTarget.value }),
              // );
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
