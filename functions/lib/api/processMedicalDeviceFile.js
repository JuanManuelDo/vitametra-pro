"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.processMedicalDeviceFile = void 0;
const admin = __importStar(require("firebase-admin"));
const storage_1 = require("firebase-functions/v2/storage");
const generative_ai_1 = require("@google/generative-ai");
const pdfParse = require("pdf-parse");
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
const storage = admin.storage();
exports.processMedicalDeviceFile = (0, storage_1.onObjectFinalized)(async (event) => {
    try {
        const filePath = event.data.name;
        if (!filePath)
            return;
        const pathSegments = filePath.split('/');
        if (pathSegments.length !== 4 || pathSegments[0] !== 'users' || pathSegments[2] !== 'medical-reports') {
            return;
        }
        const userId = pathSegments[1];
        const fileId = pathSegments[3];
        console.log(`Processing medical report ${fileId} for user ${userId}`);
        const bucket = storage.bucket(event.data.bucket);
        const file = bucket.file(filePath);
        const [fileBuffer] = await file.download();
        let extractedText = "";
        if (event.data.contentType === "application/pdf") {
            const pdfData = await pdfParse(fileBuffer);
            extractedText = pdfData.text;
        }
        else if (event.data.contentType === "text/csv" || event.data.name?.endsWith(".csv")) {
            extractedText = fileBuffer.toString("utf-8");
        }
        else {
            console.warn(`Unsupported file type or requires Vision API: ${event.data.contentType}`);
            throw new Error(`Vision not fully implemented in this node yet for ${event.data.contentType}`);
        }
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("Gemini API key not configured");
        }
        const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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
        const maxRetries = 3;
        let attempt = 0;
        let responseText = "";
        const pendingRef = db.collection("users").doc(userId).collection("pending_reports").doc(fileId);
        while (attempt < maxRetries) {
            try {
                const result = await model.generateContent(prompt);
                responseText = result.response.text();
                break;
            }
            catch (err) {
                attempt++;
                console.warn(`Gemini API failed on attempt ${attempt} for file ${fileId}:`, err.message);
                if (attempt >= maxRetries) {
                    throw new Error(`Gemini API permanently failed after ${maxRetries} attempts: ${err.message}`);
                }
                await pendingRef.set({
                    status: "PROCESSING_RETRY",
                    message: "Tráfico detectado. Procesando reporte detallado, esto puede tardar un momento...",
                    analyzedAt: admin.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
                await new Promise(res => setTimeout(res, Math.pow(2, attempt) * 1000));
            }
        }
        const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const extractedData = JSON.parse(jsonString);
        await pendingRef.set({
            status: "ANALYZED",
            fileName: event.data.name,
            analyzedAt: admin.firestore.FieldValue.serverTimestamp(),
            ...extractedData
        }, { merge: true });
        console.log(`Successfully processed and staged report ${fileId} for user ${userId}`);
    }
    catch (error) {
        console.error("Error processing medical file:", error);
        const filePath = event.data.name;
        if (filePath && filePath.startsWith('users/')) {
            const segments = filePath.split('/');
            if (segments.length === 4) {
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
//# sourceMappingURL=processMedicalDeviceFile.js.map