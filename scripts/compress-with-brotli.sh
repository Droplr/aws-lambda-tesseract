#!/usr/bin/env bash

tar -C /build -zxvf /build/tesseract.tar.gz
tar -cf /build/tt.tar /build/tesseract-standalone
echo "Running brotli (this can take a few minutes)"
brotli --best --force --verbose /build/tt.tar
