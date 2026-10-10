import { Donation, IDonation } from '../models/Donation';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors/app.error';

export async function createDonationService(data: {
    donorId: string;
    donorName: string;
    category: IDonation['category'];
    title: string;
    description: string;
    quantity: string;
    wardId: string;
    address: string;
}) {
    const donation = new Donation(data);
    return await donation.save();
}

export async function getAvailableDonationsService(wardId?: string) {
    const query: any = { status: 'Available' };
    if (wardId) query.wardId = wardId;
    return await Donation.find(query).sort({ createdAt: -1 });
}

export async function getMyDonationsService(donorId: string) {
    return await Donation.find({ donorId }).sort({ createdAt: -1 });
}

export async function claimDonationService(donationId: string, ngoId: string, ngoName: string) {
    const donation = await Donation.findById(donationId);
    if (!donation) throw new NotFoundError('Donation not found');
    if (donation.status !== 'Available') throw new BadRequestError('This donation has already been claimed');

    donation.status = 'Claimed';
    donation.claimedBy = ngoId;
    donation.claimedByName = ngoName;
    donation.claimedAt = new Date();
    return await donation.save();
}

export async function completeDonationService(donationId: string, userId: string) {
    const donation = await Donation.findById(donationId);
    if (!donation) throw new NotFoundError('Donation not found');
    if (donation.status !== 'Claimed') throw new BadRequestError('Donation is not in claimed state');
    // Allow donor or claiming NGO to mark complete
    if (donation.donorId !== userId && donation.claimedBy !== userId) {
        throw new ForbiddenError('Not authorized to complete this donation');
    }

    donation.status = 'Completed';
    donation.completedAt = new Date();
    return await donation.save();
}

export async function cancelDonationService(donationId: string, donorId: string) {
    const donation = await Donation.findById(donationId);
    if (!donation) throw new NotFoundError('Donation not found');
    if (donation.donorId !== donorId) throw new ForbiddenError('Not authorized');
    if (donation.status === 'Completed') throw new BadRequestError('Cannot cancel a completed donation');

    await Donation.findByIdAndDelete(donationId);
    return { message: 'Donation offer removed' };
}
