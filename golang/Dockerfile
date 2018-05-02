FROM golang:onbuild

COPY . .

RUN go get -u github.com/golang/dep/cmd/dep
RUN dep ensure

RUN go-wrapper install

