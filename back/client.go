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
			log.Printf("error in read: %v", err)
			c.conn.Close(websocket.StatusAbnormalClosure, "error")
			break
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
			log.Printf("error in write: %v", err)
			c.conn.Close(websocket.StatusAbnormalClosure, "error")
			break
		}
	}
}
