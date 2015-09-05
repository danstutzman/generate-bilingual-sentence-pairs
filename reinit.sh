#!/bin/bash -ex
cat reinit.sql | sqlite3 test.db
echo 'select * from assets;' | sqlite3 test.db
