import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      deviceId?: string;
    }
  }
}

export function requireDeviceId(req: Request, res: Response, next: NextFunction) {
  const deviceId = req.header("X-Device-Id");
  if (!deviceId) {
    return res.status(400).json({ error: "Missing X-Device-Id header" });
  }
  req.deviceId = deviceId;
  next();
}