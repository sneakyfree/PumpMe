/**
 * Storage Service — MinIO/S3 object storage for Pump Home
 *
 * FEAT-089: Storage architecture for persistent file storage
 */

import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectCommand, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from '../lib/logger.js';

const s3 = new S3Client({
    endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
    region: 'us-east-1',
    credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY || 'minioadmin',
        secretAccessKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    },
    forcePathStyle: true, // Required for MinIO
});

const BUCKET_PREFIX = 'pump-';

/**
 * Ensure user's bucket exists
 */
async function ensureBucket(userId: string): Promise<string> {
    const bucket = `${BUCKET_PREFIX}${userId.slice(0, 8)}`;
    try {
        await s3.send(new HeadBucketCommand({ Bucket: bucket }));
    } catch {
        await s3.send(new CreateBucketCommand({ Bucket: bucket }));
        logger.info(`Created storage bucket: ${bucket}`);
    }
    return bucket;
}

/**
 * Upload a file to user's storage
 */
export async function uploadFile(
    userId: string,
    key: string,
    body: Buffer | ReadableStream,
    contentType: string,
    metadata?: Record<string, string>
): Promise<{ key: string; size: number }> {
    const bucket = await ensureBucket(userId);

    await s3.send(new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body as Buffer,
        ContentType: contentType,
        Metadata: metadata,
    }));

    const size = body instanceof Buffer ? body.length : 0;
    logger.info(`File uploaded: ${bucket}/${key} (${size} bytes)`);

    return { key, size };
}

/**
 * Download a file from user's storage
 */
export async function downloadFile(userId: string, key: string) {
    const bucket = await ensureBucket(userId);

    const result = await s3.send(new GetObjectCommand({
        Bucket: bucket,
        Key: key,
    }));

    return {
        body: result.Body,
        contentType: result.ContentType,
        size: result.ContentLength,
        lastModified: result.LastModified,
    };
}

/**
 * List files in user's storage
 */
export async function listFiles(
    userId: string,
    prefix?: string,
    maxKeys = 100
): Promise<Array<{ key: string; size: number; lastModified: Date }>> {
    const bucket = await ensureBucket(userId);

    const result = await s3.send(new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        MaxKeys: maxKeys,
    }));

    return (result.Contents || []).map((obj: { Key?: string; Size?: number; LastModified?: Date }) => ({
        key: obj.Key || '',
        size: obj.Size || 0,
        lastModified: obj.LastModified || new Date(),
    }));
}

/**
 * Delete a file from user's storage
 */
export async function deleteFile(userId: string, key: string): Promise<void> {
    const bucket = await ensureBucket(userId);

    await s3.send(new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
    }));

    logger.info(`File deleted: ${bucket}/${key}`);
}

/**
 * Get a pre-signed download URL for a file (expires in 1 hour)
 */
export async function getDownloadUrl(userId: string, key: string, expiresIn = 3600): Promise<string> {
    const bucket = await ensureBucket(userId);

    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
    });

    return getSignedUrl(s3, command, { expiresIn });
}

/**
 * Get storage usage for a user (total bytes)
 */
export async function getStorageUsage(userId: string): Promise<{ totalBytes: number; fileCount: number }> {
    const files = await listFiles(userId, undefined, 10000);

    return {
        totalBytes: files.reduce((sum, f) => sum + f.size, 0),
        fileCount: files.length,
    };
}

// Tier-based storage quotas (bytes)
export const STORAGE_QUOTAS: Record<string, number> = {
    free: 1 * 1024 * 1024 * 1024,      // 1 GB
    starter: 5 * 1024 * 1024 * 1024,    // 5 GB
    pro: 50 * 1024 * 1024 * 1024,       // 50 GB
    beast: 200 * 1024 * 1024 * 1024,    // 200 GB
    ultra: 1024 * 1024 * 1024 * 1024,   // 1 TB
};

export const storageService = {
    uploadFile,
    downloadFile,
    listFiles,
    deleteFile,
    getDownloadUrl,
    getStorageUsage,
    STORAGE_QUOTAS,
};
