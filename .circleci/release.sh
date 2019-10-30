#!/bin/bash
if [[ $CIRCLE_TAG == v* ]] ;
then
  APP_VERSION=$CIRCLE_TAG
else
  APP_VERSION=experimental
fi

docker login -u $DOCKER_HUB_LOGIN -p $DOCKER_HUB_PASSWORD

docker tag orbs:orbs-token-explorer orbsnetwork/orbs-token-explorer:$APP_VERSION

docker push orbsnetwork/orbs-token-explorer:$APP_VERSION
