import { Request, Response } from "express";
import * as service from "./admin.service";

export const dashboard = async (_req: Request, res: Response) => {
  const data = await service.getDashboardStats();
  res.json(data);
};

export const lockUser = async (req: Request, res: Response) => {
  const { userId } = req.params;

  await service.toggleUserLock(userId, true);
  res.json({ message: "User locked" });
};

export const unlockUser = async (req: Request, res: Response) => {
  const { userId } = req.params;

  await service.toggleUserLock(userId, false);
  res.json({ message: "User unlocked" });
};

export const sessions = async (req: Request, res: Response) => {
  const { userId } = req.params;

  const data = await service.getUserSessions(userId);
  res.json(data);
};

export const revoke = async (req: Request, res: Response) => {
  const { sessionId } = req.params;

  await service.revokeSession(sessionId);
  res.json({ message: "Session revoked" });
};

export const revokeAll = async (req: Request, res: Response) => {
  const { userId } = req.params;

  await service.revokeAllSessions(userId);
  res.json({ message: "All sessions revoked" });
};

export const suspicious = async (_req: Request, res: Response) => {
  const data = await service.getSuspiciousUsers();
  res.json(data);
};