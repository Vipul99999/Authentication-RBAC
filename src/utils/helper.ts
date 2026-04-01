export const asyncHandler =
  (fn: Function) =>
  (req: any, res: any, next: any) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export const pick = (obj: any, keys: string[]) => {
  return keys.reduce((acc, key) => {
    if (obj[key] !== undefined) acc[key] = obj[key];
    return acc;
  }, {} as any);
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));