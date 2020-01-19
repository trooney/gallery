#!/bin/sh

rm -f $SERVER_ROOT/data/production/db.json
rm -f $SERVER_ROOT/data/production/photos/*.*

cp -a $SERVER_ROOT/seed/db.json $SERVER_ROOT/data/production/db.json
cp -a $SERVER_ROOT/seed/photos/*.* $SERVER_ROOT/data/production/photos/
