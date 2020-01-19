## Local Development
```
yarn start
```

## Docker Development
``` 
docker build -t gallery/server .
docker container run -it gallery/web /bin/sh
docker container run -p 5000:5000 gallery/server
docker ps
docker stop {ID}
```