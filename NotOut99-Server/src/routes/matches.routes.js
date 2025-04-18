import { Router } from "express";
import {
    addToMyMatches,
    fetchAndStoreMatches,
    getMatches,
    getMyMatches,
} from "../controllers/cricketMatch.controllers.js";

const router = Router();
router.route("/fetch-match").get(fetchAndStoreMatches);
router.route("/get-match").get(getMatches);
router.route("/add-to-my-matches").post(addToMyMatches);
router.route("/get-my-matches").get(getMyMatches)

export default router;
