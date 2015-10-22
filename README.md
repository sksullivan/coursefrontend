brew install git
git clone https://github.com/acm-uiuc/Scheedule2.git
cd Scheedule2
sudo gem install bundle
bundle install

// `gem install pg` fails

brew install postgres

// `gem install pg` fails again
// workaround for mac

sudo su
env ARCHFLAGS="-arch x86_64" gem install pg
exit

bundle install

// `gem install pg` fails yet again

ARCHFLAGS="-arch x86_64" bundle install

// finally worked!

npm install -g bower
bower install

// Let's run the server!

rails s

// visit http://localhost:3000 in chrome
// looks like rails can't connect to postgres

pg_ctl -D /usr/local/var/postgres -l /usr/local/var/postgres/server.log start
createdb
psql -h localhost // This will open the psql shell
CREATE USER sigsoft WITH CREATEDB PASSWORD 'sigsoft';

// Press Ctrl-D to exit psql shell

rails s
 
// visit http://localhost:3000 in chrome
// scheedule2_development DB does not exist

rake db:create
rake db:migrate

// visit http://localhost:3000 in chrome
