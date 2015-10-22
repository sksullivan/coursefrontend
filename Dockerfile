FROM ubuntu:14.04
RUN apt-get update && apt-get -y upgrade
RUN apt-get install -y git nginx npm
RUN npm install -g bower
RUN ln -s /usr/bin/nodejs /usr/bin/node

ENTRYPOINT git clone https://github.com/sksullivan/coursefrontend &&\
bash coursefrontend/start.sh
