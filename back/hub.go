package main

import (
	"fmt"

	"github.com/coder/websocket"
)

type Hub struct {
	clients    map[*Client]bool
	register   chan *Client
	unregister chan *Client
	message    chan []byte
}

func newHub() *Hub {
	return &Hub{
		clients:    make(map[*Client]bool),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		message:    make(chan []byte),
	}
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			fmt.Println("adding client: ")
			h.clients[client] = true
			fmt.Println("number of clients NOW: ", len(h.clients))
		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				fmt.Printf("deleting client: ")
				delete(h.clients, client)
				client.cancel()
				close(client.send)
				client.conn.Close(websocket.StatusNormalClosure, "poop")
				fmt.Println("number of clients NOW: ", len(h.clients))
			}
		case msg := <-h.message:
			fmt.Printf("recieved message: %v\n", string(msg))
			// loop over clients and push message into their send channels

			var i int = 0
			for client := range h.clients {
				client.send <- msg
				fmt.Printf("sent message to client %d\n", i)
				i++
			}

		}
	}
}
