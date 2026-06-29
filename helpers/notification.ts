import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

export async function sendTextNotification(phone: string, text: string): Promise<any> {
    const baseUrl = process.env.NOTIFICATION_URL;
    
    if (!baseUrl) {
        throw new Error('La variable de entorno NOTIFICATION_URL no está definida.');
    }

    const sessionName = process.env.SESSION_NAME;


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
        session: sessionName,
    };

    try {
        const { data } = await axios.post(fullUrl, payload, {
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
            },
            timeout: 30000, 
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