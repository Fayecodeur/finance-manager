import { Router } from "express";
import { protect } from "../middlewares/authMiddleware";
import {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  resetAllTransactions,
} from "../controllers/transactionController";

const router = Router();

router.use(protect);

router.post("/", createTransaction);
router.get("/", getTransactions);
router.delete("/reset-all", resetAllTransactions);
router.put("/:id", updateTransaction);
router.delete("/:id", deleteTransaction);

export default router;
