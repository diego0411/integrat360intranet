const db = require("../config/db");

class User {
    static async create(name, email, password, role, birthdate) {
        try {
            const [result] = await db.execute(
                "INSERT INTO users (name, email, password, role, birthdate) VALUES (?, ?, ?, ?, ?)",
                [name, email, password, role, birthdate]
            );
            return result;
        } catch (error) {
            console.error("❌ Error en la creación del usuario:", error);
            throw new Error("No se pudo crear el usuario.");
        }
    }
}

module.exports = User;
