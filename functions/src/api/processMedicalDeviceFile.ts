import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { onObjectFinalized } from "firebase-functions/v2/storage";
import { GoogleGenerativeAI } from "@google/generative-ai";
const pdfParse = require("pdf-parse"); // Dynamic import for JS compatibility

// Initialize Admin SDK if not already done
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();
const storage = admin.storage();

export const processMedicalDeviceFile = onObjectFinalized(async (event) => {
    try {
        const filePath = event.data.name;
        if (!filePath) return;

        // Path structure: users/{userId}/medical-reports/{fileId}
        const pathSegments = filePath.split('/');
        if (pathSegments.length !== 4 || pathSegments[0] !== 'users' || pathSegments[2] !== 'medical-reports') {
            return; // Ignore files not in this specific path
        }

        const userId = pathSegments[1];
        const fileId = pathSegments[3];
        
        console.log(`Processing medical report ${fileId} for user ${userId}`);

        // 1. Download the file from Storage
        const bucket = storage.bucket(event.data.bucket);
        const file = bucket.file(filePath);
        const [fileBuffer] = await file.download();

        let extractedText = "";

        // 2. Extract Text (Basic implementation for PDF and CSV)
        if (event.data.contentType === "application/pdf") {
            const pdfData = await pdfParse(fileBuffer);
            extractedText = pdfData.text;
        } else if (event.data.contentType === "text/csv" || event.data.name?.endsWith(".csv")) {
            extractedText = fileBuffer.toString("utf-8");
        } else {
            // For images (PNG/JPEG) we would normally pass the base64 directly to Gemini Vision,
            // but for simplicity in this MVP snippet we focus on text/PDF logic, or assume the client sent the text.
            console.warn(`Unsupported file type or requires Vision API: ${event.data.contentType}`);
            // If it's an image, in a full vision model:
            // const base64Image = fileBuffer.toString("base64");
            // send inlineData: { mimeType: event.data.contentType, data: base64Image }
            throw new Error(`Vision not fully implemented in this node yet for ${event.data.contentType}`);
        }

        // 3. Process with Gemini 1.5 Pro/Flash (with Retry Logic)
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("Gemini API key not configured");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Fast extraction model

        const prompt = `
            You are a clinical AI agent extracting data from a continuous glucose monitor (CGM) or an insulin pump report.
            Extract the data strictly in JSON format following this schema:
            {
                "detectedInsulinDoses": number, // Count of bolus/basal doses found
                "detectedGlucoseReadings": number, // Count of blood glucose readings found
                "summary": "A 1 sentence clinical summary of the extracted data",
                "extractedData": {
                   "glucose": [{ "timestamp": "YYYY-MM-DDTHH:mm:ssZ", "value": number }],
                   "insulin": [{ "timestamp": "YYYY-MM-DDTHH:mm:ssZ", "units": number, "type": "Basal" | "Bolus" }]
                }
            }
            Do not include any text outside the JSON block. Return ONLY the JSON object. 
            Here is the raw text from the report:
            ---
            ${extractedText.substring(0, 30000)} // Limit context to avoid token limits
            ---
        `;

        // Exponential Backoff Retry System for LLM Calls
        const maxRetries = 3;
        let attempt = 0;
        let responseText = "";
        
        const pendingRef = db.collection("users").doc(userId).collection("pending_reports").doc(fileId);

        while (attempt < maxRetries) {
            try {
                const result = await model.generateContent(prompt);
                responseText = result.response.text();
                break; // Success, exit loop
            } catch (err: any) {
                attempt++;
                console.warn(`Gemini API failed on attempt ${attempt} for file ${fileId}:`, err.message);
                
                if (attempt >= maxRetries) {
                    throw new Error(`Gemini API permanently failed after ${maxRetries} attempts: ${err.message}`);
                }
                
                // Emite status intermedio a Firestore para que UI reaccione y reduzca ansiedad
                await pendingRef.set({
                    status: "PROCESSING_RETRY",
                    message: "Tráfico detectado. Procesando reporte detallado, esto puede tardar un momento...",
                    analyzedAt: admin.firestore.FieldValue.serverTimestamp()
                }, { merge: true });

                // Exponential backoff: 2s, 4s, etc.
                await new Promise(res => setTimeout(res, Math.pow(2, attempt) * 1000));
            }
        }
        
        // Strip markdown blocks if the model returned them
        const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const extractedData = JSON.parse(jsonString);

        // 4. Save to temporary pending validation table
        await pendingRef.set({
            status: "ANALYZED",
            fileName: event.data.name,
            analyzedAt: admin.firestore.FieldValue.serverTimestamp(),
            ...extractedData
        }, { merge: true });

        console.log(`Successfully processed and staged report ${fileId} for user ${userId}`);

    } catch (error) {
        console.error("Error processing medical file:", error);
        
        // Save error state so UI can react
        const filePath = event.data.name;
        if (filePath && filePath.startsWith('users/')) {
            const segments = filePath.split('/');
            if(segments.length === 4) {
                 const userId = segments[1];
                 const fileId = segments[3];
                 await db.collection("users").doc(userId).collection("pending_reports").doc(fileId).set({
                     status: "ERROR",
                     error: error instanceof Error ? error.message : "Unknown error",
                     analyzedAt: admin.firestore.FieldValue.serverTimestamp(),
                 });
            }
        }
    }
});
