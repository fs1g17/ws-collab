package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/coder/websocket"
)

func serve(w http.ResponseWriter, r *http.Request) {
	c, err := websocket.Accept(w, r, nil)
	if err != nil {
		log.Printf("%v", err)
		return
	}
	defer c.CloseNow()

	for {
		err = echo(c)
		if websocket.CloseStatus(err) == websocket.StatusNormalClosure {
			return
		}
		if err != nil {
			fmt.Printf("error: %v", err)
			return
		}
	}
}

func echo(c *websocket.Conn) error {
	ctx := context.Background()
	typ, r, err := c.Reader(ctx)
	if err != nil {
		return err
	}

	w, err := c.Writer(ctx, typ)
	if err != nil {
		return err
	}

	_, err = io.Copy(w, r)
	if err != nil {
		return fmt.Errorf("failed to io.Copy: %w", err)
	}

	err = w.Close()
	return err
}

func main() {
	http.Handle("/", http.FileServer(http.Dir("./static")))
	http.HandleFunc("/api/echo", serve)

	http.ListenAndServe(":8080", nil)
}
