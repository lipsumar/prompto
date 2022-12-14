import { Router } from 'express';
import isValidUser from '../lib/isValidUser';
import jwt from 'jsonwebtoken';

const router = Router();

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const valid = await isValidUser(email, password);
    if (valid) {
      const data = {
        email,
      };
      const token = jwt.sign(data, process.env.JWT_SECRET_KEY, {
        expiresIn: '1d',
      });
      const oneDayMs = 86400000;
      const { SITE_DOMAIN } = process.env;
      res.cookie('prompto-token', token, {
        maxAge: oneDayMs,
        httpOnly: true,
        secure: true,
        domain: SITE_DOMAIN !== 'localhost' ? `.${SITE_DOMAIN}` : undefined,
      });
      res.redirect(process.env.EDITOR_URL);
    } else {
      res.send('invalid credentials');
    }
  } catch (err) {
    next(err);
  }
});

export default router;
