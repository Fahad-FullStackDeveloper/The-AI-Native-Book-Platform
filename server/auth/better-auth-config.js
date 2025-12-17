const { betterAuth } = require("better-auth");

// Initialize better-auth with in-memory adapter for development
const auth = betterAuth({
  database: {
    provider: 'sqlite',
    url: ':memory:',
  },
  // Custom fields for user background
  user: {
    additionalFields: {
      backgroundSoftware: {
        type: 'string',
        required: false
      },
      backgroundHardware: {
        type: 'string',
        required: false
      },
      backgroundDescription: {
        type: 'string',
        required: false
      }
    }
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    // Optional: Add social login providers later
  }
});

module.exports = auth;