export function validarUser (text) {
    if (!text || typeof text !== 'string') return "Campo requerido.";
    if (text.trim().length === 0) return "Campo requerido.";
    const textValido = /^[a-z0-9]+@(gmail|hotmail|outlook)\.com$/.test(text);
    if (!textValido) return "Ingrese un username válido.";
    return '';
  }

  export function validarTexto (text) {
    if (!text || typeof text !== 'string') return "Campo requerido.";
    if (text.trim().length === 0) return "Campo requerido.";
    if (text.trim().length < 3) return "Debe tener al menos 3 letras.";
    return '';
  };

  export function validarContrasena (text) {
    if (!text || typeof text !== 'string') return "Campo requerido.";
    if (text.trim().length === 0) return "Campo requerido.";
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{3,}$/;
    if (!regex.test(text)) { return "La contraseña debe tener al menos 3 caracteres, letras mayúsculas y minúsculas, un número y un caracter especial.";}
    return '';
  };

  export function maskPassword (password) {
    if (!password) return '';
    return '*'.repeat(password.length);
  };

  export function validarFecha (fecha) {
    const inputFecha = new Date(fecha);
    const fechaActual = new Date();
    if(inputFecha instanceof Date && !isNaN(inputFecha) && inputFecha <= fechaActual) return 'Fecha invalida';
    return '';
  };

  export function validarNum(num) {
    if(num < 0) return 'Debe ser mayor o igual a cero.';
    return '';
  };