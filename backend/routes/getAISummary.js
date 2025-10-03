import express from "express";
import dotenv from "dotenv";
dotenv.config();
import { OpenAI } from "openai/client.js";

const router = express.Router();

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Function to extract valid JSON from model response
function extractJsonFromString(str) {
  const cleaned = str
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();

  let start = cleaned.indexOf("{");
  if (start === -1) throw new Error("No JSON start found.");

  let depth = 0;
  for (let i = start; i < cleaned.length; i++) {
    if (cleaned[i] === "{") depth++;
    else if (cleaned[i] === "}") depth--;

    if (depth === 0) {
      const candidate = cleaned.slice(start, i + 1);
      try {
        return JSON.parse(candidate);
      } catch (err) {
        throw new Error("Found JSON block but it could not be parsed.");
      }
    }
  }

  throw new Error("Incomplete JSON object detected.");
}

// POST route to handle AI summary
router.post("/get_ai_summary", async (req, res) => {
  const {
    make,
    model,
    year,
    engineSize,
    fuelType,
    transmission,
    mileage,
    price,
    doors,
  } = req.body;

  // Basic validation
  if (!make || !model || !year || !price || !mileage) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const prompt = `
You are a UK car expert. Evaluate cars objectively based on the details provided.  
All units must use UK measurement standards. Your responses must be fact-based, neutral, and focused on the car rather than the brand.  

Given the following car details: 
Make: ${make} 
Model: ${model} 
Year: ${year} 
Engine Size: ${engineSize} 
Fuel Type: ${fuelType} 
Transmission: ${transmission} 
Mileage: ${mileage} 
Doors: ${doors} 
Price: ${price}

Follow these guidelines carefully:  

1. **Ratings**: Provide integer ratings from 0 to 10 for price, comfort, performance, and reliability.  
2. **Comments**: Each comment must be a maximum of two sentences, concise and informative.  
3. **Price**: Evaluate the value for money, taking into account the car’s mileage and typical UK market pricing.  
4. **Comfort**: Assess interior space, seating, ride quality, and ergonomics.  
5. **Performance**: Assess engine, transmission, handling, and fuel efficiency.  
6. **Reliability**: Mention known common faults and approximate UK repair costs if applicable. If no major recurring issues are known, state that explicitly.  
7. **SimilarCars**: Provide a comma-separated list of 2–3 comparable cars available in the UK market.  

**Output Format:** The response must strictly follow this JSON schema, with no extra text, formatting, or commentary outside of the JSON object:

{
  "priceRating": 0,             // Integer 0–10
  "priceComment": "",            // Max 2 sentences
  "comfortRating": 0,           // Integer 0–10
  "comfortComment": "",          // Max 2 sentences
  "performanceRating": 0,       // Integer 0–10
  "performanceComment": "",      // Max 2 sentences
  "reliabilityRating": 0,       // Integer 0–10
  "reliabilityComment": "",      // Max 2 sentences, include faults and costs if known
  "similarCars": ""              // Comma-separated list of 2–3 comparable cars in the UK
}

**Requirements:**  
- Use UK spelling and units.  
- Do not add any explanations, text, or commentary outside of the JSON.  
- Keep all comments objective, neutral, and focused on the car itself.  
- Always provide complete JSON even if some data is unknown; fill unknowns with an honest statement.  

`;

  try {
    const completion = await openai.chat.completions.create({
      model: "openai/gpt-oss-20b:free",
      messages: [
        {
          role: "system",
          content:
            "You are a JSON generator. Respond only with a valid JSON object, no extra text. You must return valid compact JSON, without markdown or code fences.",
        },
        {
          role: "user",
          content: prompt.trim(),
        },
      ],
      temperature: 0,
    });

    const raw = completion.choices?.[0]?.message?.content;
    if (!raw) {
      return res.status(500).json({ error: "No response from model." });
    }

    console.log("Raw model output:\n", raw);

    // Try to parse JSON
    let parsed;
    try {
      parsed = extractJsonFromString(raw);
    } catch (err) {
      console.error("JSON parse failed:", err.message);
      return res
        .status(500)
        .json({ error: "Failed to parse model response.", raw });
    }

    // Validate required keys exist
    const requiredKeys = [
      "priceRating",
      "priceComment",
      "comfortRating",
      "comfortComment",
      "performanceRating",
      "performanceComment",
      "reliabilityRating",
      "reliabilityComment",
      "similarCars",
    ];
    for (const key of requiredKeys) {
      if (!(key in parsed)) {
        return res.status(500).json({
          error: `Missing key in AI response: ${key}`,
          parsed,
        });
      }
    }

    return res.json(parsed);
  } catch (error) {
    console.error("Error in AI route:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
