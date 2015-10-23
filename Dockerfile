FROM nginx

RUN apt-get update && apt-get -y upgrade
RUN apt-get install -y git nginx npm
RUN npm install -g bower
RUN ln -s /usr/bin/nodejs /usr/bin/node

COPY . /usr/share/nginx/html
RUN cd /usr/share/nginx/html && bower install --allow-root --config.interactive=false
COPY nginx.conf /etc/nginx/nginx.conf
