require("dotenv").config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("GEMINI_API_KEY not found in environment variables");
    process.exit(1);
  }

  try {
    console.log("Fetching available Gemini models...\n");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    console.log("Available Models:");
    console.log("=================\n");

    if (data.models) {
      data.models.forEach((model) => {
        console.log(`Model: ${model.name}`);
        console.log(`Display Name: ${model.displayName || "N/A"}`);
        console.log(`Description: ${model.description || "N/A"}`);
        console.log(
          `Supported Methods: ${
            model.supportedGenerationMethods
              ? model.supportedGenerationMethods.join(", ")
              : "N/A"
          }`
        );
        console.log(`Input Token Limit: ${model.inputTokenLimit || "N/A"}`);
        console.log(`Output Token Limit: ${model.outputTokenLimit || "N/A"}`);
        console.log("---\n");
      });

      // Filter models that support generateContent
      console.log("\n\nModels that support generateContent:");
      console.log("=====================================\n");
      const contentGenModels = data.models.filter(
        (model) =>
          model.supportedGenerationMethods &&
          model.supportedGenerationMethods.includes("generateContent")
      );
      contentGenModels.forEach((model) => {
        console.log(`- ${model.name}`);
      });
    } else {
      console.log("No models found");
    }
  } catch (error) {
    console.error("Error listing models:", error.message);
    process.exit(1);
  }
}

listModels();
