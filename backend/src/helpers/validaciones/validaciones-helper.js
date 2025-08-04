import { StatusCodes } from 'http-status-codes';

export class validaciones {
    chequearSiExiste = async(result, nombreCampo) => {
        if (result.rowCount === 0) {
            throw new Error(`${nombreCampo} no existe`);
        }
    }
    
    isValidEmail = async(email) => {
      
        const re = /^[^@]+@[^@]+\.[^@]+$/;
        if (!email || typeof email !== 'string' || !re.test(email)) {
            throw new Error('El mail es inválido');
        }
        return true;
    }

    isValidString = async(string, nombreCampo) => {
        if (!string || typeof string !== 'string' || string.trim() === '' || string.length < 3) {
            throw new Error(`El campo ${nombreCampo} es inválido`);
        }
        return true;
    }

    isPositivo = async(value, nombreCampo) => {
        if (value === undefined || value <= 0 || isNaN(value)) {
            throw new Error(`El ${nombreCampo} debe ser un número positivo`);
        }
        return true;
    }

    isNumValido = async(value, nombreCampo, defaultValue) => {
        if (value === undefined || value <= 0 || isNaN(value)) {
            throw new Error(`El ${nombreCampo} no es válido`);
        }
        return true;
    }
} 