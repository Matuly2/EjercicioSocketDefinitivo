// Conectar a MongoDB y definir el modelo del usuario
const mongoose = require("mongoose");

// URI de conexión a MongoDB, incluyendo credenciales y nombre de la base de datos
const mongoDBURI = "mongodb+srv://Matuly:1234@cluster0.cijwgvu.mongodb.net/";

// Definir el esquema del usuario
const usuarioSchema = new mongoose.Schema({
  nombre: String,
  password: String,
  // Para guardar mensajes también en la base de datos, añadir este atributo al esquema de MongoDB
  mensajes: [{ de: String, mensaje: String, fecha: { type: Date, default: Date.now } }]
});

// Crear el modelo basado en el esquema
const Usuario = mongoose.model("Usuario", usuarioSchema);

// Función para conectar a la base de datos MongoDB
const conectarDB = async () => {
  try {
    // Intentar conectar a la base de datos
    await mongoose.connect(mongoDBURI);
    console.log("Conectado a MongoDB");
  } catch (err) {
    // En caso de error, imprimir el mensaje de error y salir del proceso
    console.error("Error al conectar a MongoDB", err);
    process.exit(1);
  }
};

// Exportar el modelo y la función de conexión para usar en otras partes de la aplicación
module.exports = { Usuario, conectarDB };
