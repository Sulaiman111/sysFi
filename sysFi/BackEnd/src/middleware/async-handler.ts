import { Request, Response, NextFunction } from 'express';

// Update the asyncHandler to properly handle the response
export const asyncHandler = (fn: Function) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await fn(req, res, next);
      // Don't return the response object
    } catch (error) {
      next(error);
    }
  };
};