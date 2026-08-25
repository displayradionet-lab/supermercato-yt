import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma.js";

const admin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 💡 Controlla il campo booleano dal database!
    if (user.isAdmin === true) {
      if (req.user) req.user.isAdmin = true;
      next();
    } else {
      res.status(403).json({ message: "Admin access required" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Admin verification failed" });
  }
};

export default admin;