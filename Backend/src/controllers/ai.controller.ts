import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { generateIssueDescriptionService, chatWithGeminiService } from '../services/gemini.service';
import { InternalServerError } from '../utils/errors/app.error';

export const generateDescriptionHandler = async (req: Request, res: Response) => {
    try {
        const { title, category, location } = req.body;
        const description = await generateIssueDescriptionService(title, category, location || 'reported location');
        res.status(StatusCodes.OK).json({ success: true, description });
    } catch (error) {
        throw new InternalServerError('AI generation failed');
    }
};

export const chatHandler = async (req: Request, res: Response) => {
    try {
        const { message, context } = req.body;
        const reply = await chatWithGeminiService(message, context);
        res.status(StatusCodes.OK).json({ success: true, reply });
    } catch (error) {
        throw new InternalServerError('AI chat failed');
    }
};
