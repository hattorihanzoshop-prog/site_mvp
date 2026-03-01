from fastapi import FastAPI, APIRouter, Request, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
import json
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone
from io import BytesIO
from starlette.responses import StreamingResponse

# Настройка путей
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

DB_PATH = ROOT_DIR / "db_dump.json"

# --- Имитация базы данных MongoDB через JSON ---
class MockCursor:
    def __init__(self, data):
        self.data = data

    def sort(self, field, direction=-1):
        # Простая сортировка (обычно по дате или ID)
        try:
            self.data.sort(key=lambda x: x.get(field, ""), reverse=(direction == -1))
        except:
            pass
        return self

    def skip(self, n):
        self.data = self.data[n:]
        return self

    def limit(self, n):
        self.data = self.data[:n]
        return self

    async def to_list(self, length=None):
        return self.data[:length] if length is not None else self.data

class MockCollection:
    def __init__(self, data):
        self.data = data if isinstance(data, list) else []

    async def find(self, query=None, projection=None):
        filtered_data = self.data
        if query:
            filtered_data = [
                item for item in self.data 
                if all(item.get(k) == v for k, v in query.items())
            ]
        # Возвращаем копию данных, чтобы не менять оригинал в памяти
        return MockCursor(list(filtered_data))

    async def find_one(self, query):
        cursor = await self.find(query)
        res = await cursor.to_list(1)
        return res[0] if res else None

    async def insert_one(self, document):
        if "id" not in document:
            document["id"] = str(uuid.uuid4())
        self.data.append(document)
        return document

    async def count_documents(self, query):
        cursor = await self.find(query)
        res = await cursor.to_list()
        return len(res)

class JSONDatabase:
    def __init__(self, file_path):
        self.file_path = file_path
        if os.path.exists(file_path):
            with open(file_path, 'r', encoding='utf-8') as f:
                self._storage = json.load(f)
        else:
            self._storage = {}

    def __getattr__(self, name):
        # Возвращает коллекцию из JSON или пустой список, если её нет
        return MockCollection(self._storage.get(name, []))

# Инициализация "БД"
db = JSONDatabase(DB_PATH)

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Модели данных ---
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

# --- Роуты API ---
@api_router.get("/industries")
async def get_industries():
    # Извлекаем все уникальные индустрии из списка отчетов
    reports_cursor = await db.reports.find({})
    reports_list = await reports_cursor.to_list()
    # Собираем уникальные значения и сортируем их
    industries = sorted(list(set(r.get("industry") for r in reports_list if r.get("industry"))))
    return industries

@api_router.get("/reports", response_model=List[ReportOut])
async def get_reports(
    industry: Optional[str] = Query(None), 
    featured: Optional[bool] = Query(None),
    limit: int = Query(50)
):
    query = {}
    if industry and industry != "All Industries":
        query["industry"] = industry
    if featured is not None:
        query["featured"] = featured
    
    cursor = await db.reports.find(query)
    return await cursor.to_list(limit)

@api_router.get("/reports/{report_id}", response_model=ReportOut)
async def get_report(report_id: str):
    report = await db.reports.find_one({"id": report_id})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@api_router.post("/research-request")
async def research_request(data: dict):
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.custom_research_requests.insert_one(data)
    return {"status": "success"}

@api_router.post("/newsletter-signup")
async def newsletter_signup(data: dict):
    await db.newsletter_signups.insert_one(data)
    return {"status": "success"}

# --- Админ-панель (упрощенная проверка пароля) ---
@api_router.get("/admin/stats")
async def get_admin_stats(password: str = Query(...)):
    if password != os.getenv("ADMIN_PASSWORD"):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    return {
        "reports_count": await db.reports.count_documents({}),
        "requests_count": await db.custom_research_requests.count_documents({}),
        "signups_count": await db.newsletter_signups.count_documents({})
    }

@api_router.get("/")
async def root():
    return {"message": "Flow Consulting API", "status": "running", "database": "JSON-mode"}

app.include_router(api_router)
