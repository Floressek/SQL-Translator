import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { loggerOpenAI } from "../Utils/logger.js";
import { AppError } from "../Utils/AppError.js";

const openai = new OpenAI();

export async function generateGPTAnswer(prompt, responseFormat, responseName) {
  try {
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: prompt,
      response_format: zodResponseFormat(responseFormat, responseName),
    });

    const response = completion.choices[0].message;

    if (response.refusal) {
      // Custom feedback after disturbing user input
      throw new AppError(
        "GPT model refused to answer due to disturbing user input."
      );
    }
    if (!response.parsed) {
      throw new AppError(`Generated GPT answer is null or undefined.`);
    }

    loggerOpenAI.info("Successfully generated an AI response! ✅");
    return response.parsed;
  } catch (error) {
    loggerOpenAI.error("❌ Error generating GPT answer.");
    throw error;
  }
}
