import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { User } from '../models/user.js';
import { createSession } from '../services/auth.js';
import { Session } from '../models/session.js';
import { setSessionCookies } from '../services/auth.js';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/sendMail.js';
import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';

//POST /auth/register
export const registerUser = async (req, res, next) => {
  //забираємо email and password з request bd.
  const { email, password } = req.body;

  //перевіряємо чи є вже така пошта в нашій базі данних
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(createHttpError(400, 'Email in use'));
  }

  //хешуємо пароль перед відправкою
  const hashedPassword = await bcrypt.hash(password, 10);

  //створюємо обєкт юзера та додаємо хешований пароль
  const newUser = await User.create({
    email,
    password: hashedPassword,
  });

  //створюємо нову сесію
  const newSesssion = await createSession(newUser._id);

  //Викликаємо та передаємо обєкт відповіді та сесію в кукі
  setSessionCookies(res, newSesssion);

  res.status(201).json(newUser);
};

//POST auth/login

export const loginUser = async (req, res, next) => {
  //забираємо пошту та пароль з тіла запиту
  const { email, password } = req.body;
  //перевіряємо чи є така пошта в базі данних, якщо так даля перевіряємо чи є такий юзер
  const user = await User.findOne({ email });
  if (!user) {
    return next(createHttpError(401, 'Invalid credentials'));
  }

  //порівнюємо пароль з тіла запиту з паролем з бази данних
  const isVaildPassword = await bcrypt.compare(password, user.password);
  if (!isVaildPassword) {
    return next(createHttpError(401, 'Invalid credentials'));
  }

  //Видаляємо стару сесію
  await Session.deleteOne({ userId: user._id });

  //Створюємо новую сесію
  const newSession = await createSession(user._id);

  //Викликаємо та передаємо обєкт відповіді та сесію
  setSessionCookies(res, newSession);

  res.status(200).json(user);
};

//POST auth/logout
export const logoutUser = async (req, res) => {
  const { sessionId } = req.cookies;

  //Видаляємо сесію
  if (sessionId) {
    await Session.deleteOne({ _id: sessionId });
  }

  //Видаляємо кукі
  res.clearCookie('sessionId');
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  res.status(204).send();
};

//оновлення acccesToken і реврештокен та ід сесії
export const refreshUserSession = async (req, res, next) => {
  //забираємо ід сесії та рефрештокен з кукі
  const { sessionId, refreshToken } = req.cookies;

  //перевіряємо чи є така сесія, якщо нема повертаємо помилку
  const session = await Session.findOne({
    _id: sessionId,
    refreshToken,
  });
  if (!session) {
    return next(createHttpError(401, 'Session not found'));
  }

  //перевіряємо валідність рефрештокена
  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);
  if (isSessionTokenExpired) {
    return next(createHttpError(401, 'Session token expired'));
  }

  //Видаляємо поточну сесію
  await Session.deleteOne({
    _id: sessionId,
    refreshToken,
  });

  //створюємо нову сесію та після додаємо кукі
  const newSession = await createSession(session.userId);
  setSessionCookies(res, newSession);

  res.status(200).json({ message: 'Session refreshed' });
};

//POST /auth/request-reset-email
export const requestResetEmail = async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(200)
      .json({ message: 'Password reset email sent successfully' });
  }

  //Якщо користувач генеруємо кортко живучий токен та відправляємо лист
  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    process.env.JWT_SECRET,
    { expiresIn: '15m' },
  );

  console.log(resetToken);

  //Формуємо шлях до шаблону
  const templatePath = path.resolve('src/templates/reset-password-email.html');
  //Читаємо шаблон
  const templateSource = await fs.readFile(templatePath, 'utf-8');
  //Готуємо шаблон до заповнення
  const template = handlebars.compile(templateSource);
  //Формуємо із шаблона HTML докумен з динамычними данними
  const html = template({
    name: user.username,
    link: `${process.env.FRONTEND_DOMAIN}/reset-password?token=${resetToken}`,
  });
  try {
    await sendEmail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Reset your password',
      html,
    });
  } catch {
    return next(
      createHttpError(500, 'Failed to send the email, please try again'),
    );
  }

  res
    .status(200)
    .json({ message: 'If this email exists, a rest link has been sent' });
};

//POST auth/reset-password
export const resetPassword = async (req, res, next) => {
  const { password, token } = req.body;

  let payload;

  try {
    //перевіряємо зміст токена
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return next(createHttpError(401, 'Invalid or expired token'));
  }

  const user = await User.findOne({ _id: payload.sub, email: payload.email });
  if (!user) {
    return next(createHttpError(404, 'User not found'));
  }

  //хешуємо пароль перед відправкою
  const hashedPassword = await bcrypt.hash(password, 10);

  //встановлюємо новий пароль та оновлюємо користувача
  await User.updateOne({ _id: user._id }, { password: hashedPassword });
  //видаляємо всі сессії
  await Session.deleteMany({ userId: user._id });

  res.status(200).json({ message: 'Password reset successfully' });
};
