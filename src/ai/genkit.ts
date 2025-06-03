// src/ai/genkit.ts
import { genkit, googleAI } from 'genkit';

// Configure Genkit
// IMPORTANT: Ensure you have GOOGLE_API_KEY set in your environment for googleAI() to work.
export const ai = genkit({
  plugins: [
    googleAI(), // Uses GOOGLE_API_KEY from environment
  ],
  // logLevel: 'debug', // Optional: for more detailed logs
  // logSink: console.log, // Optional: direct logs to console
});
