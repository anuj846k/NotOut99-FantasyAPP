import mongoose from "mongoose";

const ContestSchema = new mongoose.Schema(
    {
        match_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MyMatch",
            required: true,
        },
        match_details: {
            type: Object,
            required: false,
        },
        contest_name: {
            type: String,
            required: true,
        },
        entry_fee: {
            type: Number,
            required: true,
        },
        totalPricePool: {
            type: Number,
            required: true,
        },
        firstPrice: {
            type: Number,
            required: true,
        },
        secondPrice: {
            type: Number,
            required: true,
        },
        maxEntries: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

export const Contest = mongoose.model("Contest", ContestSchema);
