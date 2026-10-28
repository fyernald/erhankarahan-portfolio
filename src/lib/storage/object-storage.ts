import "server-only";
import { createReadStream } from "node:fs";
import {
  CreateBucketCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadBucketCommand,
  S3Client,
  type GetObjectCommandOutput,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { env } from "@/lib/env";

const IMMUTABLE_CACHE = "public, max-age=31536000, immutable";

type PutFileInput = {
  key: string;
  filePath: string;
  contentType: string;
  contentDisposition?: string;
};

/**
 * Thin wrapper around an S3-compatible bucket (SeaweedFS/MinIO/AWS). The bucket
 * is private; objects are only ever served through the `/media` route handler.
 */
class ObjectStorage {
  private bucketReady?: Promise<void>;

  constructor(
    private readonly client: S3Client,
    private readonly bucket: string,
  ) {}

  async putFile({ key, filePath, contentType, contentDisposition }: PutFileInput): Promise<void> {
    await this.ensureBucket();
    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: createReadStream(filePath),
        ContentType: contentType,
        ContentDisposition: contentDisposition,
        CacheControl: IMMUTABLE_CACHE,
      },
      queueSize: 4,
      partSize: 16 * 1024 * 1024,
    });
    await upload.done();
  }

  async get(key: string, options: { range?: string; ifNoneMatch?: string } = {}): Promise<GetObjectCommandOutput> {
    return this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key, Range: options.range, IfNoneMatch: options.ifNoneMatch }),
    );
  }

  async deleteMany(keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    await this.client.send(
      new DeleteObjectsCommand({
        Bucket: this.bucket,
        Delete: { Objects: keys.map((Key) => ({ Key })), Quiet: true },
      }),
    );
  }

  private ensureBucket(): Promise<void> {
    this.bucketReady ??= (async () => {
      try {
        await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      } catch {
        await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
      }
    })().catch((error) => {
      this.bucketReady = undefined;
      throw error;
    });
    return this.bucketReady;
  }
}

const globalForStorage = globalThis as unknown as { __storage?: ObjectStorage };

export function getStorage(): ObjectStorage {
  if (!globalForStorage.__storage) {
    const config = env();
    const client = new S3Client({
      endpoint: config.S3_ENDPOINT,
      region: config.S3_REGION,
      forcePathStyle: config.S3_FORCE_PATH_STYLE,
      credentials: { accessKeyId: config.S3_ACCESS_KEY, secretAccessKey: config.S3_SECRET_KEY },
    });
    globalForStorage.__storage = new ObjectStorage(client, config.S3_BUCKET);
  }
  return globalForStorage.__storage;
}

export type { ObjectStorage };
