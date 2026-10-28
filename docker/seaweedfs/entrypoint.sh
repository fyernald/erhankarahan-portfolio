#!/bin/sh
# Generates the S3 identity file from environment variables, then starts SeaweedFS
# with only the S3 gateway exposed to the internal Docker network.
set -eu
: "${S3_ACCESS_KEY:?S3_ACCESS_KEY is required}"
: "${S3_SECRET_KEY:?S3_SECRET_KEY is required}"

umask 077
cat > /tmp/s3.json <<JSON
{
  "identities": [
    {
      "name": "portfolio-app",
      "credentials": [{ "accessKey": "${S3_ACCESS_KEY}", "secretKey": "${S3_SECRET_KEY}" }],
      "actions": ["Admin", "Read", "Write", "List", "Tagging"]
    }
  ]
}
JSON

# Hard storage cap: STORAGE_LIMIT_GB volumes of 1 GB each (default 30 GB). A fixed
# count also avoids -volume.max=0, which derives the count from a free-disk reading
# that came out as zero on some hosts, leaving no writable volume ("No writable volumes").
STORAGE_LIMIT_GB="${STORAGE_LIMIT_GB:-30}"
case "$STORAGE_LIMIT_GB" in
  '' | *[!0-9]* | 0) echo "STORAGE_LIMIT_GB must be a whole number of GB" >&2; exit 1 ;;
esac

exec weed server -dir=/data -ip.bind=0.0.0.0 -master.volumeSizeLimitMB=1024 -volume.max="$STORAGE_LIMIT_GB" \
  -s3 -s3.port=8333 -s3.config=/tmp/s3.json
