import { Router } from "express";
import {
    createUser,
    requestOtp,
    verifyLogin
} from "../controllers/user.controllers.js";

const router = Router();

router.route("/request-otp").post(requestOtp);
router.route("/verify-otp").post(verifyLogin);
router.route("/create-user").post(createUser);

export default router;
