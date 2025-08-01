import pkg from 'pg';
import { StatusCodes } from 'http-status-codes';
import {validaciones} from '../validaciones/stringValidacion.js'

export const getHello = (req, res) => {
    res.json({ message: 'Hola desde la API 🚀' });
};

// 2) +  3) 
export const getAllEvents = async (req, res) => {
    const { page = 1, limit = 15, name, startdate, tag } = req.query;
    const offset = (page - 1) * limit;
    const client = pool;
    
    try {
        await client.connect();
        
        let sqlQuery = `
             SELECT 
    e.id, e.name, e.description, e.start_date, e.duration_in_minutes,
    e.price, e.enabled_for_enrollment, e.max_assistance,
    el.id AS event_location_id, el.name AS location_name, 
    el.full_address, el.latitude, el.longitude, el.max_capacity,
    l.id AS location_id, l.name AS locality_name,
    p.id AS province_id, p.name AS province_name, p.full_name AS province_full_name,
    u.id AS creator_id, u.first_name, u.last_name, u.username
FROM events e
LEFT JOIN event_locations el ON e.id_event_location = el.id
LEFT JOIN locations l ON el.id_location = l.id
LEFT JOIN provinces p ON l.id_province = p.id
LEFT JOIN users u ON e.id_creator_user = u.id
WHERE 1=1
`;
        
        const values = [];
        let paramCount = 0;

       
        if (name) {
            paramCount++;
            sqlQuery += ` AND e.name ILIKE $${paramCount}`;
            values.push(`%${name}%`);
        }

        if (startdate) {
            paramCount++;
            sqlQuery += ` AND DATE(e.start_date) = $${paramCount}`;
            values.push(startdate);
        }

        if (tag) {
            paramCount++;
            sqlQuery += ` AND EXISTS (
                SELECT 1 FROM Event_Tags et 
                JOIN Tags t ON et.id_tag = t.id 
                WHERE et.id_event = e.id AND t.name ILIKE $${paramCount}
            )`;
            values.push(`%${tag}%`);
        }

      
        paramCount++;
        sqlQuery += ` ORDER BY e.id ASC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        values.push(limit, offset);

        const result = await client.query(sqlQuery, values);


        if (result.rows.length === 0) {
            return res.status(StatusCodes.OK).json({
                collection: [],
                message: 'No hay eventos registrados en la base de datos.'
            });
        }

        const eventsWithTags = await Promise.all(
            result.rows.map(async (event) => {
                const tagsQuery = `
                    SELECT t.id, t.name 
                    FROM Event_Tags et 
                    JOIN Tags t ON et.id_tag = t.id 
                    WHERE et.id_event = $1
                `;
                const tagsResult = await client.query(tagsQuery, [event.id]);
                
                return {
                    id: event.id,
                    name: event.name,
                    description: event.description,
                    start_date: event.start_date,
                    duration_in_minutes: event.duration_in_minutes,
                    price: event.price,
                    enabled_for_enrollment: event.enabled_for_enrollment === '1',
                    max_assistance: event.max_assistance,
                    event_location: {
                        id: event.event_location_id,
                        name: event.location_name,
                        full_address: event.full_address,
                        latitude: parseFloat(event.latitude),
                        longitude: parseFloat(event.longitude),
                        max_capacity: event.max_capacity,
                        location: {
                            id: event.location_id,
                            name: event.locality_name,
                            latitude: parseFloat(event.latitude),
                            longitude: parseFloat(event.longitude),
                            province: {
                                id: event.province_id,
                                name: event.province_name,
                                full_name: event.province_full_name
                            }
                        }
                    },
                    creator_user: {
                        id: event.creator_id,
                        username: event.username,
                        first_name: event.first_name,
                        last_name: event.last_name
                    },
                    tags: tagsResult.rows
                };
            })
        );

        
        
        const nextPage = offset + limit < total ? page + 1 : null;

        res.status(StatusCodes.OK).json({
            collection: eventsWithTags,
            pagination: {
                limit: parseInt(limit),
                offset: offset,
                nextPage: nextPage,
                total: total.toString()
            }
        });

    } catch (error) {
        console.error('Error obteniendo eventos:', error);
        if (error.code === 'ECONNREFUSED' || error.message.includes('connect') || error.message.includes('Connection')) {
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: 'Error de conexión con la base de datos'
            });
        }
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};



// 4)
export const getEventById = async (req, res) => {
    const { id } = req.params;
    const client = pool;


    try {
        await client.connect();
        
        const sqlQuery = `
            SELECT 
                e.*, el.*, l.*, p.*, u.* 
            FROM Events e
            LEFT JOIN event_Locations el ON e.id_event_location = el.id
            LEFT JOIN locations l ON el.id_location = l.id
            LEFT JOIN provinces p ON l.id_province = p.id
            LEFT JOIN users u ON e.id_creator_user = u.id
            WHERE e.id = $1
        `;
        
        const result = await client.query(sqlQuery, [id]);

        try{
            chequearSiExiste(result, "Evento");

        }catch(error){
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message:error.message
            });
        }

   

        const event = result.rows[0];

       
        const tagsQuery = `
            SELECT t.id, t.name 
            FROM Event_Tags et 
            JOIN Tags t ON et.id_tag = t.id 
            WHERE et.id_event = $1
        `;
        const tagsResult = await client.query(tagsQuery, [id]);

        const locationCreatorQuery = 'SELECT id, first_name, last_name, username FROM Users WHERE id = $1';
        const locationCreatorResult = await client.query(locationCreatorQuery, [event.id_creator_user]);

        const eventDetail = {
            id: event.id,
            name: event.name,
            description: event.description,
            id_event_location: event.id_event_location,
            start_date: event.start_date,
            duration_in_minutes: event.duration_in_minutes,
            price: event.price,
            enabled_for_enrollment: event.enabled_for_enrollment,
            max_assistance: event.max_assistance,
            id_creator_user: event.id_creator_user,
            event_location: {
                id: event.event_location_id,
                id_location: event.id_location,
                name: event.location_name,
                full_address: event.full_address,
                max_capacity: event.max_capacity,
                latitude: event.latitude,
                longitude: event.longitude,
                id_creator_user: event.id_creator_user,
                location: {
                    id: event.location_id,
                    name: event.locality_name,
                    id_province: event.id_province,
                    latitude: event.latitude,
                    longitude: event.longitude,
                    province: {
                        id: event.province_id,
                        name: event.province_name,
                        full_name: event.province_full_name,
                        latitude: event.province_latitude,
                        longitude: event.province_longitude,
                        display_order: event.display_order
                    }
                },
                creator_user: locationCreatorResult.rows[0]
            },
            tags: tagsResult.rows,
            creator_user: {
                id: event.creator_id,
                first_name: event.first_name,
                last_name: event.last_name,
                username: event.username,
                password: '******'
            }
        };

        res.status(StatusCodes.OK).json(eventDetail);

    } catch (error) {
        console.error('Error obteniendo evento:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error interno del servidor'
        });
    } 
};

// 6) POST Y PUT
export const createEvent = async (req, res) => {
    const { 
        name, description, id_event_location, start_date, 
        duration_in_minutes, price, enabled_for_enrollment, 
        max_assistance, tags 
    } = req.body;
    const userId = req.user.id;
    const client = pool;

    try {
       
        isValidString(name, "nombre")
        isValidString(description, "descripción")
        isPositivo(price, "precio")
        isPositivo(duration_in_minutes, "duración")

        await client.connect();

        const locationQuery = 'SELECT max_capacity FROM Event_Locations WHERE id = $1';
        const locationResult = await client.query(locationQuery, [id_event_location]);
        
        try{
            chequearSiExiste(locationResult, "ubicación");

        }catch(error){
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message:error.message
            });
        }
        if (max_assistance > locationResult.rows[0].max_capacity) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'La capacidad máxima excede la capacidad de la ubicación'
            });
        }
        if(!userId){
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'Error: el usuario no se encuentra autenticado'
            });
        }
        const insertQuery = `
            INSERT INTO Events (name, description, id_event_location, start_date, 
                              duration_in_minutes, price, enabled_for_enrollment, 
                              max_assistance, id_creator_user)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id
        `;
        
        const eventResult = await client.query(insertQuery, [
            name, description, id_event_location, start_date,
            duration_in_minutes, price, enabled_for_enrollment,
            max_assistance, userId
        ]);

        const eventId = eventResult.rows[0].id;

    
        res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Evento creado exitosamente',
            eventId: eventId
        });

    } catch (error) {
        console.error('Error creando evento:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error interno del servidor'
        });
    } 
};


export const updateEvent = async (req, res) => {
    const { idEvento } = req.params;
    const updateData = req.body;
    const userId = req.user.id;
    const client = pool;

    try {
        await client.connect();

        const checkQuery = 'SELECT id_creator_user FROM Events WHERE id = $1';
        const checkResult = await client.query(checkQuery, [idEvento]);
        
        try{
            chequearSiExiste(checkResult, "Evento")

        }catch(error){
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message:error.message
            });
        }

   
        if (checkResult.rows[0].id_creator_user !== userId) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'No tienes permisos para editar este evento'
            });
        }

        isValidString(updateData.name,"nombre")
        isValidString(updateData.description,"descripción")

        isPositivo(updateData.price,"precio")
        isPositivo(updateData.duration_in_minutes,"duración")


        const updateFields = [];
        const values = [];
        let paramCount = 0;

        Object.keys(updateData).forEach(key => {
            if (key !== 'id' && key !== 'id_creator_user' && key !== 'tags') {
                paramCount++;
                updateFields.push(`${key} = $${paramCount}`);
                values.push(updateData[key]);
            }
        });
        if (updateFields.length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'No hay campos válidos para actualizar'
            });
        }

        paramCount++;
        values.push(idEvento);

        const updateQuery = `UPDATE Events SET ${updateFields.join(', ')} WHERE id = $${paramCount}`;
        await client.query(updateQuery, values);


        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Evento actualizado exitosamente'
        });

    } catch (error) {
        console.error('Error actualizando evento:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// 6 DELETE
export const deleteEvent = async (req, res) => {
    const { idEvento } = req.params;
    const userId = req.user.id;
    const client = pool;

    try {
        await client.connect();


        const checkQuery = 'SELECT id_creator_user FROM Events WHERE id = $1';
        const checkResult = await client.query(checkQuery, [idEvento]);
       
        if(!userId){
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'Error: el usuario no se encuentra autenticado'
            });
        }
        try{
            chequearSiExiste(checkResult, "Evento")

        }catch(error){
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message:error.message
            });
        }
      
        if (checkResult.rows[0].id_creator_user !== userId) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'No tienes permisos para eliminar este evento'
            });
        }
        

        const enrollmentQuery = 'SELECT COUNT(*) FROM Event_Enrollments WHERE id_event = $1';
        const enrollmentResult = await client.query(enrollmentQuery, [idEvento]);

        if (parseInt(enrollmentResult.rows[0].count) > 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'No se puede eliminar un evento con usuarios registrados'
            });
        }


        await client.query('DELETE FROM Event_Tags WHERE id_event = $1', [idEvento]);


        await client.query('DELETE FROM Events WHERE id = $1', [idEvento]);

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Evento eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error eliminando evento:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// 7)
export const enrollInEvent = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const client = pool;

    try {
        await client.connect();

  
        const eventQuery = `
            SELECT start_date, enabled_for_enrollment, max_assistance 
            FROM Events WHERE id = $1
        `;
        const eventResult = await client.query(eventQuery, [id]);

        if (eventResult.rowCount === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }

        const event = eventResult.rows[0];

  
        if (event.enabled_for_enrollment !== '1') {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'El evento no está habilitado para inscripción'
            });
        }


        const eventDate = new Date(event.start_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (eventDate <= today) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'No se puede inscribir a un evento que ya pasó o es hoy'
            });
        }

  
        const existingEnrollmentQuery = 'SELECT id FROM Event_Enrollments WHERE id_event = $1 AND id_user = $2';
        const existingEnrollmentResult = await client.query(existingEnrollmentQuery, [id, userId]);

        if (existingEnrollmentResult.rowCount > 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Ya estás inscrito en este evento'
            });
        }

   
        const currentEnrollmentsQuery = 'SELECT COUNT(*) FROM Event_Enrollments WHERE id_event = $1';
        const currentEnrollmentsResult = await client.query(currentEnrollmentsQuery, [id]);
        const currentEnrollments = parseInt(currentEnrollmentsResult.rows[0].count);

        if (currentEnrollments >= event.max_assistance) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'El evento ha alcanzado su capacidad máxima'
            });
        }

  
        const enrollmentQuery = `
            INSERT INTO Event_Enrollments (id_event, id_user, registration_date_time)
            VALUES ($1, $2, NOW())
        `;
        await client.query(enrollmentQuery, [id, userId]);

        res.status(StatusCodes.CREATED).json({
            success: true,
            message: 'Inscripción exitosa'
        });

    } catch (error) {
        console.error('Error en inscripción:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};


export const cancelEnrollment = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const client = pool;

    try {
        await client.connect();

        
        const eventQuery = 'SELECT start_date FROM Events WHERE id = $1';
        const eventResult = await client.query(eventQuery, [id]);

        if (eventResult.rowCount === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }

        const event = eventResult.rows[0];

  
        const eventDate = new Date(event.start_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (eventDate <= today) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'No se puede cancelar la inscripción a un evento que ya pasó o es hoy'
            });
        }

      
        const enrollmentQuery = 'SELECT id FROM Event_Enrollments WHERE id_event = $1 AND id_user = $2';
        const enrollmentResult = await client.query(enrollmentQuery, [id, userId]);

        if (enrollmentResult.rowCount === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'No estás inscrito en este evento'
            });
        }


        await client.query('DELETE FROM Event_Enrollments WHERE id_event = $1 AND id_user = $2', [id, userId]);

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Inscripción cancelada exitosamente'
        });

    } catch (error) {
        console.error('Error cancelando inscripción:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};


export const getEventParticipants = async (req, res) => {
    const { id } = req.params;
    const { page = 1, limit = 15 } = req.query;
    const offset = (page - 1) * limit;
    const client = pool;

    try {
        await client.connect();

       
        const eventQuery = 'SELECT id FROM Events WHERE id = $1';
        const eventResult = await client.query(eventQuery, [id]);

        if (eventResult.rowCount === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }

  
        const countQuery = 'SELECT COUNT(*) FROM Event_Enrollments WHERE id_event = $1';
        const countResult = await client.query(countQuery, [id]);
        const total = parseInt(countResult.rows[0].count);


        const participantsQuery = `
            SELECT 
                u.id, u.username, u.first_name, u.last_name,
                ee.attended, ee.rating, ee.description
            FROM Event_Enrollments ee
            JOIN Users u ON ee.id_user = u.id
            WHERE ee.id_event = $1
            ORDER BY ee.registration_date_time ASC
            LIMIT $2 OFFSET $3
        `;
        const participantsResult = await client.query(participantsQuery, [id, limit, offset]);

        const participants = participantsResult.rows.map(row => ({
            user: {
                id: row.id,
                username: row.username,
                first_name: row.first_name,
                last_name: row.last_name
            },
            attended: row.attended,
            rating: row.rating,
            description: row.description
        }));

        const nextPage = offset + limit < total ? page + 1 : null;

        res.status(StatusCodes.OK).json({
            collection: participants,
            pagination: {
                limit: parseInt(limit),
                offset: offset,
                nextPage: nextPage,
                total: total.toString()
            }
        });

    } catch (error) {
        console.error('Error obteniendo participantes:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};


export const getEventByName = async (req, res) => {
    const { name } = req.params;
    const client = pool;

    try {
        await client.connect();
        const sqlQuery = 'SELECT * FROM Events WHERE name = $1';
        const values = [name];
        const resultadoPg = await client.query(sqlQuery, values);
        
        if (resultadoPg.rowCount === 0) {
            return res.status(StatusCodes.NOT_FOUND).send(`No se encontró un evento con el nombre ${name}`);
        }
        res.status(StatusCodes.OK).json(resultadoPg.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Error interno del servidor');
    }
};

export const getEventByStartDate = async (req, res) => {
    const { startdate } = req.params;
    const client = pool;

    try {
        await client.connect();
        const sqlQuery = 'SELECT * FROM Events WHERE startdate = $1';
        const values = [startdate];
        const resultadoPg = await client.query(sqlQuery, values);
        
        if (resultadoPg.rowCount === 0) {
            return res.status(StatusCodes.NOT_FOUND).send(`No se encontró un evento con fecha de inicio ${startdate}`);
        }
        res.status(StatusCodes.OK).json(resultadoPg.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Error interno del servidor');
    }
};

export const getEventByTag = async (req, res) => {
    const { tag } = req.params;
    const client = pool;

    try {
        await client.connect();
        const sqlQuery = 'SELECT * FROM Events WHERE tag = $1';
        const values = [tag];
        const resultadoPg = await client.query(sqlQuery, values);
        
        if (resultadoPg.rowCount === 0) {
            return res.status(StatusCodes.NOT_FOUND).send(`No se encontró un evento con la etiqueta ${tag}`);
        }
        res.status(StatusCodes.OK).json(resultadoPg.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Error interno del servidor');
    }
};
  