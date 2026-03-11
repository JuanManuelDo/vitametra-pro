/**
 * Skill para interpretar exámenes médicos o de laboratorio.
 */
export async function handleExamReading(
  patientId: string | null,
  mediaId: string
): Promise<string> {
  if (!patientId) {
    return "Para interpretar exámenes médicos, por favor vincula tu número en la app VitaMetra por seguridad.";
  }

  // Aquí iría la obtención del documento/imagen con el mediaId de WhatsApp
  // Luego, pasar al modelo OCR o Vision para procesar "Hemoglobina Glicosilada, Colesterol, etc."
  
  return "He recibido tu documento. Nutria está analizando los resultados de tus exámenes. Te enviaré un resumen con el impacto clínico en breve.";
}
