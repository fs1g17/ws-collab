package main

import (
	"context"
	"log"

	"github.com/coder/websocket"
)

type Client struct {
	hub  *Hub
	send chan []byte
	conn *websocket.Conn
}

func (c *Client) read() {
	ctx := context.Background()
	for {
		_, r, err := c.conn.Read(ctx)
		if err != nil {
			if websocket.CloseStatus(err) == websocket.StatusNormalClosure ||
				websocket.CloseStatus(err) == websocket.StatusGoingAway {
				// websocket hung up on the other end
				log.Println("socket hung up on the other end, unregistering")
				c.hub.unregister <- c
				return
			}
			log.Printf("error in read: %v\n", err)
			c.conn.Close(websocket.StatusInternalError, "error")
			return
		}
		c.hub.message <- r
	}
}

func (c *Client) write() {
	ctx := context.Background()
	for {
		msg := <-c.send
		err := c.conn.Write(ctx, websocket.MessageText, msg)
		if err != nil {
			if websocket.CloseStatus(err) == websocket.StatusNormalClosure ||
				websocket.CloseStatus(err) == websocket.StatusGoingAway {
				// websocket hung up on the other end
				log.Println("socket hung up on the other end, unregistering")
				c.hub.unregister <- c
				return
			}
			log.Printf("error in write: %v\n", err)
			c.conn.Close(websocket.StatusInternalError, "error")
			return
		}
	}
}
