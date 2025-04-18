// const express = require("express");
// const crypto = require("crypto");
// const router = express.Router();

// const MERCHANT_KEY = process.env.PAYU_MERCHANT_KEY;
// const MERCHANT_SALT = process.env.PAYU_MERCHANT_SALT;

// router.post("/initiate-payment", async (req, res) => {
//   try {
//     const { amount, productInfo, firstName, email } = req.body;

//     // Generate unique transaction ID
//     const txnId = `TXN_${Date.now()}_${Math.random()
//       .toString(36)
//       .substr(2, 9)}`;

//     // Generate hash
//     const hashString = `${MERCHANT_KEY}|${txnId}|${amount}|${productInfo}|${firstName}|${email}|||||||||||${MERCHANT_SALT}`;
//     const hash = crypto.createHash("sha512").update(hashString).digest("hex");

//     // Success and failure URLs
//     const surl = "YOUR_APP_SUCCESS_URL";
//     const furl = "YOUR_APP_FAILURE_URL";

//     res.json({
//       key: MERCHANT_KEY,
//       txnId,
//       amount,
//       productInfo,
//       firstName,
//       email,
//       hash,
//       surl,
//       furl,
//     });
//   } catch (error) {
//     console.error("Payment initiation failed:", error);
//     res.status(500).json({ error: "Payment initiation failed" });
//   }
// });

// export default router;
