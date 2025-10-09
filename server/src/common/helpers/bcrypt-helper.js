import bcrypt from 'bcrypt'

export async function hashPassword(password) {
	return await bcrypt.hash(password, 10)
}

/**
 * Funcion que recibe 2 parametros (contraseña plana y contraseña encriptada)
 * Metodo compare devuelve true si la contraseña coincide y false si no coincide
 * @param {*} password
 * @param {*} hashedPassword
 * @returns
 */
export async function comparePassword(password, hashedPassword) {
	return await bcrypt.compare(password, hashedPassword)
}
