import { configuration } from '@forgerock/login-widget';

export function configurePing() {
    configuration.set({
        forgerock: {
            serverConfig: {
                baseUrl: import.meta.env.VITE_PING_BASE_URL, // e.g. https://<tenant>.forgerock.io/am
                timeout: 30000,
            },
            realmPath: import.meta.env.VITE_PING_REALM_PATH || 'root', // or "alpha" etc
            // The widget can use the journey provided at start(), but you can also set defaults here.
            oauth: {
                clientId: import.meta.env.VITE_PING_OAUTH_CLIENT_ID,
                redirectUri: import.meta.env.VITE_PING_REDIRECT_URI, // e.g. http://localhost:5173/callback
                scope: 'openid profile email',
            },
        },
    });
}
