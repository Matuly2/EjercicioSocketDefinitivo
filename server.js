// Importar el framework Express para la creación de la aplicación
const express = require('express');

// Importar la biblioteca para trabajar con el sistema de archivos (file system)
var fs = require("fs");

// Importar la librería para manejar sesiones en Express (para autenticación, por ejemplo)
var session = require("express-session");

// Crear una instancia de la aplicación Express
const app = express();

// Crear una instancia del servidor HTTP utilizando la aplicación Express
const server = require('http').Server(app);

// Importar y configurar Socket.IO para la comunicación en tiempo real
const io = require("socket.io")(server);

// Definir el puerto en el que la aplicación escuchará, con opción de usar el puerto proporcionado por el entorno
const port = process.env.PORT || 3000;

// Configurar Express para servir archivos estáticos desde la carpeta "public"
app.use(express.static("public"));

// Importar Mongoose para la conexión a MongoDB y el manejo de esquemas
const mongoose = require("mongoose");

// Importar funciones y modelo definidos en el archivo "conexionMongo.js"
const { Usuario, conectarDB } = require("./conexionMongo.js");

// Configurar Express para manejar datos en formato JSON
app.use(express.json());

// Configurar Express para usar el middleware de sesión
app.use(session({
    secret: "Tu cadena secreta", // Agrega tu propia cadena secreta aquí
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Middleware de autenticación
var auth = function (req, res, next) {
    // Verificar si hay una sesión activa y si el usuario es "admin" y tiene el rol de administrador
    if (req.session && req.session.user === "admin" && req.session.admin) {
      // Permitir el acceso al siguiente middleware o ruta
      return next();
    } else {
      // Devolver un código de estado 401 (No autorizado) si la autenticación falla
      return res.sendStatus(401);
    }
  }
/**VARIABLES GLOBALES**/
var usuarioConectado={};//Almacenará el nombre del usuario actual
var usuariosConectados={};//Almacenará todos los nombres de los usuarios que se han ido conectando
var guardarNombreUsuariosBdd=[];//Este array guardará los nombres de los usuarios de la bdd con lo que devuelve la función
//var usuariosConectadosId=[];
//var contador=0;//Esta variable lo usare para la coleccion de usuariosConectadosId

//iniciar();
//console.log(guardarNombreUsuariosBdd)
/*** FUNCIONES GET ***/
app.get('/', (req, res) => {
   
    var contenido=fs.readFileSync("public/index.html");
    res.setHeader("Content-type", "text/html");
    res.send(contenido);
  });

  app.get('/login', (req, res) => {
   
    var contenido=fs.readFileSync("public/login.html");
    res.setHeader("Content-type", "text/html");
    res.send(contenido);
  });

  app.get('/registro', (req, res) => {
   
    var contenido=fs.readFileSync("public/registro.html");
    res.setHeader("Content-type", "text/html");
    res.send(contenido);
  });

app.get('/chat', auth, (req, res) => {
  
  var contenido=fs.readFileSync("public/chat.html");
  res.setHeader("Content-type", "text/html");
  res.send(contenido);
});

/*** FUNCIONES POST ***/
// Ruta para registrar un nuevo usuario en la base de datos
app.post("/registrar", async function(req, res) {
    // Verificar si los campos de nombre de usuario y contraseña están presentes en la solicitud
    if (!req.body.username || !req.body.password) {
      res.send({"res": "register failed"}); // Enviar respuesta de fallo si los campos no están presentes
    } else {
      let usuarioExistente;
      try {
        // Comprobar si ya existe un usuario con el mismo nombre
        usuarioExistente = await Usuario.findOne({ nombre: req.body.username });
      } catch (err) {
        console.error("Error al crear usuario: ", err);
      }
      if (usuarioExistente) {
        console.log("Ya existe un usuario con ese nombre");
        res.send({"res": "usuario ya existe"}); // Enviar respuesta de fallo si el usuario ya existe
      } else {
        // Crear un nuevo usuario utilizando el modelo Mongoose
        const nuevoUsuario = new Usuario({
          nombre: req.body.username,
          password: req.body.password
        });
        try {
          // Guardar el nuevo usuario en la base de datos
          nuevoUsuario.save();
          console.log("Nuevo usuario creado: ", nuevoUsuario);
          res.send({"res": "register true"}); // Enviar respuesta de éxito si el registro es exitoso
        } catch (err) {
          console.error("Error al crear usuario: ", err);
        }
      }
    }
  });
  
  /**************************************************************************************/
  // Ruta para identificar y autenticar a un usuario utilizando la base de datos
app.post("/identificar", async function(req, res) {
    // Verificar si los campos de nombre de usuario y contraseña están presentes en la solicitud
    if (!req.body.username || !req.body.password) {
      res.send({"res": "login failed"}); // Enviar respuesta de fallo si los campos no están presentes
    } else {
      try {
        obtenerNombresUsuarios();
        // Buscar un usuario en la base de datos con el nombre y contraseña proporcionados
        const usuarioEncontrado = await Usuario.findOne({ nombre: req.body.username, password: req.body.password });
  
        if (usuarioEncontrado) {
          // Usuario autenticado con éxito
          usuarioConectado = { nombre: req.body.username };
          
          // Almacenar el usuario en un objeto de usuarios conectados
          if (!usuariosConectados.hasOwnProperty(req.body.username)) {
            // Si no existe, lo añadimos
            usuariosConectados[req.body.username] = usuarioConectado;
          } else {
            // Si ya existe, puedes manejarlo de acuerdo a tus necesidades, como emitir un mensaje de error
            console.log('El usuario ya existe en usuariosConectados.');
          }
  
          // Establecer la sesión indicando que el usuario está autenticado y es un administrador
          req.session.user = "admin";
          req.session.admin = true;
          
          // Enviar respuesta de éxito
          return res.send({"res": "login true"});
        } else {
          // Enviar respuesta de fallo si el usuario no es válido
          res.send({"res": "usuario no válido"});
        }
      } catch (err) {
        console.error("Error al identificar usuario: ", err);
      }
    }
  });

  /**FUNCIÓN PARA RECUPERAR TODOS LOS NOMBRES DE LA BDD**/
  // Función para obtener y mostrar los nombres de todas las colecciones en la base de datos
  async function obtenerNombresUsuarios() {
    let contenedor=[];
    try {
      // Esperar a que la conexión a la base de datos se haya establecido
      await conectarDB();
  
      // Realizar una consulta para obtener los nombres de los usuarios
      const usuarios = await Usuario.find({}, 'nombre');
  
      // Mostrar los nombres de los usuarios
      usuarios.forEach((usuario) => {
        contenedor.push(usuario.nombre);
      });
      guardarNombreUsuariosBdd=contenedor;
      //console.log(guardarNombreUsuariosBdd)
      return true;
    } catch (error) {
      console.error('Error al obtener nombres de usuarios:', error);
    }
  }
  /********************************************************************************/
  // Llamar a la función obtenerNombresUsuarios después de definirla
  
  
  /**CONEXIONES DE SOCKET**/
  var usuariosConectadosId={};//Esta variable ira almacenando todos los usuarios que vaya enviando el cliente para posteriormente enviarle toda la coleccion a este para que los vaya añadiendo al desplegable
  io.on("connection", function(socket) {
    //var usuarioActual = {}; // Almacena el nombre y el ID del usuario actual
    
    /**PARA LOS MENSAJES PÚBLICOS**/
    io.emit("listaUsuarios", guardarNombreUsuariosBdd);
    io.emit("miNombre", usuarioConectado);

    //Para que los usuarios vayan mandando su socketid al servidor, y este los vaya almacenando para volver a enviarlos al cliente y los trate en el desplegable
    
    socket.on("idActual", function(data) {
      
       usuariosConectadosId[socket.id]=data;
      console.log(usuariosConectadosId," Este es el usuariosConectadosId de idActual");
      io.emit("listaId",usuariosConectadosId);
    });

    //Para enviar al cliente todos los usuarios e ids para manejarlos en el desplegable
    
    socket.on("publico", async function(data) {

        //io.emit("publico", {mensaje: mensaje, de: socket.id, para: null });
        io.emit("publico",{mensaje: data.mensaje, de: data.de, para: data.para});
    
        //Para el tema de guardar mensajes en la bdd
        try {
            const usuarioRemitente = await Usuario.findOne({ nombre: data.de });
            
            if (!usuarioRemitente) {
                console.error("Usuario remitente no encontrado en la base de datos");
                return;
            }
            usuarioRemitente.mensajes.push({ de: data.de, mensaje: data.mensaje });
            await usuarioRemitente.save();
        } catch (err) {
            console.error("Error al guardar el mensaje en la base de datos:", err);
        }
        
    });

    socket.on('privado', async function(data) {
      let variablePrivado=null;
      for (const clave in usuariosConectadosId) {
        if (usuariosConectadosId.hasOwnProperty(clave)) {
          const elemento = usuariosConectadosId[clave];
      
          // Comprueba si el valor del nombre es igual al que tienes
          if (elemento.nombre == data.para) {
            //console.log("este es el log de elemento.nombre", elemento.nombre)
            variablePrivado=elemento.id;  // Asigna el valor del atributo id a la variablePrivado
            // Puedes realizar otras acciones aquí si es necesario
          }
        }
      }





     //console.log("este es el data.para",data.para);
     //console.log("esto es lo que hay dentro de usuariosEId",usuariosEId)
     /*usuariosEId.forEach(function(usuario) {
      if(usuario.nombre==data.para){
          variableEmit=usuario.id;
      }
    });*/
    //console.log("esta es la variable emit: ", variableEmit);
      socket.to(variablePrivado).emit('privado', {mensaje: data.mensaje, de: data.de, para: data.para});
      socket.emit('privado', {mensaje: data.mensaje, de: data.de, para: data.para});
  
      //Para guardar los mensajes en la bdd
      try {
          const usuarioRemitente = await Usuario.findOne({ nombre: data.de });
          const usuarioDestinatario = await Usuario.findOne({ nombre: data.para });
  
          usuarioRemitente.mensajes.push({ de: data.de, mensaje: data.mensaje });
          usuarioDestinatario.mensajes.push({ de: data.de, mensaje: data.mensaje });
  
          await usuarioRemitente.save();
          await usuarioDestinatario.save();
      } catch (err) {
          console.error("Error al guardar el mensaje en la base de datos:", err);
      }
  });
  socket.on("disconnect", ()=>{
    //Eliminar al usuario del registro cuando se desconecta
    delete usuariosConectadosId[socket.id];
    //console.log("Este es el log del disconect",usuariosConectadosId)
    //Notificar a todos los usuarios sobre el cambio en la lista de conectados
    io.emit("listaId", usuariosConectadosId);
});
  });
  /**FUNCION PARA LOS MENSAJES PRIVADOS**/

  
  

  server.listen(port, () => {
    
    console.log(`App escuchando en el puerto ${port}`);
  });