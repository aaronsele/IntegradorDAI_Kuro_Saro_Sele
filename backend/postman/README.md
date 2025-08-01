# Pruebas con los endpoints

Autenticación
POST /api/user/register
Registra un nuevo usuario.

Body:

{
    "first_name": "Juan",
    "last_name": "Pérez",
    "username": "juan.perez@email.com",
    "password": "password123"
}
Respuesta exitosa (201):

{
    "success": true,
    "message": "Usuario registrado exitosamente",
    "user": {
        "id": 1,
        "first_name": "Juan",
        "last_name": "Pérez",
        "username": "juan.perez@email.com"
    }
}
POST /api/user/login
Autentica un usuario y devuelve un token JWT.

Body:

{
    "username": "juan.perez@email.com",
    "password": "password123"
}
Respuesta exitosa (200):

{
    "success": true,
    "message": "Login exitoso",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
Eventos (Públicos)
GET /api/event
Obtiene todos los eventos con paginación y filtros.

Query Parameters:

page: Número de página (default: 1)
limit: Elementos por página (default: 15)
name: Filtrar por nombre
startdate: Filtrar por fecha (YYYY-MM-DD)
tag: Filtrar por etiqueta
Ejemplo:

GET /api/event?page=1&limit=10&name=taylor&tag=rock
Respuesta:

{
    "collection": [
        {
            "id": 1,
            "name": "Taylor Swift Concert",
            "description": "Un espectacular show",
            "start_date": "2024-03-21T03:00:00.000Z",
            "duration_in_minutes": 210,
            "price": "15500",
            "enabled_for_enrollment": true,
            "max_assistance": 120000,
            "event_location": {
                "id": 1,
                "name": "Club Atlético River Plate",
                "full_address": "Av. Pres. Figueroa Alcorta 7597",
                "latitude": -34.54454505693356,
                "longitude": -58.4494761175694,
                "max_capacity": "84567",
                "location": {
                    "id": 3391,
                    "name": "Nuñez",
                    "latitude": -34.548805236816406,
                    "longitude": -58.463230133056641,
                    "province": {
                        "id": 1,
                        "name": "Ciudad Autónoma de Buenos Aires",
                        "full_name": "Ciudad Autónoma de Buenos Aires"
                    }
                }
            },
            "creator_user": {
                "id": 3,
                "username": "Jschiffer",
                "first_name": "Julian",
                "last_name": "Schiffer"
            },
            "tags": [
                {
                    "id": 1,
                    "name": "Rock"
                },
                {
                    "id": 2,
                    "name": "Pop"
                }
            ]
        }
    ],
    "pagination": {
        "limit": 10,
        "offset": 0,
        "nextPage": null,
        "total": "1"
    }
}
GET /api/event/:id
Obtiene el detalle completo de un evento.

Respuesta:

{
    "id": 8,
    "name": "Toto",
    "description": "La legendaria banda estadounidense se presentará en Buenos Aires.",
    "id_event_location": 2,
    "start_date": "2024-11-22T03:00:00.000Z",
    "duration_in_minutes": 120,
    "price": "150000",
    "enabled_for_enrollment": "1",
    "max_assistance": 12000,
    "id_creator_user": 1,
    "event_location": {
        "id": 2,
        "id_location": 3397,
        "name": "Movistar Arena",
        "full_address": "Humboldt 450, C1414 Cdad. Autónoma de Buenos Aires",
        "max_capacity": "15000",
        "latitude": "-34.593488697344405",
        "longitude": "-58.44735886932156",
        "id_creator_user": 1,
        "location": {
            "id": 3397,
            "name": "Villa Crespo",
            "id_province": 2,
            "latitude": "-34.599876403808594",
            "longitude": "-58.438816070556641",
            "province": {
                "id": 2,
                "name": "Ciudad Autónoma de Buenos Aires",
                "full_name": "Ciudad Autónoma de Buenos Aires",
                "latitude": "-34.61444091796875",
                "longitude": "-58.445877075195312",
                "display_order": null
            }
        },
        "creator_user": {
            "id": 1,
            "first_name": "Pablo",
            "last_name": "Ulman",
            "username": "pablo.ulman@ort.edu.ar"
        }
    },
    "tags": [
        {
            "id": 1,
            "name": "rock"
        },
        {
            "id": 2,
            "name": "pop"
        }
    ],
    "creator_user": {
        "id": 1,
        "first_name": "Pablo",
        "last_name": "Ulman",
        "username": "pablo.ulman@ort.edu.ar",
        "password": "******"
    }
}
Eventos (Requieren Autenticación)
POST /api/event
Crea un nuevo evento.

Headers:

Authorization: Bearer <token>
Body:

{
    "name": "Nuevo Evento",
    "description": "Descripción del evento",
    "id_event_location": 1,
    "start_date": "2024-12-25T20:00:00.000Z",
    "duration_in_minutes": 120,
    "price": 5000,
    "enabled_for_enrollment": "1",
    "max_assistance": 1000,
    "tags": ["rock", "pop"]
}
PUT /api/event/:id
Actualiza un evento existente.

Headers:

Authorization: Bearer <token>
Body:

{
    "name": "Evento Actualizado",
    "description": "Nueva descripción",
    "price": 6000
}
DELETE /api/event/:id
Elimina un evento.

Headers:

Authorization: Bearer <token>
Inscripciones (Requieren Autenticación)
POST /api/event/:id/enrollment
Inscribe al usuario autenticado en un evento.

Headers:

Authorization: Bearer <token>
DELETE /api/event/:id/enrollment
Cancela la inscripción del usuario autenticado en un evento.

Headers:

Authorization: Bearer <token>
Participantes (Requieren Autenticación)
GET /api/event/:id/participants
Obtiene la lista de participantes de un evento.

Headers:

Authorization: Bearer <token>
Query Parameters:

page: Número de página (default: 1)
limit: Elementos por página (default: 15)
Respuesta:

{
    "collection": [
        {
            "user": {
                "id": 3,
                "username": "Jschiffer",
                "first_name": "Julian",
                "last_name": "Schiffer"
            },
            "attended": false,
            "rating": null,
            "description": null
        },
        {
            "user": {
                "id": 1,
                "username": "Polshetta",
                "first_name": "Pablo",
                "last_name": "Ulman"
            },
            "attended": true,
            "rating": 5,
            "description": "Alto Show"
        }
    ],
    "pagination": {
        "limit": 15,
        "offset": 0,
        "nextPage": null,
        "total": "2"
    }
}
Ubicaciones de Eventos (Requieren Autenticación)
GET /api/event-location
Obtiene todas las ubicaciones del usuario autenticado.

Headers:

Authorization: Bearer <token>
GET /api/event-location/:id
Obtiene una ubicación específica del usuario autenticado.

Headers:

Authorization: Bearer <token>
POST /api/event-location
Crea una nueva ubicación de evento.

Headers:

Authorization: Bearer <token>
Body:

{
    "id_location": 3397,
    "name": "Mi Venue",
    "full_address": "Calle Principal 123",
    "max_capacity": 1000,
    "latitude": "-34.593488697344405",
    "longitude": "-58.44735886932156"
}
PUT /api/event-location/:id
Actualiza una ubicación de evento.

Headers:

Authorization: Bearer <token>
DELETE /api/event-location/:id
Elimina una ubicación de evento.

Headers:

Authorization: Bearer <token>



Estas son algunas pruebas que hicimos para verificar el funcionamiento de los distintos endpoints, las pusimos aca porque no sabiamos como poner un archivo o carpeta con el postman.