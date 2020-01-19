## Setup

Due to CORS, this repository uses the `package.json` PROXY setting pointing to `server`. This requires `HOSTS` file entry:

```
server                127.0.0.1
```

## Local Development
```
yarn start
```

## Docker Development
``` 
docker build -t gallery/web .
docker container run -it gallery/web /bin/sh
docker container run -p 3000:3000 gallery/web
docker ps
docker stop {ID}
```