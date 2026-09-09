import { Router } from "express";

import { protect } from "../middleware/auth.js";

import {
  createPaymentOrderController,
  verifyPaymentController,
} from "../controllers/payment.controller.js";


const router = Router();


router.post(
  "/create-order",
  protect,
  createPaymentOrderController
);


router.post(
  "/verify",
  protect,
  verifyPaymentController
);


export default router;