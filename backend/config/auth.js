/**
 * Urban EYE - Better Auth Backend Configuration
 * Seamless MongoDB integration with Bearer Token and Cookie support
 */

const mongoose = require('mongoose');
const { betterAuth } = require('better-auth');
const { mongodbAdapter } = require('better-auth/adapters/mongodb');
const { bearer } = require('better-auth/plugins');

let authInstance = null;

function getAuth() {
  if (!authInstance) {
    const db = mongoose.connection?.db;
    if (!db) {
      throw new Error('[Better Auth] Database connection not ready. Mongoose must connect before auth operations.');
    }

    authInstance = betterAuth({
      database: mongodbAdapter(db),
      baseURL: process.env.BETTER_AUTH_URL || process.env.VITE_API_URL || 'http://localhost:5000',
      basePath: '/api/auth',
      secret: process.env.BETTER_AUTH_SECRET || process.env.JWT_SECRET || 'urban_eye_better_auth_secret_2026_super_secure',
      emailAndPassword: {
        enabled: true,
        autoSignIn: true
      },
      plugins: [
        bearer()
      ],
      socialProviders: {
        ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
          }
        } : {})
      },
      user: {
        additionalFields: {
          role: {
            type: 'string',
            defaultValue: 'user'
          },
          departmentId: {
            type: 'string',
            required: false
          },
          departmentName: {
            type: 'string',
            required: false
          },
          phone: {
            type: 'string',
            required: false
          },
          status: {
            type: 'string',
            defaultValue: 'active'
          }
        }
      }
    });
  }
  return authInstance;
}

// Proxy wrapper allows directly calling auth.api.* or passing auth to toNodeHandler(auth)
const auth = new Proxy({}, {
  get(target, prop) {
    const instance = getAuth();
    const val = instance[prop];
    return typeof val === 'function' ? val.bind(instance) : val;
  }
});

module.exports = {
  auth,
  getAuth
};
