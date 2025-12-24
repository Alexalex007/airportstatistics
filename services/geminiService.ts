import { AirportData } from "../types";

// 這裡就是「人手輸入」的地方。您可以直接修改下方的數據。
const MANUAL_DATABASE: Record<string, AirportData> = {
  "HKG": {
    airportName: "香港國際機場 (HKG)",
    summary: "2024年客運量強勁復甦，受惠於長假期及大型國際活動，單月客運量已回復至疫情前80%水平。東南亞及日本航線增長最為顯著。",
    chartData: [
      { period: "2024 Jan", passengers: 4100000, comparison: 2100000 },
      { period: "2024 Feb", passengers: 4200000, comparison: 2150000 },
      { period: "2024 Mar", passengers: 4350000, comparison: 2600000 },
      { period: "2024 Apr", passengers: 4250000, comparison: 3100000 },
      { period: "2024 May", passengers: 4100000, comparison: 3200000 },
      { period: "2024 Jun", passengers: 4500000, comparison: 3300000 }
    ],
    sources: [
      { title: "香港機場管理局官方公佈", uri: "https://www.hongkongairport.com" }
    ]
  },
  "TPE": {
    airportName: "台灣桃園機場 (TPE)",
    summary: "受惠於日韓旅遊熱潮及轉機市場暢旺，客運量穩步上揚。北美轉機客源佔比較去年同期增加15%。",
    chartData: [
      { period: "2024 Jan", passengers: 3800000, comparison: 2000000 },
      { period: "2024 Feb", passengers: 3950000, comparison: 2200000 },
      { period: "2024 Mar", passengers: 3850000, comparison: 2400000 },
      { period: "2024 Apr", passengers: 3700000, comparison: 2800000 },
      { period: "2024 May", passengers: 3800000, comparison: 3000000 },
      { period: "2024 Jun", passengers: 4000000, comparison: 3200000 }
    ],
    sources: [
      { title: "桃園機場統計報表", uri: "https://www.taoyuan-airport.com" }
    ]
  },
  "SIN": {
    airportName: "新加坡樟宜機場 (SIN)",
    summary: "作為東南亞主要樞紐，免簽證政策推動中國遊客數量回升，整體客運量已接近全面恢復。",
    chartData: [
      { period: "2024 Jan", passengers: 5200000, comparison: 4300000 },
      { period: "2024 Feb", passengers: 5100000, comparison: 4000000 },
      { period: "2024 Mar", passengers: 5300000, comparison: 4500000 },
      { period: "2024 Apr", passengers: 5150000, comparison: 4600000 },
      { period: "2024 May", passengers: 5250000, comparison: 4700000 },
      { period: "2024 Jun", passengers: 5400000, comparison: 4900000 }
    ],
    sources: [
      { title: "Changi Airport Group", uri: "https://www.changiairport.com" }
    ]
  },
  "BKK": {
    airportName: "曼谷素萬那普機場 (BKK)",
    summary: "泰國旅遊業復甦帶動機場人流，尤其是來自印度及俄羅斯的遊客數量顯著增加。",
    chartData: [
      { period: "2024 Jan", passengers: 4800000, comparison: 3800000 },
      { period: "2024 Feb", passengers: 4900000, comparison: 3900000 },
      { period: "2024 Mar", passengers: 4700000, comparison: 4000000 },
      { period: "2024 Apr", passengers: 4600000, comparison: 3800000 },
      { period: "2024 May", passengers: 4500000, comparison: 3700000 },
      { period: "2024 Jun", passengers: 4650000, comparison: 3900000 }
    ],
    sources: [
      { title: "Airports of Thailand", uri: "https://www.airportthai.co.th" }
    ]
  },
  "ICN": {
    airportName: "首爾仁川機場 (ICN)",
    summary: "轉機旅客創下歷史新高，帶動整體運量突破預期。貨運量亦保持平穩。",
    chartData: [
      { period: "2024 Jan", passengers: 5500000, comparison: 3500000 },
      { period: "2024 Feb", passengers: 5400000, comparison: 3600000 },
      { period: "2024 Mar", passengers: 5200000, comparison: 3800000 },
      { period: "2024 Apr", passengers: 5300000, comparison: 4000000 },
      { period: "2024 May", passengers: 5400000, comparison: 4200000 },
      { period: "2024 Jun", passengers: 5600000, comparison: 4500000 }
    ],
    sources: [
      { title: "Incheon Airport Stats", uri: "https://www.airport.kr" }
    ]
  }
};

// Mock function that returns static data immediately
export const fetchAirportStats = async (query: string): Promise<AirportData> => {
  // Simulate a tiny network delay for better UX (optional)
  await new Promise(resolve => setTimeout(resolve, 300));

  // Extract airport code from query (e.g., "HKG" from "HKG 香港國際機場")
  const code = query.split(' ')[0];
  
  const data = MANUAL_DATABASE[code];
  
  if (!data) {
    throw new Error(`找不到 ${code} 的數據`);
  }

  return data;
};
