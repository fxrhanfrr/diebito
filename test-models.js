const { GoogleGenerativeAI } = require("@google/generative-ai");

const fs = require('fs');
const path = require('path');

function getEnvKey() {
    try {
        const envPath = path.join(__dirname, '.env.local');
        const content = fs.readFileSync(envPath, 'utf8');
        const match = content.match(/GOOGLE_GENERATIVE_AI_API_KEY=(.*)/);
        return match ? match[1].trim() : null;
    } catch (e) {
        return null;
    }
}

async function main() {
    const apiKey = getEnvKey();
    if (!apiKey) {
        console.error("Could not find API KEY in .env.local");
        return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        console.log("Checking model...");
        // Just try to generate something simple to prove it works
        const result = await model.generateContent("Hello");
        console.log("Success! Response:", result.response.text());
    } catch (error) {
        console.error("Error testing model:", error.message);

        // Try listing models if possible (not directly exposed in this helper, but we catch the error)
        console.log("Trying to list models via raw fetch...");
        try {
            const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
            const data = await response.json();
            console.log("Available Models:", JSON.stringify(data, null, 2));
        } catch (e) {
            console.error("Failed to list models:", e);
        }
    }
}

main();
