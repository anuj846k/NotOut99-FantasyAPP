import mongoose from "mongoose";

const coinsSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
    },
    balance: {
        type: Number,
        default: 0,
    },
    transactions: [
        {
            amount: Number,
            type: {
                type: String,
                enum: ["credit", "debit"],
            },
            description: String,
            date: {
                type: Date,
                default: Date.now,
            },
        },
    ],
});

export const Coins = mongoose.model("Coins", coinsSchema);
