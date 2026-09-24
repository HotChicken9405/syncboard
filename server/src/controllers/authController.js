import * as authService from '../services/authService.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export async function register(req, res, next) {
  try {
    const { accessToken, refreshToken, user } = await authService.register(req.body);
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    res.status(201).json({ data: { token: accessToken, user } });
  } catch (err) { next(err); }
}

export async function login(req, res, next) {
  try {
    const { accessToken, refreshToken, user } = await authService.login(req.body);
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    res.json({ data: { token: accessToken, user } });
  } catch (err) { next(err); }
}

export async function refresh(req, res, next) {
  try {
    const refreshToken = req.cookies?.refreshToken;
    const { accessToken, refreshToken: newRefreshToken, user } = await authService.refresh(refreshToken);
    res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);
    res.json({ data: { token: accessToken, user } });
  } catch (err) { next(err); }
}

export async function logout(req, res, next) {
  try {
    const refreshToken = req.cookies?.refreshToken;
    await authService.logout(refreshToken);
    res.clearCookie('refreshToken', COOKIE_OPTIONS);
    res.status(204).send();
  } catch (err) { next(err); }
}

export async function me(req, res, next) {
  try {
    res.json({ data: { id: req.user.id, email: req.user.email, name: req.user.name } });
  } catch (err) { next(err); }
}

export async function updateProfile(req, res, next) {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);
    res.json({ data: user });
  } catch (err) { next(err); }
}

export async function changePassword(req, res, next) {
  try {
    await authService.changePassword(req.user.id, req.body);
    // Clear all sessions on password change
    res.clearCookie('refreshToken', COOKIE_OPTIONS);
    res.json({ data: { message: 'Password updated successfully' } });
  } catch (err) { next(err); }
}

export async function deleteAccount(req, res, next) {
  try {
    await authService.deleteAccount(req.user.id);
    res.clearCookie('refreshToken', COOKIE_OPTIONS);
    res.status(204).send();
  } catch (err) { next(err); }
}