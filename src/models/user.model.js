const supabase = require("../config/supabase");

class User {
    static async create(name, email, password, role, birthdate) {
        try {
            const { data, error } = await supabase
                .from("users")
                .insert([
                    {
                        name,
                        email,
                        password,
                        role,
                        birthdate,
                    },
                ])
                .select()
                .single();

            if (error) {
                console.error("❌ Error al insertar usuario en Supabase:", error.message);
                throw new Error("No se pudo crear el usuario.");
            }

            return data;
        } catch (err) {
            console.error("❌ Error inesperado en la creación del usuario:", err);
            throw new Error("No se pudo crear el usuario.");
        }
    }
}

module.exports = User;
