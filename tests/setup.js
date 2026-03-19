const fs = require('fs');
const path = require('path');

const htmlContent = fs.readFileSync(
  path.resolve(__dirname, '../Pagina Web/Index.Html'),
  'utf8'
);

document.body.innerHTML = htmlContent;

global.SUPABASE_URL = 'https://ocuoxlfltaelrojdkbdf.supabase.co';
global.SUPABASE_ANON_KEY = 'sb_publishable_VD9fF-BmNxuxuyhuBKT_UA_plcEV7TF';
global.currentUser = null;
global.equipos = [];
global.jugadores = [];

global.localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, value) { this.store[key] = value; },
  removeItem(key) { delete this.store[key]; },
  clear() { this.store = {}; }
};

global.fetch = jest.fn();

global.alert = jest.fn();
global.confirm = jest.fn(() => true);

global.resizeImage = (file, maxWidth, maxHeight, callback) => {
  const canvas = {
    width: 150,
    height: 150,
    toDataURL: () => 'data:image/jpeg;base64,mockbase64image'
  };
  global.canvasMock = canvas;
  callback('data:image/jpeg;base64,mockbase64image');
};
