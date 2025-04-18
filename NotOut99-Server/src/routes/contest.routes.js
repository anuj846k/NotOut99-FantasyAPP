import { Router } from "express";
import {
    createContest,
    getAllContest,
    getContestsByMatch,
    getMatchForContest,
    checkContestEntry,
} from "../controllers/contest.controllers.js";

const router = Router();
router.route("/create-contest").post(createContest);
router.route("/get-match-for-contest/:id").get(getMatchForContest);
router.route("/contests/:match_id").get(getContestsByMatch)
router.route("/get-all-contests").get(getAllContest);
router.route("/contests/:contestId/check-entry").get(checkContestEntry);


export default router;
