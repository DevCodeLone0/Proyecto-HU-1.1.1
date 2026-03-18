let currentUser = null;
let users = [];

function initAuth() {
  const storedUsers = localStorage.getItem('footballUsers');
  const storedSession = localStorage.getItem('footballCurrentUser');
  
  if (storedUsers) {
    users = JSON.parse(storedUsers);
  }
  
  if (storedSession) {
    currentUser = JSON.parse(storedSession);
    updateHeaderAuth();
    loadUserData();
  }
}

function saveUsers() {
  localStorage.setItem('footballUsers', JSON.stringify(users));
}

function saveSession() {
  if (currentUser) {
    localStorage.setItem('footballCurrentUser', JSON.stringify(currentUser));
  } else {
    localStorage.removeItem('footballCurrentUser');
  }
}

function updateHeaderAuth() {
  const headerAuth = document.getElementById('headerAuth');
  const headerUser = document.getElementById('headerUser');
  const userWelcome = document.getElementById('userWelcome');
  
  if (currentUser) {
    headerAuth.style.display = 'none';
    headerUser.style.display = 'flex';
    userWelcome.textContent = 'Hola, ' + currentUser.name;
  } else {
    headerAuth.style.display = 'flex';
    headerUser.style.display = 'none';
  }
}

function showLoginModal() {
  closeAllModals();
  document.getElementById('loginModal').classList.add('active');
}

function showRegisterModal() {
  closeAllModals();
  document.getElementById('registerModal').classList.add('active');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
  clearFormErrors();
}

function closeAllModals() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.classList.remove('active');
  });
  clearFormErrors();
}

function clearFormErrors() {
  const errorMessages = document.querySelectorAll('.error-message');
  errorMessages.forEach(msg => msg.classList.remove('active'));
}

function switchToRegister() {
  closeModal('loginModal');
  showRegisterModal();
}

function switchToLogin() {
  closeModal('registerModal');
  showLoginModal();
}

function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    currentUser = { id: user.id, name: user.name, email: user.email };
    saveSession();
    updateHeaderAuth();
    loadUserData();
    closeModal('loginModal');
    document.getElementById('loginForm').reset();
    alert('Bienvenido, ' + user.name + '!');
  } else {
    showFormError('loginForm', 'Correo o contraseña incorrectos');
  }
}

function handleRegister(event) {
  event.preventDefault();
  
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
  
  if (password !== passwordConfirm) {
    showFormError('registerForm', 'Las contraseñas no coinciden');
    return;
  }
  
  if (users.some(u => u.email === email)) {
    showFormError('registerForm', 'Este correo ya está registrado');
    return;
  }
  
  const newUser = {
    id: Date.now(),
    name: name,
    email: email,
    password: password,
    teams: [],
    players: []
  };
  
  users.push(newUser);
  saveUsers();
  
  currentUser = { id: newUser.id, name: newUser.name, email: newUser.email };
  saveSession();
  updateHeaderAuth();
  loadUserData();
  closeModal('registerModal');
  document.getElementById('registerForm').reset();
  alert('Cuenta creada exitosamente. ¡Bienvenido, ' + name + '!');
}

function showFormError(formId, message) {
  const form = document.getElementById(formId);
  let errorDiv = form.querySelector('.error-message');
  
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    form.insertBefore(errorDiv, form.firstChild);
  }
  
  errorDiv.textContent = message;
  errorDiv.classList.add('active');
}

function logout() {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    currentUser = null;
    saveSession();
    updateHeaderAuth();
    clearUserData();
    alert('Sesión cerrada correctamente.');
  }
}

function getCurrentUserData() {
  return users.find(u => u.id === currentUser.id);
}

function saveUserData() {
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  if (userIndex !== -1) {
    users[userIndex].teams = equipos;
    users[userIndex].players = jugadores;
    saveUsers();
  }
}

function loadUserData() {
  const userData = getCurrentUserData();
  if (userData) {
    equipos = userData.teams || [];
    jugadores = userData.players || [];
    mostrarEquipos(equipos);
    mostrarJugadores(jugadores);
    loadTeamsToSelect();
  }
}

function clearUserData() {
  equipos = [];
  jugadores = [];
  mostrarEquipos(equipos);
  mostrarJugadores(jugadores);
  loadTeamsToSelect();
}

function checkAuth() {
  if (!currentUser) {
    alert('Debes iniciar sesión para agregar equipos.');
    showLoginModal();
    return false;
  }
  return true;
}

let equipos = [];
let jugadores = [];

function resizeImage(file, maxWidth, maxHeight, callback) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataURL = canvas.toDataURL('image/jpeg', 0.8);
      callback(dataURL);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function addTeam() {
  if (!checkAuth()) return;
  
  const teamName = document.getElementById("teamName").value;
  const teamLogoInput = document.getElementById("teamLogo");
  const file = teamLogoInput.files[0];

  if (!teamName) {
    alert("Por favor ingrese un nombre de equipo.");
    return;
  }

  if (file) {
    resizeImage(file, 150, 150, function(dataURL) {
      const equipo = {
        id: Date.now(),
        nombre: teamName,
        logo: dataURL
      };

      equipos.push(equipo);
      saveUserData();

      document.getElementById("teamName").value = "";
      document.getElementById("teamLogo").value = "";

      mostrarEquipos(equipos);
      loadTeamsToSelect();
      alert("Equipo " + teamName + " agregado correctamente.");
    });
  } else {
    const equipo = {
      id: Date.now(),
      nombre: teamName,
      logo: ""
    };

    equipos.push(equipo);
    saveUserData();

    document.getElementById("teamName").value = "";
    document.getElementById("teamLogo").value = "";

    mostrarEquipos(equipos);
    loadTeamsToSelect();
    alert("Equipo " + teamName + " agregado correctamente.");
  }
}

function mostrarEquipos(listaEquipos) {
  const teamList = document.getElementById("teamList");
  const noResults = document.getElementById("noResults");
  
  teamList.innerHTML = "";

  if (listaEquipos.length === 0) {
    noResults.style.display = "block";
    teamList.innerHTML = "";
    return;
  }

  noResults.style.display = "none";

  listaEquipos.forEach(function(equipo) {
    const teamCard = document.createElement("div");
    teamCard.className = "team-card";
    
    const img = document.createElement("img");
    if (!equipo.logo) {
      img.src = "../assets/logo.png";
    } else {
      img.src = equipo.logo;
    }
    img.alt = "Logo de " + equipo.nombre;
    img.className = "team-logo";

    const nombre = document.createElement("h4");
    nombre.textContent = equipo.nombre;
    
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.textContent = "Editar";
    editBtn.className = "edit-btn";
    editBtn.onclick = function() {
      toggleEditMenuTeam(teamCard, equipo);
    };
    
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.textContent = "Eliminar";
    deleteBtn.className = "delete-btn";
    deleteBtn.onclick = function() {
      eliminarEquipo(equipo.id);
    };
    
    const editMenu = document.createElement("div");
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
      <button type="button" class="btn-manage-players" onclick="managePlayers(${equipo.id})">Ver Jugadores</button>
    `;
    
    teamCard.appendChild(img);
    teamCard.appendChild(nombre);
    teamCard.appendChild(editBtn);
    teamCard.appendChild(deleteBtn);
    teamCard.appendChild(editMenu);
    teamList.appendChild(teamCard);
  });
}

function mostrarTodos() {
  document.getElementById("searchTeam").value = "";
  mostrarEquipos(equipos);
}

function searchTeams() {
  const searchValue = document.getElementById("searchTeam").value.toLowerCase();
  
  if (searchValue === "") {
    mostrarEquipos(equipos);
    return;
  }

  const equiposFiltrados = equipos.filter(function(equipo) {
    return equipo.nombre.toLowerCase().includes(searchValue);
  });

  mostrarEquipos(equiposFiltrados);
}

function eliminarEquipo(equipoId) {
  const equipo = equipos.find(function(e) {
    return e.id === equipoId;
  });
  const playersOfTeam = jugadores.filter(function(jugador) {
    return jugador.equipoId === equipoId;
  });

  let message = "¿Estás seguro de que deseas eliminar el equipo '" + equipo.nombre + "'?";
  if (playersOfTeam.length > 0) {
    message += "\n\nEsto también eliminará los siguientes jugadores asociados:\n";
    playersOfTeam.forEach(function(jugador, index) {
      message += (index + 1) + ". " + jugador.nombre + "\n";
    });
  }

  if (confirm(message)) {
    equipos = equipos.filter(function(equipo) {
      return equipo.id !== equipoId;
    });

    jugadores = jugadores.filter(function(jugador) {
      return jugador.equipoId !== equipoId;
    });

    saveUserData();
    mostrarEquipos(equipos);
    mostrarJugadores(jugadores);
    loadTeamsToSelect();

    const playerTeamSelect = document.getElementById("playerTeam");
    if (playerTeamSelect && playerTeamSelect.value === equipoId.toString()) {
      playerTeamSelect.value = "";
    }

    alert("Equipo y sus jugadores eliminados correctamente.");
  }
}

function loadTeamsToSelect() {
  const playerTeamSelect = document.getElementById("playerTeam");
  if (!playerTeamSelect) return;
  
  playerTeamSelect.innerHTML = '<option value="">Selecciona un equipo</option>';
  
  equipos.forEach(function(equipo) {
    const option = document.createElement("option");
    option.value = equipo.id;
    option.textContent = equipo.nombre;
    playerTeamSelect.appendChild(option);
  });
}

function addPlayer() {
  if (!checkAuth()) return;
  
  const playerName = document.getElementById("playerName").value;
  const playerAge = document.getElementById("playerAge").value;
  const playerPosition = document.getElementById("playerPosition").value;
  const playerTeam = parseInt(document.getElementById("playerTeam").value);
  const playerImageInput = document.getElementById("playerImage");
  const file = playerImageInput.files[0];

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

  const equipoSeleccionado = equipos.find(function(equipo) {
    return equipo.id === playerTeam;
  });

  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const jugador = {
        id: Date.now(),
        nombre: playerName,
        edad: playerAge,
        posicion: playerPosition,
        equipoId: playerTeam,
        equipoNombre: equipoSeleccionado.nombre,
        imagen: e.target.result
      };

      jugadores.push(jugador);
      saveUserData();

      document.getElementById("playerName").value = "";
      document.getElementById("playerAge").value = "";
      document.getElementById("playerPosition").value = "";
      document.getElementById("playerTeam").value = "";
      document.getElementById("playerImage").value = "";

      mostrarJugadores(jugadores);
      alert("Jugador " + playerName + " agregado correctamente al equipo " + equipoSeleccionado.nombre);
    };
    reader.readAsDataURL(file);
  } else {
    const jugador = {
      id: Date.now(),
      nombre: playerName,
      edad: playerAge,
      posicion: playerPosition,
      equipoId: playerTeam,
      equipoNombre: equipoSeleccionado.nombre
    };

    jugadores.push(jugador);
    saveUserData();

    document.getElementById("playerName").value = "";
    document.getElementById("playerAge").value = "";
    document.getElementById("playerPosition").value = "";
    document.getElementById("playerTeam").value = "";
    document.getElementById("playerImage").value = "";

    mostrarJugadores(jugadores);
    alert("Jugador " + playerName + " agregado correctamente al equipo " + equipoSeleccionado.nombre);
  }
}

function mostrarJugadores(listaJugadores) {
  const playersList = document.getElementById("playersList");
  const noPlayersResults = document.getElementById("noPlayersResults");
  
  if (!playersList) return;
  
  playersList.innerHTML = "";

  if (listaJugadores.length === 0) {
    noPlayersResults.style.display = "block";
    playersList.innerHTML = "";
    return;
  }

  noPlayersResults.style.display = "none";

  listaJugadores.forEach(function(jugador) {
    const playerItem = document.createElement("div");
    playerItem.className = "player-item";
    playerItem.onclick = function(e) {
      if (!e.target.closest(".edit-menu")) {
        toggleEditMenu(playerItem, jugador);
      }
    };
    
    const playerInfo = document.createElement("div");
    playerInfo.className = "player-info";
    
    if (jugador.imagen) {
      const img = document.createElement("img");
      img.src = jugador.imagen;
      img.alt = "Foto de " + jugador.nombre;
      img.className = "player-photo";
      playerInfo.appendChild(img);
    }
    
    const nombre = document.createElement("div");
    nombre.className = "player-name";
    nombre.textContent = jugador.nombre;
    
    const edad = document.createElement("div");
    edad.className = "player-edad";
    edad.textContent = "Edad: " + jugador.edad;
    
    const posicion = document.createElement("div");
    posicion.className = "player-position";
    posicion.textContent = "Posición: " + jugador.posicion;
    
    const equipo = document.createElement("div");
    equipo.className = "player-team";
    equipo.textContent = "Equipo: " + jugador.equipoNombre;
    
    playerInfo.appendChild(nombre);
    playerInfo.appendChild(edad);
    playerInfo.appendChild(posicion);
    playerInfo.appendChild(equipo);
    
    const editMenu = document.createElement("div");
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
  
  listaJugadores.forEach(function(jugador) {
    const teamSelect = document.getElementById("edit-team-" + jugador.id);
    if (teamSelect) {
      teamSelect.innerHTML = '<option value="">Selecciona un equipo</option>';
      equipos.forEach(function(equipo) {
        const option = document.createElement("option");
        option.value = equipo.id;
        option.textContent = equipo.nombre;
        if (equipo.id === jugador.equipoId) {
          option.selected = true;
        }
        teamSelect.appendChild(option);
      });
    }
  });
}

function toggleEditMenu(element, jugador) {
  const editMenu = element.querySelector(".edit-menu");
  if (editMenu.classList.contains("active")) {
    editMenu.classList.remove("active");
    element.classList.remove("edit-active");
  } else {
    editMenu.classList.add("active");
    element.classList.add("edit-active");
  }
}

function closeEditMenu(jugadorId) {
  const playersList = document.getElementById("playersList");
  if (!playersList) return;
  
  const playerItems = playersList.querySelectorAll(".player-item");
  playerItems.forEach(function(item) {
    const editMenu = item.querySelector(".edit-menu");
    editMenu.classList.remove("active");
    item.classList.remove("edit-active");
  });
}

function savePlayer(jugadorId) {
  const newName = document.getElementById("edit-name-" + jugadorId).value;
  const newAge = document.getElementById("edit-age-" + jugadorId).value;
  const newPosition = document.getElementById("edit-position-" + jugadorId).value;
  const newTeamId = parseInt(document.getElementById("edit-team-" + jugadorId).value);
  const newImageInput = document.getElementById("edit-image-" + jugadorId);
  const file = newImageInput.files[0];

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

  const jugador = jugadores.find(function(j) {
    return j.id === jugadorId;
  });

  const equipoSeleccionado = equipos.find(function(equipo) {
    return equipo.id === newTeamId;
  });

  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      jugador.nombre = newName;
      jugador.edad = newAge;
      jugador.posicion = newPosition;
      jugador.equipoId = newTeamId;
      jugador.equipoNombre = equipoSeleccionado.nombre;
      jugador.imagen = e.target.result;

      saveUserData();
      mostrarJugadores(jugadores);
      closeEditMenu(jugadorId);
      alert("Jugador actualizado correctamente.");
    };
    reader.readAsDataURL(file);
  } else {
    jugador.nombre = newName;
    jugador.edad = newAge;
    jugador.posicion = newPosition;
    jugador.equipoId = newTeamId;
    jugador.equipoNombre = equipoSeleccionado.nombre;

    saveUserData();
    mostrarJugadores(jugadores);
    closeEditMenu(jugadorId);
    alert("Jugador actualizado correctamente.");
  }
}

function deletePlayer(jugadorId) {
  if (confirm("¿Estás seguro de que deseas eliminar este jugador?")) {
    jugadores = jugadores.filter(function(jugador) {
      return jugador.id !== jugadorId;
    });
    saveUserData();
    mostrarJugadores(jugadores);
    alert("Jugador eliminado correctamente.");
  }
}

function toggleEditMenuTeam(element, equipo) {
  const editMenu = element.querySelector(".edit-menu-team");
  if (editMenu.classList.contains("active")) {
    editMenu.classList.remove("active");
    element.classList.remove("edit-active");
  } else {
    editMenu.classList.add("active");
    element.classList.add("edit-active");
  }
}

function closeEditMenuTeam(equipoId) {
  const teamList = document.getElementById("teamList");
  if (!teamList) return;
  
  const teamCards = teamList.querySelectorAll(".team-card");
  teamCards.forEach(function(card) {
    const editMenu = card.querySelector(".edit-menu-team");
    editMenu.classList.remove("active");
    card.classList.remove("edit-active");
  });
}

function saveTeam(equipoId) {
  const newName = document.getElementById("edit-team-name-" + equipoId).value;
  const newLogoInput = document.getElementById("edit-team-logo-" + equipoId);
  const file = newLogoInput.files[0];

  if (!newName) {
    alert("El nombre del equipo no puede estar vacío.");
    return;
  }

  const equipo = equipos.find(function(e) {
    return e.id === equipoId;
  });

  if (file) {
    resizeImage(file, 150, 150, function(dataURL) {
      equipo.nombre = newName;
      equipo.logo = dataURL;

      jugadores.forEach(function(jugador) {
        if (jugador.equipoId === equipoId) {
          jugador.equipoNombre = newName;
        }
      });

      saveUserData();
      mostrarEquipos(equipos);
      mostrarJugadores(jugadores);
      loadTeamsToSelect();
      closeEditMenuTeam(equipoId);
      alert("Equipo actualizado correctamente.");
    });
  } else {
    equipo.nombre = newName;

    jugadores.forEach(function(jugador) {
      if (jugador.equipoId === equipoId) {
        jugador.equipoNombre = newName;
      }
    });

    saveUserData();
    mostrarEquipos(equipos);
    mostrarJugadores(jugadores);
    loadTeamsToSelect();
    closeEditMenuTeam(equipoId);
    alert("Equipo actualizado correctamente.");
  }
}

function managePlayers(equipoId) {
  const equipo = equipos.find(function(e) {
    return e.id === equipoId;
  });
  const playersOfTeam = jugadores.filter(function(j) {
    return j.equipoId === equipoId;
  });

  let message = "Jugadores del equipo " + equipo.nombre + ":\n\n";
  if (playersOfTeam.length === 0) {
    message += "No hay jugadores registrados en este equipo.";
  } else {
    playersOfTeam.forEach(function(jugador, index) {
      message += (index + 1) + ". " + jugador.nombre + " - " + jugador.posicion + " - Edad: " + jugador.edad + "\n";
    });
  }
  alert(message);
}

window.onclick = function(event) {
  if (event.target.classList.contains('modal')) {
    closeAllModals();
  }
};

document.addEventListener('DOMContentLoaded', initAuth);
