var socket = io();//Para conectarnos 

var  miSocketId;//Esta variable guardara el socket id de la conexión propia de cada usuario

var miNombre;//Esta variable guardará mi nombre

var coleccionIdNombre={};//Esta variable guardará una colección que almacenará tanto el nombre como el socket id del usuario actual

var todosIdNombre={}//Esta variable guardará todos los ids y nombres conectados
// Manejar el evento de conexión de un socket con el servidor
var miNombreActual=null;



socket.on("connect", () => {
  (async () => {
    // Asignar el ID del socket actual a la variable miSocketId
    miSocketId = socket.id;
    //console.log(socket.id)

    await esperarMiNombre();
  

  /*socket.on("miNombre", function(data){
    //console.log("Este es el data de miNombre", data);
    //miNombre=data.nombre;
    //console.log("Este es la variable de miNombre", data.nombre," ", miNombre);
   // console.log("Este es el socket.id", miSocketId)
     coleccionIdNombre={nombre: data.nombre, id: socket.id};//Esta variable guardará una colección que almacenará tanto el nombre como el socket id del usuario actual

    
  });*/


  socket.on("listaId", function(data){
    todosIdNombre=data;
    //console.log("todosidnombre y data",todosIdNombre," ", data);
    mostrarDesplegable(data);
  });
  
  socket.on("listaUsuarios", function(data){
    //console.log("Console de listaUsuarios ", data);//Recibo un array 
   
    mostrarDesplegable(data);
    
});
  socket.on("publico", function(data){
    
    render(data,"publico");
    
});

socket.on("privado", function(data){
    
  render(data,"privado");
  
});

/**Funciones emit al servidor**/
 //console.log("Esta es la coleccion que mando en el emit",coleccionIdNombre);
  socket.emit("idActual", coleccionIdNombre);
//console.log(coleccionIdNombre, "Esta es mi colección de nombre e id");

})();
});
/**FUNCIONES DEL CLIENTE**/
function esperarMiNombre() {
  return new Promise((resolve) => {
      socket.on("miNombre", function (data) {
          miNombre = data.nombre;
          coleccionIdNombre = { nombre: miNombre, id: socket.id };
          resolve(); // Resuelve la promesa después de manejar miNombre
      });
  });
}
/**FUNCIÓN PARA EL DESPLEGABLE**/
function mostrarDesplegable(data) {
  const usuariosDesplegable = $("#usuariosDesplegable");

  // Limpiar el desplegable antes de agregar nuevas opciones
  usuariosDesplegable.empty();

  // Crear la opción por defecto "publico"
  const publicoOption = $("<option>")
    .val("Publico")
    .text("Publico")
    .prop("selected", true); // Seleccionado por defecto

  usuariosDesplegable.append(publicoOption);

  // Iterar sobre los IDs recibidos y agregarlos como opciones
  const arrayIterable = Object.values(data);

  $.each(arrayIterable, (index, elemento) => {
    const option = $("<option>")
      .val(elemento.nombre)
      .text(elemento.nombre); // Mostrar el nombre en el texto de la opción

    if (elemento.id !== socket.id) {
      usuariosDesplegable.append(option);
    } else {
      miNombreActual = elemento.nombre;
      option.addClass("opcion-destacada");
      usuariosDesplegable.append(option);
    }
  });
}

function addMessage() {
  const desplegable = $("#usuariosDesplegable");
  const valorSeleccionado = desplegable.val();
  const texto = $("#texto").val();

  if (valorSeleccionado) {
    const mensaje = {
      autor: miNombreActual,
      texto: $("#texto").val(),
    };

    if (valorSeleccionado === "Publico" && texto) {
      //console.log("addmesaje", mensaje.autor);

      socket.emit("publico", { mensaje: mensaje.texto, de: mensaje.autor, para: valorSeleccionado });

      $("#texto").val("");

    } else if (valorSeleccionado !== "Publico" && texto) {
      socket.emit("privado", { mensaje: mensaje.texto, de: mensaje.autor, para: valorSeleccionado });
      //console.log("este es mi socket",miSocketId)
      $("#texto").val("");
    }
  } else {
    console.log("Ninguna opción seleccionada en el desplegable");
  }

  return false;
}


/**FUNCION RENDER **///Para mostrar los mensajes en el html
/** FUNCION RENDER **///Para mostrar los mensajes en el html
var html = "";
var deMen = "";
/***LISTA DE INSULTOS*/
var insultos = [
  "abanto", "abrazafarolas", "adufe", "alcornoque", "alfeñique", "andurriasmo", 
  "arrastracueros", "artabán", "atarre", "baboso", "barrabás", "barriobajero", 
  "bebecharcos", "bellaco", "belloto", "berzotas", "besugo", "bobalicón", 
  "bocabuzón", "bocachancla", "bocallanta", "boquimuelle", "borrico", 
  "botarate", "brasas", "cabestro", "cabezaalberca", "cabezabuque", 
  "cachibache", "cafres", "cagalindes", "cagarruta", "calambuco", 
  "calamidad", "caldúo", "calientahielos", "calzamonas", "cansalmas", 
  "cantamañanas", "capullo", "caracaballo", "caracartón", "caraculo", 
  "caraflema", "carajaula", "carajote", "carapapa", "carapijo", "cazurro", 
  "cebollino", "cenizo", "cenutrio", "ceporro", "cernícalo", "charrán", 
  "chiquilicuatre", "chirimbaina", "chupacables", "chupasangre", 
  "chupóptero", "cierrabares", "cipote", "comebolsas", "comechapas", 
  "comeflores", "comestacas", "cretino", "cuerpoescombro", "culopollo", 
  "descerebrado", "desgarracalzas", "dondiego", "donnadie", "echacantos", 
  "ejarramantas", "energúmeno", "esbaratabailes", "escolimoso", 
  "escornacabras", "estulto", "fanfosquero", "fantoche", "fariseo", 
  "filimincias", "foligoso", "fulastre", "ganapán", "ganapio", "gandúl", 
  "gañán", "gaznápiro", "gilipuertas", "giraesquinas", "gorrino", 
  "gorrumino", "guitarro", "gurriato", "habahelá", "huelegateras", 
  "huevón", "lamecharcos", "lameculos", "lameplatos", "lechuguino", 
  "lerdo", "letrín", "lloramigas", "longanizas", "lumbreras", "maganto", 
  "majadero", "malasangre", "malasombra", "malparido", "mameluco", 
  "mamporrero", "manegueta", "mangarrán", "mangurrián", "mastuerzo", 
  "matacandiles", "meapilas", "melón", "mendrugo", "mentecato", 
  "mequetrefe", "merluzo", "metemuertos", "metijaco", "mindundi", 
  "morlaco", "morroestufa", "muerdesartenes", "orate", "ovejo", 
  "pagafantas", "palurdo", "pamplinas", "panarra", "panoli", "papafrita", 
  "papanatas", "papirote", "paquete", "pardillo", "parguela", "pasmarote", 
  "pasmaluegras", "pataliebre", "patán", "pavitonto", "pazguato", 
  "pecholata", "pedorro", "peinabombillas", "peinaovejas", "pelagallos", 
  "pelagambas", "pelagatos", "pelatigres", "pelazarzas", "pelele", "pelma", 
  "percebe", "perrocostra", "perroflauta", "peterete", "petimetre", 
  "picapleitos", "pichabrava", "pillavispas", "piltrafa", "pinchauvas", 
  "pintamonas", "piojoso", "pitañoso", "pitofloro", "plomo", "pocasluces", 
  "pollopera", "quitahipos", "rastrapajo", "rebañasandías", 
  "revientabaules", "ríeleches", "robaperas", "sabandija", "sacamuelas", 
  "sanguijuela", "sinentraero", "sinsustancia", "sonajas", "sonso", 
  "soplagaitas", "soplaguindas", "sosco", "tagarote", "tarado", "tarugo", 
  "tiralevitas", "tocapelotas", "tocho", "tolai", "tontaco", "tontucio", 
  "tordo", "tragaldabas", "tuercebotas", "tunante", "zamacuco", "zambombo", 
  "zampabollos", "zamugo", "zángano", "zarrapastroso", "zascandil", 
  "zopenco", "zoquete", "zote", "zullenco", "zurcefrenillos", "hijo de puta", "hija de puta", "gilipollas", "cabron", "cabrona", "zorra", "puta"
];


function contieneInsulto(mensaje) {
    mensaje = mensaje.toLowerCase(); // Convertir el mensaje a minúsculas para hacer la comparación sin distinción entre mayúsculas y minúsculas
    return insultos.some(insulto => mensaje.includes(insulto));
}

function render(data, dirigido) {
    //console.log(data, "este es el log del render");
    if (data !== null) {
      const miBoton = document.getElementById("pdf");


        // Habilita el botón
        miBoton.removeAttribute("disabled");

        let mensajeMostrar = data.mensaje;
        const horaMensaje = new Date().toLocaleTimeString(); // Obtiene la hora actual
        // Verificar si el mensaje contiene insultos
        if (contieneInsulto(mensajeMostrar)) {
            mensajeMostrar = `<div style="color: red;" >[${horaMensaje}] Tía Paola, ${data.de} dijo una grosería.</div>`;
        }

        if (dirigido == "publico") {
            if(data.de!=miNombreActual){
            html += `
                <div class="mensaje-container">
                    <strong id="nombre">[${horaMensaje}]  ${data.de}</strong>
                    <em id="mensaje">${mensajeMostrar}</em>
                </div>
            `;
            }else{
              html += `
                <div class="mensaje-container2">
                    <strong id="nombre">[${horaMensaje}]  ${data.de}</strong>
                    <em id="mensaje">${mensajeMostrar}</em>
                </div>
            `;
            }
            deMen += "Mensaje de: " + data.de + " Contenido: " + mensajeMostrar;
        } else {
          if(data.de!=miNombreActual){
            html += `
                <div class="mensaje-container">
                    <strong id="nombre">[${horaMensaje}]  ${data.de} (PRIVADO)</strong>
                    <em id="mensaje">${mensajeMostrar}</em>
                </div>
            `;
          }else{
            html += `
            <div class="mensaje-container2">
                <strong id="nombre">[${horaMensaje}]  ${data.de} (PRIVADO)</strong>
                <em id="mensaje">${mensajeMostrar}</em>
            </div>
        `;
          }
            deMen += "Mensaje de: " + data.de + " Contenido: " + mensajeMostrar;
        }
       document.getElementById("chat").innerHTML = html;

    } else {
        console.error("Los datos recibidos no son una colección de objetos:", data);
    }
    const chatContainer = document.getElementById("chat");

    chatContainer.scrollTop = chatContainer.scrollHeight;
}
/**Función para generar el pdf**/
function descargarComoPDF() {
  if(html){
    const fechaMensaje = new Date().toLocaleDateString(); // Obtiene la fecha actual
    
  const chatContainer = fechaMensaje + html;
  
  html2pdf(chatContainer, {
    margin: 10,
    filename: 'chat.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  });
}else{
  console.log("No hay datos");
}
}


/**FUNCION  PARA SACAR MI NOMBRE Y USARLO**/
function sacarNombre(data){
  for (const clave in data) {
    if (data.hasOwnProperty(clave)) {
      const elemento = data[clave];
  
      // Comprueba si el valor del id es igual al que tienes
      if (elemento.id == socket.id) {
        //console.log("este es el log de elemento.nombre", elemento.nombre)
        return elemento.nombre;  // Asigna el valor del atributo nombre a la variable global
        // Puedes realizar otras acciones aquí si es necesario
      }
    }
  }
}

/** FUNCION PARA LEER EL CHAT**/
function leerTexto() {
  //Texto que se lee
  var textoAEscuchar = deMen;

  // Objeto sintesis de vox
  var synth = window.speechSynthesis;

  // Objeto discurso
  var speech = new SpeechSynthesisUtterance(textoAEscuchar);

  
  speech.lang = 'es-ES';  // Código de idioma español de España

  // Reproduce el discurso
  synth.speak(speech);
}

/**FUNCIÓN PARA QUE SE ENVÍEN MESAJES CON LA TECLA ENTER**/
function presionarEnter(event) {
  // Verifica si la tecla presionada es "Enter"
  if (event.key === "Enter") {
    // Evitar el comportamiento predeterminado del formulario
    event.preventDefault();
    // Obtener referencia al botón y disparar su evento de clic
    $("#miBoton").click();

  }
}