import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { z } from "zod";

// Zod Schema: Strict Validation for Clinical Inputs
const ClinicalDataSchema = z.object({
  type: z.enum(['MEAL', 'GLUCOSE', 'EXERCISE', 'INSULIN', 'CGM_SYNC', 'AUDIO_NOTE']),
  date: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid ISO date string" }),
  value: z.number().finite().nonnegative().optional(),
  totalCarbs: z.number().finite().nonnegative().optional(),
  bloodGlucoseValue: z.number().finite().nonnegative().optional(),
  notes: z.string().max(1000).optional(),
  foodName: z.string().max(255).optional(),
  mealType: z.string().optional(),
  imageUrl: z.string().url().max(1000).optional(),
  finalInsulinUnits: z.number().finite().nonnegative().optional(),
  physicalActivityLevel: z.enum(['bajo', 'medio', 'alto']).optional()
});

export const saveClinicalData = onCall({ region: "southamerica-east1", cors: true }, async (request) => {
  // 1. Verify Authentication (HIPAA Absolute Isolation)
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError('unauthenticated', 'Endpoint exclusively for authenticated patients.');
  }

  const userId = request.auth.uid;

  try {
    // 2. Validate Payload with Zod Schema
    const validatedData = ClinicalDataSchema.parse(request.data);

    // 3. Connect to Firestore Admin
    const db = admin.firestore();
    const isoDate = new Date(validatedData.date);
    const monthId = isoDate.toISOString().slice(0, 7);

    // 4. Construct Clinical Master Record
    const historyEntry = {
      ...validatedData,
      userId,
      monthId,
      timestamp: validatedData.date, // Unified consistency
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isCalibrated: false // Raw imported state default
    };

    // 5. Atomic Write
    const logRef = await db.collection("users").doc(userId)
                          .collection("history").doc(monthId)
                          .collection("logs").add(historyEntry);

    return { 
      success: true, 
      id: logRef.id, 
      message: "Data securely persisted using Zod schema check." 
    };

  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodErr = error as any;
      console.error("Zod Validation Error:", zodErr.errors);
      throw new HttpsError('invalid-argument', 'Clinical validation failed: Unsafe or malformed payload.', zodErr.flatten());
    }
    
    console.error("Internal save failure:", error);
    throw new HttpsError('internal', 'Internal server error while saving clinical data.');
  }
});
