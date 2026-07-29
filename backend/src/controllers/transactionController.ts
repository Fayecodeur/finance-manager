import { Response } from "express";
import Transaction from "../models/Transaction";
import { AuthRequest } from "../middlewares/authMiddleware";

export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const { type, amount, description, category, date } = req.body;

    if (!type || !amount || !description || !category || !date) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    const transaction = await Transaction.create({
      user: req.userId as string,
      type,
      amount,
      description,
      category,
      date,
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

export const updateTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const filter: Record<string, any> = {
      _id: req.params.id,
      user: req.userId as string,
    };

    const transaction = await Transaction.findOneAndUpdate(filter, req.body, {
      returnDocument: "after",
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction non trouvée",
      });
    }

    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({
      message: "Erreur serveur",
      error,
    });
  }
};

export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const {
      search = "",
      type = "",
      category = "",
      sortBy = "date",
      order = "desc",
      page = "1",
      limit = "10",
    } = req.query;

    const query: Record<string, any> = { user: req.userId as string };

    if (search) {
      query.description = { $regex: search as string, $options: "i" };
    }

    if (type) {
      query.type = type;
    }

    if (category) {
      query.category = category;
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const transactions = await Transaction.find(query)
      .populate("category")
      .sort({ [sortBy as string]: order === "asc" ? 1 : -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      transactions,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

export const resetAllTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const filter: Record<string, any> = { user: req.userId as string };
    const result = await Transaction.deleteMany(filter);

    res.status(200).json({
      message: "Toutes les transactions ont été supprimées",
      count: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const filter: Record<string, any> = {
      _id: req.params.id,
      user: req.userId as string,
    };

    const transaction = await Transaction.findOneAndDelete(filter);

    if (!transaction) {
      return res.status(404).json({ message: "Transaction non trouvée" });
    }

    res.status(200).json({ message: "Transaction supprimée" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
