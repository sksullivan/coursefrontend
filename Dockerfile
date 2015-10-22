FROM ubuntu:14.04
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
RUN echo "deb http://repo.mongodb.org/apt/ubuntu trusty/mongodb-org/3.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.0.list
RUN apt-get update && apt-get -y upgrade
RUN apt-get install -y git nginx

RUN mkdir -p /data/db

RUN git clone https://github.com/sksullivan/coursefrontend
RUN cp coursefrontend/nginx.conf /etc/nginx/