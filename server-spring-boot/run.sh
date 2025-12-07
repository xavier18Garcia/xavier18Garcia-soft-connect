#!/bin/bash

docker start soft_connect_postgres

set -a
source .env
set +a

./gradlew clean build
./gradlew clean bin
./gradlew clean build --refresh-dependencies
./gradlew bootRun
