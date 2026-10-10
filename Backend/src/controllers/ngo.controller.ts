import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getNearbyNGOsService, getNGOProfileService, getAllNGOsService } from '../services/ngo.service';
import { InternalServerError } from '../utils/errors/app.error';

export const getNearbyNGOsHandler = async (req: Request, res: Response) => {
    try {
        const { longitude, latitude, maxDistance, category } = req.query;
        const ngos = await getNearbyNGOsService(
            parseFloat(longitude as string),
            parseFloat(latitude as string),
            maxDistance ? parseFloat(maxDistance as string) : 10000,
            category as string | undefined
        );
        res.status(StatusCodes.OK).json({ success: true, data: ngos, count: ngos.length });
    } catch (error) {
        throw new InternalServerError('Failed to fetch NGOs');
    }
};

export const getAllNGOsHandler = async (req: Request, res: Response) => {
    try {
        const ngos = await getAllNGOsService();
        res.status(StatusCodes.OK).json({ success: true, data: ngos, count: ngos.length });
    } catch (error) {
        throw new InternalServerError('Failed to fetch NGOs');
    }
};

export const getNGOProfileHandler = async (req: Request, res: Response) => {
    try {
        const { ngoId } = req.params;
        const ngo = await getNGOProfileService(ngoId);
        if (!ngo) {
            res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'NGO not found' });
            return;
        }
        res.status(StatusCodes.OK).json({ success: true, data: ngo });
    } catch (error) {
        throw new InternalServerError('Failed to fetch NGO profile');
    }
};
