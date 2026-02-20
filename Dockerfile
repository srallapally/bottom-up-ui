FROM ubuntu:latest
LABEL authors="sanjay.rallapally"

ENTRYPOINT ["top", "-b"]