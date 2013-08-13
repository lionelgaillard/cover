
build:
	uglifyjs -nc ./cover.js > ./cover.min.js

.PHONY: build
