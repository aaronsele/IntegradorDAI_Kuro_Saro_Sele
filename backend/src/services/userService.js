export default class userService{
    registerUser = async(username) => {
    

        const checkUserQuery = 'SELECT id FROM Users WHERE username = $1';
        const existingUser = await pool.query(checkUserQuery, [username]);

        if (existingUser.rowCount > 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: 'El usuario ya existe'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newId = await userService.registerUser(username);


    }

}
       
