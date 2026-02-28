// Array para almacenar los equipos registrados
var equipos = [];

// Función para agregar un equipo (nombre + logo opcional)
function addTeam() {
    var teamName = document.getElementById("teamName").value;
    var teamLogoInput = document.getElementById("teamLogo");
    var file = teamLogoInput.files[0];

    if (!teamName) {
        alert("Por favor ingrese un nombre de equipo.");
        return;
    }

    // Si hay archivo, leerlo
    if (file) {
        var reader = new FileReader();
        reader.onload = function(e) {
            // Crear objeto de equipo con logo
            var equipo = {
                id: Date.now(),
                nombre: teamName,
                logo: e.target.result
            };

            // Agregar al array de equipos
            equipos.push(equipo);

            // Limpiar los campos del formulario
            document.getElementById("teamName").value = "";
            document.getElementById("teamLogo").value = "";

            // Mostrar los equipos actualizados
            mostrarEquipos(equipos);
            alert("Equipo " + teamName + " agregado correctamente.");
        };
        reader.readAsDataURL(file);
    } else {
        // Crear objeto de equipo sin logo (usará imagen por defecto)
        var equipo = {
            id: Date.now(),
            nombre: teamName,
            logo: ""
        };

        // Agregar al array de equipos
        equipos.push(equipo);

        // Limpiar los campos del formulario
        document.getElementById("teamName").value = "";
        document.getElementById("teamLogo").value = "";

        // Mostrar los equipos actualizados
        mostrarEquipos(equipos);
        alert("Equipo " + teamName + " agregado correctamente.");
    }
}

// Función para mostrar todos los equipos
function mostrarEquipos(listaEquipos) {
    var teamList = document.getElementById("teamList");
    var noResults = document.getElementById("noResults");
    
    // Limpiar la lista
    teamList.innerHTML = "";

    if (listaEquipos.length === 0) {
        noResults.style.display = "block";
        teamList.innerHTML = "";
        return;
    }

    noResults.style.display = "none";

    // Crear cards para cada equipo
    listaEquipos.forEach(function(equipo) {
        var teamCard = document.createElement("div");
        teamCard.className = "team-card";
        
        var img = document.createElement("img");
        img.src = equipo.logo;
        img.alt = "Logo de " + equipo.nombre;
          if(!equipo.logo) {
            img.src = "assets/images/defaultteam.jpg";
        }
        
        
        var nombre = document.createElement("h4");
        nombre.textContent = equipo.nombre;
        
        var deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.textContent = "Eliminar";
        deleteBtn.className = "delete-btn";
        deleteBtn.onclick = function() {
            eliminarEquipo(equipo.id);
        };
        
        teamCard.appendChild(img);
        teamCard.appendChild(nombre);
        teamCard.appendChild(deleteBtn);
        teamList.appendChild(teamCard);
    });
}

// Función para mostrar todos los equipos
function mostrarTodos() {
    document.getElementById("searchTeam").value = "";
    mostrarEquipos(equipos);
}

// Función para buscar equipos por nombre
function searchTeams() {
    var searchValue = document.getElementById("searchTeam").value.toLowerCase();
    
    if (searchValue === "") {
        mostrarEquipos(equipos);
        return;
    }

    var equiposFiltrados = equipos.filter(function(equipo) {
        return equipo.nombre.toLowerCase().includes(searchValue);
    });

    mostrarEquipos(equiposFiltrados);
}

// Función para eliminar un equipo
function eliminarEquipo(equipoId) {
    if (confirm("¿Estás seguro de que deseas eliminar este equipo?")) {
        equipos = equipos.filter(function(equipo) {
            return equipo.id !== equipoId;
        });
        mostrarEquipos(equipos);
        alert("Equipo eliminado correctamente.");
    }
}
