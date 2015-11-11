FROM nginx

RUN apt-get update && apt-get -y upgrade
RUN apt-get install -y git nginx npm
RUN npm install -g bower
RUN ln -s /usr/bin/nodejs /usr/bin/node

COPY bower.json /usr/share/nginx/html/
RUN cd /usr/share/nginx/html && bower install --allow-root --config.interactive=false

RUN echo "cache bust"
COPY nginx.conf /etc/nginx/nginx.conf
COPY . /usr/share/nginx/html
RUN mv /usr/share/nginx/html/dist/* /usr/share/nginx/html/

#VOLUME /usr/share/nginx/html
#VOLUME /usr/share/nginx/html/bower_components
