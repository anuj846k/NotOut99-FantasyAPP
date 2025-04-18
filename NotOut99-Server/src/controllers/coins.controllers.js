import { Coins } from "../models/coins.model.js";

export const coinsController = {
    getCoins: async (req, res) => {
        try {
            const { userId } = req.params;
            const userCoins = await Coins.findOne({ userId });

            if (!userCoins) {
                const newUserCoins = await Coins.create({
                    userId,
                    balance: 0,
                    transactions: [],
                });
                return res.json(newUserCoins);
            }

            res.json(userCoins);
        } catch (error) {
            res.status(500).json({
                error: "Failed to fetch user coins",
            });
        }
    },

    addCoins: async (req, res) => {
        try {
            const { userId } = req.params;
            const { amount, description } = req.body;
            const coinsToAdd = amount * 2;

            const userCoins = await Coins.findOneAndUpdate(
                { userId },
                {
                    $inc: { balance: coinsToAdd },
                    $push: {
                        transactions: {
                            amount: coinsToAdd,
                            type: "credit",
                            description:
                                description ||
                                `Added ${coinsToAdd} coins for ₹${amount}`,
                        },
                    },
                },
                { new: true, upsert: true }
            );
            res.json(userCoins);
        } catch (error) {
            res.status(500).json({ error: "Failed to add coins " });
        }
    },

    deductCoins: async (req, res) => {
        try {
            const { userId } = req.params;
            const { amount, description } = req.body;
            const userCoins = await Coins.findOne({ userId });
            if (!userCoins || userCoins.balance < amount) {
                return res.status(400).json({
                    error: "Insufficient coins",
                    currentBalance: userCoins?.balance || 0,
                });
            }
            const updatedCoins = await Coins.findOneAndUpdate(
                { userId },
                {
                    $inc: { balance: -amount },
                    $push: {
                        transactions: {
                            amount: amount,
                            type: "debit",
                            description:
                                description ||
                                `Deducted ${amount} coins for contest entry`,
                        },
                    },
                },
                { new: true }
            );
            res.json(updatedCoins);
        } catch (error) {
            res.status(500).json({ error: "Failed to dedcut coins" });
        }
    },
};
