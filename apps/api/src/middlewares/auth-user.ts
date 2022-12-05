import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

export default async function authUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const encodedToken = req.cookies['prompto-token'];
  if (encodedToken) {
    const token = jwt.verify(encodedToken, process.env.JWT_SECRET_KEY) as {
      email: string;
    };

    let user = await prisma.user.findUnique({
      where: { email: token.email },
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: token.email,
        },
      });
    }
    res.locals.user = user;
  }
  next();
}
