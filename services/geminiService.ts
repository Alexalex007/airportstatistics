import { AirportData, ChartDataPoint } from "../types";
import { Language } from "../locales/translations";

// ----------------------------------------------------------------------
// 原始數據庫 (Raw Data)
// ----------------------------------------------------------------------

interface MultiLangString {
  'zh-TW': string;
  'zh-CN': string;
  'en': string;
}

const AIRPORT_RAW_DATA: Record<string, {
  name: MultiLangString;
  sources: { title: string; uri: string }[];
  summaries: Record<number, MultiLangString>;
  stats: Record<number, number[]>;
}> = {
  "HKG": {
    name: {
      'zh-TW': "香港國際機場",
      'zh-CN': "香港国际机场",
      'en': "Hong Kong Int'l Airport"
    },
    sources: [{ title: "香港機場管理局官方公佈", uri: "https://www.hongkongairport.com" }],
    summaries: {
      2026: {
         'zh-TW': "2026年數據尚未發布。",
         'zh-CN': "2026年数据尚未发布。",
         'en': "Data for 2026 is not yet released."
      },
      2025: {
         'zh-TW': "2025年數據截至11月，累計客運量達 5,524 萬人次，較 2024 年同期成長約 15.2%。單月客運量表現強勁，於 8 月達到 568 萬人次高峰，顯示國際航空樞紐地位穩固。",
         'zh-CN': "2025年数据截至11月，累计客运量达 5,524 万人次，较 2024 年同期增长约 15.2%。单月客运量表现强劲，于 8 月达到 568 万人次高峰，显示国际航空枢纽地位稳固。",
         'en': "As of Nov 2025, cumulative passengers reached 55.24 million, up 15.2% YoY. Monthly traffic peaked at 5.68 million in August, solidifying its hub status."
      },
      2024: {
         'zh-TW': "2024年全年客運量達 5,305 萬人次 (53,055,000)，較 2023 年增長約 34.4%。單月客運量於 12 月突破 500 萬人次，顯示航空交通量持續強勁復甦。",
         'zh-CN': "2024年全年客运量达 5,305 万人次，较 2023 年增长约 34.4%。单月客运量于 12 月突破 500 万人次，显示航空交通量持续强劲复苏。",
         'en': "Total passengers in 2024 reached 53.05 million, a 34.4% increase from 2023. Monthly traffic exceeded 5 million in December, indicating strong recovery."
      },
      2023: {
         'zh-TW': "2023年為疫後復甦關鍵年，全年客運量約 3,949 萬人次。隨著旅遊限制解除，下半年客運量增長顯著。",
         'zh-CN': "2023年为疫后复苏关键年，全年客运量约 3,949 万人次。随着旅游限制解除，下半年客运量增长显著。",
         'en': "2023 marked a key recovery year with 39.49 million passengers. Traffic grew significantly in the second half as travel restrictions were lifted."
      }
    },
    stats: {
      2026: [],
      2025: [5269000, 4514000, 4800000, 5184000, 4856000, 4760000, 5203000, 5680000, 4417000, 5367000, 5194000],
      2024: [4131000, 4205000, 4355000, 4214000, 4058000, 4282000, 4743000, 4918000, 4055000, 4546000, 4439000, 5106000], 
      2023: [2070000, 2145000, 2784000, 3112000, 3107000, 3320000, 3816000, 3998000, 3313000, 3748000, 3761000, 4316000]
    }
  },
  "TPE": {
    name: {
      'zh-TW': "臺灣桃園國際機場",
      'zh-CN': "台湾桃园国际机场",
      'en': "Taiwan Taoyuan Int'l Airport"
    },
    sources: [{ title: "桃園機場統計報表", uri: "https://www.taoyuan-airport.com" }],
    summaries: {
      2026: { 'zh-TW': "2026年數據尚未發布。", 'zh-CN': "2026年数据尚未发布。", 'en': "Data for 2026 is not yet released." },
      2025: {
         'zh-TW': "2025年數據截至11月，累計客運量達 4,348 萬人次，較 2024 年同期成長 6.29%。其中 1 月、7 月、8 月、10 月及 11 月單月客運量均突破 400 萬人次。",
         'zh-CN': "2025年数据截至11月，累计客运量达 4,348 万人次，较 2024 年同期成长 6.29%。部分月份单月客运量突破 400 万人次。",
         'en': "As of Nov 2025, cumulative passengers reached 43.48 million, up 6.29% YoY. Monthly traffic exceeded 4 million in Jan, Jul, Aug, Oct, and Nov."
      },
      2024: {
         'zh-TW': "2024年全年總客運量達 4,492 萬人次，較 2023 年成長 27.06%。單月客運量於年底 12 月突破 400 萬大關，顯示旅運需求強勁復甦。",
         'zh-CN': "2024年全年总客运量达 4,492 万人次，较 2023 年成长 27.06%。",
         'en': "Total passengers in 2024 reached 44.92 million, up 27.06% from 2023. Monthly traffic broke the 4 million mark in December."
      },
      2023: {
         'zh-TW': "2023年全年總客運量為 3,535 萬人次。隨著國境解封，下半年客運量顯著回升。",
         'zh-CN': "2023年全年总客运量为 3,535 万人次。随着国境解封，下半年客运量显著回升。",
         'en': "Total passengers in 2023 were 35.35 million. Traffic rebounded significantly in the second half following border reopenings."
      }
    },
    stats: {
      2026: [],
      2025: [4078276, 3714480, 3954945, 3968204, 3856742, 3895235, 4030257, 4185544, 3540816, 4202003, 4054033],
      2024: [3589422, 3665758, 3915713, 3680062, 3555852, 3777405, 3857630, 3946200, 3480525, 3698791, 3738700, 4015938],
      2023: [2069808, 2028972, 2447470, 2747391, 2745676, 3128002, 3325281, 3390100, 3051050, 3456427, 3387013, 3577734]
    }
  },
  "SIN": {
    name: {
      'zh-TW': "新加坡樟宜國際機場",
      'zh-CN': "新加坡樟宜国际机场",
      'en': "Singapore Changi Airport"
    },
    sources: [{ title: "Changi Airport Group", uri: "https://www.changiairport.com" }],
    summaries: {
      2026: { 'zh-TW': "2026年數據尚未發布。", 'zh-CN': "2026年数据尚未发布。", 'en': "Data for 2026 is not yet released." },
      2025: {
         'zh-TW': "2025年數據截至11月，累計客運量達 6,364 萬人次，較 2024 年同期成長約 3.9%。1月創下 616 萬人次的高峰。",
         'zh-CN': "2025年数据截至11月，累计客运量达 6,364 万人次，较 2024 年同期成长约 3.9%。",
         'en': "As of Nov 2025, cumulative passengers reached 63.64 million, up 3.9% YoY. January saw a peak of 6.16 million passengers."
      },
      2024: {
         'zh-TW': "2024年全年客運量達6,770萬人次，較2023年增長14.8%。整體表現已接近疫情前2019年水平。",
         'zh-CN': "2024年全年客运量达6,770万人次，较2023年增长14.8%。整体表现已接近疫情前2019年水平。",
         'en': "2024 total passengers reached 67.7 million, up 14.8% from 2023, nearing pre-pandemic 2019 levels."
      },
      2023: {
         'zh-TW': "2023年航班運力快速恢復，全年客運量達5,890萬人次，樟宜機場重返繁忙樞紐地位。",
         'zh-CN': "2023年航班运力快速恢复，全年客运量达5,890万人次。",
         'en': "Flight capacity recovered quickly in 2023, with total passengers reaching 58.9 million."
      }
    },
    stats: {
      2026: [],
      2025: [6160000, 5440000, 5620000, 5780000, 5820000, 5880000, 5970000, 5910000, 5470000, 5840000, 5750000],
      2024: [5430000, 5350000, 5730000, 5400000, 5480000, 5620000, 5700000, 5730000, 5400000, 5650000, 5740000, 6410000],
      2023: [4370000, 4003000, 4630000, 4603000, 4840000, 5120000, 5270000, 5150000, 4870000, 5120000, 5150000, 5810000]
    }
  },
  "BKK": {
    name: {
      'zh-TW': "曼谷素萬那普國際機場",
      'zh-CN': "曼谷素万那普国际机场",
      'en': "Suvarnabhumi Airport"
    },
    sources: [{ title: "Airports of Thailand (AOT) Report", uri: "https://www.airportthai.co.th" }],
    summaries: {
      2026: { 'zh-TW': "2026年數據尚未發布。", 'zh-CN': "2026年数据尚未发布。", 'en': "Data for 2026 is not yet released." },
      2025: {
         'zh-TW': "2025年數據截至11月，累計客運量達 5,678 萬人次。年初旺季客運量突破 600 萬，顯示泰國旅遊吸引力依然強勁。",
         'zh-CN': "2025年数据截至11月，累计客运量达 5,678 万人次。年初旺季客运量突破 600 万。",
         'en': "As of Nov 2025, cumulative passengers reached 56.78 million. Early year peak traffic exceeded 6 million."
      },
      2024: {
         'zh-TW': "2024年全年客運量達6,223萬人次，較2023年增長20.38%。受惠於免簽證政策及國際航班運力恢復。",
         'zh-CN': "2024年全年客运量达6,223万人次，较2023年增长20.38%。",
         'en': "2024 total passengers reached 62.23 million, up 20.38% from 2023, boosted by visa-free policies."
      },
      2023: {
         'zh-TW': "2023年為泰國旅遊業全面重啟之年，全年客運量達5,169萬人次。",
         'zh-CN': "2023年为泰国旅游业全面重启之年，全年客运量达5,169万人次。",
         'en': "2023 was a year of full restart for Thai tourism, with total passengers reaching 51.69 million."
      }
    },
    stats: {
      2026: [],
      2025: [6070319, 5448370, 5440012, 5263943, 4730767, 4543762, 5087390, 5097426, 4452839, 5251849, 5402030],
      2024: [5340635, 5297911, 5425447, 5175262, 4752715, 4687383, 5229699, 5282745, 4514319, 5045721, 5460064, 6022792],
      2023: [4286443, 3971181, 4339706, 4142992, 3902262, 3903267, 4421739, 4474970, 3963336, 4439195, 4625552, 5228461]
    }
  },
  "ICN": {
    name: {
      'zh-TW': "首爾仁川國際機場",
      'zh-CN': "首尔仁川国际机场",
      'en': "Incheon Int'l Airport"
    },
    sources: [{ title: "Incheon Airport Stats", uri: "https://www.airport.kr" }],
    summaries: {
      2026: { 'zh-TW': "2026年數據尚未發布。", 'zh-CN': "2026年数据尚未发布。", 'en': "Data for 2026 is not yet released." },
      2025: {
         'zh-TW': "2025年數據截至11月，累計客運量達 6,750 萬人次，較 2024 年同期成長約 4.3%。1月及 8月單月客運量均突破 650 萬人次。",
         'zh-CN': "2025年数据截至11月，累计客运量达 6,750 万人次。1月及 8月单月客运量均突破 650 万人次。",
         'en': "As of Nov 2025, cumulative passengers reached 67.5 million, up 4.3% YoY. Monthly traffic topped 6.5 million in Jan and Aug."
      },
      2024: {
         'zh-TW': "2024年全年客運量達 7,116 萬人次，較 2023 年增長 26.8%。年底突破 645 萬，顯示韓國航空樞紐地位完全恢復。",
         'zh-CN': "2024年全年客运量达 7,116 万人次，较 2023 年增长 26.8%。",
         'en': "Total passengers in 2024 reached 71.16 million, up 26.8% from 2023, indicating full recovery."
      },
      2023: {
         'zh-TW': "2023年全年客運量為 5,613 萬人次。隨著東亞航線復甦，下半年客運量增長強勁。",
         'zh-CN': "2023年全年客运量为 5,613 万人次。",
         'en': "Total passengers in 2023 were 56.13 million. Strong growth in the second half as East Asian routes recovered."
      }
    },
    stats: {
      2026: [],
      2025: [6581937, 6007453, 6017200, 5820214, 5986584, 5948531, 6233120, 6595805, 5835462, 6394203, 6081957],
      2024: [5827109, 5736757, 5694105, 5563719, 5684889, 5772177, 6137513, 6371478, 5781303, 6203582, 5932689, 6451626],
      2023: [3845153, 3730499, 3909015, 4048187, 4394892, 4618738, 5239356, 5440372, 4846532, 5372752, 5079595, 5605973]
    }
  },
  "MNL": {
    name: {
      'zh-TW': "馬尼拉國際機場",
      'zh-CN': "马尼拉国际机场",
      'en': "Ninoy Aquino Int'l Airport"
    },
    sources: [{ title: "Manila International Airport Authority", uri: "https://www.miaa.gov.ph" }],
    summaries: {
      2026: { 'zh-TW': "2026年數據尚未發布。", 'zh-CN': "2026年数据尚未发布。", 'en': "Data for 2026 is not yet released." },
      2025: {
         'zh-TW': "2025年數據截至9月，累計客運量達 3,851 萬人次，較 2024 年同期成長約 3.8%。其中 1 月創下 471 萬人次高峰。",
         'zh-CN': "2025年数据截至9月，累计客运量达 3,851 万人次。其中 1 月创下 471 万人次高峰。",
         'en': "As of Sep 2025, cumulative passengers reached 38.51 million, up 3.8% YoY. January hit a peak of 4.71 million."
      },
      2024: {
         'zh-TW': "2024年全年客運量達 4,939 萬人次，較 2023 年增長約 10.0%。單月客運量於 12 月達到 461 萬人次高峰。",
         'zh-CN': "2024年全年客运量达 4,939 万人次，较 2023 年增长约 10.0%。",
         'en': "Total passengers in 2024 reached 49.39 million, up 10.0% from 2023. Monthly traffic peaked at 4.61 million in December."
      },
      2023: {
         'zh-TW': "2023年全年客運量為 4,488 萬人次。隨著旅遊限制解除，客運量穩步回升。",
         'zh-CN': "2023年全年客运量为 4,488 万人次。",
         'en': "Total passengers in 2023 were 44.88 million. Traffic recovered steadily as restrictions eased."
      }
    },
    stats: {
      2026: [],
      2025: [4714582, 4094453, 4133627, 4355128, 4580414, 4503674, 4282082, 4191687, 3659151],
      2024: [4230040, 3923552, 4078029, 4028539, 4054670, 4435938, 4424971, 4139386, 3798284, 3820881, 4240647, 4617444],
      2023: [3765619, 3369471, 3425097, 3669094, 3807195, 3801404, 4188043, 3953622, 3384409, 3652292, 3770622, 4101582]
    }
  }
};

const MONTH_NAMES_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ----------------------------------------------------------------------
// 服務邏輯
// ----------------------------------------------------------------------

export const getAvailableYears = (code: string): number[] => {
  const airport = AIRPORT_RAW_DATA[code];
  if (!airport) return [];
  // Return years that have actual data (non-empty arrays)
  return Object.keys(airport.stats)
    .map(Number)
    .filter(year => airport.stats[year] && airport.stats[year].length > 0)
    .sort((a, b) => b - a); // Descending order
};

export const fetchAirportStats = async (query: string, year: number = 2024, language: Language = 'zh-TW'): Promise<AirportData> => {
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
  
  // Always show 12 months
  const loopCount = 12;

  for (let i = 0; i < loopCount; i++) {
    const passengers = currentStats[i] || 0;
    const comparison = prevStats[i]; 

    chartData.push({
      period: `${year} ${MONTH_NAMES_EN[i]}`,
      passengers: passengers,
      comparison: comparison
    });
  }

  // Get summary for that year
  let summaryObj = airport.summaries[year];
  if (!summaryObj) {
     if (year > 2025) summaryObj = { 'zh-TW': "數據待更新。", 'zh-CN': "数据待更新。", 'en': "Data pending." };
     else summaryObj = airport.summaries[2024] || { 'zh-TW': "暫無分析。", 'zh-CN': "暂无分析。", 'en': "No analysis." };
  }

  return {
    airportName: airport.name[language],
    summary: summaryObj[language],
    chartData,
    sources: airport.sources
  };
};