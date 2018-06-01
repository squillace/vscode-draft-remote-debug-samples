package main

import (
	//"crypto/tls"
	"fmt"
	//"log"
	//"net"
	"net/http"
	//"os"
	//"time"

	"gopkg.in/mgo.v2"
	//"gopkg.in/mgo.v2/bson"
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
	/*
		c := session.DB("webratings").C("heroes")
		result := Hero{}
		if err := c.Find(bson.M{"name": "Wonder Woman"}).One(&result); err != nil {
			log.Println(err)
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}

		fmt.Fprintf(w, "%s:  %v\n", result.Name, result.Description)
	*/

	fmt.Fprintln(w, "Hi Kubecon EU.")
}

func main() {
	/*
		mongoHost := os.Getenv("MONGO_HOST")
		fmt.Printf("mongo host: %s", mongoHost)
		mongoUsername := os.Getenv("MONGO_USERNAME")
		mongoPassword := os.Getenv("MONGO_PASSWORD")
		mongoPort := os.Getenv("MONGO_PORT")
		dialInfo := &mgo.DialInfo{
			Addrs: []string{
				fmt.Sprintf(
					"%s:%s",
					mongoHost,
					mongoPort,
				),
			},
			Timeout:  60 * time.Second,
			Database: "webratings",
			Username: mongoUsername,
			Password: mongoPassword,
			DialServer: func(addr *mgo.ServerAddr) (net.Conn, error) {
				return tls.Dial("tcp", addr.String(), &tls.Config{})
			},
		}
		var err error
		session, err = mgo.DialWithInfo(dialInfo)
		if err != nil {
			log.Fatalf("could not retrieve a connection to mongodb: %v", err)
		}
		defer session.Close()
	*/
	http.HandleFunc("/", handler)
	http.ListenAndServe(":8080", nil)
}
