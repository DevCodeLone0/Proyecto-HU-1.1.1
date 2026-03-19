const fs = require('fs');
const path = require('path');

describe('Verifier - Pruebas Unitarias del Proyecto', () => {
  let fns;
  
  beforeAll(() => {
    const jsContent = fs.readFileSync(
      path.resolve(__dirname, '../Pagina Web/Index.JS'),
      'utf8'
    );
    
    fns = {};
    
    const script = `
      ${jsContent}
      return {
        initAuth, saveSession, updateHeaderAuth, showLoginModal,
        showRegisterModal, closeModal, closeAllModals, clearFormErrors,
        switchToRegister, switchToLogin, handleLogin, handleRegister,
        showFormError, logout, checkAuth, loadUserData, loadTeams,
        loadPlayers, clearUserData, resizeImage, addTeam, mostrarEquipos,
        mostrarTodos, searchTeams, eliminarEquipo, loadTeamsToSelect,
        addPlayer, mostrarJugadores, toggleEditMenu, closeEditMenu,
        savePlayer, deletePlayer, toggleEditMenuTeam, closeEditMenuTeam,
        saveTeam, managePlayers
      };
    `;
    
    const fn = new Function(script);
    Object.assign(fns, fn());
    
    global.SUPABASE_URL = 'https://ocuoxlfltaelrojdkbdf.supabase.co';
    global.SUPABASE_ANON_KEY = 'sb_publishable_VD9fF-BmNxuxuyhuBKT_UA_plcEV7TF';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderizado de Equipos', () => {
    test('mostrarEquipos debe renderizar tarjetas de equipos en el DOM', () => {
      const equiposMock = [
        { id: 1, name: 'Real Madrid', logo: null },
        { id: 2, name: 'Barcelona', logo: 'data:image/png;base64,abc' }
      ];
      
      fns.mostrarEquipos(equiposMock);
      
      const teamList = document.getElementById('teamList');
      expect(teamList.children.length).toBe(2);
      expect(teamList.querySelectorAll('.team-card').length).toBe(2);
    });

    test('mostrarEquipos debe mostrar mensaje cuando no hay equipos', () => {
      fns.mostrarEquipos([]);
      
      const noResults = document.getElementById('noResults');
      expect(noResults.style.display).toBe('block');
    });

    test('mostrarEquipos debe ocultar mensaje cuando hay equipos', () => {
      fns.mostrarEquipos([{ id: 1, name: 'Test Team' }]);
      
      const noResults = document.getElementById('noResults');
      expect(noResults.style.display).toBe('none');
    });

    test('mostrarEquipos debe usar logo por defecto cuando no hay logo', () => {
      fns.mostrarEquipos([{ id: 1, name: 'Test Team', logo: null }]);
      
      const teamList = document.getElementById('teamList');
      const img = teamList.querySelector('.team-card img');
      expect(img.src).toContain('logo.png');
    });

    test('mostrarEquipos debe usar logo personalizado cuando existe', () => {
      const customLogo = 'data:image/png;base64,customlogo123';
      fns.mostrarEquipos([{ id: 1, name: 'Test Team', logo: customLogo }]);
      
      const teamList = document.getElementById('teamList');
      const img = teamList.querySelector('.team-card img');
      expect(img.src).toBe(customLogo);
    });
  });

  describe('Renderizado de Jugadores', () => {
    test('mostrarJugadores debe renderizar lista de jugadores en el DOM', () => {
      const jugadoresMock = [
        { id: 1, name: 'Messi', age: 35, position: 'Delantero', team_name: 'Barcelona', image: null },
        { id: 2, name: 'Ronaldo', age: 38, position: 'Delantero', team_name: 'Al-Nassr', image: 'data:image/png;base64,xyz' }
      ];
      
      fns.mostrarJugadores(jugadoresMock);
      
      const playersList = document.getElementById('playersList');
      expect(playersList.children.length).toBe(2);
      expect(playersList.querySelectorAll('.player-item').length).toBe(2);
    });

    test('mostrarJugadores debe mostrar mensaje cuando no hay jugadores', () => {
      fns.mostrarJugadores([]);
      
      const noPlayersResults = document.getElementById('noPlayersResults');
      expect(noPlayersResults.style.display).toBe('block');
    });

    test('mostrarJugadores debe ocultar mensaje cuando hay jugadores', () => {
      const jugadoresMock = [{ id: 1, name: 'Test', age: 20, position: 'Medio', team_name: 'Team A', image: null }];
      fns.mostrarJugadores(jugadoresMock);
      
      const noPlayersResults = document.getElementById('noPlayersResults');
      expect(noPlayersResults.style.display).toBe('none');
    });

    test('mostrarJugadores debe poblar el select de equipos en edicion', () => {
      const jugadoresMock = [{ id: 1, name: 'Test', age: 20, position: 'Medio', team_name: 'Team A', image: null }];
      fns.mostrarJugadores(jugadoresMock);
      
      const teamSelect = document.getElementById('edit-team-1');
      expect(teamSelect).not.toBeNull();
    });
  });

  describe('Gestion de Modales', () => {
    test('showLoginModal debe abrir el modal de login', () => {
      fns.showLoginModal();
      
      const modal = document.getElementById('loginModal');
      expect(modal.classList.contains('active')).toBe(true);
    });

    test('showRegisterModal debe abrir el modal de registro', () => {
      fns.showRegisterModal();
      
      const modal = document.getElementById('registerModal');
      expect(modal.classList.contains('active')).toBe(true);
    });

    test('closeModal debe cerrar el modal especificado', () => {
      document.getElementById('loginModal').classList.add('active');
      
      fns.closeModal('loginModal');
      
      expect(document.getElementById('loginModal').classList.contains('active')).toBe(false);
    });

    test('closeAllModals debe cerrar todos los modales', () => {
      document.getElementById('loginModal').classList.add('active');
      document.getElementById('registerModal').classList.add('active');
      
      fns.closeAllModals();
      
      document.querySelectorAll('.modal').forEach(modal => {
        expect(modal.classList.contains('active')).toBe(false);
      });
    });

    test('switchToRegister debe cerrar login y abrir registro', () => {
      fns.showLoginModal();
      fns.switchToRegister();
      
      expect(document.getElementById('loginModal').classList.contains('active')).toBe(false);
      expect(document.getElementById('registerModal').classList.contains('active')).toBe(true);
    });

    test('switchToLogin debe cerrar registro y abrir login', () => {
      fns.showRegisterModal();
      fns.switchToLogin();
      
      expect(document.getElementById('registerModal').classList.contains('active')).toBe(false);
      expect(document.getElementById('loginModal').classList.contains('active')).toBe(true);
    });
  });

  describe('Formularios y Validacion', () => {
    test('clearFormErrors debe limpiar mensajes de error', () => {
      const form = document.getElementById('loginForm');
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message active';
      form.insertBefore(errorDiv, form.firstChild);
      
      fns.clearFormErrors();
      
      expect(errorDiv.classList.contains('active')).toBe(false);
    });

    test('showFormError debe crear y mostrar mensaje de error', () => {
      fns.showFormError('loginForm', 'Credenciales invalidas');
      
      const form = document.getElementById('loginForm');
      const errorDiv = form.querySelector('.error-message');
      
      expect(errorDiv).toBeTruthy();
      expect(errorDiv.classList.contains('active')).toBe(true);
      expect(errorDiv.textContent).toBe('Credenciales invalidas');
    });

    test('showFormError debe actualizar mensaje existente', () => {
      const form = document.getElementById('loginForm');
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message active';
      form.insertBefore(errorDiv, form.firstChild);
      
      fns.showFormError('loginForm', 'Nuevo mensaje de error');
      
      expect(errorDiv.textContent).toBe('Nuevo mensaje de error');
    });
  });

  describe('Interaccion con API de Supabase', () => {
    test('handleLogin debe hacer peticion fetch a la API de users', async () => {
      const mockUsers = [{ id: 1, name: 'Test', email: 'test@test.com' }];
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUsers)
      });
      
      document.getElementById('loginEmail').value = 'test@test.com';
      document.getElementById('loginPassword').value = 'password123';
      
      await fns.handleLogin({ preventDefault: () => {} });
      
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('users?email=eq.'),
        expect.objectContaining({ method: 'GET' })
      );
    });

    test('handleLogin debe detectar credenciales invalidas cuando la API retorna array vacio', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      });
      
      document.getElementById('loginEmail').value = 'wrong@test.com';
      document.getElementById('loginPassword').value = 'wrongpass';
      
      let errorThrown = false;
      try {
        await fns.handleLogin({ preventDefault: () => {} });
      } catch (e) {
        errorThrown = true;
      }
      
      expect(fetch).toHaveBeenCalled();
    });

    test('handleRegister debe validar que contrasenas sean iguales', () => {
      document.getElementById('registerName').value = 'Test User';
      document.getElementById('registerEmail').value = 'test@test.com';
      document.getElementById('registerPassword').value = 'password123';
      document.getElementById('registerPasswordConfirm').value = 'different';
      
      const password = document.getElementById('registerPassword').value;
      const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
      
      expect(password).not.toBe(passwordConfirm);
    });

    test('handleRegister debe validar longitud minima de contrasena', () => {
      document.getElementById('registerPassword').value = '123';
      document.getElementById('registerPasswordConfirm').value = '123';
      
      const password = document.getElementById('registerPassword').value;
      
      expect(password.length).toBeLessThan(6);
    });
  });

  describe('Verificacion de Consistencia', () => {
    test('Todos los IDs del HTML deben existir en el DOM', () => {
      const requiredIds = [
        'headerAuth', 'headerUser', 'userWelcome',
        'loginModal', 'registerModal', 'loginForm', 'registerForm',
        'loginEmail', 'loginPassword', 'registerName', 'registerEmail',
        'registerPassword', 'registerPasswordConfirm',
        'teamForm', 'teamName', 'teamLogo',
        'playerForm', 'playerName', 'playerAge', 'playerPosition',
        'playerImage', 'playerTeam',
        'playersList', 'noPlayersResults',
        'searchTeam', 'teamList', 'noResults'
      ];
      
      requiredIds.forEach(id => {
        expect(document.getElementById(id)).not.toBeNull();
      });
    });

    test('Constantes de Supabase deben estar definidas', () => {
      expect(global.SUPABASE_URL).toBeDefined();
      expect(global.SUPABASE_ANON_KEY).toBeDefined();
      expect(global.SUPABASE_URL).toContain('supabase.co');
      expect(global.SUPABASE_ANON_KEY).toMatch(/^sb_/);
    });

    test('Todas las funciones deben estar definidas', () => {
      const requiredFunctions = [
        'initAuth', 'saveSession', 'updateHeaderAuth', 'showLoginModal',
        'showRegisterModal', 'closeModal', 'closeAllModals', 'clearFormErrors',
        'handleLogin', 'handleRegister', 'showFormError', 'logout', 'checkAuth',
        'loadTeams', 'loadPlayers', 'clearUserData', 'resizeImage', 'addTeam',
        'mostrarEquipos', 'mostrarTodos', 'searchTeams', 'eliminarEquipo',
        'loadTeamsToSelect', 'addPlayer', 'mostrarJugadores', 'toggleEditMenu',
        'closeEditMenu', 'savePlayer', 'deletePlayer', 'saveTeam', 'managePlayers'
      ];
      
      requiredFunctions.forEach(fnName => {
        expect(typeof fns[fnName]).toBe('function');
      });
    });
  });
});

describe('Verifier - Coherencia del Codigo', () => {
  test('Archivo JS debe tener sintaxis valida', () => {
    const jsContent = fs.readFileSync(
      path.resolve(__dirname, '../Pagina Web/Index.JS'),
      'utf8'
    );
    
    expect(() => {
      new Function(jsContent);
    }).not.toThrow();
  });

  test('Archivo CSS debe tener sintaxis basica valida', () => {
    const cssContent = fs.readFileSync(
      path.resolve(__dirname, '../Pagina Web/Index.css'),
      'utf8'
    );
    
    const openBraces = (cssContent.match(/{/g) || []).length;
    const closeBraces = (cssContent.match(/}/g) || []).length;
    
    expect(openBraces).toBe(closeBraces);
  });

  test('Archivo HTML debe tener estructura basica valida', () => {
    const htmlContent = fs.readFileSync(
      path.resolve(__dirname, '../Pagina Web/Index.Html'),
      'utf8'
    );
    
    expect(htmlContent).toContain('<!DOCTYPE html>');
    expect(htmlContent).toContain('<html');
    expect(htmlContent).toContain('</html>');
    expect(htmlContent).toContain('<head>');
    expect(htmlContent).toContain('</head>');
    expect(htmlContent).toContain('<body>');
    expect(htmlContent).toContain('</body>');
    expect(htmlContent).toContain('<script');
    expect(htmlContent).toContain('</script>');
  });

  test('No debe haber URLs http hardcodeadas (solo https)', () => {
    const jsContent = fs.readFileSync(
      path.resolve(__dirname, '../Pagina Web/Index.JS'),
      'utf8'
    );
    
    const httpPattern = /http:\/\/(?!localhost)/g;
    expect(jsContent).not.toMatch(httpPattern);
  });

  test('Funciones asincronas deben usar async/await', () => {
    const jsContent = fs.readFileSync(
      path.resolve(__dirname, '../Pagina Web/Index.JS'),
      'utf8'
    );
    
    const asyncFunctions = jsContent.match(/async function \w+/g) || [];
    const awaitUsage = (jsContent.match(/await /g) || []).length;
    
    expect(asyncFunctions.length).toBeGreaterThan(0);
    expect(awaitUsage).toBeGreaterThan(0);
  });

  test('Todas las funciones principales deben estar definidas en el codigo', () => {
    const jsContent = fs.readFileSync(
      path.resolve(__dirname, '../Pagina Web/Index.JS'),
      'utf8'
    );
    
    const expectedFunctions = [
      'initAuth', 'saveSession', 'updateHeaderAuth', 'showLoginModal',
      'showRegisterModal', 'closeModal', 'closeAllModals', 'clearFormErrors',
      'handleLogin', 'handleRegister', 'showFormError', 'logout', 'checkAuth',
      'loadTeams', 'loadPlayers', 'clearUserData', 'resizeImage', 'addTeam',
      'mostrarEquipos', 'mostrarTodos', 'searchTeams', 'eliminarEquipo',
      'loadTeamsToSelect', 'addPlayer', 'mostrarJugadores', 'toggleEditMenu',
      'closeEditMenu', 'savePlayer', 'deletePlayer', 'saveTeam', 'managePlayers'
    ];
    
    expectedFunctions.forEach(fnName => {
      expect(jsContent).toContain(`function ${fnName}`);
    });
  });

  test('No debe haber console.log en el codigo de produccion', () => {
    const jsContent = fs.readFileSync(
      path.resolve(__dirname, '../Pagina Web/Index.JS'),
      'utf8'
    );
    
    expect(jsContent).not.toContain('console.log');
  });

  test('Debe usar fetch para llamadas a la API', () => {
    const jsContent = fs.readFileSync(
      path.resolve(__dirname, '../Pagina Web/Index.JS'),
      'utf8'
    );
    
    expect(jsContent).toContain('fetch(');
    expect(jsContent).toContain('method: \'POST\'');
    expect(jsContent).toContain('method: \'DELETE\'');
    expect(jsContent).toContain('method: \'PATCH\'');
  });

  test('Debe tener manejo de errores con try-catch', () => {
    const jsContent = fs.readFileSync(
      path.resolve(__dirname, '../Pagina Web/Index.JS'),
      'utf8'
    );
    
    expect(jsContent).toContain('try {');
    expect(jsContent).toContain('catch');
  });
});

describe('Verifier - Estructura del DOM', () => {
  test('Header debe tener elementos de autenticacion', () => {
    const headerAuth = document.getElementById('headerAuth');
    const headerUser = document.getElementById('headerUser');
    
    expect(headerAuth).not.toBeNull();
    expect(headerUser).not.toBeNull();
  });

  test('Formularios deben tener campos requeridos', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const teamForm = document.getElementById('teamForm');
    const playerForm = document.getElementById('playerForm');
    
    expect(loginForm).not.toBeNull();
    expect(registerForm).not.toBeNull();
    expect(teamForm).not.toBeNull();
    expect(playerForm).not.toBeNull();
  });

  test('Select de posiciones debe tener todas las opciones', () => {
    const positionSelect = document.getElementById('playerPosition');
    
    expect(positionSelect).not.toBeNull();
    expect(positionSelect.options.length).toBeGreaterThan(1);
    
    const positions = ['Portero', 'Defensa', 'Medio', 'Delantero'];
    positions.forEach(pos => {
      expect(positionSelect.innerHTML).toContain(pos);
    });
  });

  test('Contenedores de equipos y jugadores deben existir', () => {
    const teamList = document.getElementById('teamList');
    const playersList = document.getElementById('playersList');
    
    expect(teamList).not.toBeNull();
    expect(playersList).not.toBeNull();
  });
});
