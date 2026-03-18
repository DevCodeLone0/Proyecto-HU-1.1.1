const SUPABASE_URL = 'https://ocuoxlfltaelrojdkbdf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_VD9fF-BmNxuxuyhuBKT_UA_plcEV7TF';

const HEADERS = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json'
};

let currentUser = null;
let equipos = [];
let jugadores = [];

async function supabaseFetch(endpoint, options = {}) {
  const { method = 'GET', body, filters } = options;
  
  let url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  if (filters) {
    url += '?' + filters;
  }
  
  const config = {
    method,
    headers: {
      ...HEADERS,
      ...options.headers
    }
  };
  
  if (body) {
    config.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, config);
  return response;
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function initAuth() {
  const storedSession = localStorage.getItem('footballCurrentUser');
  const storedUserId = localStorage.getItem('footballUserId');
  
  if (storedSession) {
    currentUser = JSON.parse(storedSession);
    updateHeaderAuth();
    loadUserData();
  }
}

function saveSession() {
  if (currentUser) {
    localStorage.setItem('footballCurrentUser', JSON.stringify(currentUser));
    localStorage.setItem('footballUserId', currentUser.id);
  } else {
    localStorage.removeItem('footballCurrentUser');
    localStorage.removeItem('footballUserId');
  }
}

function updateHeaderAuth() {
  const headerAuth = document.getElementById('headerAuth');
  const headerUser = document.getElementById('headerUser');
  const userWelcome = document.getElementById('userWelcome');
  
  if (currentUser) {
    headerAuth.style.display = 'none';
    headerUser.style.display = 'flex';
    userWelcome.textContent = `Hola, ${escapeHtml(currentUser.name)}`;
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

async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  
  try {
    const response = await supabaseFetch('users', {
      filters: `email=eq.${encodeURIComponent(email)}&password=eq.${encodeURIComponent(password)}`
    });
    const users = await response.json();
    
    if (!users || users.length === 0) {
      showFormError('loginForm', 'Credenciales inválidas');
      return;
    }
    
    const user = users[0];
    currentUser = { id: user.id, name: user.name, email: user.email };
    saveSession();
    updateHeaderAuth();
    await loadUserData();
    closeModal('loginModal');
    document.getElementById('loginForm').reset();
    showToast(`Bienvenido, ${escapeHtml(user.name)}!`, 'success');
  } catch (error) {
    showFormError('loginForm', 'Error al iniciar sesión');
  }
}

async function handleRegister(event) {
  event.preventDefault();
  
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
  
  if (password !== passwordConfirm) {
    showFormError('registerForm', 'Las contraseñas no coinciden');
    return;
  }
  
  if (password.length < 6) {
    showFormError('registerForm', 'La contraseña debe tener al menos 6 caracteres');
    return;
  }
  
  try {
    const response = await supabaseFetch('users', {
      filters: `email=eq.${encodeURIComponent(email)}`
    });
    const existing = await response.json();
    
    if (existing && existing.length > 0) {
      showFormError('registerForm', 'Este correo ya está registrado');
      return;
    }
    
    const postResponse = await supabaseFetch('users', {
      method: 'POST',
      body: { name, email, password },
      headers: { 'Prefer': 'return=representation' }
    });

    if (!postResponse.ok) {
      const errorText = await postResponse.text();
      showFormError('registerForm', `Error: ${errorText}`);
      return;
    }

    const newUser = await postResponse.json();
    const user = Array.isArray(newUser) ? newUser[0] : newUser;
    
    currentUser = { id: user.id, name: user.name, email: user.email };
    saveSession();
    updateHeaderAuth();
    await loadUserData();
    closeModal('registerModal');
    document.getElementById('registerForm').reset();
    showToast(`Cuenta creada exitosamente. ¡Bienvenido, ${escapeHtml(name)}!`, 'success');
  } catch (error) {
    showFormError('registerForm', 'Error al crear cuenta');
  }
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
    showToast('Sesión cerrada correctamente.', 'info');
  }
}

function checkAuth() {
  if (!currentUser) {
    showToast('Debes iniciar sesión para agregar equipos.', 'error');
    showLoginModal();
    return false;
  }
  return true;
}

async function loadUserData() {
  await Promise.all([loadTeams(), loadPlayers()]);
}

async function loadTeams() {
  const userId = localStorage.getItem('footballUserId');
  if (!userId) return;
  
  try {
    const response = await supabaseFetch('teams', {
      filters: `user_id=eq.${userId}&order=created_at.desc`
    });
    const teams = await response.json();
    
    equipos = teams || [];
    mostrarEquipos(equipos);
    loadTeamsToSelect();
  } catch (error) {
    showToast('Error al cargar equipos', 'error');
  }
}

async function loadPlayers() {
  const userId = localStorage.getItem('footballUserId');
  if (!userId) return;
  
  try {
    const response = await supabaseFetch('players', {
      filters: `user_id=eq.${userId}&order=created_at.desc`
    });
    const players = await response.json();
    
    jugadores = players || [];
    mostrarJugadores(jugadores);
  } catch (error) {
    showToast('Error al cargar jugadores', 'error');
  }
}

function clearUserData() {
  equipos = [];
  jugadores = [];
  mostrarEquipos(equipos);
  mostrarJugadores(jugadores);
  loadTeamsToSelect();
}

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

async function addTeam() {
  if (!checkAuth()) return;
  
  const teamName = document.getElementById("teamName").value.trim();
  const teamLogoInput = document.getElementById("teamLogo");
  const file = teamLogoInput.files[0];
  const userId = localStorage.getItem('footballUserId');

  if (!teamName) {
    showToast('Por favor ingrese un nombre de equipo.', 'error');
    return;
  }

  const processTeam = async (logoData = null) => {
    try {
      const response = await supabaseFetch('teams', {
        method: 'POST',
        body: {
          user_id: userId,
          name: teamName,
          ...(logoData && { logo: logoData })
        },
        headers: { 'Prefer': 'return=representation' }
      });

      if (!response.ok) {
        showToast('Error al crear equipo', 'error');
        return;
      }

      const newTeam = await response.json();
      const equipo = Array.isArray(newTeam) ? newTeam[0] : newTeam;
      equipos.unshift(equipo);

      document.getElementById("teamName").value = "";
      document.getElementById("teamLogo").value = "";

      mostrarEquipos(equipos);
      loadTeamsToSelect();
      showToast(`Equipo "${escapeHtml(teamName)}" agregado correctamente.`, 'success');
    } catch (error) {
      showToast('Error al crear equipo', 'error');
    }
  };

  if (file) {
    resizeImage(file, 150, 150, async function(dataURL) {
      await processTeam(dataURL);
    });
  } else {
    await processTeam();
  }
}

function mostrarEquipos(listaEquipos) {
  const teamList = document.getElementById("teamList");
  const noResults = document.getElementById("noResults");
  
  teamList.innerHTML = "";

  if (!listaEquipos || listaEquipos.length === 0) {
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
    img.alt = `Logo de ${escapeHtml(equipo.name)}`;
    img.className = "team-logo";

    const nombre = document.createElement("h4");
    nombre.textContent = equipo.name;
    
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
        <input type="text" id="edit-team-name-${equipo.id}" value="${escapeHtml(equipo.name)}" placeholder="Nombre del equipo">
        <input type="file" id="edit-team-logo-${equipo.id}" accept="image/*" placeholder="Cambiar logo">
      </div>
      <div class="edit-menu-actions">
        <button type="button" class="btn-save" onclick="saveTeam('${equipo.id}')">Guardar</button>
        <button type="button" class="btn-cancel" onclick="closeEditMenuTeam('${equipo.id}')">Cancelar</button>
      </div>
      <button type="button" class="btn-manage-players" onclick="managePlayers('${equipo.id}')">Ver Jugadores</button>
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
    return equipo.name.toLowerCase().includes(searchValue);
  });

  mostrarEquipos(equiposFiltrados);
}

async function eliminarEquipo(equipoId) {
  const equipo = equipos.find(function(e) {
    return e.id === equipoId;
  });
  const playersOfTeam = jugadores.filter(function(jugador) {
    return jugador.team_id === equipoId;
  });

  let message = `¿Estás seguro de que deseas eliminar el equipo "${escapeHtml(equipo.name)}"?`;
  if (playersOfTeam.length > 0) {
    message += "\n\nEsto también eliminará los siguientes jugadores asociados:\n";
    playersOfTeam.forEach(function(jugador, index) {
      message += `${index + 1}. ${escapeHtml(jugador.name)}\n`;
    });
  }

  if (confirm(message)) {
    try {
      await supabaseFetch('players', {
        method: 'DELETE',
        filters: `team_id=eq.${equipoId}`
      });
      
      await supabaseFetch('teams', {
        method: 'DELETE',
        filters: `id=eq.${equipoId}`
      });

      equipos = equipos.filter(function(equipo) {
        return equipo.id !== equipoId;
      });

      jugadores = jugadores.filter(function(jugador) {
        return jugador.team_id !== equipoId;
      });

      mostrarEquipos(equipos);
      mostrarJugadores(jugadores);
      loadTeamsToSelect();

      const playerTeamSelect = document.getElementById("playerTeam");
      if (playerTeamSelect && playerTeamSelect.value === equipoId.toString()) {
        playerTeamSelect.value = "";
      }

      showToast('Equipo y sus jugadores eliminados correctamente.', 'success');
    } catch (error) {
      showToast('Error al eliminar equipo', 'error');
    }
  }
}

function loadTeamsToSelect() {
  const playerTeamSelect = document.getElementById("playerTeam");
  if (!playerTeamSelect) return;
  
  playerTeamSelect.innerHTML = '<option value="">Selecciona un equipo</option>';
  
  equipos.forEach(function(equipo) {
    const option = document.createElement("option");
    option.value = equipo.id;
    option.textContent = equipo.name;
    playerTeamSelect.appendChild(option);
  });
}

async function addPlayer() {
  if (!checkAuth()) return;
  
  const playerName = document.getElementById("playerName").value.trim();
  const playerAge = document.getElementById("playerAge").value;
  const playerPosition = document.getElementById("playerPosition").value;
  const playerTeam = document.getElementById("playerTeam").value;
  const playerImageInput = document.getElementById("playerImage");
  const file = playerImageInput.files[0];
  const userId = localStorage.getItem('footballUserId');

  if (!playerName) {
    showToast('Por favor ingrese el nombre del jugador.', 'error');
    return;
  }

  if (!playerAge || playerAge < 1 || playerAge > 100) {
    showToast('Por favor ingrese una edad válida (1-100).', 'error');
    return;
  }

  if (!playerPosition) {
    showToast('Por favor seleccione una posición.', 'error');
    return;
  }

  if (!playerTeam) {
    showToast('Por favor seleccione un equipo.', 'error');
    return;
  }

  const equipoSeleccionado = equipos.find(function(equipo) {
    return equipo.id === playerTeam;
  });

  const processPlayer = async (imageData = null) => {
    try {
      const response = await supabaseFetch('players', {
        method: 'POST',
        body: {
          user_id: userId,
          team_id: playerTeam,
          name: playerName,
          age: playerAge,
          position: playerPosition,
          team_name: equipoSeleccionado.name,
          ...(imageData && { image: imageData })
        },
        headers: { 'Prefer': 'return=representation' }
      });

      const newPlayer = await response.json();
      const jugador = Array.isArray(newPlayer) ? newPlayer[0] : newPlayer;
      jugadores.unshift(jugador);

      document.getElementById("playerName").value = "";
      document.getElementById("playerAge").value = "";
      document.getElementById("playerPosition").value = "";
      document.getElementById("playerTeam").value = "";
      document.getElementById("playerImage").value = "";

      mostrarJugadores(jugadores);
      showToast(`Jugador "${escapeHtml(playerName)}" agregado correctamente al equipo ${escapeHtml(equipoSeleccionado.name)}`, 'success');
    } catch (error) {
      showToast('Error al crear jugador', 'error');
    }
  };

  if (file) {
    resizeImage(file, 150, 150, async function(dataURL) {
      await processPlayer(dataURL);
    });
  } else {
    await processPlayer();
  }
}

function mostrarJugadores(listaJugadores) {
  const playersList = document.getElementById("playersList");
  const noPlayersResults = document.getElementById("noPlayersResults");
  
  if (!playersList) return;
  
  playersList.innerHTML = "";

  if (!listaJugadores || listaJugadores.length === 0) {
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
    
    if (jugador.image) {
      const img = document.createElement("img");
      img.src = jugador.image;
      img.alt = `Foto de ${escapeHtml(jugador.name)}`;
      img.className = "player-photo";
      playerInfo.appendChild(img);
    }
    
    const nombre = document.createElement("div");
    nombre.className = "player-name";
    nombre.textContent = jugador.name;
    
    const edad = document.createElement("div");
    edad.className = "player-edad";
    edad.textContent = `Edad: ${jugador.age}`;
    
    const posicion = document.createElement("div");
    posicion.className = "player-position";
    posicion.textContent = `Posición: ${jugador.position}`;
    
    const equipo = document.createElement("div");
    equipo.className = "player-team";
    equipo.textContent = `Equipo: ${escapeHtml(jugador.team_name)}`;
    
    playerInfo.appendChild(nombre);
    playerInfo.appendChild(edad);
    playerInfo.appendChild(posicion);
    playerInfo.appendChild(equipo);
    
    const editMenu = document.createElement("div");
    editMenu.className = "edit-menu";
    editMenu.innerHTML = `
      <div class="edit-menu-form">
        <input type="text" id="edit-name-${jugador.id}" value="${escapeHtml(jugador.name)}" placeholder="Nombre del jugador">
        <input type="number" id="edit-age-${jugador.id}" value="${jugador.age}" placeholder="Edad" min="1" max="100">
        <select id="edit-position-${jugador.id}">
          <option value="Portero" ${jugador.position === 'Portero' ? 'selected' : ''}>Portero</option>
          <option value="Defensa" ${jugador.position === 'Defensa' ? 'selected' : ''}>Defensa</option>
          <option value="Medio" ${jugador.position === 'Medio' ? 'selected' : ''}>Medio</option>
          <option value="Delantero" ${jugador.position === 'Delantero' ? 'selected' : ''}>Delantero</option>
        </select>
        <input type="file" id="edit-image-${jugador.id}" accept="image/*" placeholder="Cambiar imagen">
        <select id="edit-team-${jugador.id}">
          <option value="">Selecciona un equipo</option>
        </select>
      </div>
      <div class="edit-menu-actions">
        <button type="button" class="btn-save" onclick="savePlayer('${jugador.id}')">Guardar</button>
        <button type="button" class="btn-cancel" onclick="closeEditMenu('${jugador.id}')">Cancelar</button>
      </div>
      <button type="button" class="btn-delete" onclick="deletePlayer('${jugador.id}')">Eliminar</button>
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
        option.textContent = equipo.name;
        if (equipo.id === jugador.team_id) {
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

async function savePlayer(jugadorId) {
  const newName = document.getElementById("edit-name-" + jugadorId).value.trim();
  const newAge = document.getElementById("edit-age-" + jugadorId).value;
  const newPosition = document.getElementById("edit-position-" + jugadorId).value;
  const newTeamId = document.getElementById("edit-team-" + jugadorId).value;
  const newImageInput = document.getElementById("edit-image-" + jugadorId);
  const file = newImageInput.files[0];

  if (!newName) {
    showToast('El nombre del jugador no puede estar vacío.', 'error');
    return;
  }

  if (!newAge || newAge < 1 || newAge > 100) {
    showToast('La edad debe estar entre 1 y 100.', 'error');
    return;
  }

  if (!newTeamId) {
    showToast('Debe seleccionar un equipo.', 'error');
    return;
  }

  const equipoSeleccionado = equipos.find(function(equipo) {
    return equipo.id === newTeamId;
  });

  const updateData = {
    name: newName,
    age: newAge,
    position: newPosition,
    team_id: newTeamId,
    team_name: equipoSeleccionado.name
  };

  if (file) {
    resizeImage(file, 150, 150, async function(dataURL) {
      updateData.image = dataURL;
      await performPlayerUpdate(jugadorId, updateData);
    });
  } else {
    await performPlayerUpdate(jugadorId, updateData);
  }
}

async function performPlayerUpdate(jugadorId, updateData) {
  try {
    const userId = localStorage.getItem('footballUserId');
    
    await supabaseFetch('players', {
      method: 'PATCH',
      filters: `id=eq.${jugadorId}&user_id=eq.${userId}`,
      body: updateData
    });

    const index = jugadores.findIndex(j => j.id === jugadorId);
    if (index !== -1) {
      jugadores[index] = { ...jugadores[index], ...updateData };
    }

    mostrarJugadores(jugadores);
    closeEditMenu(jugadorId);
    showToast('Jugador actualizado correctamente.', 'success');
  } catch (error) {
    showToast('Error al actualizar jugador', 'error');
  }
}

async function deletePlayer(jugadorId) {
  if (confirm("¿Estás seguro de que deseas eliminar este jugador?")) {
    try {
      await supabaseFetch('players', {
        method: 'DELETE',
        filters: `id=eq.${jugadorId}`
      });

      jugadores = jugadores.filter(function(jugador) {
        return jugador.id !== jugadorId;
      });
      mostrarJugadores(jugadores);
      showToast('Jugador eliminado correctamente.', 'success');
    } catch (error) {
      showToast('Error al eliminar jugador', 'error');
    }
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

async function saveTeam(equipoId) {
  const newName = document.getElementById("edit-team-name-" + equipoId).value.trim();
  const newLogoInput = document.getElementById("edit-team-logo-" + equipoId);
  const file = newLogoInput.files[0];

  if (!newName) {
    showToast('El nombre del equipo no puede estar vacío.', 'error');
    return;
  }

  const updateData = { name: newName };

  if (file) {
    resizeImage(file, 150, 150, async function(dataURL) {
      updateData.logo = dataURL;
      await performTeamUpdate(equipoId, updateData);
    });
  } else {
    await performTeamUpdate(equipoId, updateData);
  }
}

async function performTeamUpdate(equipoId, updateData) {
  try {
    const userId = localStorage.getItem('footballUserId');
    
    await supabaseFetch('teams', {
      method: 'PATCH',
      filters: `id=eq.${equipoId}&user_id=eq.${userId}`,
      body: updateData
    });

    if (updateData.name) {
      await supabaseFetch('players', {
        method: 'PATCH',
        filters: `team_id=eq.${equipoId}&user_id=eq.${userId}`,
        body: { team_name: updateData.name }
      });
      
      jugadores.forEach(function(jugador) {
        if (jugador.team_id === equipoId) {
          jugador.team_name = updateData.name;
        }
      });
    }

    const index = equipos.findIndex(e => e.id === equipoId);
    if (index !== -1) {
      equipos[index] = { ...equipos[index], ...updateData };
    }

    mostrarEquipos(equipos);
    mostrarJugadores(jugadores);
    loadTeamsToSelect();
    closeEditMenuTeam(equipoId);
    showToast('Equipo actualizado correctamente.', 'success');
  } catch (error) {
    showToast('Error al actualizar equipo', 'error');
  }
}

function managePlayers(equipoId) {
  const equipo = equipos.find(function(e) {
    return e.id === equipoId;
  });
  const playersOfTeam = jugadores.filter(function(j) {
    return j.team_id === equipoId;
  });

  let message = `Jugadores del equipo ${escapeHtml(equipo.name)}:\n\n`;
  if (playersOfTeam.length === 0) {
    message += "No hay jugadores registrados en este equipo.";
  } else {
    playersOfTeam.forEach(function(jugador, index) {
      message += `${index + 1}. ${escapeHtml(jugador.name)} - ${jugador.position} - Edad: ${jugador.age}\n`;
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
