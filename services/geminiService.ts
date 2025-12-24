import { GoogleGenAI } from "@google/genai";
import { AirportData, ChartDataPoint, GroundingSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Map airport codes to the specific official URLs requested by the user
const OFFICIAL_SOURCES: Record<string, string> = {
  HKG: "https://www.hongkongairport.com/tc/the-airport/hkia-at-a-glance/fact-figures.page",
  TPE: "https://www.taoyuanairport.com.tw/passengervolume",
  SIN: "https://www.changiairport.com/en/corporate/about-us/traffic-statistics.html",
  ICN: "https://www.airport.kr/co_en/4272/subview.do",
  BKK: "https://investor.airportthai.co.th/transport.html",
};

export const fetchAirportStats = async (query: string): Promise<AirportData> => {
  // Using gemini-2.0-flash which has robust Google Search Grounding support
  const modelId = "gemini-2.0-flash"; 

  // Extract the airport code (first 3 letters) from the query to find the target URL
  const airportCode = query.substring(0, 3).toUpperCase();
  const targetUrl = OFFICIAL_SOURCES[airportCode] || "";

  const prompt = `
    You are a real-time data extraction tool. Your goal is to find the **LATEST available monthly passenger traffic statistics** for "${query}".
    
    *** PRIORITY DATA SOURCES ***
    You MUST prioritize searching and extracting data specifically from this official URL:
    Target Site: ${targetUrl}
    
    INSTRUCTIONS:
    1. Access the target site (or the latest PDF/Excel reports linked on that site) to find the "Passenger Traffic" or "Passenger Movements" table.
    2. **SEQUENTIAL DATA (NO GAPS)**: You MUST extract data for **EVERY SINGLE MONTH** from January 2024 up to the latest available month. **DO NOT SKIP ANY MONTH**.
       - Correct: Jan, Feb, Mar, Apr, May...
       - Incorrect: Jan, Mar, May... (Do not do this).
    3. **CRITICAL**: Provide **EXACT integers** for passenger counts. **DO NOT ROUND** (e.g., return 3456789, NOT 3.45M).
    4. Look specifically for **comparisons with the same month last year** (Year-over-Year). 
       - If the 2024 table doesn't show 2023 data, search for the 2023 reports on the same site to populate the comparison field.

    RESPONSE FORMAT:
    1. A brief "Data Summary" text (in Traditional Chinese 繁體中文). Summarize the latest month's performance.
    2. A JSON code block with the chart data.
    
    JSON STRUCTURE:
    [
      {
        "period": "2024-01",   // Format: YYYY-MM
        "passengers": 3412567, // EXACT integer, no rounding
        "comparison": 2890123  // EXACT integer for same month last year (2023)
      },
      {
        "period": "2024-02",
        "passengers": 3100200,
        "comparison": 2500100
      }
      // Continue for ALL available months...
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1, 
      },
    });

    const text = response.text || "";
    
    // Extract Sources (Grounding)
    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          sources.push({
            title: chunk.web.title,
            uri: chunk.web.uri,
          });
        }
      });
    }

    // Extract JSON for Chart
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    let chartData: ChartDataPoint[] = [];
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        chartData = JSON.parse(jsonMatch[1]);
        // Sort by period to ensure chronological order
        chartData.sort((a, b) => a.period.localeCompare(b.period));
      } catch (e) {
        console.error("Failed to parse chart data JSON", e);
      }
    }

    // Clean text (remove the JSON block)
    const cleanSummary = text.replace(/```(?:json)?[\s\S]*?```/, "").trim();

    return {
      airportName: query,
      summary: cleanSummary,
      chartData,
      sources,
    };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to fetch data.");
  }
};