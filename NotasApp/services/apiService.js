// 👉 Cambia esta IP por la de tu PC en la red local
//    En Windows: ejecuta "ipconfig" en cmd → IPv4
//    Ejemplo: 192.168.1.100
const BASE_URL = 'http://10.66.185.176/notasapp/api.php';

const request = async (action, method = 'GET', body = null, extraParams = '') => {
  try {
    const url = `${BASE_URL}?action=${action}${extraParams}`;
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(url, options);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`[API] Error en ${action}:`, error.message);
    return { success: false, error: error.message };
  }
};

// ─── Notas ──────────────────────────────────────────────────────────────────
export const apiGetNotes = (onlyImportant = false, sortBy = 'date', search = '') =>
  request(
    'notes',
    'GET',
    null,
    `&onlyImportant=${onlyImportant ? 1 : 0}&sortBy=${sortBy}&search=${encodeURIComponent(search)}`
  );

export const apiAddNote = (title, content, isImportant = 0) =>
  request('add_note', 'POST', { title, content, isImportant });

export const apiDeleteNote = (id) =>
  request('delete_note', 'DELETE', null, `&id=${id}`);

export const apiToggleImportant = (id, newValue) =>
  request('toggle_important', 'PUT', { isImportant: newValue ? 1 : 0 }, `&id=${id}`);

// ─── Preferencias ───────────────────────────────────────────────────────────
export const apiGetPreferences = () => request('preferences');

export const apiUpdatePreferences = (showOnlyImportant, sortBy) =>
  request('update_preferences', 'PUT', { showOnlyImportant, sortBy });