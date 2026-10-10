import { Router } from 'express';
import { getNearbyNGOsHandler, getAllNGOsHandler, getNGOProfileHandler } from '../../controllers/ngo.controller';

const router = Router();

router.get('/nearby', getNearbyNGOsHandler);
router.get('/all', getAllNGOsHandler);
router.get('/:ngoId', getNGOProfileHandler);

export default router;
