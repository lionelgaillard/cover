
build:
	uglifyjs -nc ./js/background.js > ./js/background.min.js

.PHONY: build
