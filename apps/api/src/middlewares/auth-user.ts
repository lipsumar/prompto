import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export default function authUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const encodedToken = req.cookies['prompto-token'];
  if (encodedToken) {
    const token = jwt.verify(encodedToken, process.env.JWT_SECRET_KEY);
    res.locals.verifiedToken = token;
  }
  next();
}
