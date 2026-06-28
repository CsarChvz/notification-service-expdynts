export function formatMessage(payload: any): string {
    let message = "";

    try {
        // En esta Lambda, si recibimos el mensaje, asumimos que siempre hubo un cambio
        message += "📝 *Se han detectado cambios en un expediente existente*\n\n";

        const expedienteExp = payload.expediente?.exp || "N/A";
        const expedienteFecha = payload.expediente?.fecha || "N/A";
        const juzgadoName = payload.juzgado?.name || "Desconocido";
        const juzgadoExtracto = payload.extracto?.extracto_name || "Desconocido";

        message += `*Expediente:* ${expedienteExp}\n`;
        message += `*Año:* ${expedienteFecha}\n`;
        message += `*Juzgado:* ${juzgadoName}\n`;
        message += `*Lugar:* ${juzgadoExtracto}\n`;

        const cambiosRealizados = payload.cambiosRealizados || [];
        
        if (cambiosRealizados.length > 0) {
            message += "\n*Cambios realizados:*\n";

            for (let i = 0; i < cambiosRealizados.length; i++) {
                const cambio = cambiosRealizados[i];
                if (!cambio) continue;

                message += `\n📋 *Cambio ${i + 1}:*\n`;

                const exp = cambio.EXP || "";
                const cveJuz = cambio.CVE_JUZ || "";
                const fchPro = cambio.FCH_PRO ? new Date(cambio.FCH_PRO).getTime() : null;
                const fchAcu = cambio.FCH_ACU ? new Date(cambio.FCH_ACU).getTime() : null;
                const fchRes = cambio.FCH_RES ? new Date(cambio.FCH_RES).getTime() : null;
                const descrip = cambio.DESCRIP || "";

                message += `• *Expediente:* ${exp}\n`;
                message += `• *Juzgado:* ${cveJuz}\n`;
                if (fchPro) message += `• *Fecha de procedimiento:* ${formatDate(fchPro)}\n`;
                if (fchAcu) message += `• *Fecha de acuerdo:* ${formatDate(fchAcu)}\n`;
                if (fchRes) message += `• *Fecha de resolución:* ${formatDate(fchRes)}\n`;
                if (descrip) message += `• *Descripción:* "${descrip}"\n`;
                
                // Si quieres agregar los demás campos (BOLETIN, act_names, etc.), los puedes poner aquí
            }
        }
    } catch (error) {
        console.error(`Error construyendo el template del mensaje: ${(error as Error).message}`);
        message = "⚠️ Hay actualizaciones en su expediente, pero ocurrió un error al formatear los detalles.";
    }

    return message;
}

function formatDate(timestamp: number): string {
    try {
        const date = new Date(timestamp);
        // Usamos formato de México ya que el contexto está en Zapopan/Jalisco
        return date.toLocaleDateString("es-MX", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return "Fecha no disponible";
    }
}