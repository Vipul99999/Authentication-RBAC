export interface UpdateProfileInput {
  email?: string;
  phone?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface SetPinInput {
  pin: string;
}

export interface ChangePinInput {
  currentPin: string;
  newPin: string;
}