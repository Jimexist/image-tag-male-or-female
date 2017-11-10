# image-tag-male-or-female

image tag male or female

## How to use

### Run a local instance of PostgreSQL

1. decide on where you want to store your data, e.g. on your disk `~/my_data/`, then `mkdir -p ~/my_data/`
1. cd `~/my_data/`
1. run `docker run -d -v $(pwd):/var/lib/postgresql/ --name pg -p 5432:5432 postgres:alpine`

### Pull image and connect to PostgreSQL

1. decide where you stored your images, e.g. you have `~/my_images/` and subdirectories like `~/my_images/Ziyi_Zhang/Ziyi_Zhang_image_1.jpg`
1. cd `~/my_images/`
1. run `docker pull -v $(pwd):/opt/images/ --link postgres:postgres --port 3000:3000 --name image-tag-male-or-female jimexist/image-tag-male-or-female:latest`
