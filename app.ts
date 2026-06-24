export const handler = async (event: any[]): Promise<any[]> => {
    const mensajesProcesados: any[] = [];

    for (const record of event) {
        try {
            // Pipes entrega el body de SQS como string JSON
            const body = JSON.parse(record.body);
            console.log("=====================================")
            console.log(body);
            console.log("=====================================")

            const messageId = record.messageId;
            const idProceso = body.id_proceso || 0;

            body.fecha_procesamiento = new Date().toISOString();

            console.log(`Item ${messageId} (ID: ${idProceso}) evaluado como: ${body.estado}`);
            
            mensajesProcesados.push(body);
        } catch (error) {
            console.error(`Error procesando mensaje:`, error);
        }
    }

    return mensajesProcesados;
};