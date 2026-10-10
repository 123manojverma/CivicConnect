import { Router } from 'express';
import { generateDescriptionHandler, chatHandler } from '../../controllers/ai.controller';

const router = Router();

router.post('/generate-description', generateDescriptionHandler);
router.post('/chat', chatHandler);

export default router;
