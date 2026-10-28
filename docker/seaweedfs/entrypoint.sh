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

# -volume.max=0 sizes the number of volumes from free disk space. With the default
# 30 GB volume size a disk with less than ~30 GB free gets no writable volume at all
# and every upload fails ("No writable volumes"), so use 1 GB volumes instead.
exec weed server -dir=/data -ip.bind=0.0.0.0 -master.volumeSizeLimitMB=1024 -volume.max=0 \
  -s3 -s3.port=8333 -s3.config=/tmp/s3.json
