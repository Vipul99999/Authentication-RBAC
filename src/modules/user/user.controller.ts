import { Request, Response } from "express";
import * as service from "./user.service";

export const profile = async (req: any, res: Response) => {
  const data = await service.getProfile(req.user.userId);
  res.json(data);
};

export const update = async (req: any, res: Response) => {
  const data = await service.updateProfile(req.user.userId, req.body);
  res.json(data);
};

export const changePass = async (req: any, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  const data = await service.changePassword(
    req.user.userId,
    currentPassword,
    newPassword
  );

  res.json(data);
};

export const setPinCtrl = async (req: any, res: Response) => {
  const { pin } = req.body;

  const data = await service.setPin(req.user.userId, pin);
  res.json(data);
};

export const changePinCtrl = async (req: any, res: Response) => {
  const { currentPin, newPin } = req.body;

  const data = await service.changePin(
    req.user.userId,
    currentPin,
    newPin
  );

  res.json(data);
};

export const deactivate = async (req: any, res: Response) => {
  const data = await service.deactivateAccount(req.user.userId);
  res.json(data);
};