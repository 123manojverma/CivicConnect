import { Router } from 'express';
import { upload, uploadImagesHandler } from '../../controllers/upload.controller';

const router = Router();

router.post('/images', upload.array('images', 5), uploadImagesHandler);

export default router;
