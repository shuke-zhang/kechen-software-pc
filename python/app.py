# app.py
import hashlib
import os
import socket
from typing import Optional, Any
import uuid
from datetime import datetime
from pathlib import Path
import re

from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Request
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict

from sqlalchemy import (
    create_engine, Column, Integer, String, DateTime, Text, BigInteger,
    ForeignKey, UniqueConstraint, text
)
from sqlalchemy.orm import sessionmaker, declarative_base, relationship

# =========================
# Config （使用你的 MySQL：shuke）
# =========================
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "zhangenjian123..")
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = os.getenv("DB_PORT", "3307")
DB_NAME = os.getenv("DB_NAME", "shuke")

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
)

# 存储目录（不加子目录/前缀，直接存原名）
STORAGE_DIR = Path(os.getenv("STORAGE_DIR", "./storage")).resolve()
TMP_DIR = Path(os.getenv("TMP_DIR", "./tmp")).resolve()
CHUNK_SIZE = 1024 * 1024 * 8  # 8MB

STORAGE_DIR.mkdir(parents=True, exist_ok=True)
TMP_DIR.mkdir(parents=True, exist_ok=True)

# =========================
# Database setup
# =========================
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    future=True,
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()

print(f"[filesvc] DATABASE_URL = {engine.url}")
print(f"[filesvc] STORAGE_DIR  = {STORAGE_DIR}")

# =========================
# Enums
# =========================
class UploadStatusEnum(str):
    initiated = "initiated"
    receiving = "receiving"
    committed = "committed"
    aborted = "aborted"

class FileStatusEnum(str):
    active = "active"
    deleted = "deleted"

# =========================
# Models（与你库一致：uploaded_file）
# =========================
class FileEntry(Base):
    __tablename__ = "uploaded_file"
    id = Column(Integer, primary_key=True, autoincrement=True)
    original_name = Column(String(512), nullable=False, index=True)
    public_name = Column(String(512), nullable=False, unique=True, index=True)  # 对外直链名
    content_type = Column(String(255), nullable=True)
    size = Column(BigInteger, nullable=False)
    sha256 = Column(String(64), nullable=False, index=True)
    storage_path = Column(Text, nullable=False, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    status = Column(String(16), default=FileStatusEnum.active, nullable=False)
    note = Column(Text, nullable=True)

class ResumableUpload(Base):
    __tablename__ = "uploads"
    id = Column(String(36), primary_key=True)  # uuid4
    filename = Column(String(512), nullable=False)
    expected_size = Column(BigInteger, nullable=True)
    expected_sha256 = Column(String(64), nullable=True)
    temp_path = Column(Text, nullable=False)
    status = Column(String(16), default=UploadStatusEnum.initiated, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    chunks = relationship("UploadChunk", back_populates="upload", cascade="all, delete-orphan")

class UploadChunk(Base):
    __tablename__ = "upload_chunks"
    id = Column(Integer, primary_key=True, autoincrement=True)
    upload_id = Column(String(36), ForeignKey("uploads.id", ondelete="CASCADE"), nullable=False, index=True)
    index = Column(Integer, nullable=False)  # 0-based
    size = Column(BigInteger, nullable=False)
    sha256 = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    upload = relationship("ResumableUpload", back_populates="chunks")
    __table_args__ = (UniqueConstraint("upload_id", "index", name="uq_upload_chunk"), )

# 仅创建缺失表
Base.metadata.create_all(engine)

# =========================
# Schemas (Pydantic v2)
# =========================
class FileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    original_name: str
    public_name: str
    content_type: Optional[str]
    size: int
    sha256: str
    created_at: datetime
    status: str
    download_url: str
    public_url: str

class UploadInitReq(BaseModel):
    filename: str
    expected_size: Optional[int] = None
    expected_sha256: Optional[str] = None

class UploadInitResp(BaseModel):
    upload_id: str

class UploadCommitReq(BaseModel):
    expected_size: Optional[int] = None
    expected_sha256: Optional[str] = None
    content_type: Optional[str] = None
    note: Optional[str] = None

class UploadStatusResp(BaseModel):
    upload_id: str
    status: str
    received_bytes: int
    next_index: int

# =========================
# App
# =========================
app = FastAPI(title="File Upload Service", version="1.4.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# Helpers
# =========================
SAFE_NAME_RE = re.compile(r"[^\w\-.·\u4e00-\u9fa5]")  # 保留中文、字母数字、_ . - ·

def sanitize_filename(name: str) -> str:
    name = (name or "").strip().replace(" ", "_")
    name = SAFE_NAME_RE.sub("", name)
    return name or uuid.uuid4().hex

def split_name(name: str):
    p = Path(name)
    return p.stem, p.suffix  # suffix 含 .

def ensure_unique_public_name(session, base_name: str, sha256_val: str) -> str:
    """
    生成对外直链名：
      - 若同名且内容相同（sha256 相同）→ 复用该 public_name
      - 若同名但内容不同 → 自动追加 -1/-2/... 直到唯一
    """
    candidate = base_name
    stem, suffix = split_name(base_name)
    i = 1
    while True:
        existing = session.query(FileEntry).filter_by(public_name=candidate).first()
        if not existing:
            return candidate
        if existing.sha256 == sha256_val:
            return existing.public_name
        candidate = f"{stem}-{i}{suffix}"
        i += 1

def sha256_of_path(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        while True:
            chunk = f.read(CHUNK_SIZE)
            if not chunk:
                break
            h.update(chunk)
    return h.hexdigest()

def ensure_parent(p: Path):
    p.parent.mkdir(parents=True, exist_ok=True)

def atomic_move(src: Path, dst: Path):
    ensure_parent(dst)
    tmp_dst = dst.with_suffix(dst.suffix + ".tmp")
    if tmp_dst.exists():
        tmp_dst.unlink()
    src.replace(tmp_dst)
    tmp_dst.replace(dst)

def now_utc():
    return datetime.utcnow()

def ok(msg: str = "成功", data: Any = None, code: int = 200):
    return {"code": code, "msg": msg, "data": data}

def build_download_url(request: Request, file_id: int) -> str:
    return str(request.url_for("download_file", file_id=file_id))

def build_public_url(request: Request, public_name: str) -> str:
    # 直链： http://<host:port>/<public_name>
    base = str(request.base_url).rstrip("/")
    return f"{base}/{public_name}"

def file_to_out(entry: FileEntry, request: Request) -> FileOut:
    return FileOut(
        id=entry.id,
        original_name=entry.original_name,
        public_name=entry.public_name,
        content_type=entry.content_type,
        size=entry.size,
        sha256=entry.sha256,
        created_at=entry.created_at,
        status=entry.status,
        download_url=build_download_url(request, entry.id),
        public_url=build_public_url(request, entry.public_name),
    )

def get_local_ip() -> str:
    """尽力获取局域网 IP（不可用时回退 127.0.0.1）"""
    try:
        hostname = socket.gethostname()
        ip = socket.gethostbyname(hostname)
        if ip.startswith("127."):
            # 尝试 UDP trick
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            try:
                s.connect(("8.8.8.8", 80))
                ip = s.getsockname()[0]
            finally:
                s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def check_db_connection() -> bool:
    """启动时检查数据库连接并打印"""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            print(f"[filesvc] ✅ 数据库连接成功 -> {engine.url}")
            return True
    except Exception as e:
        print(f"[filesvc] ❌ 数据库连接失败 -> {e}")
        return False

@app.on_event("startup")
def on_startup():
    ok_db = check_db_connection()
    local_ip = get_local_ip()
    print("[filesvc] 🚀 服务启动提示（前端可用以下地址调用 API）")
    print("          ➤ 本地:   http://127.0.0.1:8000")
    print(f"          ➤ 局域网: http://{local_ip}:8000")
    if not ok_db:
        print("[filesvc] ⚠️ 服务已启动，但数据库连接异常，请检查配置/网络/权限")

# =========================
# Single-shot upload（主要用这个）
# =========================
@app.post("/upload")
async def upload_file(request: Request, file: UploadFile = File(...), note: Optional[str] = Form(None)):
    session = SessionLocal()
    try:
        # 先落临时文件并计算 sha256
        tmp_path = TMP_DIR / f"{uuid.uuid4()}.part"
        ensure_parent(tmp_path)
        size = 0
        h = hashlib.sha256()
        with tmp_path.open("wb") as out:
            while True:
                data = await file.read(CHUNK_SIZE)
                if not data:
                    break
                out.write(data)
                size += len(data)
                h.update(data)
        checksum = h.hexdigest()

        # 判重：同内容 + 未删除 → 复用
        existing = session.query(FileEntry).filter_by(sha256=checksum, status=FileStatusEnum.active).first()
        if existing:
            tmp_path.unlink(missing_ok=True)
            return ok("上传成功（已存在，直接复用）", file_to_out(existing, request).model_dump())

        # 最终写入路径（不加前缀，直接原名；如需禁止覆盖，可改成 409）
        final_path = STORAGE_DIR / file.filename
        if final_path.exists():
            # 默认覆盖；若想拒绝覆盖：raise HTTPException(409, "同名文件已存在")
            pass
        atomic_move(tmp_path, final_path)

        # 生成 public_name（数据库层面避免重名）
        safe_name = sanitize_filename(file.filename)
        public_name = ensure_unique_public_name(session, safe_name, checksum)

        entry = FileEntry(
            original_name=file.filename,
            public_name=public_name,
            content_type=file.content_type,
            size=size,
            sha256=checksum,
            storage_path=str(final_path),
            note=note,
            created_at=now_utc(),
            status=FileStatusEnum.active,
        )
        session.add(entry)
        session.commit()
        session.refresh(entry)

        return ok("上传成功", file_to_out(entry, request).model_dump())

    except Exception as e:
        session.rollback()
        return ok(f"上传失败: {e}", None, code=500)
    finally:
        session.close()

# =========================
# Resumable upload lifecycle（可选用）
# =========================
@app.post("/uploads/initiate")
def initiate_upload(req: UploadInitReq):
    session = SessionLocal()
    try:
        upload_id = str(uuid.uuid4())
        temp_path = TMP_DIR / f"{upload_id}.part"
        ensure_parent(temp_path)
        temp_path.touch(exist_ok=False)
        up = ResumableUpload(
            id=upload_id,
            filename=req.filename,
            expected_size=req.expected_size,
            expected_sha256=(req.expected_sha256.lower() if req.expected_sha256 else None),
            temp_path=str(temp_path),
            status=UploadStatusEnum.initiated,
            created_at=now_utc(),
            updated_at=now_utc(),
        )
        session.add(up)
        session.commit()
        return ok("创建分片会话成功", UploadInitResp(upload_id=upload_id).model_dump())
    except Exception as e:
        session.rollback()
        return ok(f"创建分片会话失败: {e}", None, code=500)
    finally:
        session.close()

@app.put("/uploads/{upload_id}/chunk")
async def put_chunk(upload_id: str, index: int = Form(...), chunk: UploadFile = File(...), sha256: Optional[str] = Form(None)):
    session = SessionLocal()
    try:
        up: ResumableUpload = session.get(ResumableUpload, upload_id)
        if not up or up.status in (UploadStatusEnum.committed, UploadStatusEnum.aborted):
            raise HTTPException(status_code=404, detail="Upload not found or already finalized")

        temp_path = Path(up.temp_path)
        expected_index = session.query(UploadChunk).filter(UploadChunk.upload_id == upload_id).count()
        if index != expected_index:
            raise HTTPException(status_code=409, detail=f"Unexpected chunk index {index}, expected {expected_index}")

        h = hashlib.sha256()
        bytes_written = 0
        with temp_path.open("ab") as out:
            while True:
                data = await chunk.read(CHUNK_SIZE)
                if not data:
                    break
                out.write(data)
                bytes_written += len(data)
                h.update(data)
        chk = h.hexdigest()
        if sha256 and sha256.lower() != chk:
            with temp_path.open("rb+") as f:
                f.truncate(temp_path.stat().st_size - bytes_written)
            raise HTTPException(status_code=400, detail="Chunk checksum mismatch")

        up.status = UploadStatusEnum.receiving
        up.updated_at = now_utc()
        session.add(UploadChunk(upload_id=upload_id, index=index, size=bytes_written, sha256=chk))
        session.commit()

        received = temp_path.stat().st_size
        payload = UploadStatusResp(upload_id=upload_id, status=up.status, received_bytes=received, next_index=index + 1)
        return ok("分片上传成功", payload.model_dump())
    except HTTPException as he:
        session.rollback()
        return ok(str(he.detail), None, code=he.status_code)
    except Exception as e:
        session.rollback()
        return ok(f"分片上传失败: {e}", None, code=500)
    finally:
        session.close()

@app.post("/uploads/{upload_id}/commit")
def commit_upload(request: Request, upload_id: str, req: UploadCommitReq):
    session = SessionLocal()
    try:
        up: ResumableUpload = session.get(ResumableUpload, upload_id)
        if not up or up.status in (UploadStatusEnum.committed, UploadStatusEnum.aborted):
            raise HTTPException(status_code=404, detail="Upload not found or already finalized")

        temp_path = Path(up.temp_path)
        if not temp_path.exists():
            raise HTTPException(status_code=410, detail="Temporary file missing")

        size = temp_path.stat().st_size
        exp_size = req.expected_size or up.expected_size
        if exp_size is not None and size != exp_size:
            raise HTTPException(status_code=400, detail=f"Size mismatch: got {size}, expected {exp_size}")

        checksum = sha256_of_path(temp_path)
        exp_hash = (req.expected_sha256 or up.expected_sha256)
        if exp_hash and checksum.lower() != exp_hash.lower():
            raise HTTPException(status_code=400, detail="SHA256 mismatch")

        # 判重（按内容）
        existing = session.query(FileEntry).filter_by(sha256=checksum, status=FileStatusEnum.active).first()
        if existing:
            temp_path.unlink(missing_ok=True)
            up.status = UploadStatusEnum.committed
            up.updated_at = now_utc()
            session.commit()
            return ok("提交成功（已存在，直接复用）", file_to_out(existing, request).model_dump())

        # 最终路径（不加前缀；同名默认覆盖）
        final_path = STORAGE_DIR / up.filename
        if final_path.exists():
            # 如要拒绝覆盖，改为：raise HTTPException(409, "同名存在")
            pass
        atomic_move(temp_path, final_path)

        safe_name = sanitize_filename(up.filename)
        public_name = ensure_unique_public_name(session, safe_name, checksum)

        entry = FileEntry(
            original_name=up.filename,
            public_name=public_name,
            content_type=req.content_type,
            size=size,
            sha256=checksum,
            storage_path=str(final_path),
            created_at=now_utc(),
            status=FileStatusEnum.active,
            note=req.note,
        )
        session.add(entry)
        up.status = UploadStatusEnum.committed
        up.updated_at = now_utc()
        session.commit()
        session.refresh(entry)

        return ok("提交成功", file_to_out(entry, request).model_dump())

    except HTTPException as he:
        session.rollback()
        return ok(str(he.detail), None, code=he.status_code)
    except Exception as e:
        session.rollback()
        return ok(f"提交失败: {e}", None, code=500)
    finally:
        session.close()

@app.post("/uploads/{upload_id}/abort")
def abort_upload(upload_id: str):
    session = SessionLocal()
    try:
        up: ResumableUpload = session.get(ResumableUpload, upload_id)
        if not up:
            return ok("会话不存在", None, code=404)
        Path(up.temp_path).unlink(missing_ok=True)
        session.query(UploadChunk).filter(UploadChunk.upload_id == upload_id).delete()
        up.status = UploadStatusEnum.aborted
        up.updated_at = now_utc()
        session.commit()
        return ok("已取消上传", {"upload_id": upload_id})
    except Exception as e:
        session.rollback()
        return ok(f"取消失败: {e}", None, code=500)
    finally:
        session.close()

# =========================
# File management
# =========================
@app.get("/files")
def list_files(request: Request):
    session = SessionLocal()
    try:
        rows = session.query(FileEntry).filter(
            FileEntry.status == FileStatusEnum.active
        ).order_by(FileEntry.created_at.desc()).all()
        return ok("查询成功", [file_to_out(r, request).model_dump() for r in rows])
    finally:
        session.close()

@app.get("/files/{file_id}")
def get_file(request: Request, file_id: int):
    session = SessionLocal()
    try:
        row = session.get(FileEntry, file_id)
        if not row or row.status != FileStatusEnum.active:
            return ok("未找到文件", None, code=404)
        return ok("查询成功", file_to_out(row, request).model_dump())
    finally:
        session.close()

@app.get("/download/{file_id}")
def download_file(file_id: int):
    session = SessionLocal()
    try:
        row = session.get(FileEntry, file_id)
        if not row or row.status != FileStatusEnum.active:
            raise HTTPException(status_code=404, detail="File not found")
        path = Path(row.storage_path)
        if not path.exists():
            raise HTTPException(status_code=410, detail="File missing on disk")
        return FileResponse(
            str(path),
            filename=row.original_name,
            media_type=row.content_type or "application/octet-stream"
        )
    finally:
        session.close()

# 直链：/p/<public_name> 或根路径 /<public_name>
@app.get("/p/{public_name}")
@app.get("/{public_name}")
def public_by_name(public_name: str):
    session = SessionLocal()
    try:
        row = session.query(FileEntry).filter_by(public_name=public_name, status=FileStatusEnum.active).first()
        if not row:
            raise HTTPException(status_code=404, detail="Public file not found")
        path = Path(row.storage_path)
        if not path.exists():
            raise HTTPException(status_code=410, detail="File missing on disk")
        return FileResponse(
            str(path),
            filename=row.original_name,
            media_type=row.content_type or "application/octet-stream"
        )
    finally:
        session.close()
