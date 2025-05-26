const supabase = require("../config/supabase");

// 📌 Crear una nueva carpeta
const createFolder = async (req, res) => {
    const { name, parent_id, area } = req.body;
    const owner_id = req.user.id;

    if (!name || name.trim() === "") {
        return res.status(400).json({ error: "⚠️ El nombre de la carpeta es obligatorio" });
    }

    try {
        if (parent_id) {
            const { data: parentFolder, error: parentError } = await supabase
                .from("folders")
                .select("id")
                .eq("id", parent_id)
                .single();

            if (parentError || !parentFolder) {
                return res.status(400).json({ error: "⛔ La carpeta padre no existe" });
            }
        }

        const { data, error } = await supabase
            .from("folders")
            .insert([{ name, owner_id, parent_id: parent_id || null, area: area || null }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ message: "✅ Carpeta creada correctamente", folderId: data.id });
    } catch (error) {
        console.error("❌ Error al crear carpeta:", error.message);
        res.status(500).json({ error: "Error interno al crear la carpeta" });
    }
};

// 📌 Listar carpetas propias y compartidas del usuario
const listFolders = async (req, res) => {
    const owner_id = req.user.id;

    try {
        const { data: ownFolders, error: ownError } = await supabase
            .from("folders")
            .select("id, name, area")
            .eq("owner_id", owner_id)
            .is("parent_id", null);

        const { data: sharedFolders, error: sharedError } = await supabase
            .from("folder_shares")
            .select("folders(id, name, area)")
            .eq("user_id", owner_id);

        if (ownError || sharedError) throw ownError || sharedError;

        res.json({
            ownFolders: ownFolders || [],
            sharedFolders: (sharedFolders || []).map(s => s.folders),
        });
    } catch (error) {
        console.error("❌ Error al obtener carpetas:", error.message);
        res.status(500).json({ error: "Error interno al obtener las carpetas" });
    }
};

// 📌 Compartir carpeta con usuario
const shareFolder = async (req, res) => {
    const { folderId, userId } = req.body;
    const ownerId = req.user.id;

    try {
        const { data: folders, error } = await supabase
            .from("folders")
            .select("id")
            .eq("id", folderId)
            .eq("owner_id", ownerId)
            .single();

        if (error || !folders) {
            return res.status(403).json({ error: "⛔ No tienes permiso para compartir esta carpeta" });
        }

        const { error: insertError } = await supabase
            .from("folder_shares")
            .insert([{ folder_id: folderId, user_id: userId }]);

        if (insertError) throw insertError;

        res.json({ message: "✅ Carpeta compartida exitosamente con el usuario" });
    } catch (error) {
        console.error("❌ Error al compartir la carpeta con usuario:", error.message);
        res.status(500).json({ error: "Error interno al compartir la carpeta con usuario" });
    }
};

// 📌 Compartir carpeta con grupo
const shareFolderWithGroup = async (req, res) => {
    const { folderId, groupId } = req.body;
    const ownerId = req.user.id;

    try {
        const { data: folders, error } = await supabase
            .from("folders")
            .select("id")
            .eq("id", folderId)
            .eq("owner_id", ownerId)
            .single();

        if (error || !folders) {
            return res.status(403).json({ error: "⛔ No tienes permiso para compartir esta carpeta" });
        }

        const { error: insertError } = await supabase
            .from("folder_shares")
            .insert([{ folder_id: folderId, group_id: groupId }]);

        if (insertError) throw insertError;

        res.json({ message: "✅ Carpeta compartida con el grupo exitosamente" });
    } catch (error) {
        console.error("❌ Error al compartir la carpeta con grupo:", error.message);
        res.status(500).json({ error: "Error interno al compartir la carpeta con grupo" });
    }
};

// 📌 Eliminar carpeta y subestructura
const deleteFolder = async (req, res) => {
    const folderId = req.params.id;
    const ownerId = req.user.id;

    try {
        const { data: folder, error: checkError } = await supabase
            .from("folders")
            .select("id")
            .eq("id", folderId)
            .eq("owner_id", ownerId)
            .single();

        if (checkError || !folder) {
            return res.status(404).json({ error: "⛔ La carpeta no existe o no tienes permiso para eliminarla" });
        }

        await supabase.from("documents").delete().eq("folder_id", folderId);
        await supabase.from("folder_shares").delete().eq("folder_id", folderId);
        await supabase.from("folders").delete().eq("parent_id", folderId);
        await supabase.from("folders").delete().eq("id", folderId);

        res.json({ message: "✅ Carpeta eliminada correctamente" });
    } catch (error) {
        console.error("❌ Error al eliminar carpeta:", error.message);
        res.status(500).json({ error: "Error interno al eliminar la carpeta" });
    }
};

// 📌 Contenido de una carpeta
const getFolderContents = async (req, res) => {
    const folderId = req.params.folder_id;

    try {
        const { data: subfolders } = await supabase
            .from("folders")
            .select("id, name")
            .eq("parent_id", folderId);

        const { data: documents } = await supabase
            .from("documents")
            .select("id, name, url")
            .eq("folder_id", folderId);

        res.json({ subfolders, documents });
    } catch (error) {
        console.error("❌ Error al obtener contenido de carpeta:", error.message);
        res.status(500).json({ error: "Error interno al obtener los contenidos." });
    }
};

// 📌 Carpetas del área "proyectos"
const listProjectFolders = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("folders")
            .select("id, name")
            .eq("area", "proyectos")
            .is("parent_id", null);

        if (error) throw error;

        res.status(200).json({ projectFolders: data || [] });
    } catch (error) {
        console.error("❌ Error al obtener carpetas de proyectos:", error.message);
        res.status(500).json({ error: "Error interno al obtener carpetas de proyectos." });
    }
};

// 📌 Mover carpeta
const moveFolder = async (req, res) => {
    const { folder_id, new_parent_id } = req.body;
    const ownerId = req.user.id;

    if (!folder_id || !new_parent_id) {
        return res.status(400).json({ error: "⚠️ Se requieren folder_id y new_parent_id" });
    }

    if (folder_id === new_parent_id) {
        return res.status(400).json({ error: "⛔ No puedes mover una carpeta dentro de sí misma" });
    }

    try {
        const { data: folder } = await supabase
            .from("folders")
            .select("id")
            .eq("id", folder_id)
            .eq("owner_id", ownerId)
            .single();

        const { data: destination } = await supabase
            .from("folders")
            .select("id")
            .eq("id", new_parent_id)
            .single();

        if (!folder || !destination) {
            return res.status(400).json({ error: "⛔ La carpeta destino o fuente no existe o no tienes permiso" });
        }

        await supabase
            .from("folders")
            .update({ parent_id: new_parent_id })
            .eq("id", folder_id);

        res.json({ message: "✅ Carpeta movida correctamente" });
    } catch (error) {
        console.error("❌ Error al mover la carpeta:", error.message);
        res.status(500).json({ error: "Error interno al mover la carpeta" });
    }
};

// 📌 Crear estructura de proyecto
const createProject = async (req, res) => {
    const { name } = req.body;
    const ownerId = req.user.id;

    if (!name) {
        return res.status(400).json({ error: "⚠️ El nombre del proyecto es obligatorio." });
    }

    try {
        const { data: project, error: createError } = await supabase
            .from("folders")
            .insert([{ name, owner_id: ownerId, parent_id: null, area: "proyectos" }])
            .select()
            .single();

        if (createError) throw createError;

        const structure = {
            "Ingeniería": ["Sistemas de Gestión", "Memorias de Cálculo", "Hojas de Cálculo", "Planos"],
            "Materiales": ["Lista de Materiales", "Registro Entrante de Materiales", "Cotización"],
            "Instalación": ["Documentos Generales", "Procedimientos", "Registros", "Contratistas"],
            "Operaciones": ["Certificaciones Pre-Com y Com"],
            "Mantenimiento": [],
            "Generación Distribuida": []
        };

        for (const main of Object.keys(structure)) {
            const { data: subfolder } = await supabase
                .from("folders")
                .insert([{ name: main, parent_id: project.id, owner_id: ownerId, area: "proyectos" }])
                .select()
                .single();

            if (structure[main].length) {
                await Promise.all(
                    structure[main].map(sub =>
                        supabase.from("folders").insert([{ name: sub, parent_id: subfolder.id, owner_id: ownerId, area: "proyectos" }])
                    )
                );
            }
        }

        res.status(201).json({ message: "✅ Proyecto creado con su estructura completa.", projectFolderId: project.id });
    } catch (error) {
        console.error("❌ Error al crear proyecto:", error.message);
        res.status(500).json({ error: "❌ Error interno del servidor." });
    }
};

module.exports = {
    createFolder,
    listFolders,
    listProjectFolders,
    shareFolder,
    shareFolderWithGroup,
    deleteFolder,
    getFolderContents,
    moveFolder,
    createProject
};
