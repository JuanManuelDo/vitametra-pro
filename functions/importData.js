const pdf = require('pdf-parse');
const crypto = require('crypto');
const admin = require("firebase-admin");

/**
 * Procesa el archivo médico (PDF/CSV) y lo guarda en Firestore sin duplicados.
 */
async function processFile(userId, fileBuffer, fileType) {
    const db = admin.firestore();
    let rawEntries = [];

    if (fileType === 'pdf' || fileType === 'application/pdf') {
        const data = await pdf(fileBuffer);
        rawEntries = parseMedicalPDF(data.text); 
    }

    let importedCount = 0;

    for (const entry of rawEntries) {
        // Generar un ID único basado en tiempo y valor para evitar duplicados exactos
        const externalId = generateHash(entry.timestamp, entry.value);
        
        // Ventana de tiempo para deduplicación (±5 minutos)
        const entryDate = new Date(entry.timestamp);
        const startTime = new Date(entryDate.getTime() - 5 * 60000).toISOString();
        const endTime = new Date(entryDate.getTime() + 5 * 60000).toISOString();

        const existingRef = await db.collection('history')
            .where('userId', '==', userId)
            .where('timestamp', '>=', startTime)
            .where('timestamp', '<=', endTime)
            .get();

        if (existingRef.empty) {
            await db.collection('history').add({ 
                ...entry, 
                userId, 
                externalId, 
                source: 'IMPORT',
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            importedCount++;
        } else {
            // Lógica de MERGE: Si ya existe la glucemia pero no tiene carbohidratos, se los añadimos
            const doc = existingRef.docs[0];
            const existingData = doc.data();
            
            if (!existingData.carbs && entry.carbs) {
                await doc.ref.update({ 
                    carbs: entry.carbs, 
                    source: 'MERGED_IMPORT' 
                });
                importedCount++;
            }
        }
    }

    return { count: importedCount };
}

/**
 * Extrae datos del texto plano del PDF usando patrones comunes de reportes médicos.
 * Ajustado para detectar: Fecha Hora | Valor mg/dL
 */
function parseMedicalPDF(text) {
    const entries = [];
    // Ejemplo de patrón: 17/02/2026 14:30 106 mg/dL
    const regex = /(\d{2}\/\d{2}\/\d{4})\s+(\d{2}:\d{2})\s+(\d{2,3})/g;
    
    let match;
    while ((match = regex.exec(text)) !== null) {
        const [_, date, time, value] = match;
        
        // Convertir formato DD/MM/YYYY HH:mm a objeto Date
        const [day, month, year] = date.split('/');
        const isoDate = `${year}-${month}-${day}T${time}:00`;

        entries.push({
            timestamp: new Date(isoDate).toISOString(),
            value: parseFloat(value),
            type: 'GLUCOSE',
            unit: 'mg/dL'
        });
    }
    return entries;
}

function generateHash(ts, val) {
    return crypto.createHash('md5').update(`${ts}_${val}`).digest('hex');
}

// CRÍTICO: Exportar para que index.js pueda usarlo
module.exports = { processFile };