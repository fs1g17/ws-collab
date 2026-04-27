# ws-collab

This is a small little project I've built to learn about WebSockets in Go and React.

## How to Run

### backend

Need to have go installed. Then:

- `cd back`
- `go mod download`
- `go mod tidy`
- `go run .`

### frontend

Need to have npm installed

- `cd front`
- `npm ci`
- `npm run dev`

## How it Works

### backend

The backend uses the [coder/websocket](https://github.com/coder/websocket) implementation of WebSockets, but takes the approach largely from the [gorilla/websocket chat example](https://github.com/gorilla/websocket/tree/main/examples/chat).

Each `Client` is represented by struct:

```
type Client struct {
	hub    *Hub               // thing that ties it all together
	send   chan []byte        // channel for sending messages
	conn   *websocket.Conn    // websocket connection
	ctx    context.Context    // request context
	cancel context.CancelFunc // cancel func
}
```

The `Hub` ties it all together:

```
type Hub struct {
	clients    map[*Client]bool  // map of clients
	register   chan *Client      // channel to register client
	unregister chan *Client      // channel to unregister client
	message    chan []byte       // channel to broadcast message
}
```

Each client has a `read` and `write` goroutine running. Every time a message is received in the `read` goroutine, we forward the message to the hub's `message` channel, which then broadcasts it to all clients.

When the hub receives a message in the `message` channel, it loops over all the clients, and sends a message to each client's `send` channel, which is read from by the `write` goroutine.

The reason for storing the context in the client struct is because it makes stopping both goroutines simultaneously a lot easier: if there's an error in one goroutine, calling `cancel`, stops the other routine also.

### frontend

It's a very simple vite app with tailwind and shadcn. The websocket magic happens in a `useEffect`, which creates a websocket and attaches some event handlers. The main reconnection logic lives inside the onClose event handler:

```
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
```

The `retryCounter` is a counter that is used for backoff calculation, but also for re-running the effect. Then, in the effect cleanup function, I simply remove the `closeEventListener`:

```
return () => {
  console.log("running cleanup");
  if (connection.current) {
    console.log("running close");
    connection.current.removeEventListener("close", closeEventListener);
    connection.current.close();
    connection.current = null;
  }
};
```

This way there is a distinction between the case when a websocket closed on the server side - in which case we want to retry, and when the component is unmounted, which is when we don't want to retry.
