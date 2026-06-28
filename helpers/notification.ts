import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

export async function sendTextNotification(phone: string, text: string): Promise<any> {
    const baseUrl = process.env.NOTIFICATION_URL;
    
    if (!baseUrl) {
        throw new Error('La variable de entorno NOTIFICATION_URL no está definida.');
    }

    // 1. Configuración del proxy extraída de las variables de entorno
    const login = process.env.PROXY_LOGIN;
    const password = process.env.PROXY_PASSWORD;
    const host = process.env.PROXY_HOST || 'brd.superproxy.io';
    const port = process.env.PROXY_PORT || '33335';

    if (!login || !password) {
        throw new Error('Faltan las variables de entorno PROXY_LOGIN o PROXY_PASSWORD.');
    }

    const proxyUrl = `http://${login}:${password}@${host}:${port}/`;
    const httpsAgent = new HttpsProxyAgent(proxyUrl);

    // 2. Limpieza y armado de la URL
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const fullUrl = `${cleanBaseUrl}/api/sendText`;

    // 3. Estructuración del payload
    const payload = {
        chatId: `${phone}@c.us`,
        reply_to: null,
        text: text,
        linkPreview: true,
        linkPreviewHighQuality: false,
        session: 'default',
    };

    // 4. Petición POST inyectando el httpsAgent
    try {
        const { data } = await axios.post(fullUrl, payload, {
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
            },
            httpsAgent,
            timeout: 10000, 
        });
        return data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error(`Error de red al notificar al ${phone}:`, error.message);
            if (error.response) {
                console.error('Detalles del proveedor:', error.response.data);
            }
        }
        throw error;
    }
}