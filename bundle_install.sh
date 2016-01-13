#!/bin/bash -ex
if [ ! -e cacert.pem ]; then
  curl http://curl.haxx.se/ca/cacert.pem > cacert.pem
fi
SSL_CERT_FILE=cacert.pem bundle install --path vendor/bundle
