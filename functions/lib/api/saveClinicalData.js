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
exports.saveClinicalData = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const zod_1 = require("zod");
const ClinicalDataSchema = zod_1.z.object({
    type: zod_1.z.enum(['MEAL', 'GLUCOSE', 'EXERCISE', 'INSULIN', 'CGM_SYNC', 'AUDIO_NOTE']),
    date: zod_1.z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid ISO date string" }),
    value: zod_1.z.number().finite().nonnegative().optional(),
    totalCarbs: zod_1.z.number().finite().nonnegative().optional(),
    bloodGlucoseValue: zod_1.z.number().finite().nonnegative().optional(),
    notes: zod_1.z.string().max(1000).optional(),
    foodName: zod_1.z.string().max(255).optional(),
    mealType: zod_1.z.string().optional(),
    imageUrl: zod_1.z.string().url().max(1000).optional(),
    finalInsulinUnits: zod_1.z.number().finite().nonnegative().optional(),
    physicalActivityLevel: zod_1.z.enum(['bajo', 'medio', 'alto']).optional()
});
exports.saveClinicalData = (0, https_1.onCall)({ region: "southamerica-east1", cors: true }, async (request) => {
    if (!request.auth || !request.auth.uid) {
        throw new https_1.HttpsError('unauthenticated', 'Endpoint exclusively for authenticated patients.');
    }
    const userId = request.auth.uid;
    try {
        const validatedData = ClinicalDataSchema.parse(request.data);
        const db = admin.firestore();
        const isoDate = new Date(validatedData.date);
        const monthId = isoDate.toISOString().slice(0, 7);
        const historyEntry = {
            ...validatedData,
            userId,
            monthId,
            timestamp: validatedData.date,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            isCalibrated: false
        };
        const logRef = await db.collection("users").doc(userId)
            .collection("history").doc(monthId)
            .collection("logs").add(historyEntry);
        return {
            success: true,
            id: logRef.id,
            message: "Data securely persisted using Zod schema check."
        };
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            const zodErr = error;
            console.error("Zod Validation Error:", zodErr.errors);
            throw new https_1.HttpsError('invalid-argument', 'Clinical validation failed: Unsafe or malformed payload.', zodErr.flatten());
        }
        console.error("Internal save failure:", error);
        throw new https_1.HttpsError('internal', 'Internal server error while saving clinical data.');
    }
});
//# sourceMappingURL=saveClinicalData.js.map