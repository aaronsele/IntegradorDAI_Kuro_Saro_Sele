# Hecho por Francisco Sarobe, Aarón Selener y Federico Kurozwan

Para que funcione falta instalar los node_modules (cd backend -> npm install o npm i) + crear archivo .env (no lo pusheamos porque no es seguro tener los datos de la base de datos en un repositorio publico, asi lo hacemos en proyecto, el cual contenga:
- DB_HOST=localhost
- DB_PORT=5432
- DB_NAME=eventos_db
- DB_USER=postgres
- DB_PASSWORD=tu_password_aqui

Configuracion del servidor por las dudas:

PORT=3000

Pra utilizar la clave JWT:

JWT_SECRET=tu_clave_jwt_cambiarla_en_produccion