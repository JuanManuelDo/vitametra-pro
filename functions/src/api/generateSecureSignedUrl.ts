import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

export const generateSecureSignedUrl = onCall({ region: "southamerica-east1", cors: true }, async (request) => {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError('unauthenticated', 'Endpoint exclusively for authenticated patients.');
  }

  const userId = request.auth.uid;
  const { bucketPath } = request.data; // e.g., "food_images/UID/image.jpg"

  if (!bucketPath || typeof bucketPath !== "string") {
    throw new HttpsError('invalid-argument', 'A valid bucketPath must be provided.');
  }

  // Ensure absolute isolation: User can only request tokens for their own path
  if (!bucketPath.includes(`/${userId}/`) && !bucketPath.startsWith(`users/${userId}/`)) {
    throw new HttpsError('permission-denied', 'You are not authorized to access this bucket path.');
  }

  try {
    const bucket = admin.storage().bucket();
    const file = bucket.file(bucketPath);
    
    const [exists] = await file.exists();
    if (!exists) {
       throw new HttpsError('not-found', 'Asset does not exist.');
    }

    // Generate a secure signed URL valid for only 15 minutes
    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, 
    });

    return { secureUrl: url };
  } catch (error) {
    console.error("Signed URL generation failed:", error);
    throw new HttpsError('internal', 'Failed to generate expiring access token.');
  }
});
