// Sourced AI-era job bank (jobs-1.2). Built by the We.Jian team from WEF Future of Jobs 2025 (global),
// US BLS projections and O*NET OnLine (US), LinkedIn, and country notes. Interest codes read from O*NET OnLine.
// Regenerate from wejian-questionnaire/item_bank/jobs.json; do not edit by hand.
//
// Two exceptions, applied here and not yet in that source file: data_annotator and
// datacenter_technician had riasec: null because no O*NET-SOC occupation matches them. A null
// code made matchJobs() drop them silently, so two growing jobs could never be recommended to
// anyone. They now carry the interest code of their ISCO-08 unit group (see occupationBank.js),
// recorded in riasec_from_isco so the borrowed code stays visible. Carry this forward on the
// next regeneration.
export const JOB_BANK_VERSION = 'jobs-1.2';
export const JOBS = [
  {
    "key": "ai_ml_engineer",
    "title_en": "AI / Machine Learning Engineer",
    "riasec": "I-C",
    "onet_soc": "15-2051.00",
    "horizon": "now",
    "confidence": "high",
    "majors": [
      "Artificial Intelligence",
      "Informatics / Computer Science",
      "Data Science",
      "Electrical Engineering"
    ],
    "why_en": "WEF ranks AI and machine learning specialists among the three fastest-growing jobs worldwide to 2030.",
    "regional_notes": [
      {
        "region": "ID",
        "text": "LinkedIn named AI Engineer the fastest-growing role for new graduates in Indonesia in 2025."
      }
    ],
    "sources": [
      {
        "title": "WEF - Future of Jobs Report 2025: fastest growing and declining jobs",
        "url": "https://www.weforum.org/stories/2025/01/future-of-jobs-report-2025-the-fastest-growing-and-declining-jobs/",
        "scope": "global"
      },
      {
        "title": "Medcom.id - LinkedIn Grad Guide 2025: 10 fastest-growing jobs for graduates in Indonesia",
        "url": "https://www.medcom.id/ekonomi/bisnis/Rkjrn2Rk-10-pekerjaan-dan-industri-dengan-pertumbuhan-tercepat-untuk-lulusan-sarjana-di-indonesia-kamu-masuk-yang-mana",
        "scope": "ID"
      },
      {
        "title": "Allwork.Space - LinkedIn Jobs on the Rise 2026 (US): 25 fastest-growing jobs",
        "url": "https://allwork.space/2026/01/linkedin-reveals-25-fastest-growing-jobs-for-2026",
        "scope": "US"
      },
      {
        "title": "O*NET OnLine: Data Scientists (15-2051.00) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/15-2051.00",
        "scope": "US"
      }
    ]
  },
  {
    "key": "data_scientist",
    "title_en": "Data Scientist",
    "riasec": "I-C",
    "onet_soc": "15-2051.00",
    "horizon": "now",
    "confidence": "high",
    "majors": [
      "Data Science",
      "Statistics",
      "Mathematics",
      "Informatics / Computer Science"
    ],
    "why_en": "US BLS lists data scientists among the fastest-growing occupations for 2025-35 (projected 35%), and WEF puts big data specialists at the top of its fastest-growing list.",
    "regional_notes": [],
    "sources": [
      {
        "title": "US BLS Occupational Outlook Handbook - Fastest growing occupations (2025-35)",
        "url": "https://www.bls.gov/ooh/fastest-growing.htm",
        "scope": "US"
      },
      {
        "title": "WEF - Future of Jobs Report 2025: fastest growing and declining jobs",
        "url": "https://www.weforum.org/stories/2025/01/future-of-jobs-report-2025-the-fastest-growing-and-declining-jobs/",
        "scope": "global"
      },
      {
        "title": "O*NET OnLine: Data Scientists (15-2051.00) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/15-2051.00",
        "scope": "US"
      }
    ]
  },
  {
    "key": "data_engineer",
    "title_en": "Data / Big Data Engineer",
    "riasec": "C-I",
    "onet_soc": "15-1243.00",
    "horizon": "now",
    "confidence": "high",
    "majors": [
      "Informatics / Computer Science",
      "Information Systems",
      "Data Science"
    ],
    "why_en": "WEF names big data specialists as the single fastest-growing job by percentage to 2030; O*NET flags database architects as Bright Outlook.",
    "regional_notes": [],
    "sources": [
      {
        "title": "WEF - Future of Jobs Report 2025: fastest growing and declining jobs",
        "url": "https://www.weforum.org/stories/2025/01/future-of-jobs-report-2025-the-fastest-growing-and-declining-jobs/",
        "scope": "global"
      },
      {
        "title": "O*NET OnLine: Database Architects (15-1243.00) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/15-1243.00",
        "scope": "US"
      }
    ]
  },
  {
    "key": "data_analyst_bi",
    "title_en": "Data Analyst / Business Intelligence Analyst",
    "riasec": "C-I",
    "onet_soc": "15-2051.01",
    "horizon": "now",
    "confidence": "high",
    "majors": [
      "Information Systems",
      "Statistics",
      "Data Science",
      "Management"
    ],
    "why_en": "As firms adopt AI and data processing (cited by WEF as a top transformation driver), demand rises for analysts who translate data into business insight; O*NET rates the role Bright Outlook.",
    "regional_notes": [],
    "sources": [
      {
        "title": "O*NET OnLine: Business Intelligence Analysts (15-2051.01) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/15-2051.01",
        "scope": "US"
      },
      {
        "title": "WEF - Future of Jobs Report 2025: fastest growing and declining jobs",
        "url": "https://www.weforum.org/stories/2025/01/future-of-jobs-report-2025-the-fastest-growing-and-declining-jobs/",
        "scope": "global"
      }
    ]
  },
  {
    "key": "ai_ml_researcher",
    "title_en": "AI / ML Research Scientist",
    "riasec": "I-C",
    "onet_soc": "15-1221.00",
    "horizon": "2030",
    "confidence": "high",
    "majors": [
      "Informatics / Computer Science",
      "Artificial Intelligence",
      "Mathematics"
    ],
    "why_en": "BLS projects computer and information research scientists to grow 22% over 2025-35, and LinkedIn's 2026 US Jobs on the Rise lists AI/ML researchers in its top five.",
    "regional_notes": [],
    "sources": [
      {
        "title": "US BLS Occupational Outlook Handbook - Fastest growing occupations (2025-35)",
        "url": "https://www.bls.gov/ooh/fastest-growing.htm",
        "scope": "US"
      },
      {
        "title": "Allwork.Space - LinkedIn Jobs on the Rise 2026 (US): 25 fastest-growing jobs",
        "url": "https://allwork.space/2026/01/linkedin-reveals-25-fastest-growing-jobs-for-2026",
        "scope": "US"
      },
      {
        "title": "O*NET OnLine: Computer and Information Research Scientists (15-1221.00) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/15-1221.00",
        "scope": "US"
      }
    ]
  },
  {
    "key": "software_developer",
    "title_en": "Software & Applications Developer",
    "riasec": "I-C",
    "onet_soc": "15-1252.00",
    "horizon": "now",
    "confidence": "high",
    "majors": [
      "Informatics / Computer Science",
      "Software Engineering",
      "Information Systems",
      "Computer Engineering"
    ],
    "why_en": "WEF lists software and applications developers as the fourth fastest-growing job and also among the largest net job creators to 2030.",
    "regional_notes": [],
    "sources": [
      {
        "title": "WEF - Future of Jobs Report 2025: fastest growing and declining jobs",
        "url": "https://www.weforum.org/stories/2025/01/future-of-jobs-report-2025-the-fastest-growing-and-declining-jobs/",
        "scope": "global"
      },
      {
        "title": "WEF - Future of Jobs Report 2025, Chapter 2: Jobs Outlook",
        "url": "https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/2-jobs-outlook/",
        "scope": "global"
      },
      {
        "title": "O*NET OnLine: Software Developers (15-1252.00) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/15-1252.00",
        "scope": "US"
      }
    ]
  },
  {
    "key": "cybersecurity_analyst",
    "title_en": "Cybersecurity / Security Operations Center (SOC) Analyst",
    "riasec": "C-I",
    "onet_soc": "15-1212.00",
    "horizon": "now",
    "confidence": "high",
    "majors": [
      "Informatics / Computer Science",
      "Computer Engineering",
      "Information Systems"
    ],
    "why_en": "US BLS projects information security analysts to grow 21% over 2025-35 as attacks on AI-era systems rise.",
    "regional_notes": [
      {
        "region": "ID",
        "text": "LinkedIn ranked SOC Analyst the second fastest-growing graduate job in Indonesia (2025)."
      }
    ],
    "sources": [
      {
        "title": "Medcom.id - LinkedIn Grad Guide 2025: 10 fastest-growing jobs for graduates in Indonesia",
        "url": "https://www.medcom.id/ekonomi/bisnis/Rkjrn2Rk-10-pekerjaan-dan-industri-dengan-pertumbuhan-tercepat-untuk-lulusan-sarjana-di-indonesia-kamu-masuk-yang-mana",
        "scope": "ID"
      },
      {
        "title": "US BLS Occupational Outlook Handbook - Fastest growing occupations (2025-35)",
        "url": "https://www.bls.gov/ooh/fastest-growing.htm",
        "scope": "US"
      },
      {
        "title": "WEF - Future of Jobs Report 2025, Chapter 2: Jobs Outlook",
        "url": "https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/2-jobs-outlook/",
        "scope": "global"
      },
      {
        "title": "O*NET OnLine: Information Security Analysts (15-1212.00) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/15-1212.00",
        "scope": "US"
      }
    ]
  },
  {
    "key": "fintech_engineer",
    "title_en": "FinTech Engineer",
    "riasec": "I-C",
    "onet_soc": "15-1252.00",
    "horizon": "2030",
    "confidence": "medium",
    "majors": [
      "Informatics / Computer Science",
      "Software Engineering",
      "Digital Banking & Finance",
      "Information Systems"
    ],
    "why_en": "WEF ranks fintech engineers as the second fastest-growing job worldwide to 2030.",
    "regional_notes": [
      {
        "region": "ID",
        "text": "Indonesia's fintech association (Aftech) says the country will need more than 9 million digital workers by 2030."
      }
    ],
    "sources": [
      {
        "title": "WEF - Future of Jobs Report 2025: fastest growing and declining jobs",
        "url": "https://www.weforum.org/stories/2025/01/future-of-jobs-report-2025-the-fastest-growing-and-declining-jobs/",
        "scope": "global"
      },
      {
        "title": "Bisnis.com - Aftech: Indonesia needs 9+ million digital workers by 2030 (Dec 2025)",
        "url": "https://finansial.bisnis.com/read/20251213/563/1936517/kebutuhan-tenaga-kerja-digital-ri-bakal-capai-9-juta-ini-kualifikasi-yang-bakal-banyak-dicari",
        "scope": "ID"
      },
      {
        "title": "O*NET OnLine: Software Developers (15-1252.00) - Interests",
        "url": "https://www.onetonline.org/link/summary/15-1252.00",
        "scope": "US"
      }
    ]
  },
  {
    "key": "cloud_architect",
    "title_en": "Cloud / Systems Architect",
    "riasec": "C-I",
    "onet_soc": "15-1299.08",
    "horizon": "now",
    "confidence": "high",
    "majors": [
      "Informatics / Computer Science",
      "Computer Engineering",
      "Information Systems",
      "Electrical Engineering"
    ],
    "why_en": "O*NET flags computer systems engineers and architects as a Bright Outlook occupation in the US, as AI workloads move to the cloud.",
    "regional_notes": [
      {
        "region": "ID",
        "text": "Indonesia's Coordinating Ministry for Economic Affairs flags AI and cloud computing as priorities and estimates a need for about 600,000 new digital talents per year."
      }
    ],
    "sources": [
      {
        "title": "Kompas.id - The digital talent gap (Kemenko Perekonomian: ~600,000 new digital talents needed per year)",
        "url": "https://www.kompas.id/baca/english/2023/12/04/en-kesenjangan-talenta-digital-jadi-momok-perekonomian-nasional",
        "scope": "ID"
      },
      {
        "title": "IDN Times - Indonesia needs 12 million digital talents by 2030 (Komdigi projection)",
        "url": "https://www.idntimes.com/news/indonesia/indonesia-mengejar-talenta-digital-00-dtjm6-ttdmgk",
        "scope": "ID"
      },
      {
        "title": "O*NET OnLine: Computer Systems Engineers/Architects (15-1299.08) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/15-1299.08",
        "scope": "US"
      }
    ]
  },
  {
    "key": "it_ai_project_manager",
    "title_en": "IT / AI Product & Project Manager",
    "riasec": "E-C",
    "onet_soc": "15-1299.09",
    "horizon": "now",
    "confidence": "medium",
    "majors": [
      "Information Systems",
      "Informatics / Computer Science",
      "Management",
      "Industrial Engineering"
    ],
    "why_en": "WEF lists project managers among the largest net job-growth categories, and O*NET flags IT project managers as Bright Outlook as firms roll out digital and AI systems.",
    "regional_notes": [],
    "sources": [
      {
        "title": "WEF - Future of Jobs Report 2025, Chapter 2: Jobs Outlook",
        "url": "https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/2-jobs-outlook/",
        "scope": "global"
      },
      {
        "title": "O*NET OnLine: Information Technology Project Managers (15-1299.09) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/15-1299.09",
        "scope": "US"
      }
    ]
  },
  {
    "key": "ux_ui_designer",
    "title_en": "UX/UI & Digital Interface Designer",
    "riasec": "I-A",
    "onet_soc": "15-1255.00",
    "horizon": "now",
    "confidence": "medium",
    "majors": [
      "Visual Communication Design",
      "Informatics / Computer Science",
      "Information Systems",
      "Psychology"
    ],
    "why_en": "O*NET flags web and digital interface designers as Bright Outlook (faster-than-average growth to 2035) as more services move into apps and AI interfaces.",
    "regional_notes": [],
    "sources": [
      {
        "title": "O*NET OnLine: Web and Digital Interface Designers (15-1255.00) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/15-1255.00",
        "scope": "US"
      }
    ]
  },
  {
    "key": "game_designer",
    "title_en": "Video Game & Interactive Media Designer",
    "riasec": "A-I",
    "onet_soc": "15-1255.01",
    "horizon": "now",
    "confidence": "medium",
    "majors": [
      "Visual Communication Design",
      "Informatics / Computer Science",
      "Animation",
      "Digital Media / Game Technology"
    ],
    "why_en": "O*NET marks video game designers as Bright Outlook with faster-than-average projected growth for 2025-2035.",
    "regional_notes": [],
    "sources": [
      {
        "title": "O*NET OnLine: Video Game Designers (15-1255.01) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/15-1255.01",
        "scope": "US"
      }
    ]
  },
  {
    "key": "ai_consultant",
    "title_en": "AI Consultant & Strategist",
    "riasec": "C-I",
    "onet_soc": "13-1111.00",
    "horizon": "now",
    "confidence": "high",
    "majors": [
      "Information Systems",
      "Management",
      "Industrial Engineering",
      "Digital Business"
    ],
    "why_en": "LinkedIn's Jobs on the Rise 2026 (US) ranks AI consultants and strategists second, and O*NET flags management analysts as Bright Outlook.",
    "regional_notes": [],
    "sources": [
      {
        "title": "Allwork.Space - LinkedIn Jobs on the Rise 2026 (US): 25 fastest-growing jobs",
        "url": "https://allwork.space/2026/01/linkedin-reveals-25-fastest-growing-jobs-for-2026",
        "scope": "US"
      },
      {
        "title": "O*NET OnLine: Management Analysts (13-1111.00) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/13-1111.00",
        "scope": "US"
      }
    ]
  },
  {
    "key": "data_annotator",
    "title_en": "Data Annotator / AI Trainer",
    "riasec": "C-R",
    "riasec_from_isco": {"isco": "4132", "title": "Data Entry Clerks"},
    "onet_soc": null,
    "horizon": "now",
    "confidence": "medium",
    "majors": [
      "Linguistics / Languages",
      "Informatics / Computer Science",
      "Information Systems"
    ],
    "why_en": "LinkedIn's Jobs on the Rise 2026 (US) lists data annotators fourth, reflecting demand for human-labelled data to train AI.",
    "regional_notes": [],
    "sources": [
      {
        "title": "Allwork.Space - LinkedIn Jobs on the Rise 2026 (US): 25 fastest-growing jobs",
        "url": "https://allwork.space/2026/01/linkedin-reveals-25-fastest-growing-jobs-for-2026",
        "scope": "US"
      }
    ]
  },
  {
    "key": "datacenter_technician",
    "title_en": "Data Center Technician",
    "riasec": "C-I",
    "riasec_from_isco": {"isco": "3513", "title": "Computer Network and Systems Technicians"},
    "onet_soc": null,
    "horizon": "now",
    "confidence": "medium",
    "majors": [
      "Electrical Engineering",
      "Computer Engineering",
      "Computer & Network Engineering Technology"
    ],
    "why_en": "LinkedIn's Jobs on the Rise 2026 (US) includes datacenter technicians, driven by the build-out of AI computing infrastructure.",
    "regional_notes": [],
    "sources": [
      {
        "title": "Allwork.Space - LinkedIn Jobs on the Rise 2026 (US): 25 fastest-growing jobs",
        "url": "https://allwork.space/2026/01/linkedin-reveals-25-fastest-growing-jobs-for-2026",
        "scope": "US"
      }
    ]
  },
  {
    "key": "ai_governance_compliance",
    "title_en": "AI Governance & Compliance Specialist",
    "riasec": "C-E",
    "onet_soc": "11-9199.02",
    "horizon": "2035",
    "confidence": "low",
    "majors": [
      "Law",
      "Information Systems",
      "Management"
    ],
    "why_en": "O*NET flags compliance managers as Bright Outlook; a dedicated AI-governance specialism is still emerging and not yet measured separately by any source we found.",
    "regional_notes": [],
    "sources": [
      {
        "title": "O*NET OnLine: Compliance Managers (11-9199.02) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/11-9199.02",
        "scope": "US"
      }
    ]
  },
  {
    "key": "digital_marketing_strategist",
    "title_en": "Digital & Search Marketing Strategist",
    "riasec": "E-C",
    "onet_soc": "13-1161.01",
    "horizon": "now",
    "confidence": "medium",
    "majors": [
      "Communication Science",
      "Management",
      "Digital Business",
      "Digital Marketing (D4)"
    ],
    "why_en": "O*NET flags search marketing strategists as Bright Outlook with much-faster-than-average growth, as marketing shifts to data- and AI-driven channels.",
    "regional_notes": [],
    "sources": [
      {
        "title": "O*NET OnLine: Search Marketing Strategists (13-1161.01) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/13-1161.01",
        "scope": "US"
      }
    ]
  },
  {
    "key": "ecommerce_specialist",
    "title_en": "E-commerce Specialist / Online Merchant",
    "riasec": "C-E",
    "onet_soc": "13-1199.06",
    "horizon": "now",
    "confidence": "medium",
    "majors": [
      "Digital Business",
      "Management",
      "Information Systems"
    ],
    "why_en": "O*NET flags online merchants as a Bright Outlook occupation in the US.",
    "regional_notes": [
      {
        "region": "ID",
        "text": "Indonesia's Manpower Ministry lists the digital and creative economy as a strategic job-creating sector."
      }
    ],
    "sources": [
      {
        "title": "O*NET OnLine: Online Merchants (13-1199.06) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/13-1199.06",
        "scope": "US"
      },
      {
        "title": "Bisnis.com - Kemnaker: strategic job-creating sectors (May 2026)",
        "url": "https://ekonomi.bisnis.com/read/20260521/12/1975553/kemnaker-ungkap-sektor-strategis-pencipta-lapangan-kerja-apa-saja",
        "scope": "ID"
      }
    ]
  },
  {
    "key": "procurement_specialist",
    "title_en": "Procurement & Supply Chain Specialist",
    "riasec": "C-E",
    "onet_soc": "13-1023.00",
    "horizon": "now",
    "confidence": "medium",
    "majors": [
      "Industrial Engineering",
      "Management",
      "Logistics"
    ],
    "why_en": "O*NET flags purchasing agents as a Bright Outlook occupation in the US, as supply chains become data-driven.",
    "regional_notes": [
      {
        "region": "ID",
        "text": "LinkedIn's 2025 Grad Guide lists Procurement Specialist among the ten fastest-growing graduate jobs in Indonesia."
      }
    ],
    "sources": [
      {
        "title": "Medcom.id - LinkedIn Grad Guide 2025: 10 fastest-growing jobs for graduates in Indonesia",
        "url": "https://www.medcom.id/ekonomi/bisnis/Rkjrn2Rk-10-pekerjaan-dan-industri-dengan-pertumbuhan-tercepat-untuk-lulusan-sarjana-di-indonesia-kamu-masuk-yang-mana",
        "scope": "ID"
      },
      {
        "title": "O*NET OnLine: Purchasing Agents, Except Wholesale, Retail, and Farm Products (13-1023.00) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/13-1023.00",
        "scope": "US"
      }
    ]
  },
  {
    "key": "industrial_engineer",
    "title_en": "Industrial Engineer (Smart Manufacturing)",
    "riasec": "C-I",
    "onet_soc": "17-2112.00",
    "horizon": "now",
    "confidence": "high",
    "majors": [
      "Industrial Engineering",
      "Mechanical Engineering",
      "Mechatronics"
    ],
    "why_en": "O*NET projects much-faster-than-average US growth for industrial engineers to 2035, driven by automation and smart manufacturing.",
    "regional_notes": [
      {
        "region": "ID",
        "text": "LinkedIn lists Industrial Engineer among the fastest-growing graduate jobs in Indonesia (2025)."
      }
    ],
    "sources": [
      {
        "title": "Medcom.id - LinkedIn Grad Guide 2025: 10 fastest-growing jobs for graduates in Indonesia",
        "url": "https://www.medcom.id/ekonomi/bisnis/Rkjrn2Rk-10-pekerjaan-dan-industri-dengan-pertumbuhan-tercepat-untuk-lulusan-sarjana-di-indonesia-kamu-masuk-yang-mana",
        "scope": "ID"
      },
      {
        "title": "O*NET OnLine: Industrial Engineers (17-2112.00) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/17-2112.00",
        "scope": "US"
      }
    ]
  },
  {
    "key": "project_manager",
    "title_en": "Project Management Specialist",
    "riasec": "E-C",
    "onet_soc": "13-1082.00",
    "horizon": "now",
    "confidence": "high",
    "majors": [
      "Management",
      "Industrial Engineering",
      "Civil Engineering"
    ],
    "why_en": "WEF lists project managers among the largest net job-growth categories to 2030; O*NET rates project management specialists Bright Outlook.",
    "regional_notes": [],
    "sources": [
      {
        "title": "WEF - Future of Jobs Report 2025, Chapter 2: Jobs Outlook",
        "url": "https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/2-jobs-outlook/",
        "scope": "global"
      },
      {
        "title": "O*NET OnLine: Project Management Specialists (13-1082.00) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/13-1082.00",
        "scope": "US"
      }
    ]
  },
  {
    "key": "hr_people_analytics",
    "title_en": "HR & People Analytics Specialist",
    "riasec": "E-C",
    "onet_soc": "13-1071.00",
    "horizon": "now",
    "confidence": "medium",
    "majors": [
      "Psychology",
      "Management",
      "Human Resource Management"
    ],
    "why_en": "WEF expects 39% of workers' core skills to change by 2030, raising demand for HR roles that re-skill and redeploy talent; O*NET flags HR specialists as Bright Outlook.",
    "regional_notes": [],
    "sources": [
      {
        "title": "WEF - Future of Jobs Report 2025: fastest growing and declining jobs",
        "url": "https://www.weforum.org/stories/2025/01/future-of-jobs-report-2025-the-fastest-growing-and-declining-jobs/",
        "scope": "global"
      },
      {
        "title": "O*NET OnLine: Human Resources Specialists (13-1071.00) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/13-1071.00",
        "scope": "US"
      }
    ]
  },
  {
    "key": "learning_development_specialist",
    "title_en": "Learning & Development / Training Specialist",
    "riasec": "S-I",
    "onet_soc": "13-1151.00",
    "horizon": "now",
    "confidence": "high",
    "majors": [
      "Educational Technology",
      "Psychology",
      "Management"
    ],
    "why_en": "WEF expects large-scale reskilling worldwide by 2030, and O*NET flags training and development specialists as Bright Outlook in the US.",
    "regional_notes": [
      {
        "region": "ID",
        "text": "LinkedIn's 2025 Grad Guide lists Learning Specialist among Indonesia's fastest-growing graduate jobs."
      }
    ],
    "sources": [
      {
        "title": "Medcom.id - LinkedIn Grad Guide 2025: 10 fastest-growing jobs for graduates in Indonesia",
        "url": "https://www.medcom.id/ekonomi/bisnis/Rkjrn2Rk-10-pekerjaan-dan-industri-dengan-pertumbuhan-tercepat-untuk-lulusan-sarjana-di-indonesia-kamu-masuk-yang-mana",
        "scope": "ID"
      },
      {
        "title": "WEF - Future of Jobs Report 2025: fastest growing and declining jobs",
        "url": "https://www.weforum.org/stories/2025/01/future-of-jobs-report-2025-the-fastest-growing-and-declining-jobs/",
        "scope": "global"
      },
      {
        "title": "O*NET OnLine: Training and Development Specialists (13-1151.00) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/13-1151.00",
        "scope": "US"
      }
    ]
  },
  {
    "key": "io_psychologist",
    "title_en": "Industrial-Organizational Psychologist",
    "riasec": "I-E",
    "onet_soc": "19-3032.00",
    "horizon": "2030",
    "confidence": "medium",
    "majors": [
      "Psychology",
      "Industrial & Organizational Psychology (S2)"
    ],
    "why_en": "O*NET projects much-faster-than-average growth for industrial-organizational psychologists as firms rethink jobs and talent assessment alongside AI.",
    "regional_notes": [],
    "sources": [
      {
        "title": "O*NET OnLine: Industrial-Organizational Psychologists (19-3032.00) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/19-3032.00",
        "scope": "US"
      }
    ]
  },
  {
    "key": "sustainability_specialist",
    "title_en": "Sustainability / ESG Specialist",
    "riasec": "I-E",
    "onet_soc": "13-1199.05",
    "horizon": "2030",
    "confidence": "high",
    "majors": [
      "Environmental Engineering",
      "Management",
      "Environmental Science"
    ],
    "why_en": "WEF names sustainability specialists among the roles growing worldwide with the green transition.",
    "regional_notes": [
      {
        "region": "ID",
        "text": "Indonesia's Manpower Ministry projects 3.88 million green jobs in 2026."
      }
    ],
    "sources": [
      {
        "title": "WEF - Future of Jobs Report 2025, Chapter 2: Jobs Outlook",
        "url": "https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/2-jobs-outlook/",
        "scope": "global"
      },
      {
        "title": "RCTI+ - Kemnaker projects 3.88 million green jobs in 2026 (Outlook Ketenagakerjaan 2026)",
        "url": "https://www.rctiplus.com/news/detail/terkini/5411706/kemnaker-proyeksi-3-88-juta-green-jobs-tercipta-pada-2026--ini-bidang-industrinya",
        "scope": "ID"
      },
      {
        "title": "O*NET OnLine: Sustainability Specialists (13-1199.05) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/13-1199.05",
        "scope": "US"
      }
    ]
  },
  {
    "key": "environmental_engineer",
    "title_en": "Environmental Engineer",
    "riasec": "I-R",
    "onet_soc": "17-2081.00",
    "horizon": "2030",
    "confidence": "high",
    "majors": [
      "Environmental Engineering",
      "Chemical Engineering",
      "Civil Engineering"
    ],
    "why_en": "WEF places environmental engineers in its top 15 fastest-growing jobs worldwide to 2030.",
    "regional_notes": [
      {
        "region": "ID",
        "text": "Indonesia's Manpower Ministry lists waste management and the circular economy as green-job sectors."
      }
    ],
    "sources": [
      {
        "title": "WEF - Future of Jobs Report 2025: fastest growing and declining jobs",
        "url": "https://www.weforum.org/stories/2025/01/future-of-jobs-report-2025-the-fastest-growing-and-declining-jobs/",
        "scope": "global"
      },
      {
        "title": "WEF - Future of Jobs Report 2025, Chapter 2: Jobs Outlook",
        "url": "https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/2-jobs-outlook/",
        "scope": "global"
      },
      {
        "title": "RCTI+ - Kemnaker projects 3.88 million green jobs in 2026 (Outlook Ketenagakerjaan 2026)",
        "url": "https://www.rctiplus.com/news/detail/terkini/5411706/kemnaker-proyeksi-3-88-juta-green-jobs-tercipta-pada-2026--ini-bidang-industrinya",
        "scope": "ID"
      },
      {
        "title": "O*NET OnLine: Environmental Engineers (17-2081.00) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/17-2081.00",
        "scope": "US"
      }
    ]
  },
  {
    "key": "renewable_energy_engineer",
    "title_en": "Renewable Energy Engineer",
    "riasec": "R-I",
    "onet_soc": "17-2199.11",
    "horizon": "2030",
    "confidence": "high",
    "majors": [
      "Renewable Energy Engineering",
      "Electrical Engineering",
      "Energy Systems Engineering",
      "Mechanical Engineering"
    ],
    "why_en": "WEF lists renewable energy engineers in its top 15 fastest-growing jobs worldwide to 2030.",
    "regional_notes": [
      {
        "region": "ID",
        "text": "Indonesia's Manpower Ministry highlights solar, wind, geothermal and biomass jobs in its 2026 outlook."
      }
    ],
    "sources": [
      {
        "title": "WEF - Future of Jobs Report 2025: fastest growing and declining jobs",
        "url": "https://www.weforum.org/stories/2025/01/future-of-jobs-report-2025-the-fastest-growing-and-declining-jobs/",
        "scope": "global"
      },
      {
        "title": "RCTI+ - Kemnaker projects 3.88 million green jobs in 2026 (Outlook Ketenagakerjaan 2026)",
        "url": "https://www.rctiplus.com/news/detail/terkini/5411706/kemnaker-proyeksi-3-88-juta-green-jobs-tercipta-pada-2026--ini-bidang-industrinya",
        "scope": "ID"
      },
      {
        "title": "Katadata - Target 5 million green workers by 2029, Kemnaker to add BLK (Sep 2026)",
        "url": "https://katadata.co.id/ekonomi-hijau/investasi-hijau/6a97c1d63e8d2/target-5-juta-pekerja-hijau-kemnaker-bakal-tambah-belasan-balai-latihan-kerja",
        "scope": "ID"
      },
      {
        "title": "O*NET OnLine: Solar Energy Systems Engineers (17-2199.11) - Interests",
        "url": "https://www.onetonline.org/link/summary/17-2199.11",
        "scope": "US"
      }
    ]
  },
  {
    "key": "solar_pv_installer",
    "title_en": "Solar PV Installer / Technician",
    "riasec": "R-C",
    "onet_soc": "47-2231.00",
    "horizon": "now",
    "confidence": "high",
    "majors": [
      "Electrical Engineering",
      "Renewable Energy Engineering (vocational)"
    ],
    "why_en": "US BLS projects solar photovoltaic installers to grow 37% over 2025-35, one of the fastest rates of any occupation.",
    "regional_notes": [
      {
        "region": "ID",
        "text": "Indonesia's Manpower Minister cited the solar panel industry as a green-jobs priority."
      }
    ],
    "sources": [
      {
        "title": "US BLS Occupational Outlook Handbook - Fastest growing occupations (2025-35)",
        "url": "https://www.bls.gov/ooh/fastest-growing.htm",
        "scope": "US"
      },
      {
        "title": "Katadata - Target 5 million green workers by 2029, Kemnaker to add BLK (Sep 2026)",
        "url": "https://katadata.co.id/ekonomi-hijau/investasi-hijau/6a97c1d63e8d2/target-5-juta-pekerja-hijau-kemnaker-bakal-tambah-belasan-balai-latihan-kerja",
        "scope": "ID"
      },
      {
        "title": "O*NET OnLine: Solar Photovoltaic Installers (47-2231.00) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/47-2231.00",
        "scope": "US"
      }
    ]
  },
  {
    "key": "wind_turbine_technician",
    "title_en": "Wind Turbine Service Technician",
    "riasec": "R-C",
    "onet_soc": "49-9081.00",
    "horizon": "2035",
    "confidence": "medium",
    "majors": [
      "Electrical Engineering",
      "Mechanical Engineering"
    ],
    "why_en": "US BLS projects wind turbine service technicians to grow 30% over 2025-35.",
    "regional_notes": [
      {
        "region": "ID",
        "text": "Indonesia's Manpower Ministry names the wind turbine industry among green-job areas."
      }
    ],
    "sources": [
      {
        "title": "US BLS Occupational Outlook Handbook - Fastest growing occupations (2025-35)",
        "url": "https://www.bls.gov/ooh/fastest-growing.htm",
        "scope": "US"
      },
      {
        "title": "Katadata - Target 5 million green workers by 2029, Kemnaker to add BLK (Sep 2026)",
        "url": "https://katadata.co.id/ekonomi-hijau/investasi-hijau/6a97c1d63e8d2/target-5-juta-pekerja-hijau-kemnaker-bakal-tambah-belasan-balai-latihan-kerja",
        "scope": "ID"
      },
      {
        "title": "O*NET OnLine: Wind Turbine Service Technicians (49-9081.00) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/49-9081.00",
        "scope": "US"
      }
    ]
  },
  {
    "key": "ev_engineer",
    "title_en": "Electric Vehicle & Battery Engineer",
    "riasec": "R-I",
    "onet_soc": "17-2141.02",
    "horizon": "2030",
    "confidence": "high",
    "majors": [
      "Mechanical Engineering",
      "Electrical Engineering",
      "Automotive Engineering",
      "Metallurgical Engineering"
    ],
    "why_en": "WEF lists autonomous and electric vehicle specialists in its top 15 fastest-growing jobs worldwide to 2030.",
    "regional_notes": [
      {
        "region": "ID",
        "text": "Indonesia's Manpower Ministry cites EV manufacturing, battery production and charging infrastructure as green-job sources."
      }
    ],
    "sources": [
      {
        "title": "WEF - Future of Jobs Report 2025: fastest growing and declining jobs",
        "url": "https://www.weforum.org/stories/2025/01/future-of-jobs-report-2025-the-fastest-growing-and-declining-jobs/",
        "scope": "global"
      },
      {
        "title": "RCTI+ - Kemnaker projects 3.88 million green jobs in 2026 (Outlook Ketenagakerjaan 2026)",
        "url": "https://www.rctiplus.com/news/detail/terkini/5411706/kemnaker-proyeksi-3-88-juta-green-jobs-tercipta-pada-2026--ini-bidang-industrinya",
        "scope": "ID"
      },
      {
        "title": "Bisnis.com - Kemnaker: strategic job-creating sectors (May 2026)",
        "url": "https://ekonomi.bisnis.com/read/20260521/12/1975553/kemnaker-ungkap-sektor-strategis-pencipta-lapangan-kerja-apa-saja",
        "scope": "ID"
      },
      {
        "title": "O*NET OnLine: Automotive Engineers (17-2141.02) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/17-2141.02",
        "scope": "US"
      }
    ]
  },
  {
    "key": "ehs_specialist",
    "title_en": "Environmental Health & Safety (EHS) Specialist",
    "riasec": "I-C",
    "onet_soc": "19-5011.00",
    "horizon": "now",
    "confidence": "high",
    "majors": [
      "Occupational Safety & Health",
      "Public Health",
      "Environmental Engineering"
    ],
    "why_en": "US BLS projects 18% growth for occupational health and safety specialists over 2025-35.",
    "regional_notes": [
      {
        "region": "ID",
        "text": "LinkedIn ranked Environmental Health Safety Specialist the third fastest-growing graduate job in Indonesia (2025)."
      }
    ],
    "sources": [
      {
        "title": "Medcom.id - LinkedIn Grad Guide 2025: 10 fastest-growing jobs for graduates in Indonesia",
        "url": "https://www.medcom.id/ekonomi/bisnis/Rkjrn2Rk-10-pekerjaan-dan-industri-dengan-pertumbuhan-tercepat-untuk-lulusan-sarjana-di-indonesia-kamu-masuk-yang-mana",
        "scope": "ID"
      },
      {
        "title": "US BLS Occupational Outlook Handbook - Fastest growing occupations (2025-35)",
        "url": "https://www.bls.gov/ooh/fastest-growing.htm",
        "scope": "US"
      },
      {
        "title": "O*NET OnLine: Occupational Health and Safety Specialists (19-5011.00) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/19-5011.00",
        "scope": "US"
      }
    ]
  },
  {
    "key": "precision_agriculture_technician",
    "title_en": "Precision Agriculture / AgriTech Technician",
    "riasec": "R-I",
    "onet_soc": "19-4012.01",
    "horizon": "2030",
    "confidence": "medium",
    "majors": [
      "Agrotechnology",
      "Agricultural Engineering",
      "Agribusiness"
    ],
    "why_en": "O*NET flags precision agriculture technicians as a Bright Outlook occupation in the US, as farms adopt sensors, drones and data.",
    "regional_notes": [
      {
        "region": "ID",
        "text": "Indonesia's Manpower Ministry names food security, including smart farming, as a strategic job-creating sector."
      }
    ],
    "sources": [
      {
        "title": "Bisnis.com - Kemnaker: strategic job-creating sectors (May 2026)",
        "url": "https://ekonomi.bisnis.com/read/20260521/12/1975553/kemnaker-ungkap-sektor-strategis-pencipta-lapangan-kerja-apa-saja",
        "scope": "ID"
      },
      {
        "title": "O*NET OnLine: Precision Agriculture Technicians (19-4012.01) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/19-4012.01",
        "scope": "US"
      }
    ]
  },
  {
    "key": "registered_nurse",
    "title_en": "Nurse",
    "riasec": "S-C",
    "onet_soc": "29-1141.00",
    "horizon": "now",
    "confidence": "high",
    "majors": [
      "Nursing"
    ],
    "why_en": "WEF expects nursing professionals to grow significantly to 2030, mainly due to ageing populations; O*NET rates registered nurses Bright Outlook.",
    "regional_notes": [],
    "sources": [
      {
        "title": "WEF - Future of Jobs Report 2025, Chapter 2: Jobs Outlook",
        "url": "https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/2-jobs-outlook/",
        "scope": "global"
      },
      {
        "title": "O*NET OnLine: Registered Nurses (29-1141.00) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/29-1141.00",
        "scope": "US"
      }
    ]
  },
  {
    "key": "health_informatics_specialist",
    "title_en": "Health Informatics Specialist",
    "riasec": "I-C",
    "onet_soc": "15-1211.01",
    "horizon": "2030",
    "confidence": "medium",
    "majors": [
      "Health Information Management / Medical Records",
      "Information Systems",
      "Public Health"
    ],
    "why_en": "O*NET projects much-faster-than-average growth for health informatics specialists as healthcare digitises.",
    "regional_notes": [],
    "sources": [
      {
        "title": "O*NET OnLine: Health Informatics Specialists (15-1211.01) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/15-1211.01",
        "scope": "US"
      }
    ]
  },
  {
    "key": "health_services_manager",
    "title_en": "Medical & Health Services Manager",
    "riasec": "E-C",
    "onet_soc": "11-9111.00",
    "horizon": "now",
    "confidence": "high",
    "majors": [
      "Hospital Administration",
      "Public Health",
      "Management"
    ],
    "why_en": "BLS projects medical and health services managers to grow 24% over 2025-35, among the fastest-growing occupations.",
    "regional_notes": [],
    "sources": [
      {
        "title": "US BLS Occupational Outlook Handbook - Fastest growing occupations (2025-35)",
        "url": "https://www.bls.gov/ooh/fastest-growing.htm",
        "scope": "US"
      },
      {
        "title": "O*NET OnLine: Medical and Health Services Managers (11-9111.00) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/11-9111.00",
        "scope": "US"
      }
    ]
  },
  {
    "key": "psychologist_counselor",
    "title_en": "Clinical Psychologist / Mental Health Counselor",
    "riasec": "S-I",
    "onet_soc": "19-3033.00",
    "horizon": "now",
    "confidence": "high",
    "majors": [
      "Psychology",
      "Guidance & Counseling"
    ],
    "why_en": "WEF expects social work and counselling professionals to grow significantly to 2030; BLS projects 18% growth for mental health counselors over 2025-35.",
    "regional_notes": [],
    "sources": [
      {
        "title": "WEF - Future of Jobs Report 2025, Chapter 2: Jobs Outlook",
        "url": "https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/2-jobs-outlook/",
        "scope": "global"
      },
      {
        "title": "US BLS Occupational Outlook Handbook - Fastest growing occupations (2025-35)",
        "url": "https://www.bls.gov/ooh/fastest-growing.htm",
        "scope": "US"
      },
      {
        "title": "O*NET OnLine: Clinical and Counseling Psychologists (19-3033.00) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/19-3033.00",
        "scope": "US"
      }
    ]
  },
  {
    "key": "physiotherapy_assistant",
    "title_en": "Physiotherapist / Physical Therapy Assistant",
    "riasec": "S-R",
    "onet_soc": "31-2021.00",
    "horizon": "now",
    "confidence": "high",
    "majors": [
      "Physiotherapy"
    ],
    "why_en": "BLS projects physical therapist assistants to grow 23% over 2025-35, driven largely by ageing populations - work that AI cannot easily replace.",
    "regional_notes": [],
    "sources": [
      {
        "title": "US BLS Occupational Outlook Handbook - Fastest growing occupations (2025-35)",
        "url": "https://www.bls.gov/ooh/fastest-growing.htm",
        "scope": "US"
      },
      {
        "title": "O*NET OnLine: Physical Therapist Assistants (31-2021.00) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/31-2021.00",
        "scope": "US"
      }
    ]
  },
  {
    "key": "elderly_caregiver",
    "title_en": "Elderly & Personal Care Worker",
    "riasec": "S-C",
    "onet_soc": "31-1122.00",
    "horizon": "now",
    "confidence": "high",
    "majors": [
      "Nursing",
      "Social Welfare",
      "Public Health"
    ],
    "why_en": "WEF expects personal care aides to grow significantly due to ageing populations, and BLS projects home health and personal care aides to grow 18% over 2025-35.",
    "regional_notes": [],
    "sources": [
      {
        "title": "WEF - Future of Jobs Report 2025, Chapter 2: Jobs Outlook",
        "url": "https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/2-jobs-outlook/",
        "scope": "global"
      },
      {
        "title": "US BLS Occupational Outlook Handbook - Fastest growing occupations (2025-35)",
        "url": "https://www.bls.gov/ooh/fastest-growing.htm",
        "scope": "US"
      },
      {
        "title": "O*NET OnLine: Personal Care Aides (31-1122.00) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/31-1122.00",
        "scope": "US"
      }
    ]
  },
  {
    "key": "university_lecturer",
    "title_en": "University Lecturer (Computing & Digital Fields)",
    "riasec": "S-I",
    "onet_soc": "25-1021.00",
    "horizon": "2030",
    "confidence": "medium",
    "majors": [
      "Informatics / Computer Science",
      "Artificial Intelligence",
      "Data Science"
    ],
    "why_en": "WEF lists university and higher education teachers among the biggest job creators to 2030; O*NET flags computer science postsecondary teachers as Bright Outlook.",
    "regional_notes": [],
    "sources": [
      {
        "title": "WEF - Future of Jobs Report 2025, Chapter 2: Jobs Outlook",
        "url": "https://www.weforum.org/publications/the-future-of-jobs-report-2025/in-full/2-jobs-outlook/",
        "scope": "global"
      },
      {
        "title": "O*NET OnLine: Computer Science Teachers, Postsecondary (25-1021.00) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/25-1021.00",
        "scope": "US"
      }
    ]
  },
  {
    "key": "art_therapist",
    "title_en": "Art Therapist",
    "riasec": "S-A",
    "onet_soc": "29-1129.01",
    "horizon": "2035",
    "confidence": "low",
    "majors": [
      "Psychology",
      "Fine Arts",
      "Visual Communication Design"
    ],
    "why_en": "O*NET flags art therapists as a Bright Outlook occupation in the US with much-faster-than-average growth.",
    "regional_notes": [
      {
        "region": "ID",
        "text": "The profession is still emerging and not formally regulated in Indonesia."
      }
    ],
    "sources": [
      {
        "title": "O*NET OnLine: Art Therapists (29-1129.01) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/29-1129.01",
        "scope": "US"
      }
    ]
  },
  {
    "key": "social_community_service_manager",
    "title_en": "Social and Community Service Manager",
    "riasec": "E-S",
    "onet_soc": "11-9151.00",
    "horizon": "now",
    "confidence": "medium",
    "majors": [
      "Social Welfare",
      "Psychology",
      "Public Health",
      "Sociology"
    ],
    "why_en": "O*NET flags this role as Bright Outlook, and BLS projects 7% US employment growth from 2025 to 2035, driven mainly by a growing older-adult population.",
    "regional_notes": [],
    "sources": [
      {
        "title": "O*NET OnLine: Social and Community Service Managers (11-9151.00) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/11-9151.00",
        "scope": "US"
      },
      {
        "title": "US BLS Occupational Outlook Handbook: Social and Community Service Managers",
        "url": "https://www.bls.gov/ooh/management/social-and-community-service-managers.htm",
        "scope": "US"
      }
    ]
  },
  {
    "key": "training_development_manager",
    "title_en": "Training and Development Manager",
    "riasec": "E-S",
    "onet_soc": "11-3131.00",
    "horizon": "now",
    "confidence": "medium",
    "majors": [
      "Management",
      "Psychology",
      "Educational Technology"
    ],
    "why_en": "O*NET flags this role as Bright Outlook, and BLS projects 6% US growth from 2025 to 2035 as workers need continuous skill development and firms adopt new learning technology.",
    "regional_notes": [],
    "sources": [
      {
        "title": "O*NET OnLine: Training and Development Managers (11-3131.00) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/11-3131.00",
        "scope": "US"
      },
      {
        "title": "US BLS Occupational Outlook Handbook: Training and Development Managers",
        "url": "https://www.bls.gov/ooh/management/training-and-development-managers.htm",
        "scope": "US"
      }
    ]
  },
  {
    "key": "fundraiser",
    "title_en": "Fundraiser / Fundraising Officer",
    "riasec": "E-S",
    "onet_soc": "13-1131.00",
    "horizon": "now",
    "confidence": "medium",
    "majors": [
      "Communication Science",
      "Management",
      "Social Welfare"
    ],
    "why_en": "LinkedIn lists Fundraising Officers among its 2026 US Jobs on the Rise, O*NET flags fundraisers as Bright Outlook, and BLS projects 6% US growth from 2025 to 2035.",
    "regional_notes": [],
    "sources": [
      {
        "title": "O*NET OnLine: Fundraisers (13-1131.00) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/13-1131.00",
        "scope": "US"
      },
      {
        "title": "US BLS Occupational Outlook Handbook: Fundraisers",
        "url": "https://www.bls.gov/ooh/business-and-financial/fundraisers.htm",
        "scope": "US"
      },
      {
        "title": "Allwork.Space - LinkedIn Jobs on the Rise 2026 (US): 25 fastest-growing jobs",
        "url": "https://allwork.space/2026/01/linkedin-reveals-25-fastest-growing-jobs-for-2026",
        "scope": "US"
      }
    ]
  },
  {
    "key": "fitness_wellness_coordinator",
    "title_en": "Fitness and Wellness Coordinator",
    "riasec": "S-E",
    "onet_soc": "11-9179.01",
    "horizon": "2030",
    "confidence": "medium",
    "majors": [
      "Sports Science",
      "Public Health",
      "Nutrition"
    ],
    "why_en": "O*NET flags fitness and wellness coordinators as Bright Outlook, with faster-than-average US growth projected for 2025 to 2035.",
    "regional_notes": [],
    "sources": [
      {
        "title": "O*NET OnLine: Fitness and Wellness Coordinators (11-9179.01) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/11-9179.01",
        "scope": "US"
      }
    ]
  },
  {
    "key": "sports_coach",
    "title_en": "Sports Coach",
    "riasec": "S-E",
    "onet_soc": "27-2022.00",
    "horizon": "now",
    "confidence": "medium",
    "majors": [
      "Sports Coaching Education",
      "Sports Science",
      "Physical, Health and Recreation Education"
    ],
    "why_en": "O*NET flags coaches and scouts as Bright Outlook, and BLS projects 6% US growth from 2025 to 2035 on rising interest in sports and in sports instruction.",
    "regional_notes": [],
    "sources": [
      {
        "title": "O*NET OnLine: Coaches and Scouts (27-2022.00) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/27-2022.00",
        "scope": "US"
      },
      {
        "title": "US BLS Occupational Outlook Handbook: Coaches and Scouts",
        "url": "https://www.bls.gov/ooh/entertainment-and-sports/coaches-and-scouts.htm",
        "scope": "US"
      }
    ]
  },
  {
    "key": "talent_creator_manager",
    "title_en": "Talent Manager / Agent (Artists, Creators, Athletes)",
    "riasec": "E-S",
    "onet_soc": "13-1011.00",
    "horizon": "2030",
    "confidence": "low",
    "majors": [
      "Management",
      "Communication Science",
      "Business Administration"
    ],
    "why_en": "O*NET flags agents and business managers of artists, performers and athletes as Bright Outlook, with much-faster-than-average US growth projected for 2025 to 2035.",
    "regional_notes": [],
    "sources": [
      {
        "title": "O*NET OnLine: Agents and Business Managers of Artists, Performers, and Athletes (13-1011.00) - Bright Outlook / Interests",
        "url": "https://www.onetonline.org/link/summary/13-1011.00",
        "scope": "US"
      }
    ]
  }
];
