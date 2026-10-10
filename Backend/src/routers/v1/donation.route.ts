import { Router } from 'express';
import { authenticateToken } from '../../middlewares/authMiddleware';
import {
    createDonationHandler,
    getAvailableDonationsHandler,
    getMyDonationsHandler,
    claimDonationHandler,
    completeDonationHandler,
    cancelDonationHandler
} from '../../controllers/donation.controller';

const router = Router();

// Citizen: create a donation offer
router.post('/', authenticateToken, createDonationHandler);

// All authenticated: browse available donations (NGOs filter by wardId)
router.get('/available', authenticateToken, getAvailableDonationsHandler);

// Citizen: see their own donations
router.get('/my', authenticateToken, getMyDonationsHandler);

// NGO: claim a donation
router.patch('/:id/claim', authenticateToken, claimDonationHandler);

// Donor or NGO: mark as completed
router.patch('/:id/complete', authenticateToken, completeDonationHandler);

// Citizen: cancel/remove their donation
router.delete('/:id', authenticateToken, cancelDonationHandler);

export default router;
