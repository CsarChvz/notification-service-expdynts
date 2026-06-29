import { formatMessage } from './helpers/format.js';
import { sendTextNotification } from './helpers/notification.js';

export const handler = async (event: any[] | any): Promise<any[]> => {
    const mensajesProcesados: any[] = [];
    
    const records = event.Records || event;

    for (const record of records) {
        let body: any;
        const messageId = record.messageId || 'ID_Desconocido';

        try {
            body = typeof record.body === 'string' ? JSON.parse(record.body) : record.body;
            console.log(`=====================================`);
            console.log(`📨 Evaluando mensaje para notificación ID: ${messageId}`);
            
            const dataReal = body.detail ? body.detail : body;
            
            if (dataReal.requiere_notificacion && dataReal.payload_notificacion) {
                const payload = dataReal.payload_notificacion;
                const telefono = payload.atributosUsuario?.telefono;

                if (!telefono) {
                    console.warn(`⚠️ No se encontró un número de teléfono en el payload. Omitiendo.`);
                    body.estado_notificacion = 'OMITTED_NO_PHONE';
                } else {
                    const textoWhatsApp = formatMessage(payload);

                    console.log(`🚀 Enviando WhatsApp a ${telefono}...`);
                    await sendTextNotification(telefono, textoWhatsApp);
                    
                    console.log(`✅ Notificación enviada con éxito.`);
                    body.estado_notificacion = 'SENT';
                }
            } else {
                console.log(`⏭️ El mensaje no requiere notificación. Ignorando.`);
                body.estado_notificacion = 'IGNORED';
            }

            body.fecha_notificacion = new Date().toISOString();
            mensajesProcesados.push(body);

        } catch (error) {
            console.error(`❌ Error procesando notificación para el mensaje ${messageId}:`, error);
            
            if (!body) body = { original_record: record };
            body.estado_notificacion = 'FAILED';
            body.error_detalle = error instanceof Error ? error.message : 'Error desconocido';
            
            mensajesProcesados.push(body);
        }
    }

    return mensajesProcesados;
};