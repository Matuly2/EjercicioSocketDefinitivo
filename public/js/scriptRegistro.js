//Funciones para Node.js

function registrarUsuario(){
    
    var usuario = document.getElementById("nombre_usuario").value;
    var contraseña = document.getElementById("contrasena").value;
    //Hago la petición al servidor y guardo la respuesta en la variable  promise
    var promise=$.ajax({
        type: "POST",
        url: "/registrar",
        //lo que mando
        data:JSON.stringify({username:usuario, password:contraseña}),
        contentType: "application/json;charset=UTF-8",
        dataType:"json"
});
//Tratar la respuesta que me da el servidor
promise.always(function(data){

    if(data.res=="register true"){//Si la respuesta del servidor es login true, redirijo al usuario a /login
        document.cookie = "usuario=" + data.res.user;
        document.cookie = "contraseña=" + data.res.password;
        window.location.replace("/login");
        //console.log("Primer if");
    }else if(data.res=="usuario ya existe"){//Si la respuesta del servidor es "usuario no válido", significa que este usuario no es el correcto.
        alert("El usuario ya existe");
        //console.log("segundo if");
    }else if(data.res=="register failed"){//Si la respuesta es "login failed", significa que hay algún campo sin rellenar.
        alert("Debes introducir el usuario y contraseña");
       // console.log("tercer if");
    }else{//Esto evita que pete por si aacaso
        window.alert("Error");
       // console.log("Primer if");
    }
});
}