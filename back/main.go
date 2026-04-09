package main

import (
	"context"
	"log"
	"net/http"

	"github.com/coder/websocket"
)

func serve(hub *Hub, w http.ResponseWriter, r *http.Request) {
	c, err := websocket.Accept(w, r, &websocket.AcceptOptions{InsecureSkipVerify: true})
	if err != nil {
		log.Printf("error1: %v", err)
		return
	}
	ctx, cancel := context.WithCancel(context.Background())
	client := &Client{hub: hub, send: make(chan []byte), conn: c, ctx: ctx, cancel: cancel}
	hub.register <- client
	go client.read()
	go client.write()
}

func main() {
	hub := newHub()
	go hub.run()

	http.Handle("/", http.FileServer(http.Dir("./static")))
	http.HandleFunc("/api/echo", func(w http.ResponseWriter, r *http.Request) {
		serve(hub, w, r)
	})

	http.ListenAndServe(":8080", nil)
}
