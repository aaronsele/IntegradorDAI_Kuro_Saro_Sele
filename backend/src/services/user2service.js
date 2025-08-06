import UserRepository from '../repositories/user-repository.js';
import User from '../entities/user.js';
import { validarUser, validarTexto, validarContrasena } from '../helpers/validaciones.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const repo = new UserRepository();
const JWT_SECRET = process.env.JWT_SECRET;

export default class UserService {
  async registerUser(userData) {
    if (!userData || !userData.first_name || !userData.last_name || !userData.username || !userData.password) {
      throw { status: 400, message: 'Todos los campos son requeridos.' };
    }

    const { first_name, last_name, username, password } = userData;
    const nombreError = validarTexto(first_name);
    if (nombreError) {
      throw { status: 400, message: nombreError };
    }
    const apellidoError = validarTexto(last_name);
    if (apellidoError) {
      throw { status: 400, message: apellidoError };
    }
    const emailError = validarUser(username);
    if (emailError) {
      throw { status: 400, message: emailError };
    }
    const contrasenaError = validarContrasena(password)
    if (contrasenaError) {
      throw { status: 400, message: contrasenaError };
    }
    const existing = await repo.getUserByUsername(username);
    if (existing) {
      throw { status: 400, message: 'El usuario ya existe.' };
    }
    const nuevoUser = new User({ first_name, last_name, username, password });
    const userCreado = await repo.createUser(nuevoUser);

    const token = jwt.sign(
      { id: userCreado.id, username: userCreado.username, first_name: userCreado.first_name, last_name: userCreado.last_name },
      JWT_SECRET,
      { expiresIn: '2h' }
    );
    return { user: userCreado, token };
  }

  async loginUser(userData) {
    if (!userData || !userData.username || !userData.password) {
      return {
        status: 400,
        response: {
          success: false,
          message: 'Username y password son requeridos.',
          token: ''
        }
      };
    }

    const { username, password } = userData;
    const emailError = validarUser(username);
    if (emailError) {
      return {
        status: 400,
        response: {
          success: false,
          message: emailError,
          token: ''
        }
      };
    }

    const user = await repo.getUserByUsernameAndPassword(username, password);
    if (!user) {
      return {
        status: 401,
        response: {
          success: false,
          message: 'Usuario o clave inválida.',
          token: ''
        }
      };
    }

    const token = jwt.sign(
      { id: user.id, first_name: user.first_name, last_name: user.last_name, username: user.username },
      JWT_SECRET,
      { expiresIn: '2h' }
    );
    return {
      status: 200,
      response: {
        success: true,
        message: '',
        token
      }
    };
  }
} 