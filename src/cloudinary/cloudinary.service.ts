import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
    constructor() {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }

    // Existing: Upload single image
    async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
        return this.uploadToCloudinary(file);
    }

    // New: Upload multiple images
    async uploadImages(files: Express.Multer.File[]): Promise<{ url: string, asset_id: string, public_id: string }[]> {
        if (!files || files.length === 0) {
            throw new Error('No files provided for upload');
        }

        // Upload all files in parallel
        const uploadPromises = files.map((file) => this.uploadToCloudinary(file));

        const response = await Promise.all(uploadPromises);

        return response.map((r) => {
            return { asset_id: r.asset_id, public_id: r.public_id, url: r.url }
        });
    }

    async deleteImage(public_id: string) {
        return this.removeFromCloudinary(public_id);
    }

    async deleteImages(public_ids: string[]) {
        try {
            const deletePromises = public_ids.map((id) => this.removeFromCloudinary(id));

            const response = await Promise.all(deletePromises);

            return true
        } catch (error) {
            return false
        }
    }

    // Private helper to avoid code duplication
    private uploadToCloudinary(file: Express.Multer.File): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'products' },
                (error, result) => {
                    if (error) return reject(error);
                    if (!result) {
                        return reject(new Error('No result returned from Cloudinary'));
                    }
                    resolve(result);
                },
            );

            uploadStream.end(file.buffer);
        });
    }

    private removeFromCloudinary(public_id: string) {
        return new Promise<void>(async (resolve, reject) => {
            try {
                const result = await cloudinary.uploader.destroy(public_id);
                resolve(result)
            } catch (error) {
                reject(error)
            }
        })
    }
}