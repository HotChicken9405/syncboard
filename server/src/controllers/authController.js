import * as authService from '../services/authService.js';

export async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({ data: result });
  } catch (err) { next(err); }
}

export async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    res.json({ data: result });
  } catch (err) { next(err); }
}

export async function me(req, res, next) {
  try {
    res.json({ data: { id: req.user.id, email: req.user.email } });
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
    res.json({ data: { message: 'Password updated successfully' } });
  } catch (err) { next(err); }
}

export async function deleteAccount(req, res, next) {
  try {
    await authService.deleteAccount(req.user.id);
    res.status(204).send();
  } catch (err) { next(err); }
}