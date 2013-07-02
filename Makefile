
build:
	uglifyjs -nc ./background.js > ./background.min.js

.PHONY: build
