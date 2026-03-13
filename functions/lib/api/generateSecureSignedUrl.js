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
exports.generateSecureSignedUrl = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
exports.generateSecureSignedUrl = (0, https_1.onCall)({ region: "southamerica-east1", cors: true }, async (request) => {
    if (!request.auth || !request.auth.uid) {
        throw new https_1.HttpsError('unauthenticated', 'Endpoint exclusively for authenticated patients.');
    }
    const userId = request.auth.uid;
    const { bucketPath } = request.data;
    if (!bucketPath || typeof bucketPath !== "string") {
        throw new https_1.HttpsError('invalid-argument', 'A valid bucketPath must be provided.');
    }
    if (!bucketPath.includes(`/${userId}/`) && !bucketPath.startsWith(`users/${userId}/`)) {
        throw new https_1.HttpsError('permission-denied', 'You are not authorized to access this bucket path.');
    }
    try {
        const bucket = admin.storage().bucket();
        const file = bucket.file(bucketPath);
        const [exists] = await file.exists();
        if (!exists) {
            throw new https_1.HttpsError('not-found', 'Asset does not exist.');
        }
        const [url] = await file.getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: Date.now() + 15 * 60 * 1000,
        });
        return { secureUrl: url };
    }
    catch (error) {
        console.error("Signed URL generation failed:", error);
        throw new https_1.HttpsError('internal', 'Failed to generate expiring access token.');
    }
});
//# sourceMappingURL=generateSecureSignedUrl.js.map