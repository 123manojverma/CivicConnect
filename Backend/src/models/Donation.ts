import { Schema, model, Document } from "mongoose";

export interface IDonation extends Document {
    donorId: string;
    donorName: string;
    category: 'Food' | 'Clothes' | 'Medicine' | 'Water' | 'Other';
    title: string;
    description: string;
    quantity: string;
    wardId: string;
    address: string;
    status: 'Available' | 'Claimed' | 'Completed';
    claimedBy?: string;
    claimedByName?: string;
    claimedAt?: Date;
    completedAt?: Date;
    createdAt: Date;
}

const DonationSchema = new Schema<IDonation>({
    donorId: { type: String, required: true },
    donorName: { type: String, required: true },
    category: {
        type: String,
        enum: ['Food', 'Clothes', 'Medicine', 'Water', 'Other'],
        required: true
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    quantity: { type: String, required: true },
    wardId: { type: String, required: true },
    address: { type: String, required: true },
    status: {
        type: String,
        enum: ['Available', 'Claimed', 'Completed'],
        default: 'Available'
    },
    claimedBy: { type: String },
    claimedByName: { type: String },
    claimedAt: { type: Date },
    completedAt: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

export const Donation = model<IDonation>('Donation', DonationSchema);
