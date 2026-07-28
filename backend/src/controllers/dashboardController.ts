import { Response } from "express";
import Transaction from "../models/Transaction";
import { AuthRequest } from "../middlewares/authMiddleware";

const calculatePercentChange = (
  current: number,
  previous: number,
): number | null => {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }
  return Math.round(((current - previous) / previous) * 1000) / 10;
};

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const filter = {
      user: req.userId as string,
    };

    const transactions = await Transaction.find(filter).populate("category");

    let revenusThisMonth = 0;
    let depensesThisMonth = 0;
    let revenusLastMonth = 0;
    let depensesLastMonth = 0;
    let solde = 0;
    let transactionsThisMonth = 0;
    let transactionsLastMonth = 0;

    const byCategory: Record<string, number> = {};

    const byMonth: Record<string, { revenus: number; depenses: number }> = {};

    const now = new Date();

    const currentMonth = now.getMonth();

    const currentYear = now.getFullYear();

    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    for (const t of transactions) {
      const amount = t.amount;

      const transactionDate = new Date(t.date);

      // Solde global
      if (t.type === "revenu") {
        solde += amount;
      } else {
        solde -= amount;
      }

      const isCurrentMonth =
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear;

      const isLastMonth =
        transactionDate.getMonth() === lastMonth &&
        transactionDate.getFullYear() === lastMonthYear;

      // Statistiques du mois actuel
      if (isCurrentMonth) {
        transactionsThisMonth++;

        if (t.type === "revenu") {
          revenusThisMonth += amount;
        } else {
          depensesThisMonth += amount;
        }
      }

      // Statistiques du mois précédent (pour comparaison)
      if (isLastMonth) {
        transactionsLastMonth++;

        if (t.type === "revenu") {
          revenusLastMonth += amount;
        } else {
          depensesLastMonth += amount;
        }
      }

      // Dépenses par catégorie
      if (t.type === "depense") {
        const categoryName = (t.category as any)?.name || "Sans catégorie";

        byCategory[categoryName] = (byCategory[categoryName] || 0) + amount;
      }

      // Evolution mensuelle

      const monthKey = transactionDate.toISOString().slice(0, 7);

      if (!byMonth[monthKey]) {
        byMonth[monthKey] = {
          revenus: 0,
          depenses: 0,
        };
      }

      if (t.type === "revenu") {
        byMonth[monthKey].revenus += amount;
      } else {
        byMonth[monthKey].depenses += amount;
      }
    }

    const monthlyEvolution = Object.entries(byMonth)

      .map(([month, values]) => ({
        month,
        ...values,
      }))

      .sort((a, b) => a.month.localeCompare(b.month));

    res.status(200).json({
      solde,

      revenusThisMonth,

      depensesThisMonth,

      transactionsThisMonth,

      depensesByCategory: byCategory,

      monthlyEvolution,

      revenusChangePercent: calculatePercentChange(
        revenusThisMonth,
        revenusLastMonth,
      ),

      depensesChangePercent: calculatePercentChange(
        depensesThisMonth,
        depensesLastMonth,
      ),

      transactionsDiff: transactionsThisMonth - transactionsLastMonth,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur serveur",
      error,
    });
  }
};
