import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import UserRepository from '../repositories/user-repository.js';
import { validarUser, validarTexto, validarContrasena } from '../helpers/validaciones.js';

class AuthService {
    constructor() {
        this.userRepository = new UserRepository();
        this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    }

    generateToken(user) {
        const payload = {
            id: user.id,
            first_name: user.first_name,
            username: user.username
        };
        
        return jwt.sign(payload, this.jwtSecret, { expiresIn: '24h' });
    }

    async register(userData) {
        const { first_name, last_name, username, password } = userData;
        const nombreError = validarTexto(first_name);
        if (nombreError) {
            throw new Error(nombreError);
        }
        
        const apellidoError = validarTexto(last_name);
        if (apellidoError) {
            throw new Error(apellidoError);
        }
        
        const emailError = validarUser(username);
        if (emailError) {
            throw new Error(emailError);
        }
        
        const contrasenaError = validarContrasena(password);
        if (contrasenaError) {
            throw new Error(contrasenaError);
        }
        
        const userExists = await this.userRepository.checkUsernameExists(username);
        if (userExists) {
            throw new Error('El usuario ya existe.');
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const userDataConContrasenaCifrada = {
            ...userData,
            password: hashedPassword
        };
        
        const nuevoUser = await this.userRepository.createUser(userDataConContrasenaCifrada);
        return nuevoUser;
    }

    async login(credentials) {
        const { username, password } = credentials;
        
        const emailError = validarUser(username);
        if (emailError) {
            throw new Error(emailError);
        }
        
        const user = await this.userRepository.findByUsername(username);
        if (!user) {
            throw new Error('Usuario o clave inválida.');
        }
        
        const validarContrasena = await bcrypt.compare(password, user.password);
        if (!validarContrasena) {
            throw new Error('Usuario o clave inválida.');
        }
        
        const token = this.generateToken(user);
        
        return {
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username
            },
            token
        };
    }

    verifyToken(token) {
        try {
            return jwt.verify(token, this.jwtSecret);
        } catch (error) {
            throw new Error('Token inválido.');
        }
    }
}

export default AuthService; 