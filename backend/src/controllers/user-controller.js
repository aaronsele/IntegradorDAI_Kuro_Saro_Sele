import express from 'express';
import UserService from '../services/user2service.js';

const router = express.Router();
const userService = new UserService();

router.post('/register', async (req, res) => {
  try {
    await userService.registerUser(req.body);
    return res.status(201).json({ message: 'Usuario registrado exitosamente.'});
  } catch (err) {
    if (err.status && err.message) {
      return res.status(err.status).json({ error: err.message });
    }
    return res.status(500).json({ error: 'Error en el servidor.' });
  }
});

router.post('/login', async (req, res) => {
  const { status, response } = await userService.loginUser(req.body);
  return res.status(status).json(response);
});

export default router; 