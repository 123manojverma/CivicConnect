import { v2 as cloudinary } from 'cloudinary';
import { serverConfig } from '../config';

cloudinary.config({
    cloud_name: serverConfig.CLOUDINARY_CLOUD_NAME,
    api_key: serverConfig.CLOUDINARY_API_KEY,
    api_secret: serverConfig.CLOUDINARY_API_SECRET
});

export async function uploadImageService(fileBuffer: Buffer, folder: string = 'civicconnect'): Promise<string> {
    if (!serverConfig.CLOUDINARY_CLOUD_NAME || !serverConfig.CLOUDINARY_API_KEY || !serverConfig.CLOUDINARY_API_SECRET) {
        throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.');
    }

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'image' },
            (error, result) => {
                if (error) return reject(error);
                if (!result?.secure_url) return reject(new Error('Cloudinary upload completed without returning an image URL.'));
                resolve(result.secure_url);
            }
        );
        stream.end(fileBuffer);
    });
}

export async function uploadMultipleImagesService(files: Express.Multer.File[], folder: string = 'civicconnect'): Promise<string[]> {
    const uploads = files.map(f => uploadImageService(f.buffer, folder));
    return await Promise.all(uploads);
}
