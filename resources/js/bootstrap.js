import axios from 'axios';
window.axios = axios;

// Configurar headers por defecto
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.headers.common['Content-Type'] = 'application/json';
window.axios.defaults.headers.common['Accept'] = 'application/json';

// Configurar para que axios envíe cookies automáticamente
window.axios.defaults.withCredentials = true;

// Función para obtener y configurar el token CSRF
function setCsrfToken() {
    // Verificar que document esté disponible
    if (typeof document === 'undefined') {
        return;
    }
    
    try {
        // Intentar obtener el token del meta tag
        const metaToken = document.head?.querySelector('meta[name="csrf-token"]');
        if (metaToken) {
            window.axios.defaults.headers.common['X-CSRF-TOKEN'] = metaToken.content;
            return;
        }
        
        // Si no existe el meta tag, intentar obtenerlo de la cookie XSRF-TOKEN
        if (document.cookie) {
            const cookies = document.cookie.split(';');
            for (let cookie of cookies) {
                const [name, value] = cookie.trim().split('=');
                if (name === 'XSRF-TOKEN' && value) {
                    window.axios.defaults.headers.common['X-XSRF-TOKEN'] = decodeURIComponent(value);
                    return;
                }
            }
        }
    } catch (error) {
        console.warn('Error al configurar token CSRF:', error);
    }
}

// Configurar el token cuando el DOM esté listo
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setCsrfToken);
    } else {
        setCsrfToken();
    }
}

// Interceptor para actualizar el token si cambia
window.axios.interceptors.response.use(
    (response) => {
        // Si hay un nuevo token en la respuesta, actualizarlo
        const newToken = response.headers['x-csrf-token'];
        if (newToken) {
            window.axios.defaults.headers.common['X-CSRF-TOKEN'] = newToken;
        }
        return response;
    },
    (error) => {
        // Si hay un error 419 (CSRF token mismatch), intentar refrescar el token
        if (error.response && error.response.status === 419) {
            setCsrfToken();
        }
        return Promise.reject(error);
    }
);
