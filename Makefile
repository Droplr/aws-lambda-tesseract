NAME=aws-lambda-tesseract
PWD=$(shell pwd)

build: build-docker build-tesseract compress-tesseract

build-docker:
	docker build -f Dockerfile -t $(NAME) .

version:
	@echo $(shell git rev-parse HEAD)

build-tesseract: build-docker
	docker run -it -v $(PWD)/scripts:/scripts -v $(PWD)/build:/build $(NAME) scripts/compile-tesseract.sh

compress-tesseract: build-docker
	docker run -it -v $(PWD)/scripts:/scripts -v $(PWD)/build:/build $(NAME) scripts/compress-with-brotli.sh