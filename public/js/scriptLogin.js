//Funciones para Node.js


function iniciarSesion(){
   
    var usuario = document.getElementById("nombre_usuario").value;
    var contraseña = document.getElementById("contrasena").value;
    //Hago la petición al servidor y guardo la respuesta en la variable  promise
    var promise=$.ajax({
        type: "POST",
        url: "/identificar",
        //lo que mando
        data:JSON.stringify({username:usuario, password:contraseña}),
        contentType: "application/json;charset=UTF-8",
        dataType:"json"
});
//Tratar la respuesta que me da el servidor
promise.always(function(data){

    if(data.res=="login true"){//Si la respuesta del servidor es login true, redirijo al usuario a /rutaSegura
        document.cookie = "usuario=" + data.res.user;
        document.cookie = "contraseña=" + data.res.password;
        window.location.replace("/chat");
        //console.log("Primer if");
    }else if(data.res=="usuario no válido"){//Si la respuesta del servidor es "usuario no válido", significa que este usuario no es el correcto.
        alert("No estás autorizado");
        //console.log("segundo if");
    }else if(data.res=="login failed"){//Si la respuesta es "login failed", significa que haay algún campo sin rellenar.
        alert("Debes introducir el usuario y contraseña");
       // console.log("tercer if");
    }else{//Esto evita que pete por si aacaso
        window.alert("Error");
       // console.log("Primer if");
    }
});
}
//Para detectar ENTER
 document.addEventListener('DOMContentLoaded', function () {
    var form = document.querySelector('form');

    form.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            iniciarSesion();
        }
    });
});