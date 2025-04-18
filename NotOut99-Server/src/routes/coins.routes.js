import express from "express";
import { coinsController } from "../controllers/coins.controllers.js";

const router = express.Router();

router.get("/:userId", coinsController.getCoins);

router.post("/:userId/add", coinsController.addCoins);

router.post("/:userId/deduct", coinsController.deductCoins);

export default router;
