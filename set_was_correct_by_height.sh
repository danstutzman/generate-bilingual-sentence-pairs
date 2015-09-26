#!/bin/bash -ex
echo "update arcs set was_correct = case when height < $1 then 't' else 'f' end;" | sqlite3 test.db
