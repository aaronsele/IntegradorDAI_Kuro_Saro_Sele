import express from 'express';
import AuthService from '../services/auth-service.js';

const router = express.Router();
const authService = new AuthService();

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "El email es invalido.",
                token: ""
            });
        }
        
        const result = await authService.login({ username, password });
        
        res.status(200).json({
            success: true,
            message: "",
            token: result.token
        });
        
    } catch (error) {
        if (error.message === 'El email es invalido.') {
            return res.status(400).json({
                success: false,
                message: error.message,
                token: ""
            });
        }
        
        if (error.message === 'Usuario o clave inválida.') {
            return res.status(401).json({
                success: false,
                message: error.message,
                token: ""
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Error interno del servidor.",
            token: ""
        });
    }
});

router.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, username, password } = req.body;
        
        // Validate required fields
        if (!first_name || !last_name || !username || !password) {
            return res.status(400).json({
                success: false,
                message: "Todos los campos son requeridos."
            });
        }
        
        const newUser = await authService.register({
            first_name,
            last_name,
            username,
            password
        });
        
        res.status(201).json({
            success: true,
            message: "Usuario registrado exitosamente.",
            user: {
                id: newUser.id,
                first_name: newUser.first_name,
                last_name: newUser.last_name,
                username: newUser.username
            }
        });
        
    } catch (error) {
        let statusCode = 400;
        let message = error.message;
        
        if (error.message.includes('al menos 3 caracteres') || 
            error.message === 'El email es invalido.' ||
            error.message === 'El usuario ya existe.' ||
            error.message === 'La contraseña debe tener al menos 3 caracteres.') {
            statusCode = 400;
        } else {
            statusCode = 500;
            message = "Error interno del servidor.";
        }
        
        res.status(statusCode).json({
            success: false,
            message: message
        });
    }
});

export default router; 