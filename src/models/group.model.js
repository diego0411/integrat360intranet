const db = require("../config/db");

class Group {
    // 📌 Obtener todos los grupos
    static async getGroups() {
        const [groups] = await db.execute("SELECT * FROM chat_groups");
        return groups;
    }

    // 📌 Obtener un grupo por ID
    static async getGroupById(groupId) {
        const [group] = await db.execute("SELECT * FROM chat_groups WHERE id = ?", [groupId]);
        return group[0];
    }

    // 📌 Verificar si un usuario ya está en el grupo
    static async isUserInGroup(groupId, userId) {
        const [result] = await db.execute(
            "SELECT * FROM group_members WHERE group_id = ? AND user_id = ?",
            [groupId, userId]
        );
        return result.length > 0;
    }

    // 📌 Agregar usuario al grupo
    static async addUserToGroup(groupId, userId) {
        await db.execute("INSERT INTO group_members (group_id, user_id) VALUES (?, ?)", [groupId, userId]);
    }

    // 📌 Obtener miembros de un grupo
    static async getGroupMembers(groupId) {
        const [members] = await db.execute(
            "SELECT users.id, users.name, users.email FROM group_members JOIN users ON group_members.user_id = users.id WHERE group_members.group_id = ?",
            [groupId]
        );
        return members;
    }

    // 📌 Crear un nuevo grupo
    static async createGroup(name, created_by) {
        await db.execute("INSERT INTO chat_groups (name, created_by) VALUES (?, ?)", [name, created_by]);
    }
}

module.exports = Group;
