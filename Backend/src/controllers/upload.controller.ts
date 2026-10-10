import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import multer from 'multer';
import { uploadMultipleImagesService } from '../services/upload.service';
import { InternalServerError } from '../utils/errors/app.error';

const storage = multer.memoryStorage();
export const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

export const uploadImagesHandler = async (req: Request, res: Response) => {
    try {
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
            res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'No files provided' });
            return;
        }
        const urls = await uploadMultipleImagesService(files, 'civicconnect/issues');
        res.status(StatusCodes.OK).json({ success: true, urls });
    } catch (error) {
        throw new InternalServerError('Upload failed');
    }
};
