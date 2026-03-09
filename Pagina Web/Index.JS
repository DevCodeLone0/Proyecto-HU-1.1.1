// Array para almacenar los equipos registrados
var equipos = [];

// Array para almacenar los jugadores registrados
var jugadores = [];

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
            loadTeamsToSelect();
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
        mostrarEquipos(equipos);        loadTeamsToSelect();        alert("Equipo " + teamName + " agregado correctamente.");
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
        // si el equipo tiene logo, úsalo; si no, mostrar el predeterminado
        if (!equipo.logo) {
            img.src = "../assets/logo.png"; // Ruta de la imagen predeterminada
        } else {
        img.src = equipo.logo;
        img.alt = "Logo de " + equipo.nombre;
        img.className = "team-logo";
        }
  

        var nombre = document.createElement("h4");
        nombre.textContent = equipo.nombre;
        
        var editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.textContent = "Editar";
        editBtn.className = "edit-btn";
        editBtn.onclick = function() {
            toggleEditMenuTeam(teamCard, equipo);
        };
        
        var deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.textContent = "Eliminar";
        deleteBtn.className = "delete-btn";
        deleteBtn.onclick = function() {
            eliminarEquipo(equipo.id);
        };
        
        var editMenu = document.createElement("div");
        editMenu.className = "edit-menu-team";
        editMenu.innerHTML = `
            <div class="edit-menu-form">
                <input type="text" id="edit-team-name-${equipo.id}" value="${equipo.nombre}" placeholder="Nombre del equipo">
                <input type="file" id="edit-team-logo-${equipo.id}" accept="image/*" placeholder="Cambiar logo">
            </div>
            <div class="edit-menu-actions">
                <button type="button" class="btn-save" onclick="saveTeam(${equipo.id})">Guardar</button>
                <button type="button" class="btn-cancel" onclick="closeEditMenuTeam(${equipo.id})">Cancelar</button>
            </div>
            <button type="button" class="btn-manage-players" onclick="managePlayers(${equipo.id})">Gestionar Jugadores</button>
        `;
        
        teamCard.appendChild(img);
        teamCard.appendChild(nombre);
        teamCard.appendChild(editBtn);
        teamCard.appendChild(deleteBtn);
        teamCard.appendChild(editMenu);
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
    var equipo = equipos.find(function(e) {
        return e.id == equipoId;
    });
    var playersOfTeam = jugadores.filter(function(jugador) {
        return jugador.equipoId == equipoId;
    });

    var message = "¿Estás seguro de que deseas eliminar el equipo '" + equipo.nombre + "'?";
    if (playersOfTeam.length > 0) {
        message += "\n\nEsto también eliminará los siguientes jugadores asociados:\n";
        playersOfTeam.forEach(function(jugador, index) {
            message += (index + 1) + ". " + jugador.nombre + "\n";
        });
    }

    if (confirm(message)) {
        // eliminar equipo
        equipos = equipos.filter(function(equipo) {
            return equipo.id !== equipoId;
        });

        // eliminar jugadores de ese equipo (ELIMINACIÓN EN CASCADA)
        jugadores = jugadores.filter(function(jugador) {
            return jugador.equipoId !== equipoId;
        });

        // actualizar interfaz
        mostrarEquipos(equipos);
        mostrarJugadores(jugadores);
        loadTeamsToSelect();

        alert("Equipo y sus jugadores eliminados correctamente.");
    }
}

// ========== FUNCIONES PARA JUGADORES ==========

// Función para cargar equipos en el select de jugadores
function loadTeamsToSelect() {
    var playerTeamSelect = document.getElementById("playerTeam");
    playerTeamSelect.innerHTML = '<option value="">Selecciona un equipo</option>';
    
    equipos.forEach(function(equipo) {
        var option = document.createElement("option");
        option.value = equipo.id;
        option.textContent = equipo.nombre;
        playerTeamSelect.appendChild(option);
    });
}

// Función para agregar un jugador
function addPlayer() {
    var playerName = document.getElementById("playerName").value;
    var playerAge = document.getElementById("playerAge").value;
    var playerPosition = document.getElementById("playerPosition").value;
    var playerTeam = document.getElementById("playerTeam").value;
    var playerImageInput = document.getElementById("playerImage");
    var file = playerImageInput.files[0];

    // Validaciones
    if (!playerName) {
        alert("Por favor ingrese el nombre del jugador.");
        return;
    }

    if (!playerAge || playerAge < 1 || playerAge > 100) {
        alert("Por favor ingrese una edad válida (1-100).");
        return;
    }

    if (!playerPosition) {
        alert("Por favor seleccione una posición.");
        return;
    }

    if (!playerTeam) {
        alert("Por favor seleccione un equipo.");
        return;
    }

    // Encontrar el nombre del equipo seleccionado
    var equipoSeleccionado = equipos.find(function(equipo) {
        return equipo.id == playerTeam;
    });

    // Si hay archivo de imagen, leerlo
    if (file) {
        var reader = new FileReader();
        reader.onload = function(e) {
            // Crear objeto de jugador con imagen
            var jugador = {
                id: Date.now(),
                nombre: playerName,
                edad: playerAge,
                posicion: playerPosition,
                equipoId: playerTeam,
                equipoNombre: equipoSeleccionado.nombre,
                imagen: e.target.result
            };

            // Agregar al array de jugadores
            jugadores.push(jugador);

            // Limpiar los campos del formulario
            document.getElementById("playerName").value = "";
            document.getElementById("playerAge").value = "";
            document.getElementById("playerPosition").value = "";
            document.getElementById("playerTeam").value = "";
            document.getElementById("playerImage").value = "";

            // Mostrar los jugadores actualizados
            mostrarJugadores(jugadores);

            alert("Jugador " + playerName + " agregado correctamente al equipo " + equipoSeleccionado.nombre);
        };
        reader.readAsDataURL(file);
    } else {
        // Crear objeto de jugador sin imagen
        var jugador = {
            id: Date.now(),
            nombre: playerName,
            edad: playerAge,
            posicion: playerPosition,
            equipoId: playerTeam,
            equipoNombre: equipoSeleccionado.nombre,
            imagen: ""
        };

        // Agregar al array de jugadores
        jugadores.push(jugador);

        // Limpiar los campos del formulario
        document.getElementById("playerName").value = "";
        document.getElementById("playerAge").value = "";
        document.getElementById("playerPosition").value = "";
        document.getElementById("playerTeam").value = "";
        document.getElementById("playerImage").value = "";

        // Mostrar los jugadores actualizados
        mostrarJugadores(jugadores);

        alert("Jugador " + playerName + " agregado correctamente al equipo " + equipoSeleccionado.nombre);
    }
}

// Función para mostrar todos los jugadores
function mostrarJugadores(listaJugadores) {
    var playersList = document.getElementById("playersList");
    var noPlayersResults = document.getElementById("noPlayersResults");
    
    // Limpiar la lista
    playersList.innerHTML = "";

    if (listaJugadores.length === 0) {
        noPlayersResults.style.display = "block";
        playersList.innerHTML = "";
        return;
    }

    noPlayersResults.style.display = "none";

    // Crear cards para cada jugador
    listaJugadores.forEach(function(jugador) {
        var playerItem = document.createElement("div");
        playerItem.className = "player-item";
        playerItem.onclick = function(e) {
            if (!e.target.closest(".edit-menu")) {
                toggleEditMenu(playerItem, jugador);
            }
        };
        
        var playerInfo = document.createElement("div");
        playerInfo.className = "player-info";
        
        // Agregar imagen del jugador si existe
        if (jugador.imagen) {
            var img = document.createElement("img");
            img.src = jugador.imagen;
            img.alt = "Foto de " + jugador.nombre;
            img.className = "player-photo";
            playerInfo.appendChild(img);
        }
        
        var nombre = document.createElement("div");
        nombre.className = "player-name";
        nombre.textContent = jugador.nombre;
        
        var edad = document.createElement("div");
        edad.className = "player-edad";
        edad.textContent = "Edad: " + jugador.edad;
        
        var posicion = document.createElement("div");
        posicion.className = "player-position";
        posicion.textContent = "Posición: " + jugador.posicion;
        
        var equipo = document.createElement("div");
        equipo.className = "player-team";
        equipo.textContent = "Equipo: " + jugador.equipoNombre;
        
        playerInfo.appendChild(nombre);
        playerInfo.appendChild(edad);
        playerInfo.appendChild(posicion);
        playerInfo.appendChild(equipo);
        
        // Crear el menú de edición
        var editMenu = document.createElement("div");
        editMenu.className = "edit-menu";
        editMenu.innerHTML = `
            <div class="edit-menu-form">
                <input type="text" id="edit-name-${jugador.id}" value="${jugador.nombre}" placeholder="Nombre del jugador">
                <input type="number" id="edit-age-${jugador.id}" value="${jugador.edad}" placeholder="Edad" min="1" max="100">
                <select id="edit-position-${jugador.id}">
                    <option value="Portero" ${jugador.posicion === 'Portero' ? 'selected' : ''}>Portero</option>
                    <option value="Defensa" ${jugador.posicion === 'Defensa' ? 'selected' : ''}>Defensa</option>
                    <option value="Medio" ${jugador.posicion === 'Medio' ? 'selected' : ''}>Medio</option>
                    <option value="Delantero" ${jugador.posicion === 'Delantero' ? 'selected' : ''}>Delantero</option>
                </select>
                <input type="file" id="edit-image-${jugador.id}" accept="image/*" placeholder="Cambiar imagen">
                <select id="edit-team-${jugador.id}">
                    <option value="">Selecciona un equipo</option>
                </select>
            </div>
            <div class="edit-menu-actions">
                <button type="button" class="btn-save" onclick="savePlayer(${jugador.id})">Guardar</button>
                <button type="button" class="btn-cancel" onclick="closeEditMenu(${jugador.id})">Cancelar</button>
            </div>
            <button type="button" class="btn-delete" onclick="deletePlayer(${jugador.id})">Eliminar</button>
        `;
        
        playerItem.appendChild(playerInfo);
        playerItem.appendChild(editMenu);
        playersList.appendChild(playerItem);
    });
    
    // Llenar los selects de equipos en los menús de edición
    listaJugadores.forEach(function(jugador) {
        var teamSelect = document.getElementById("edit-team-" + jugador.id);
        teamSelect.innerHTML = '<option value="">Selecciona un equipo</option>';
        equipos.forEach(function(equipo) {
            var option = document.createElement("option");
            option.value = equipo.id;
            option.textContent = equipo.nombre;
            if (equipo.id == jugador.equipoId) {
                option.selected = true;
            }
            teamSelect.appendChild(option);
        });
    });
}

// Función para alternar el menú de edición
function toggleEditMenu(element, jugador) {
    var editMenu = element.querySelector(".edit-menu");
    if (editMenu.classList.contains("active")) {
        editMenu.classList.remove("active");
        element.classList.remove("edit-active");
    } else {
        editMenu.classList.add("active");
        element.classList.add("edit-active");
    }
}

// Función para cerrar el menú de edición
function closeEditMenu(jugadorId) {
    var playersList = document.getElementById("playersList");
    var playerItems = playersList.querySelectorAll(".player-item");
    playerItems.forEach(function(item) {
        var editMenu = item.querySelector(".edit-menu");
        editMenu.classList.remove("active");
        item.classList.remove("edit-active");
    });
}

// Función para guardar cambios del jugador
function savePlayer(jugadorId) {
    var newName = document.getElementById("edit-name-" + jugadorId).value;
    var newAge = document.getElementById("edit-age-" + jugadorId).value;
    var newPosition = document.getElementById("edit-position-" + jugadorId).value;
    var newTeamId = document.getElementById("edit-team-" + jugadorId).value;
    var newImageInput = document.getElementById("edit-image-" + jugadorId);
    var file = newImageInput.files[0];

    if (!newName) {
        alert("El nombre del jugador no puede estar vacío.");
        return;
    }

    if (!newAge || newAge < 1 || newAge > 100) {
        alert("La edad debe estar entre 1 y 100.");
        return;
    }

    if (!newTeamId) {
        alert("Debe seleccionar un equipo.");
        return;
    }

    // Encontrar el jugador
    var jugador = jugadores.find(function(j) {
        return j.id == jugadorId;
    });

    // Encontrar el equipo seleccionado
    var equipoSeleccionado = equipos.find(function(equipo) {
        return equipo.id == newTeamId;
    });

    // Si hay una imagen nueva, leerla
    if (file) {
        var reader = new FileReader();
        reader.onload = function(e) {
            // Actualizar los datos del jugador con imagen nueva
            jugador.nombre = newName;
            jugador.edad = newAge;
            jugador.posicion = newPosition;
            jugador.equipoId = newTeamId;
            jugador.equipoNombre = equipoSeleccionado.nombre;
            jugador.imagen = e.target.result;

            // Volver a mostrar la lista actualizada
            mostrarJugadores(jugadores);
            closeEditMenu(jugadorId);
            alert("Jugador actualizado correctamente.");
        };
        reader.readAsDataURL(file);
    } else {
        // Actualizar los datos del jugador sin cambiar imagen
        jugador.nombre = newName;
        jugador.edad = newAge;
        jugador.posicion = newPosition;
        jugador.equipoId = newTeamId;
        jugador.equipoNombre = equipoSeleccionado.nombre;

        // Volver a mostrar la lista actualizada
        mostrarJugadores(jugadores);
        closeEditMenu(jugadorId);
        alert("Jugador actualizado correctamente.");
    }
}

// Función para eliminar un jugador
function deletePlayer(jugadorId) {
    if (confirm("¿Estás seguro de que deseas eliminar este jugador?")) {
        jugadores = jugadores.filter(function(jugador) {
            return jugador.id !== jugadorId;
        });
        mostrarJugadores(jugadores);
        alert("Jugador eliminado correctamente.");
    }
}

// Función para alternar el menú de edición de equipo
function toggleEditMenuTeam(element, equipo) {
    var editMenu = element.querySelector(".edit-menu-team");
    if (editMenu.classList.contains("active")) {
        editMenu.classList.remove("active");
        element.classList.remove("edit-active");
    } else {
        editMenu.classList.add("active");
        element.classList.add("edit-active");
    }
}

// Función para cerrar el menú de edición de equipo
function closeEditMenuTeam(equipoId) {
    var teamList = document.getElementById("teamList");
    var teamCards = teamList.querySelectorAll(".team-card");
    teamCards.forEach(function(card) {
        var editMenu = card.querySelector(".edit-menu-team");
        editMenu.classList.remove("active");
        card.classList.remove("edit-active");
    });
}

// Función para guardar cambios del equipo
function saveTeam(equipoId) {
    var newName = document.getElementById("edit-team-name-" + equipoId).value;
    var newLogoInput = document.getElementById("edit-team-logo-" + equipoId);
    var file = newLogoInput.files[0];

    if (!newName) {
        alert("El nombre del equipo no puede estar vacío.");
        return;
    }

    // Encontrar el equipo
    var equipo = equipos.find(function(e) {
        return e.id == equipoId;
    });

    // Si hay un logo nuevo, leerlo
    if (file) {
        var reader = new FileReader();
        reader.onload = function(e) {
            // Actualizar los datos del equipo con logo nuevo
            equipo.nombre = newName;
            equipo.logo = e.target.result;

            // Actualizar el nombre de los jugadores asociados
            jugadores.forEach(function(jugador) {
                if (jugador.equipoId == equipoId) {
                    jugador.equipoNombre = newName;
                }
            });

            // Volver a mostrar la lista actualizada
            mostrarEquipos(equipos);
            mostrarJugadores(jugadores);
            loadTeamsToSelect();
            closeEditMenuTeam(equipoId);
            alert("Equipo actualizado correctamente.");
        };
        reader.readAsDataURL(file);
    } else {
        // Actualizar los datos del equipo sin cambiar logo
        equipo.nombre = newName;

        // Actualizar el nombre de los jugadores asociados
        jugadores.forEach(function(jugador) {
            if (jugador.equipoId == equipoId) {
                jugador.equipoNombre = newName;
            }
        });

        // Volver a mostrar la lista actualizada
        mostrarEquipos(equipos);
        mostrarJugadores(jugadores);
        loadTeamsToSelect();
        closeEditMenuTeam(equipoId);
        alert("Equipo actualizado correctamente.");
    }
}

// Función para gestionar jugadores del equipo
function managePlayers(equipoId) {
    var equipo = equipos.find(function(e) {
        return e.id == equipoId;
    });
    var playersOfTeam = jugadores.filter(function(j) {
        return j.equipoId == equipoId;
    });

    var message = "Jugadores del equipo " + equipo.nombre + ":\n\n";
    if (playersOfTeam.length === 0) {
        message += "No hay jugadores registrados en este equipo.";
    } else {
        playersOfTeam.forEach(function(jugador, index) {
            message += (index + 1) + ". " + jugador.nombre + " - " + jugador.posicion + " - Edad: " + jugador.edad + "\n";
        });
    }
    alert(message);
}
