#!/bin/bash -ex
echo "update arcs set was_correct = (height < $1);" | sqlite3 test.db
