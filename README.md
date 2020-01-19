# Gallery

A simple photo gallery. This project began as a simple tool to nicely display a set of images. It's grown to include some reasonably complex features and a set of deployment tools.

#### Overview

- Fully themed `react` and `redux` frontend
- Bare bones `express` backend api
- `docker` based container deployment
- _no unit tests_ as this is just a personal playground

#### Screenshots

| Gallery    | Details     | Uploader    |
|------------|-------------|-------------|
| <img src="https://raw.githubusercontent.com/trooney/gallery/master/docs/screenshot-1.jpg" width="250"> | <img src="https://raw.githubusercontent.com/trooney/gallery/master/docs/screenshot-2.jpg" width="250"> | <img src="https://raw.githubusercontent.com/trooney/gallery/master/docs/screenshot-3.jpg" width="250"> |


## Quickstart

Either use the provided docker container or two open the terminal and start two node development servers. Both are open via `localhost:3000`

#### Docker 
```
# build and start a docker container
docker-compose up --build
```

#### webpack-dev-server and express 

```
# add the following line to /etc/hosts due to webpack/express CORS issues
server    127.0.0.1

# terminal 1
cd web
yarn start

# terminal 2
cd server
yarn start
```

## Container Commands

#### Docker Development
```
docker-compose up --build
docker-compose up --build server
docker-compose run server /bin/sh
docker stop {ID}
docker-compose rm server
```

#### Docker Production
```
docker-compose -f docker-compose.prod.yml build deploy
docker-compose -f docker-compose.prod.yml run deploy /bin/sh
docker build -t <repository name> .
```

#### Amazon ECS && Fargate
```
aws ecr get-login --no-include-email --region us-west-2 | /bin/bash
docker build -t <container> .
docker tag webapp-backend-stg:latest xxxxxxxxxxxx.dkr.ecr.us-east-1.amazonaws.com/<repository name>:latest
docker push xxxxxxxxxxxx.dkr.ecr.us-east-1.amazonaws.com/<repository name>:latest
aws ecs update-service --cluster <cluster name> --service <service name> --force-new-deployment
```

##### References
https://dev.to/numtostr/running-react-and-node-js-in-one-shot-with-docker-3o09
https://medium.com/@ariklevliber/aws-fargate-from-start-to-finish-for-a-nodejs-app-9a0e5fbf6361