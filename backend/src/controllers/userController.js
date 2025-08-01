import pkg from 'pg';
import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import config from '../../configs/db-configs.js';
import { generateToken } from '../../middleware/auth.js';
import {validaciones} from '../helpers/validaciones/validaciones-helper.js'
import {userService} from '../services/userService.js'

const { Pool } = pkg;
const pool = new Pool(config);

// 5)

export const registerUser = async (req, res) => {
  const { first_name, last_name, username, password } = req.body;

  try {

    try {
      validaciones.isValidString(first_name, "nombre");
      validaciones.isValidString(last_name, "apellido");
      validaciones.isValidEmail(username);
      validaciones.isValidString(password, "contraseña");
    } catch (error) {
      return res.status(StatusCodes.BAD_REQUEST).json({ 
        success: false, 
        message: error.message 
      });
    }

    // Chequeo si el usuario ya existe
    const existingUser = await pool.query(
      'SELECT id FROM Users WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: 'El usuario ya está registrado'
      });
    }

    // Hasheo de contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const insertQuery = `
      INSERT INTO Users (first_name, last_name, username, password)
      VALUES ($1, $2, $3, $4)
      RETURNING id, first_name, last_name, username
    `;

    const result = await pool.query(insertQuery, [
      first_name, last_name, username, hashedPassword
    ]);

    if (result.rows.length > 0) {
      res.status(StatusCodes.CREATED).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        user: result.rows[0]
      });
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'No se pudo registrar el usuario'
      });
    }

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};



export const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        try {
            isValidEmail(username);
            isValidString(password, "contraseña");
        } catch (error) {
            console.error(error)
            return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: error.message });
            
        }

      
        const query = 'SELECT * FROM Users WHERE username = $1';
        const result = await pool.query(query, [username]);

        if (result.rowCount === 0) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'Usuario o clave inválida',
                token: ''
            });
        }

        const user = result.rows[0];

     
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'Usuario o clave inválida',
                token: ''
            });
        }

      
        const token = generateToken(user);

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Login exitoso',
            token: token
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error interno del servidor',
            token: ''
        });
    }
}; 

// nos tira errores pero funciona igual, si algo falla es de por aca seguramente