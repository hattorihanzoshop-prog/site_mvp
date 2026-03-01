from fastapi import FastAPI, APIRouter, Request, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone
from io import BytesIO
from starlette.responses import StreamingResponse

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')


import json

class JSONDatabase:
    def __init__(self, file_path):
        with open(file_path, 'r') as f:
            self._data = json.load(f)
    
    def __getattr__(self, name):
        # Возвращает "коллекцию" из JSON (например, db.reports)
        return MockCollection(self._data.get(name, []))

class MockCollection:
    def __init__(self, data): self.data = data
    async def find(self, query=None, **kwargs):
        # Простая имитация поиска
        res = [i for i in self.data if all(i.get(k) == v for k, v in (query or {}).items())]
        class Cursor:
            def __init__(self, items): self.items = items
            def sort(self, *args): return self
            def skip(self, *args): return self
            def limit(self, *args): return self
            async def to_list(self, length=None): return self.items[:length] if length else self.items
        return Cursor(res)
    async def find_one(self, query):
        items = await (await self.find(query)).to_list()
        return items[0] if items else None
    async def insert_one(self, doc): self.data.append(doc); return doc
    async def count_documents(self, query): return len(self.data)

db = JSONDatabase(ROOT_DIR / 'db_dump.json')
app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# ─── Models ───
class ReportOut(BaseModel):
    id: str
    title: str
    industry: str
    category: str
    description: str
    detailed_description: str
    pages: int
    figures: int
    tables: int
    companies_profiled: int
    regions_covered: int
    publish_date: str
    report_id: str
    price_single: float
    price_multi: float
    price_enterprise: float
    key_findings: List[str]
    table_of_contents: List[dict]
    methodology: str
    cover_image: str
    featured: bool
    keywords: List[str]

class NewsletterRequest(BaseModel):
    email: str

class ContactRequest(BaseModel):
    name: str
    email: str
    subject: str
    message: str

class CustomResearchRequest(BaseModel):
    name: str
    email: str
    company: str
    phone: Optional[str] = ""
    industry: str
    description: str
    budget: str

class SampleDownloadRequest(BaseModel):
    email: str
    report_id: str

class CheckoutRequest(BaseModel):
    items: List[dict]
    origin_url: str

class AdminLoginRequest(BaseModel):
    password: str

class ReportCreateUpdate(BaseModel):
    title: str
    industry: str
    category: str
    description: str
    detailed_description: str = ""
    pages: int = 0
    figures: int = 0
    tables: int = 0
    companies_profiled: int = 0
    regions_covered: int = 0
    publish_date: str = ""
    report_id: str = ""
    price_single: float = 0.0
    price_multi: float = 0.0
    price_enterprise: float = 0.0
    key_findings: List[str] = []
    table_of_contents: List[dict] = []
    methodology: str = ""
    cover_image: str = ""
    featured: bool = False
    keywords: List[str] = []

# ─── Seed Data ───
SEED_REPORTS = [
    {
        "id": "rpt-001",
        "title": "Global Artificial Intelligence Market Report 2025-2030",
        "industry": "Technology & IT",
        "category": "Market Analysis",
        "description": "Comprehensive analysis of the global AI market including machine learning, NLP, computer vision, and generative AI segments. Covers market size, growth projections, competitive landscape, and regional analysis across 45 countries.",
        "detailed_description": "This definitive report provides an exhaustive analysis of the global artificial intelligence market, projected to reach $1.8 trillion by 2030. Our research team has conducted primary interviews with 200+ C-suite executives across the AI value chain to deliver unparalleled insights.\n\nThe report segments the market by technology (machine learning, deep learning, NLP, computer vision, generative AI), deployment model (cloud, on-premise, hybrid), enterprise size, and end-use industry. Each segment includes 5-year forecasts with multiple growth scenarios.\n\nOur competitive landscape analysis profiles 180+ companies from established tech giants to emerging startups, providing detailed assessments of their AI strategies, product portfolios, and market positioning. The regional analysis covers 45 countries across North America, Europe, Asia-Pacific, Latin America, and MEA.",
        "pages": 420,
        "figures": 185,
        "tables": 92,
        "companies_profiled": 180,
        "regions_covered": 45,
        "publish_date": "2025-01-15",
        "report_id": "FC-2025-001",
        "price_single": 4950.00,
        "price_multi": 7950.00,
        "price_enterprise": 11950.00,
        "key_findings": [
            "Global AI market projected to reach $1.8 trillion by 2030, growing at 35.2% CAGR",
            "Generative AI segment expected to capture 40% of total market share by 2028",
            "North America maintains dominance with 38% market share, Asia-Pacific fastest growing",
            "Enterprise AI adoption rate has increased from 35% to 72% since 2022",
            "AI infrastructure spending to surpass $200 billion annually by 2027"
        ],
        "table_of_contents": [
            {"chapter": "1", "title": "Executive Summary", "pages": "1-25"},
            {"chapter": "2", "title": "Market Overview & Definitions", "pages": "26-55"},
            {"chapter": "3", "title": "Technology Segmentation Analysis", "pages": "56-120"},
            {"chapter": "4", "title": "Deployment Model Analysis", "pages": "121-165"},
            {"chapter": "5", "title": "Industry Vertical Analysis", "pages": "166-230"},
            {"chapter": "6", "title": "Regional Analysis", "pages": "231-310"},
            {"chapter": "7", "title": "Competitive Landscape", "pages": "311-380"},
            {"chapter": "8", "title": "Strategic Recommendations", "pages": "381-400"},
            {"chapter": "9", "title": "Appendix & Methodology", "pages": "401-420"}
        ],
        "methodology": "This report is based on a combination of primary and secondary research methodologies. Primary research includes 200+ executive interviews, surveys of 1,500+ enterprises, and consultations with industry experts. Secondary research encompasses analysis of company filings, patent databases, government publications, and proprietary databases.",
        "cover_image": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop",
        "featured": True,
        "keywords": ["artificial intelligence", "machine learning", "deep learning", "generative AI", "NLP", "computer vision"]
    },
    {
        "id": "rpt-002",
        "title": "Healthcare Digital Transformation: Market Forecast & Strategic Analysis",
        "industry": "Healthcare & Pharmaceuticals",
        "category": "Industry Forecast",
        "description": "In-depth examination of digital health technologies, telemedicine adoption, AI in diagnostics, and the evolving regulatory landscape shaping healthcare innovation worldwide.",
        "detailed_description": "The healthcare industry is undergoing its most significant transformation in decades, driven by digital technologies that are reshaping patient care, drug discovery, and healthcare delivery. This report provides a comprehensive analysis of the digital health ecosystem valued at $550 billion in 2025.\n\nKey areas covered include telemedicine platforms, AI-powered diagnostics, electronic health records modernization, remote patient monitoring, digital therapeutics, and healthcare cybersecurity. The report examines how regulatory frameworks across 30+ countries are adapting to accommodate digital health innovation.\n\nOur analysis includes detailed case studies from 50+ health systems that have successfully implemented digital transformation initiatives, providing actionable benchmarks for healthcare organizations at every stage of their digital journey.",
        "pages": 350,
        "figures": 145,
        "tables": 78,
        "companies_profiled": 120,
        "regions_covered": 35,
        "publish_date": "2025-02-01",
        "report_id": "FC-2025-002",
        "price_single": 3750.00,
        "price_multi": 6250.00,
        "price_enterprise": 9750.00,
        "key_findings": [
            "Digital health market to exceed $1.2 trillion by 2030",
            "Telemedicine adoption permanently elevated — 40% of consultations now virtual",
            "AI diagnostics reducing error rates by 30% in radiology and pathology",
            "Digital therapeutics market growing at 25% CAGR, reaching $15B by 2028",
            "Healthcare cybersecurity spending to double by 2027"
        ],
        "table_of_contents": [
            {"chapter": "1", "title": "Executive Summary", "pages": "1-20"},
            {"chapter": "2", "title": "Digital Health Market Overview", "pages": "21-50"},
            {"chapter": "3", "title": "Telemedicine & Virtual Care", "pages": "51-100"},
            {"chapter": "4", "title": "AI in Healthcare", "pages": "101-160"},
            {"chapter": "5", "title": "Digital Therapeutics", "pages": "161-210"},
            {"chapter": "6", "title": "Regulatory Landscape", "pages": "211-260"},
            {"chapter": "7", "title": "Competitive Analysis", "pages": "261-320"},
            {"chapter": "8", "title": "Strategic Outlook", "pages": "321-350"}
        ],
        "methodology": "Based on primary research with 150+ healthcare executives, payers, and providers across 35 countries. Supplemented by analysis of clinical trial data, regulatory filings, patent analysis, and proprietary healthcare datasets.",
        "cover_image": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop",
        "featured": True,
        "keywords": ["digital health", "telemedicine", "AI diagnostics", "healthcare IT", "digital therapeutics"]
    },
    {
        "id": "rpt-003",
        "title": "Renewable Energy Investment Outlook 2025-2035",
        "industry": "Energy & Utilities",
        "category": "Industry Forecast",
        "description": "Detailed analysis of solar, wind, hydrogen, and energy storage markets. Includes investment flow analysis, policy impact assessment, and 10-year projections for 60+ countries.",
        "detailed_description": "As the world accelerates its transition to clean energy, understanding investment flows and market dynamics has never been more critical. This report provides the most comprehensive analysis available of the renewable energy investment landscape through 2035.\n\nOur research covers solar PV, onshore and offshore wind, green hydrogen, battery storage, and emerging technologies like perovskite solar cells and solid-state batteries. The report includes granular investment data across 60+ countries, policy impact modeling, and technology cost curves.\n\nThe financial analysis section provides detailed ROI modeling for different renewable energy project types across multiple geographies, making this an essential resource for investors, project developers, and policy makers.",
        "pages": 280,
        "figures": 130,
        "tables": 65,
        "companies_profiled": 95,
        "regions_covered": 60,
        "publish_date": "2025-01-20",
        "report_id": "FC-2025-003",
        "price_single": 4200.00,
        "price_multi": 6800.00,
        "price_enterprise": 10500.00,
        "key_findings": [
            "Global renewable energy investment to reach $5.5 trillion annually by 2030",
            "Solar PV costs to decline another 40% by 2030, reaching grid parity globally",
            "Green hydrogen production capacity to increase 100x by 2035",
            "Battery storage deployments to grow at 45% CAGR through 2030",
            "Offshore wind market to triple in size by 2030"
        ],
        "table_of_contents": [
            {"chapter": "1", "title": "Executive Summary", "pages": "1-18"},
            {"chapter": "2", "title": "Investment Landscape Overview", "pages": "19-50"},
            {"chapter": "3", "title": "Solar Energy Markets", "pages": "51-95"},
            {"chapter": "4", "title": "Wind Energy Markets", "pages": "96-140"},
            {"chapter": "5", "title": "Green Hydrogen Economy", "pages": "141-185"},
            {"chapter": "6", "title": "Energy Storage", "pages": "186-220"},
            {"chapter": "7", "title": "Regional Outlook", "pages": "221-260"},
            {"chapter": "8", "title": "Investment Strategy", "pages": "261-280"}
        ],
        "methodology": "Combines primary research with 100+ energy executives, government officials, and investors with proprietary energy market databases, satellite imagery analysis of renewable installations, and financial modeling of 500+ projects.",
        "cover_image": "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=400&fit=crop",
        "featured": True,
        "keywords": ["renewable energy", "solar", "wind", "hydrogen", "energy storage", "clean energy"]
    },
    {
        "id": "rpt-004",
        "title": "Global Fintech Market Intelligence Report",
        "industry": "Financial Services & Banking",
        "category": "Market Analysis",
        "description": "Explores digital payments, neobanking, blockchain in finance, insurtech, and embedded finance trends. Features 200+ company profiles and detailed funding analysis.",
        "detailed_description": "The fintech revolution continues to reshape global financial services, with the sector attracting over $100 billion in annual investment. This comprehensive market intelligence report covers every major fintech vertical and provides actionable insights for incumbents and challengers alike.\n\nOur analysis spans digital payments and wallets, neobanking and challenger banks, blockchain and DeFi, insurtech, regtech, wealthtech, and embedded finance. The report includes detailed funding analysis of 500+ fintech companies, M&A trends, and IPO pipeline assessment.\n\nThe regulatory section covers licensing frameworks, open banking mandates, and CBDC developments across 40+ countries, providing critical context for market entry and expansion strategies.",
        "pages": 310,
        "figures": 155,
        "tables": 85,
        "companies_profiled": 200,
        "regions_covered": 40,
        "publish_date": "2025-02-10",
        "report_id": "FC-2025-004",
        "price_single": 3500.00,
        "price_multi": 5800.00,
        "price_enterprise": 8950.00,
        "key_findings": [
            "Global fintech market to reach $700 billion by 2030",
            "Embedded finance to become the largest fintech segment by 2028",
            "CBDC pilots active in 80% of central banks worldwide",
            "Neobank customer base to exceed 500 million globally by 2027",
            "AI-driven compliance tools reducing regulatory costs by 40%"
        ],
        "table_of_contents": [
            {"chapter": "1", "title": "Executive Summary", "pages": "1-22"},
            {"chapter": "2", "title": "Fintech Market Landscape", "pages": "23-55"},
            {"chapter": "3", "title": "Digital Payments & Wallets", "pages": "56-100"},
            {"chapter": "4", "title": "Neobanking & Challenger Banks", "pages": "101-145"},
            {"chapter": "5", "title": "Blockchain & DeFi", "pages": "146-190"},
            {"chapter": "6", "title": "Insurtech & Wealthtech", "pages": "191-235"},
            {"chapter": "7", "title": "Regulatory Environment", "pages": "236-275"},
            {"chapter": "8", "title": "Competitive Landscape & Funding", "pages": "276-310"}
        ],
        "methodology": "Primary research includes 180+ interviews with fintech founders, banking executives, and regulators. Data sourced from proprietary fintech deal database, regulatory filings, and financial institution surveys across 40 countries.",
        "cover_image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
        "featured": True,
        "keywords": ["fintech", "digital payments", "neobanking", "blockchain", "embedded finance", "insurtech"]
    },
    {
        "id": "rpt-005",
        "title": "Electric Vehicle Supply Chain Analysis 2025",
        "industry": "Automotive & Transportation",
        "category": "Competitive Landscape",
        "description": "End-to-end analysis of the EV supply chain from raw materials to finished vehicles. Covers battery technology, charging infrastructure, and OEM strategies across major markets.",
        "detailed_description": "The electric vehicle industry is at an inflection point, with global EV sales expected to surpass 30 million units annually by 2027. This report provides the most detailed analysis available of the entire EV supply chain, from mining and raw materials to manufacturing, distribution, and end-of-life recycling.\n\nKey topics include lithium, cobalt, and nickel supply dynamics, next-generation battery technologies (solid-state, sodium-ion, lithium-sulfur), charging infrastructure deployment, and the shifting strategies of traditional OEMs versus pure-play EV manufacturers.\n\nThe report includes proprietary cost modeling that reveals the true economics of EV production across different battery chemistries and vehicle segments, providing invaluable intelligence for investment and strategic decisions.",
        "pages": 260,
        "figures": 120,
        "tables": 58,
        "companies_profiled": 110,
        "regions_covered": 30,
        "publish_date": "2025-01-25",
        "report_id": "FC-2025-005",
        "price_single": 3900.00,
        "price_multi": 6400.00,
        "price_enterprise": 9800.00,
        "key_findings": [
            "Global EV sales to reach 30 million units by 2027, 50% of new car sales by 2030",
            "Battery costs to fall below $80/kWh by 2028, enabling EV-ICE price parity",
            "Solid-state batteries to enter mass production by 2027-2028",
            "Global charging infrastructure investment to exceed $500 billion through 2030",
            "China controls 75% of global battery supply chain — diversification is critical"
        ],
        "table_of_contents": [
            {"chapter": "1", "title": "Executive Summary", "pages": "1-18"},
            {"chapter": "2", "title": "EV Market Overview", "pages": "19-45"},
            {"chapter": "3", "title": "Raw Materials & Mining", "pages": "46-85"},
            {"chapter": "4", "title": "Battery Technology & Manufacturing", "pages": "86-135"},
            {"chapter": "5", "title": "Vehicle Manufacturing & OEM Strategies", "pages": "136-180"},
            {"chapter": "6", "title": "Charging Infrastructure", "pages": "181-220"},
            {"chapter": "7", "title": "Recycling & Sustainability", "pages": "221-245"},
            {"chapter": "8", "title": "Strategic Outlook", "pages": "246-260"}
        ],
        "methodology": "Research based on 120+ interviews with OEM executives, battery manufacturers, mining companies, and charging infrastructure providers. Supplemented by proprietary cost models, patent analysis, and supply chain mapping.",
        "cover_image": "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&h=400&fit=crop",
        "featured": True,
        "keywords": ["electric vehicles", "EV", "battery technology", "charging infrastructure", "supply chain"]
    },
    {
        "id": "rpt-006",
        "title": "Cybersecurity Threat Landscape & Market Report 2025",
        "industry": "Technology & IT",
        "category": "Market Analysis",
        "description": "Comprehensive overview of the cybersecurity market including threat intelligence, zero-trust architecture, cloud security, and AI-driven defense solutions. Profiles 150+ vendors.",
        "detailed_description": "With cyberattacks costing the global economy $10.5 trillion annually by 2025, cybersecurity has become a board-level priority for organizations worldwide. This report provides an exhaustive analysis of the cybersecurity market, threat landscape, and technology evolution.\n\nThe report covers all major cybersecurity domains including network security, endpoint protection, cloud security, identity and access management, SIEM/SOAR, threat intelligence, and emerging categories like AI security and quantum-safe cryptography.\n\nOur threat landscape analysis examines the latest attack vectors, ransomware economics, state-sponsored threats, and supply chain vulnerabilities, providing security leaders with the intelligence they need to protect their organizations.",
        "pages": 290,
        "figures": 135,
        "tables": 72,
        "companies_profiled": 150,
        "regions_covered": 35,
        "publish_date": "2025-02-15",
        "report_id": "FC-2025-006",
        "price_single": 4100.00,
        "price_multi": 6700.00,
        "price_enterprise": 10200.00,
        "key_findings": [
            "Global cybersecurity market to reach $500 billion by 2030",
            "AI-powered security tools to comprise 35% of cybersecurity spending by 2028",
            "Zero-trust adoption rate to reach 80% among enterprises by 2027",
            "Ransomware damage costs projected at $265 billion by 2031",
            "Cybersecurity workforce gap remains at 3.5 million unfilled positions"
        ],
        "table_of_contents": [
            {"chapter": "1", "title": "Executive Summary", "pages": "1-20"},
            {"chapter": "2", "title": "Cybersecurity Market Overview", "pages": "21-55"},
            {"chapter": "3", "title": "Threat Landscape Analysis", "pages": "56-110"},
            {"chapter": "4", "title": "Network & Endpoint Security", "pages": "111-155"},
            {"chapter": "5", "title": "Cloud & Identity Security", "pages": "156-200"},
            {"chapter": "6", "title": "AI in Cybersecurity", "pages": "201-240"},
            {"chapter": "7", "title": "Vendor Landscape", "pages": "241-275"},
            {"chapter": "8", "title": "Strategic Recommendations", "pages": "276-290"}
        ],
        "methodology": "Based on analysis of 50,000+ cyber incidents, interviews with 100+ CISOs and security professionals, vendor briefings, and proprietary threat intelligence feeds.",
        "cover_image": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=400&fit=crop",
        "featured": True,
        "keywords": ["cybersecurity", "threat intelligence", "zero trust", "cloud security", "AI security"]
    },
    {
        "id": "rpt-007",
        "title": "Global Cloud Computing Market Analysis 2025-2030",
        "industry": "Technology & IT",
        "category": "Market Analysis",
        "description": "Analysis of IaaS, PaaS, SaaS markets with focus on multi-cloud strategies, edge computing, and sovereign cloud trends across enterprise segments.",
        "detailed_description": "The cloud computing market continues its explosive growth trajectory. This report provides detailed analysis of market dynamics, vendor strategies, and enterprise adoption patterns across all cloud service models.",
        "pages": 340,
        "figures": 160,
        "tables": 80,
        "companies_profiled": 130,
        "regions_covered": 40,
        "publish_date": "2025-01-10",
        "report_id": "FC-2025-007",
        "price_single": 4500.00,
        "price_multi": 7200.00,
        "price_enterprise": 10800.00,
        "key_findings": ["Cloud market to exceed $1.5T by 2030", "Edge computing to capture 25% of workloads by 2028", "Multi-cloud adoption at 85% among large enterprises", "Sovereign cloud regulations impacting 60% of global organizations"],
        "table_of_contents": [{"chapter": "1", "title": "Executive Summary", "pages": "1-25"}, {"chapter": "2", "title": "Market Overview", "pages": "26-80"}, {"chapter": "3", "title": "Service Model Analysis", "pages": "81-180"}, {"chapter": "4", "title": "Competitive Landscape", "pages": "181-300"}, {"chapter": "5", "title": "Strategic Outlook", "pages": "301-340"}],
        "methodology": "Primary research with 200+ cloud architects and IT leaders. Vendor analysis based on public filings, product benchmarks, and customer surveys.",
        "cover_image": "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&h=400&fit=crop",
        "featured": False,
        "keywords": ["cloud computing", "IaaS", "PaaS", "SaaS", "edge computing", "multi-cloud"]
    },
    {
        "id": "rpt-008",
        "title": "Pharmaceutical R&D Pipeline Analysis 2025",
        "industry": "Healthcare & Pharmaceuticals",
        "category": "Company Profiles",
        "description": "Comprehensive analysis of global pharma R&D pipelines covering oncology, immunology, rare diseases, and cell & gene therapy segments.",
        "detailed_description": "This report analyzes 3,000+ drugs in clinical development across the top 50 pharmaceutical companies, providing critical intelligence for investors, licensing professionals, and strategic planners.",
        "pages": 380,
        "figures": 170,
        "tables": 95,
        "companies_profiled": 50,
        "regions_covered": 25,
        "publish_date": "2024-12-15",
        "report_id": "FC-2024-008",
        "price_single": 5200.00,
        "price_multi": 8500.00,
        "price_enterprise": 12500.00,
        "key_findings": ["Oncology represents 35% of global pipeline", "Cell & gene therapy approvals to double by 2028", "AI-discovered drugs entering Phase III trials", "Biosimilar market to reach $100B by 2030"],
        "table_of_contents": [{"chapter": "1", "title": "Executive Summary", "pages": "1-25"}, {"chapter": "2", "title": "Pipeline Overview", "pages": "26-100"}, {"chapter": "3", "title": "Therapeutic Area Analysis", "pages": "101-250"}, {"chapter": "4", "title": "Company Profiles", "pages": "251-350"}, {"chapter": "5", "title": "Strategic Outlook", "pages": "351-380"}],
        "methodology": "Analysis of clinical trial registries, FDA/EMA filings, company pipelines, and expert interviews with 80+ pharma R&D leaders.",
        "cover_image": "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=600&h=400&fit=crop",
        "featured": False,
        "keywords": ["pharmaceutical", "R&D pipeline", "oncology", "gene therapy", "drug development"]
    },
    {
        "id": "rpt-009",
        "title": "Global E-Commerce & Digital Retail Report 2025",
        "industry": "Retail & E-Commerce",
        "category": "Market Analysis",
        "description": "Analysis of global e-commerce trends, social commerce, live shopping, fulfillment innovation, and the convergence of online and offline retail.",
        "detailed_description": "The retail landscape continues to evolve rapidly with e-commerce penetration reaching new highs. This report covers market dynamics, consumer behavior shifts, and technology-driven retail innovation across 50+ markets worldwide.",
        "pages": 300,
        "figures": 140,
        "tables": 70,
        "companies_profiled": 100,
        "regions_covered": 50,
        "publish_date": "2025-01-30",
        "report_id": "FC-2025-009",
        "price_single": 3200.00,
        "price_multi": 5400.00,
        "price_enterprise": 8200.00,
        "key_findings": ["Global e-commerce to reach $8T by 2028", "Social commerce growing 3x faster than traditional e-commerce", "Same-day delivery becoming baseline expectation in urban markets", "AI personalization driving 25% revenue uplift"],
        "table_of_contents": [{"chapter": "1", "title": "Executive Summary", "pages": "1-20"}, {"chapter": "2", "title": "Market Overview", "pages": "21-70"}, {"chapter": "3", "title": "Consumer Behavior", "pages": "71-140"}, {"chapter": "4", "title": "Technology & Innovation", "pages": "141-230"}, {"chapter": "5", "title": "Competitive Landscape", "pages": "231-300"}],
        "methodology": "Consumer surveys of 25,000+ shoppers across 50 countries, retailer interviews, and transaction data analysis.",
        "cover_image": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop",
        "featured": False,
        "keywords": ["e-commerce", "digital retail", "social commerce", "fulfillment", "omnichannel"]
    },
    {
        "id": "rpt-010",
        "title": "5G & Next-Gen Telecommunications Market Report",
        "industry": "Telecommunications",
        "category": "Industry Forecast",
        "description": "Comprehensive outlook on 5G deployment, private networks, satellite communications, and the path to 6G across global markets.",
        "detailed_description": "As 5G networks mature and 6G research begins, this report provides detailed analysis of the telecommunications infrastructure market, enterprise adoption, and emerging use cases driving the next generation of connectivity.",
        "pages": 270,
        "figures": 125,
        "tables": 60,
        "companies_profiled": 85,
        "regions_covered": 45,
        "publish_date": "2025-02-05",
        "report_id": "FC-2025-010",
        "price_single": 3800.00,
        "price_multi": 6200.00,
        "price_enterprise": 9500.00,
        "key_findings": ["5G subscribers to reach 5.5 billion by 2030", "Private 5G networks market growing at 40% CAGR", "LEO satellite broadband to serve 50M+ subscribers by 2028", "6G standardization expected by 2029-2030"],
        "table_of_contents": [{"chapter": "1", "title": "Executive Summary", "pages": "1-18"}, {"chapter": "2", "title": "5G Market Status", "pages": "19-70"}, {"chapter": "3", "title": "Enterprise 5G", "pages": "71-130"}, {"chapter": "4", "title": "Satellite Communications", "pages": "131-190"}, {"chapter": "5", "title": "Path to 6G", "pages": "191-240"}, {"chapter": "6", "title": "Outlook", "pages": "241-270"}],
        "methodology": "Based on operator data, spectrum auction analysis, equipment vendor briefings, and enterprise adoption surveys across 45 countries.",
        "cover_image": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop",
        "featured": False,
        "keywords": ["5G", "telecommunications", "private networks", "satellite", "6G"]
    },
    {
        "id": "rpt-011",
        "title": "Smart Manufacturing & Industry 4.0 Report 2025",
        "industry": "Manufacturing & Industrial",
        "category": "Market Analysis",
        "description": "Analysis of IoT in manufacturing, digital twins, robotics, predictive maintenance, and smart factory implementation across global markets.",
        "detailed_description": "This report examines how Industry 4.0 technologies are transforming manufacturing operations worldwide, covering adoption trends, ROI analysis, and implementation strategies.",
        "pages": 250,
        "figures": 110,
        "tables": 55,
        "companies_profiled": 90,
        "regions_covered": 30,
        "publish_date": "2024-11-20",
        "report_id": "FC-2024-011",
        "price_single": 3600.00,
        "price_multi": 5900.00,
        "price_enterprise": 9000.00,
        "key_findings": ["Smart manufacturing market to reach $650B by 2030", "Digital twin adoption to grow 5x by 2028", "Cobots growing at 35% CAGR", "Predictive maintenance reducing downtime by 45%"],
        "table_of_contents": [{"chapter": "1", "title": "Executive Summary", "pages": "1-18"}, {"chapter": "2", "title": "Industry 4.0 Overview", "pages": "19-60"}, {"chapter": "3", "title": "Technology Analysis", "pages": "61-150"}, {"chapter": "4", "title": "Use Cases & ROI", "pages": "151-210"}, {"chapter": "5", "title": "Outlook", "pages": "211-250"}],
        "methodology": "Primary research with 100+ manufacturing executives, factory visits, and analysis of industrial IoT deployment data.",
        "cover_image": "https://images.unsplash.com/photo-1565043666747-69f6646db940?w=600&h=400&fit=crop",
        "featured": False,
        "keywords": ["smart manufacturing", "Industry 4.0", "IoT", "digital twin", "robotics"]
    },
    {
        "id": "rpt-012",
        "title": "Global Real Estate Technology (PropTech) Report",
        "industry": "Real Estate & Construction",
        "category": "Market Analysis",
        "description": "Analysis of property technology innovations including digital transactions, smart buildings, construction tech, and real estate investment platforms.",
        "detailed_description": "PropTech is revolutionizing every aspect of the real estate value chain. This report provides a thorough analysis of the technologies transforming property development, transactions, management, and investment.",
        "pages": 220,
        "figures": 95,
        "tables": 48,
        "companies_profiled": 75,
        "regions_covered": 25,
        "publish_date": "2025-01-05",
        "report_id": "FC-2025-012",
        "price_single": 2800.00,
        "price_multi": 4600.00,
        "price_enterprise": 7200.00,
        "key_findings": ["PropTech market to reach $90B by 2030", "Digital closings now standard in 60% of US transactions", "Smart building market growing at 28% CAGR", "Tokenized real estate assets to reach $5B by 2028"],
        "table_of_contents": [{"chapter": "1", "title": "Executive Summary", "pages": "1-15"}, {"chapter": "2", "title": "PropTech Landscape", "pages": "16-55"}, {"chapter": "3", "title": "Technology Analysis", "pages": "56-130"}, {"chapter": "4", "title": "Investment Trends", "pages": "131-185"}, {"chapter": "5", "title": "Outlook", "pages": "186-220"}],
        "methodology": "Research based on interviews with 60+ proptech founders and real estate executives, deal analysis, and property market data.",
        "cover_image": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop",
        "featured": False,
        "keywords": ["proptech", "real estate technology", "smart buildings", "construction tech"]
    },
    {
        "id": "rpt-013",
        "title": "Global Food & AgriTech Innovation Report 2025",
        "industry": "Food & Agriculture",
        "category": "Industry Forecast",
        "description": "Analysis of precision agriculture, alternative proteins, vertical farming, and food supply chain technology transforming global agriculture.",
        "detailed_description": "This report examines how technology is addressing the challenge of feeding 10 billion people by 2050 while reducing agriculture's environmental footprint.",
        "pages": 240,
        "figures": 105,
        "tables": 52,
        "companies_profiled": 80,
        "regions_covered": 35,
        "publish_date": "2024-12-01",
        "report_id": "FC-2024-013",
        "price_single": 3400.00,
        "price_multi": 5600.00,
        "price_enterprise": 8600.00,
        "key_findings": ["AgriTech market to exceed $40B by 2030", "Alt-protein market growing at 20% CAGR", "Precision agriculture reducing input costs by 30%", "Vertical farming capacity to grow 10x by 2030"],
        "table_of_contents": [{"chapter": "1", "title": "Executive Summary", "pages": "1-16"}, {"chapter": "2", "title": "AgriTech Overview", "pages": "17-55"}, {"chapter": "3", "title": "Precision Agriculture", "pages": "56-110"}, {"chapter": "4", "title": "Alternative Proteins", "pages": "111-170"}, {"chapter": "5", "title": "Supply Chain Innovation", "pages": "171-210"}, {"chapter": "6", "title": "Outlook", "pages": "211-240"}],
        "methodology": "Research combining satellite crop data, farm-level surveys, agritech startup analysis, and interviews with 70+ industry leaders.",
        "cover_image": "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=400&fit=crop",
        "featured": False,
        "keywords": ["agritech", "precision agriculture", "alternative protein", "vertical farming", "food tech"]
    },
    {
        "id": "rpt-014",
        "title": "Aerospace & Defense Technology Outlook 2025-2035",
        "industry": "Aerospace & Defense",
        "category": "Regional Report",
        "description": "Strategic analysis of defense modernization, space economy, autonomous systems, and next-generation aerospace technologies.",
        "detailed_description": "This report covers the convergence of commercial space, defense modernization, and advanced aerospace technologies that are reshaping the industry landscape through 2035.",
        "pages": 320,
        "figures": 150,
        "tables": 75,
        "companies_profiled": 100,
        "regions_covered": 30,
        "publish_date": "2025-02-12",
        "report_id": "FC-2025-014",
        "price_single": 4800.00,
        "price_multi": 7800.00,
        "price_enterprise": 11500.00,
        "key_findings": ["Space economy to reach $1.8T by 2035", "Defense AI spending to triple by 2030", "Autonomous drone market exceeding $50B by 2028", "Hypersonic technology investments surging globally"],
        "table_of_contents": [{"chapter": "1", "title": "Executive Summary", "pages": "1-22"}, {"chapter": "2", "title": "Space Economy", "pages": "23-90"}, {"chapter": "3", "title": "Defense Modernization", "pages": "91-180"}, {"chapter": "4", "title": "Autonomous Systems", "pages": "181-250"}, {"chapter": "5", "title": "Regional Analysis", "pages": "251-295"}, {"chapter": "6", "title": "Outlook", "pages": "296-320"}],
        "methodology": "Based on government procurement data, defense budget analysis, space industry metrics, and interviews with 80+ defense and aerospace executives.",
        "cover_image": "https://images.unsplash.com/photo-1517976487492-5750f3195933?w=600&h=400&fit=crop",
        "featured": False,
        "keywords": ["aerospace", "defense", "space economy", "autonomous systems", "military technology"]
    },
    {
        "id": "rpt-015",
        "title": "Global Media & Entertainment Digital Transformation",
        "industry": "Media & Entertainment",
        "category": "Competitive Landscape",
        "description": "Analysis of streaming wars, gaming economy, creator economy, immersive media (AR/VR), and advertising technology evolution.",
        "detailed_description": "The media and entertainment industry is undergoing fundamental disruption. This report analyzes the shifting landscape of content creation, distribution, monetization, and consumption.",
        "pages": 275,
        "figures": 130,
        "tables": 62,
        "companies_profiled": 110,
        "regions_covered": 35,
        "publish_date": "2025-01-18",
        "report_id": "FC-2025-015",
        "price_single": 3300.00,
        "price_multi": 5500.00,
        "price_enterprise": 8400.00,
        "key_findings": ["Global streaming market consolidation accelerating", "Gaming industry to reach $320B by 2028", "Creator economy valued at $250B+", "Immersive media (AR/VR) breaking into mainstream"],
        "table_of_contents": [{"chapter": "1", "title": "Executive Summary", "pages": "1-18"}, {"chapter": "2", "title": "Streaming Landscape", "pages": "19-70"}, {"chapter": "3", "title": "Gaming Economy", "pages": "71-130"}, {"chapter": "4", "title": "Creator Economy", "pages": "131-185"}, {"chapter": "5", "title": "Immersive Media", "pages": "186-230"}, {"chapter": "6", "title": "AdTech Evolution", "pages": "231-255"}, {"chapter": "7", "title": "Outlook", "pages": "256-275"}],
        "methodology": "Consumer behavior surveys of 15,000+ media consumers, content library analysis, advertising spend data, and interviews with 70+ media executives.",
        "cover_image": "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=600&h=400&fit=crop",
        "featured": False,
        "keywords": ["media", "entertainment", "streaming", "gaming", "creator economy", "AR/VR"]
    }
]

INDUSTRIES = [
    {"name": "Technology & IT", "icon": "Monitor", "slug": "technology-it"},
    {"name": "Healthcare & Pharmaceuticals", "icon": "Heart", "slug": "healthcare-pharmaceuticals"},
    {"name": "Financial Services & Banking", "icon": "Landmark", "slug": "financial-services-banking"},
    {"name": "Energy & Utilities", "icon": "Zap", "slug": "energy-utilities"},
    {"name": "Manufacturing & Industrial", "icon": "Factory", "slug": "manufacturing-industrial"},
    {"name": "Retail & E-Commerce", "icon": "ShoppingBag", "slug": "retail-e-commerce"},
    {"name": "Automotive & Transportation", "icon": "Car", "slug": "automotive-transportation"},
    {"name": "Telecommunications", "icon": "Radio", "slug": "telecommunications"},
    {"name": "Real Estate & Construction", "icon": "Building2", "slug": "real-estate-construction"},
    {"name": "Food & Agriculture", "icon": "Wheat", "slug": "food-agriculture"},
    {"name": "Aerospace & Defense", "icon": "Plane", "slug": "aerospace-defense"},
    {"name": "Media & Entertainment", "icon": "Film", "slug": "media-entertainment"},
]

# ─── Startup: Seed DB ───
@app.on_event("startup")
async def seed_database():
    count = await db.reports.count_documents({})
    if count == 0:
        logger.info("Seeding reports database...")
        await db.reports.insert_many(SEED_REPORTS)
        logger.info(f"Seeded {len(SEED_REPORTS)} reports")
    # Ensure indexes
    await db.reports.create_index("industry")
    await db.reports.create_index("category")
    await db.reports.create_index("featured")
    await db.reports.create_index([("title", "text"), ("description", "text"), ("keywords", "text")])

# ─── Report Endpoints ───
@api_router.get("/reports")
async def get_reports(
    industry: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    search: Optional[str] = None,
    featured: Optional[bool] = None,
    sort_by: Optional[str] = "publish_date",
    page: int = 1,
    limit: int = 12,
):
    query = {}
    if industry:
        query["industry"] = industry
    if category:
        query["category"] = category
    if featured is not None:
        query["featured"] = featured
    if min_price is not None or max_price is not None:
        price_q = {}
        if min_price is not None:
            price_q["$gte"] = min_price
        if max_price is not None:
            price_q["$lte"] = max_price
        query["price_single"] = price_q
    if search:
        query["$text"] = {"$search": search}

    skip = (page - 1) * limit
    sort_field = sort_by if sort_by in ["publish_date", "price_single", "title"] else "publish_date"
    sort_dir = -1 if sort_field == "publish_date" else 1

    total = await db.reports.count_documents(query)
    reports = await db.reports.find(query, {"_id": 0}).sort(sort_field, sort_dir).skip(skip).limit(limit).to_list(limit)
    return {"reports": reports, "total": total, "page": page, "pages": (total + limit - 1) // limit}

@api_router.get("/reports/{report_id}")
async def get_report(report_id: str):
    report = await db.reports.find_one({"id": report_id}, {"_id": 0})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@api_router.get("/industries")
async def get_industries():
    pipeline = [{"$group": {"_id": "$industry", "count": {"$sum": 1}}}]
    counts_raw = await db.reports.aggregate(pipeline).to_list(100)
    counts = {c["_id"]: c["count"] for c in counts_raw}
    result = []
    for ind in INDUSTRIES:
        result.append({**ind, "report_count": counts.get(ind["name"], 0)})
    return result

@api_router.get("/search")
async def search_reports(q: str = Query(..., min_length=1)):
    reports = await db.reports.find(
        {"$text": {"$search": q}},
        {"_id": 0, "id": 1, "title": 1, "industry": 1, "price_single": 1, "description": 1}
    ).limit(10).to_list(10)
    return reports

# ─── Stripe Checkout ───
REPORT_PRICES = {}

async def get_report_prices():
    """Load report prices from DB (cached in memory)."""
    global REPORT_PRICES
    if not REPORT_PRICES:
        reports = await db.reports.find({}, {"_id": 0, "id": 1, "price_single": 1, "price_multi": 1, "price_enterprise": 1, "title": 1}).to_list(100)
        for r in reports:
            REPORT_PRICES[r["id"]] = r
    return REPORT_PRICES

@api_router.post("/checkout")
async def create_checkout(request: Request, body: CheckoutRequest):
    from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest, CheckoutSessionResponse

    prices = await get_report_prices()
    total_amount = 0.0
    item_details = []

    for item in body.items:
        report_id = item.get("report_id")
        license_type = item.get("license_type", "single")
        if report_id not in prices:
            raise HTTPException(400, f"Invalid report: {report_id}")
        report = prices[report_id]
        price_key = f"price_{license_type}"
        if price_key not in report:
            raise HTTPException(400, f"Invalid license type: {license_type}")
        price = report[price_key]
        total_amount += price
        item_details.append({"report_id": report_id, "title": report["title"], "license_type": license_type, "price": price})

    if total_amount <= 0:
        raise HTTPException(400, "Cart is empty")

    origin_url = body.origin_url.rstrip("/")
    success_url = f"{origin_url}/?payment=success&session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{origin_url}/?payment=cancelled"

    api_key = os.environ.get("STRIPE_API_KEY")
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)

    metadata = {"items": str(item_details)[:500], "item_count": str(len(item_details))}

    checkout_req = CheckoutSessionRequest(
        amount=float(total_amount),
        currency="usd",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata
    )
    session: CheckoutSessionResponse = await stripe_checkout.create_checkout_session(checkout_req)

    # Store transaction
    tx = {
        "id": str(uuid.uuid4()),
        "session_id": session.session_id,
        "amount": total_amount,
        "currency": "usd",
        "items": item_details,
        "metadata": metadata,
        "payment_status": "initiated",
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.payment_transactions.insert_one(tx)

    return {"url": session.url, "session_id": session.session_id}

@api_router.get("/checkout/status/{session_id}")
async def get_checkout_status(session_id: str):
    from emergentintegrations.payments.stripe.checkout import StripeCheckout

    api_key = os.environ.get("STRIPE_API_KEY")
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url="")

    status = await stripe_checkout.get_checkout_status(session_id)

    # Update transaction in DB
    await db.payment_transactions.update_one(
        {"session_id": session_id, "payment_status": {"$ne": "paid"}},
        {"$set": {
            "payment_status": status.payment_status,
            "status": status.status,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )

    return {
        "status": status.status,
        "payment_status": status.payment_status,
        "amount_total": status.amount_total,
        "currency": status.currency,
    }

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    from emergentintegrations.payments.stripe.checkout import StripeCheckout

    api_key = os.environ.get("STRIPE_API_KEY")
    host_url = str(request.base_url).rstrip("/")
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=api_key, webhook_url=webhook_url)

    body = await request.body()
    signature = request.headers.get("Stripe-Signature", "")
    try:
        event = await stripe_checkout.handle_webhook(body, signature)
        if event.payment_status == "paid":
            await db.payment_transactions.update_one(
                {"session_id": event.session_id, "payment_status": {"$ne": "paid"}},
                {"$set": {
                    "payment_status": "paid",
                    "status": "complete",
                    "event_id": event.event_id,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"status": "error"}

# ─── Newsletter ───
@api_router.post("/newsletter")
async def subscribe_newsletter(body: NewsletterRequest):
    existing = await db.newsletter_signups.find_one({"email": body.email})
    if existing:
        return {"message": "Already subscribed", "status": "existing"}
    doc = {
        "id": str(uuid.uuid4()),
        "email": body.email,
        "subscribed_at": datetime.now(timezone.utc).isoformat()
    }
    await db.newsletter_signups.insert_one(doc)
    return {"message": "Successfully subscribed", "status": "success"}

# ─── Contact ───
@api_router.post("/contact")
async def submit_contact(body: ContactRequest):
    doc = {
        "id": str(uuid.uuid4()),
        "name": body.name,
        "email": body.email,
        "subject": body.subject,
        "message": body.message,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.contact_requests.insert_one(doc)
    return {"message": "Message received. We'll get back to you shortly.", "status": "success"}

# ─── Custom Research ───
@api_router.post("/custom-research")
async def submit_custom_research(body: CustomResearchRequest):
    doc = {
        "id": str(uuid.uuid4()),
        "name": body.name,
        "email": body.email,
        "company": body.company,
        "phone": body.phone,
        "industry": body.industry,
        "description": body.description,
        "budget": body.budget,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.custom_research_requests.insert_one(doc)
    return {"message": "Research request received. Our team will contact you within 24 hours.", "status": "success"}

# ─── Sample Download ───
@api_router.post("/sample-download")
async def request_sample(body: SampleDownloadRequest):
    doc = {
        "id": str(uuid.uuid4()),
        "email": body.email,
        "report_id": body.report_id,
        "downloaded_at": datetime.now(timezone.utc).isoformat()
    }
    await db.sample_downloads.insert_one(doc)
    return {"message": "Sample ready for download", "status": "success", "download_url": f"/api/sample-download/{body.report_id}/pdf"}

@api_router.get("/sample-download/{report_id}/pdf")
async def download_sample_pdf(report_id: str):
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch

    report = await db.reports.find_one({"id": report_id}, {"_id": 0})
    if not report:
        raise HTTPException(404, "Report not found")

    buf = BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=letter, topMargin=1*inch, bottomMargin=1*inch)
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle("CustomTitle", parent=styles["Title"], fontSize=20, spaceAfter=20, textColor=colors.HexColor("#0A1628"))
    subtitle_style = ParagraphStyle("CustomSub", parent=styles["Normal"], fontSize=12, textColor=colors.HexColor("#64748B"), spaceAfter=30)

    elements = []
    elements.append(Paragraph("FLOW CONSULTING", ParagraphStyle("Brand", parent=styles["Normal"], fontSize=14, textColor=colors.HexColor("#00B4D8"), spaceAfter=5)))
    elements.append(Paragraph("SAMPLE REPORT PREVIEW", ParagraphStyle("Tag", parent=styles["Normal"], fontSize=10, textColor=colors.HexColor("#F59E0B"), spaceAfter=20)))
    elements.append(Paragraph(report["title"], title_style))
    elements.append(Paragraph(f"Report ID: {report['report_id']} | {report['pages']} Pages | Published: {report['publish_date']}", subtitle_style))
    elements.append(Spacer(1, 20))
    elements.append(Paragraph("EXECUTIVE SUMMARY", styles["Heading2"]))
    elements.append(Paragraph(report["description"], styles["Normal"]))
    elements.append(Spacer(1, 20))
    elements.append(Paragraph("KEY FINDINGS", styles["Heading2"]))
    for finding in report.get("key_findings", []):
        elements.append(Paragraph(f"• {finding}", styles["Normal"]))
    elements.append(Spacer(1, 20))
    elements.append(Paragraph("TABLE OF CONTENTS", styles["Heading2"]))
    toc_data = [["Chapter", "Title", "Pages"]]
    for ch in report.get("table_of_contents", []):
        toc_data.append([ch["chapter"], ch["title"], ch["pages"]])
    t = Table(toc_data, colWidths=[60, 300, 80])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0A1628")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 30))
    elements.append(Paragraph("This is a sample preview. Purchase the full report for complete analysis.", ParagraphStyle("Footer", parent=styles["Normal"], fontSize=10, textColor=colors.HexColor("#94A3B8"))))
    elements.append(Paragraph(f"www.flowconsulting.com | {report['report_id']}", ParagraphStyle("Footer2", parent=styles["Normal"], fontSize=9, textColor=colors.HexColor("#64748B"))))

    doc.build(elements)
    buf.seek(0)

    filename = f"FlowConsulting_Sample_{report['report_id']}.pdf"
    return StreamingResponse(buf, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename={filename}"})

# ─── Admin Endpoints ───
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "flowadmin2025")

@api_router.post("/admin/login")
async def admin_login(body: AdminLoginRequest):
    if body.password != ADMIN_PASSWORD:
        raise HTTPException(401, "Invalid password")
    return {"status": "ok", "message": "Authenticated"}

@api_router.get("/admin/stats")
async def admin_stats():
    reports_count = await db.reports.count_documents({})
    newsletter_count = await db.newsletter_signups.count_documents({})
    contact_count = await db.contact_requests.count_documents({})
    research_count = await db.custom_research_requests.count_documents({})
    downloads_count = await db.sample_downloads.count_documents({})
    transactions_count = await db.payment_transactions.count_documents({})
    paid_count = await db.payment_transactions.count_documents({"payment_status": "paid"})

    # Revenue calc
    pipeline = [
        {"$match": {"payment_status": "paid"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    rev_result = await db.payment_transactions.aggregate(pipeline).to_list(1)
    total_revenue = rev_result[0]["total"] if rev_result else 0

    return {
        "reports": reports_count,
        "newsletter_subscribers": newsletter_count,
        "contact_requests": contact_count,
        "research_requests": research_count,
        "sample_downloads": downloads_count,
        "total_transactions": transactions_count,
        "paid_transactions": paid_count,
        "total_revenue": total_revenue,
    }

@api_router.post("/admin/reports")
async def create_report(body: ReportCreateUpdate):
    report_dict = body.model_dump()
    report_dict["id"] = f"rpt-{str(uuid.uuid4())[:8]}"
    if not report_dict["report_id"]:
        report_dict["report_id"] = f"FC-{datetime.now(timezone.utc).strftime('%Y')}-{str(uuid.uuid4())[:3].upper()}"
    if not report_dict["publish_date"]:
        report_dict["publish_date"] = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    await db.reports.insert_one(report_dict)
    # Reset cached prices
    global REPORT_PRICES
    REPORT_PRICES = {}
    # Return without _id
    report_dict.pop("_id", None)
    return report_dict

@api_router.put("/admin/reports/{report_id}")
async def update_report(report_id: str, body: ReportCreateUpdate):
    update_data = body.model_dump()
    result = await db.reports.update_one({"id": report_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(404, "Report not found")
    global REPORT_PRICES
    REPORT_PRICES = {}
    updated = await db.reports.find_one({"id": report_id}, {"_id": 0})
    return updated

@api_router.delete("/admin/reports/{report_id}")
async def delete_report(report_id: str):
    result = await db.reports.delete_one({"id": report_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Report not found")
    global REPORT_PRICES
    REPORT_PRICES = {}
    return {"status": "deleted", "id": report_id}

@api_router.get("/admin/submissions")
async def get_submissions(
    submission_type: str = "all",
    page: int = 1,
    limit: int = 20,
):
    skip = (page - 1) * limit
    result = {}

    if submission_type in ("all", "newsletter"):
        items = await db.newsletter_signups.find({}, {"_id": 0}).sort("subscribed_at", -1).skip(skip if submission_type == "newsletter" else 0).limit(limit).to_list(limit)
        total = await db.newsletter_signups.count_documents({})
        result["newsletter"] = {"items": items, "total": total}

    if submission_type in ("all", "contact"):
        items = await db.contact_requests.find({}, {"_id": 0}).sort("created_at", -1).skip(skip if submission_type == "contact" else 0).limit(limit).to_list(limit)
        total = await db.contact_requests.count_documents({})
        result["contact"] = {"items": items, "total": total}

    if submission_type in ("all", "research"):
        items = await db.custom_research_requests.find({}, {"_id": 0}).sort("created_at", -1).skip(skip if submission_type == "research" else 0).limit(limit).to_list(limit)
        total = await db.custom_research_requests.count_documents({})
        result["research"] = {"items": items, "total": total}

    if submission_type in ("all", "downloads"):
        items = await db.sample_downloads.find({}, {"_id": 0}).sort("downloaded_at", -1).skip(skip if submission_type == "downloads" else 0).limit(limit).to_list(limit)
        total = await db.sample_downloads.count_documents({})
        result["downloads"] = {"items": items, "total": total}

    return result

@api_router.get("/admin/transactions")
async def get_transactions(page: int = 1, limit: int = 20):
    skip = (page - 1) * limit
    total = await db.payment_transactions.count_documents({})
    items = await db.payment_transactions.find({}, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    return {"items": items, "total": total, "page": page, "pages": (total + limit - 1) // limit if total > 0 else 1}

# ─── Root ───
@api_router.get("/")
async def root():
    return {"message": "Flow Consulting API", "status": "running"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
