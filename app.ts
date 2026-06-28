import { formatMessage } from './helpers/format.js';
import { sendTextNotification } from './helpers/notification.js';

export const handler = async (event: any[] | any): Promise<any[]> => {
    const mensajesProcesados: any[] = [];
    
    // AWS SQS manda los records dentro de un objeto `Records` si es invocación directa de SQS.
    // Si viene de EventBridge Pipes, podría venir directo como un array. Validamos esto.
    const records = event.Records || event;

    for (const record of records) {
        let body: any;
        const messageId = record.messageId || 'ID_Desconocido';

        try {
            // SQS siempre entrega el body como string
            body = typeof record.body === 'string' ? JSON.parse(record.body) : record.body;
            console.log(`=====================================`);
            console.log(`📨 Evaluando mensaje para notificación ID: ${messageId}`);
            
            // Validamos si realmente requiere notificación
            // (Lo ideal es que configures un "Filter" en EventBridge Pipes para que esta Lambda 
            // solo reciba los que tengan requiere_notificacion = true)
            if (body.requiere_notificacion && body.payload_notificacion) {
                const payload = body.payload_notificacion;
                const telefono = payload.atributosUsuario?.telefono;

                if (!telefono) {
                    console.warn(`⚠️ No se encontró un número de teléfono en el payload. Omitiendo.`);
                    body.estado_notificacion = 'OMITTED_NO_PHONE';
                } else {
                    // 1. Formateamos el mensaje para WhatsApp
                    const textoWhatsApp = formatMessage(payload);

                    // 2. Disparamos la petición a la API
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
            
            // Retornamos el error estructurado. 
            // Si usas SQS "ReportBatchItemFailures", puedes cambiar esta lógica para que SQS reintente.
            if (!body) body = { original_record: record };
            body.estado_notificacion = 'FAILED';
            body.error_detalle = error instanceof Error ? error.message : 'Error desconocido';
            
            mensajesProcesados.push(body);
        }
    }

    return mensajesProcesados;
};