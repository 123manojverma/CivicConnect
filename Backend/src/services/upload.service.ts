import { v2 as cloudinary } from 'cloudinary';
import { serverConfig } from '../config';

cloudinary.config({
    cloud_name: serverConfig.CLOUDINARY_CLOUD_NAME,
    api_key: serverConfig.CLOUDINARY_API_KEY,
    api_secret: serverConfig.CLOUDINARY_API_SECRET
});

export async function uploadImageService(fileBuffer: Buffer, folder: string = 'civicconnect'): Promise<string> {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'image' },
            (error, result) => {
                if (error) return reject(error);
                resolve(result!.secure_url);
            }
        );
        stream.end(fileBuffer);
    });
}

export async function uploadMultipleImagesService(files: Express.Multer.File[], folder: string = 'civicconnect'): Promise<string[]> {
    const uploads = files.map(f => uploadImageService(f.buffer, folder));
    return await Promise.all(uploads);
}
