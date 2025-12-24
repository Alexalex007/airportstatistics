import { AirportData, ChartDataPoint } from "../types";

// ----------------------------------------------------------------------
// 原始數據庫 (Raw Data)
// ----------------------------------------------------------------------
// 結構: { 機場代碼: { name, sources, summaries: {年份: 描述}, stats: {年份: [1-12月數據]} } }

const AIRPORT_RAW_DATA: Record<string, {
  name: string;
  sources: { title: string; uri: string }[];
  summaries: Record<number, string>;
  stats: Record<number, number[]>;
}> = {
  "HKG": {
    name: "香港國際機場 (HKG)",
    sources: [{ title: "香港機場管理局官方公佈", uri: "https://www.hongkongairport.com" }],
    summaries: {
      2024: "2024年全年客運量達 5,305 萬人次 (53,055,000)，較 2023 年增長約 34.4%。單月客運量於 12 月突破 500 萬人次，顯示航空交通量持續強勁復甦。",
      2023: "2023年為疫後復甦關鍵年，全年客運量約 3,949 萬人次。隨著旅遊限制解除，下半年客運量增長顯著。"
    },
    stats: {
      2024: [4131000, 4205000, 4355000, 4214000, 4058000, 4282000, 4743000, 4918000, 4055000, 4546000, 4439000, 5106000], 
      2023: [2070000, 2145000, 2784000, 3112000, 3107000, 3320000, 3816000, 3998000, 3313000, 3748000, 3761000, 4316000]
    }
  },
  "TPE": {
    name: "台灣桃園機場 (TPE)",
    sources: [{ title: "桃園機場統計報表", uri: "https://www.taoyuan-airport.com" }],
    summaries: {
      2024: "2024年全年總客運量達 4,492 萬人次 (44,921,996)，較 2023 年成長 27.06%。單月客運量於年底 12 月突破 400 萬大關，顯示旅運需求強勁復甦。",
      2023: "2023年全年總客運量為 3,535 萬人次 (35,354,924)。隨著國境解封，下半年客運量顯著回升。"
    },
    stats: {
      2024: [3589422, 3665758, 3915713, 3680062, 3555852, 3777405, 3857630, 3946200, 3480525, 3698791, 3738700, 4015938],
      2023: [2069808, 2028972, 2447470, 2747391, 2745676, 3128002, 3325281, 3390100, 3051050, 3456427, 3387013, 3577734]
    }
  },
  "SIN": {
    name: "新加坡樟宜機場 (SIN)",
    sources: [{ title: "Changi Airport Group", uri: "https://www.changiairport.com" }],
    summaries: {
      2024: "2024年全年客運量達6,770萬人次，較2023年增長14.8%。整體表現已接近疫情前2019年水平（與2019年相比僅差0.93%），免簽證政策及航班運力恢復是主要推動力。",
      2023: "2023年航班運力快速恢復，全年客運量達5,890萬人次，樟宜機場重返繁忙樞紐地位。"
    },
    stats: {
      2024: [5430000, 5350000, 5730000, 5400000, 5480000, 5620000, 5700000, 5730000, 5400000, 5650000, 5740000, 6410000],
      2023: [4370000, 4003000, 4630000, 4603000, 4840000, 5120000, 5270000, 5150000, 4870000, 5120000, 5150000, 5810000]
    }
  },
  "BKK": {
    name: "曼谷素萬那普機場 (BKK)",
    sources: [{ title: "Airports of Thailand (AOT) Report", uri: "https://www.airportthai.co.th" }],
    summaries: {
      2025: "數據待更新。",
      2024: "2024年全年客運量達6,223萬人次，較2023年增長20.38%。受惠於免簽證政策及國際航班運力恢復，所有月份均錄得增長，其中第一季及年底旅遊旺季表現最為強勁。",
      2023: "2023年為泰國旅遊業全面重啟之年，全年客運量達5,169萬人次，下半年增長尤為明顯。"
    },
    stats: {
      2025: [], // Placeholder for future data
      2024: [5340635, 5297911, 5425447, 5175262, 4752715, 4687383, 5229699, 5282745, 4514319, 5045721, 5460064, 6022792],
      2023: [4286443, 3971181, 4339706, 4142992, 3902262, 3903267, 4421739, 4474970, 3963336, 4439195, 4625552, 5228461]
    }
  },
  "ICN": {
    name: "首爾仁川機場 (ICN)",
    sources: [{ title: "Incheon Airport Stats", uri: "https://www.airport.kr" }],
    summaries: {
      2024: "2024年全年客運量達 7,116 萬人次 (71,156,947)，較 2023 年增長 26.8%。單月客運量穩定維持在 550 萬以上，年底更突破 645 萬，顯示韓國航空樞紐地位完全恢復。",
      2023: "2023年全年客運量為 5,613 萬人次 (56,131,064)。隨著東亞航線復甦，下半年客運量增長強勁，年底已接近疫情前水準。"
    },
    stats: {
      2024: [5827109, 5736757, 5694105, 5563719, 5684889, 5772177, 6137513, 6371478, 5781303, 6203582, 5932689, 6451626],
      2023: [3845153, 3730499, 3909015, 4048187, 4394892, 4618738, 5239356, 5440372, 4846532, 5372752, 5079595, 5605973]
    }
  }
};

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ----------------------------------------------------------------------
// 服務邏輯
// ----------------------------------------------------------------------

export const fetchAirportStats = async (query: string, year: number = 2024): Promise<AirportData> => {
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const code = query.split(' ')[0];
  const airport = AIRPORT_RAW_DATA[code];
  
  if (!airport) {
    throw new Error(`找不到 ${code} 的數據`);
  }

  // Get data for selected year
  const currentStats = airport.stats[year] || [];
  // Get data for previous year for comparison
  const prevYear = year - 1;
  const prevStats = airport.stats[prevYear] || [];

  // Construct chart data
  const chartData: ChartDataPoint[] = [];
  
  // We determine how many months to show based on the data available in the requested year.
  // If requested year is empty (e.g., 2025), we might show 12 empty months or nothing.
  // Let's show 12 months structure if it's a valid year, but empty values if no data.
  const loopCount = currentStats.length > 0 ? currentStats.length : 12;

  for (let i = 0; i < loopCount; i++) {
    const passengers = currentStats[i] || 0;
    const comparison = prevStats[i]; // undefined if not available

    // Only add to chart if we have current data, OR if we want to show empty slots (let's show only if we have data or if it's the current year view but empty)
    // To keep it clean: if current stats exist, map them.
    if (currentStats.length > 0) {
       chartData.push({
         period: `${year} ${MONTH_NAMES[i]}`,
         passengers: passengers,
         comparison: comparison
       });
    }
  }
  
  // If chartData is empty (e.g. 2025), maybe initialize empty months so the chart renders empty grid
  if (chartData.length === 0) {
      MONTH_NAMES.forEach(month => {
          chartData.push({
              period: `${year} ${month}`,
              passengers: 0,
              comparison: prevStats[MONTH_NAMES.indexOf(month)] // Show previous year even if current is 0? Optional.
          });
      });
  }

  // Get summary for that year, fallback to generic or latest
  let summary = airport.summaries[year];
  if (!summary) {
    // Fallback logic
    if (year > 2024) summary = "數據待更新。";
    else summary = airport.summaries[2024] || "暫無詳細分析。";
  }

  return {
    airportName: airport.name,
    summary,
    chartData,
    sources: airport.sources
  };
};