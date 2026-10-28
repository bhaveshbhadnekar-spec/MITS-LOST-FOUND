const { GoogleGenerativeAI } = require("@google/generative-ai");

const VALID_CATEGORIES = [
  "Mobile",
  "Laptop",
  "Wallet",
  "ID Card",
  "Keys",
  "Books",
  "Accessories",
  "Documents",
  "Others",
];

// Helper to sanitize and normalize category
function matchCategory(catStr = "") {
  if (!catStr) return "Others";
  const normalized = catStr.trim().toLowerCase();
  for (const cat of VALID_CATEGORIES) {
    if (cat.toLowerCase() === normalized) return cat;
  }
  // Keyword-based fallback
  if (normalized.includes("phone") || normalized.includes("mobile") || normalized.includes("iphone") || normalized.includes("samsung") || normalized.includes("android")) {
    return "Mobile";
  }
  if (normalized.includes("laptop") || normalized.includes("macbook") || normalized.includes("charger") || normalized.includes("computer")) {
    return "Laptop";
  }
  if (normalized.includes("wallet") || normalized.includes("purse") || normalized.includes("money")) {
    return "Wallet";
  }
  if (normalized.includes("card") || normalized.includes("id") || normalized.includes("pass") || normalized.includes("badge")) {
    return "ID Card";
  }
  if (normalized.includes("key")) {
    return "Keys";
  }
  if (normalized.includes("book") || normalized.includes("notebook") || normalized.includes("register") || normalized.includes("copy")) {
    return "Books";
  }
  if (normalized.includes("watch") || normalized.includes("bag") || normalized.includes("bottle") || normalized.includes("earphone") || normalized.includes("headphone") || normalized.includes("glasses") || normalized.includes("ring")) {
    return "Accessories";
  }
  if (normalized.includes("doc") || normalized.includes("certificate") || normalized.includes("paper")) {
    return "Documents";
  }
  return "Others";
}

// Fallback smart heuristic analyzer if Gemini key is missing or API is unreachable
function heuristicAnalysis(file) {
  const originalName = file?.originalname || "item";
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
  
  return {
    itemName: nameWithoutExt && nameWithoutExt !== "image" && nameWithoutExt !== "camera shot" && nameWithoutExt !== "blob"
      ? nameWithoutExt.charAt(0).toUpperCase() + nameWithoutExt.slice(1)
      : "Found/Lost Campus Item",
    category: matchCategory(nameWithoutExt),
    description: "Item captured via camera. Clear photo attached. Please verify color, brand, and details before submitting.",
    suggestedLocation: "",
    extractedText: "",
  };
}

exports.analyzeItemImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided for analysis.",
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // If no Gemini API key is configured, return clean heuristic data with guidance
    if (!apiKey) {
      const fallback = heuristicAnalysis(req.file);
      return res.status(200).json({
        success: true,
        aiPowered: false,
        message: "Image processed. To enable full AI vision recognition, set GEMINI_API_KEY in backend/.env.",
        data: fallback,
      });
    }

    // Call Google Gemini Vision model
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const imagePart = {
        inlineData: {
          data: req.file.buffer.toString("base64"),
          mimeType: req.file.mimetype,
        },
      };

      const prompt = `You are an expert AI lost & found assistant for MITS Gwalior college campus.
Analyze this photo of an item that was lost or found on campus.
Extract key information to auto-fill a lost & found report.

Return STRICTLY a JSON object without markdown formatting, backticks, or other text.
The JSON must follow this exact schema:
{
  "itemName": "Concise and descriptive item name including brand or model if visible (max 60 characters, e.g. 'Black Dell 65W Laptop Charger', 'Boat Rockerz 450 Black Headphones', 'College Identity Card - CSE')",
  "category": "Must be exactly one of: Mobile, Laptop, Wallet, ID Card, Keys, Books, Accessories, Documents, Others",
  "description": "2-3 sentences describing the item: primary and secondary colors, materials, condition, visible logos/brands, unique stickers or scratches, and any distinctive identifiers",
  "suggestedLocation": "Potential campus location if identifiable from image context (e.g. 'Classroom Desk', 'Computer Lab', 'Library'), otherwise empty string ''",
  "extractedText": "Any prominent readable text found on the item such as names, enrollment numbers, serial codes, or brand labels, otherwise empty string ''"
}`;

      const modelsToTry = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.8-flash"];
      let result = null;
      let lastModelError = null;

      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          result = await model.generateContent([prompt, imagePart]);
          if (result) break;
        } catch (mErr) {
          lastModelError = mErr;
          console.warn(`Model ${modelName} attempt failed:`, mErr.message);
        }
      }

      if (!result) {
        throw lastModelError || new Error("All Gemini vision models failed");
      }

      const response = await result.response;
      let text = response.text().trim();

      // Clean markdown code blocks if returned
      if (text.startsWith("```json")) {
        text = text.replace(/^```json/, "").replace(/```$/, "").trim();
      } else if (text.startsWith("```")) {
        text = text.replace(/^```/, "").replace(/```$/, "").trim();
      }

      let parsedData;
      try {
        parsedData = JSON.parse(text);
      } catch (e) {
        // Fallback simple parsing if output had extra text
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Could not parse AI response as JSON");
        }
      }

      const structuredResult = {
        itemName: parsedData.itemName || "Campus Item",
        category: matchCategory(parsedData.category),
        description: parsedData.description || "Photo captured item.",
        suggestedLocation: parsedData.suggestedLocation || "",
        extractedText: parsedData.extractedText || "",
      };

      return res.status(200).json({
        success: true,
        aiPowered: true,
        message: "AI image analysis completed successfully.",
        data: structuredResult,
      });
    } catch (aiErr) {
      console.warn("Gemini Vision API error (falling back to heuristic analysis):", aiErr.message);
      const fallback = heuristicAnalysis(req.file);
      return res.status(200).json({
        success: true,
        aiPowered: false,
        message: "AI analysis unavailable, using smart photo template. You can verify and fill in details.",
        data: fallback,
      });
    }
  } catch (err) {
    next(err);
  }
};
