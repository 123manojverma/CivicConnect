import { Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import {
    createDonationService,
    getAvailableDonationsService,
    getMyDonationsService,
    claimDonationService,
    completeDonationService,
    cancelDonationService
} from '../services/donation.service';

export const createDonationHandler = async (req: AuthenticatedRequest, res: Response) => {
    const { category, title, description, quantity, wardId, address } = req.body;
    const donation = await createDonationService({
        donorId: req.user!.id,
        donorName: req.body.donorName || 'Anonymous',
        category, title, description, quantity,
        wardId: wardId || req.user!.wardId,
        address
    });
    res.status(StatusCodes.CREATED).json({ success: true, data: donation });
};

export const getAvailableDonationsHandler = async (req: AuthenticatedRequest, res: Response) => {
    const wardId = req.query.wardId as string | undefined;
    const donations = await getAvailableDonationsService(wardId);
    res.status(StatusCodes.OK).json({ success: true, data: donations });
};

export const getMyDonationsHandler = async (req: AuthenticatedRequest, res: Response) => {
    const donations = await getMyDonationsService(req.user!.id);
    res.status(StatusCodes.OK).json({ success: true, data: donations });
};

export const claimDonationHandler = async (req: AuthenticatedRequest, res: Response) => {
    const donation = await claimDonationService(
        req.params.id,
        req.user!.id,
        req.body.ngoName || 'NGO'
    );
    res.status(StatusCodes.OK).json({ success: true, data: donation });
};

export const completeDonationHandler = async (req: AuthenticatedRequest, res: Response) => {
    const donation = await completeDonationService(req.params.id, req.user!.id);
    res.status(StatusCodes.OK).json({ success: true, data: donation });
};

export const cancelDonationHandler = async (req: AuthenticatedRequest, res: Response) => {
    const result = await cancelDonationService(req.params.id, req.user!.id);
    res.status(StatusCodes.OK).json({ success: true, ...result });
};
