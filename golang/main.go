package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

var session *mgo.Session

// Hero is a superhero.
type Hero struct {
	Name        string
	Img         string
	Description string
	Aliases     []string
}

func handler(w http.ResponseWriter, r *http.Request) {
	c := session.DB("webratings").C("heroes")
	result := Hero{}
	if err := c.Find(bson.M{"name": "Wonder Woman"}).One(&result); err != nil {
		log.Println(err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	fmt.Fprintf(w, "Aliases for %s: %v\n", result.Name, result.Aliases)
}

func main() {
	session, err := mgo.Dial(os.Getenv("MONGO_CONNECTIONSTRING"))
	if err != nil {
		log.Fatalf("could not retrieve a connection to mongodb: %v", err)
	}
	defer session.Close()
	http.HandleFunc("/", handler)
	http.ListenAndServe(":8080", nil)
}
