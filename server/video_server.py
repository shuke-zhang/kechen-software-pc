# video_server.py
import os
import re
import sys
import mimetypes
import subprocess
from typing import Generator, Optional
from flask import Flask, Response, request, abort, jsonify, stream_with_context

app = Flask(__name__)

# 默认视频路径（可用 ?path= 覆盖）
DEFAULT_FILE = r"D:\xxx.mp4"

# -------- 通用工具 --------
RANGE_RE = re.compile(r"bytes=(\d*)-(\d*)")

def resolve_path() -> str:
    path = request.args.get("path") or DEFAULT_FILE
    path = os.path.normpath(path)
    if not os.path.isfile(path):
        abort(Response(jsonify({"error": f"file not found: {path}"}), 404))
    return path

def parse_range_header(file_size: int) -> Optional[tuple[int, int]]:
    """
    返回 (start, end)（含端），或 None 表示不使用 Range。
    """
    rng = request.headers.get("Range")
    if not rng:
        return None
    m = RANGE_RE.match(rng.strip())
    if not m:
        return None
    start_s, end_s = m.groups()
    if start_s == "" and end_s == "":
        return None
    if start_s == "":
        # suffix bytes: bytes=-N
        length = int(end_s)
        if length <= 0:
            return None
        start = max(0, file_size - length)
        end = file_size - 1
        return (start, end)
    start = int(start_s)
    end = file_size - 1
    if end_s:
        end = min(end, int(end_s))
    if start > end or start >= file_size:
        # 416
        resp = Response(status=416)
        resp.headers["Content-Range"] = f"bytes */{file_size}"
        abort(resp)
    return (start, end)

def file_chunk_reader(path: str, start: int, end: int, chunk_size: int = 1024 * 1024) -> Generator[bytes, None, None]:
    with open(path, "rb") as f:
        f.seek(start)
        remaining = end - start + 1
        while remaining > 0:
            read_len = min(chunk_size, remaining)
            data = f.read(read_len)
            if not data:
                break
            yield data
            remaining -= len(data)

# -------- 方式 A：原始文件字节流 + Range --------
@app.get("/video/raw")
def video_raw():
    path = resolve_path()
    file_size = os.path.getsize(path)
    rng = parse_range_header(file_size)
    mime, _ = mimetypes.guess_type(path)
    content_type = mime or "video/mp4"

    if rng is None:
        # 200 全量流式
        def generate():
            with open(path, "rb") as f:
                while True:
                    chunk = f.read(1024 * 1024)
                    if not chunk:
                        break
                    yield chunk
        resp = Response(stream_with_context(generate()), status=200, mimetype=content_type)
        resp.headers["Accept-Ranges"] = "bytes"
        resp.headers["Content-Length"] = str(file_size)
        resp.headers["Cache-Control"] = "no-cache"
        return resp

    start, end = rng
    length = end - start + 1
    resp = Response(
        stream_with_context(file_chunk_reader(path, start, end)),
        status=206,
        mimetype=content_type,
    )
    resp.headers["Content-Range"] = f"bytes {start}-{end}/{file_size}"
    resp.headers["Accept-Ranges"] = "bytes"
    resp.headers["Content-Length"] = str(length)
    resp.headers["Cache-Control"] = "no-cache"
    return resp

# -------- 方式 B：ffmpeg 转为分片 fMP4（适合 MSE）--------
@app.get("/video/fmp4")
def video_fmp4():
    """
    将本地文件通过 ffmpeg 转封装为 fragmented MP4 并边转边推。
    适合前端 Media Source Extensions 追加播放。
    """
    path = resolve_path()

    # 确保有 ffmpeg
    try:
        subprocess.run(["ffmpeg", "-version"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    except Exception:
        return jsonify({"error": "ffmpeg not found in PATH"}), 500

    # -re 模拟实时；若想尽快吐数据可去掉 -re
    # -movflags 避免一次性写 moov，改为分片（fMP4）
    # -c copy 如需转码可换成 -c:v libx264 -preset veryfast -profile:v baseline -level 3.1 -c:a aac -b:a 128k
    cmd = [
        "ffmpeg",
        "-hide_banner",
        "-loglevel", "error",
        "-re",
        "-i", path,
        "-c", "copy",
        "-f", "mp4",
        "-movflags", "frag_keyframe+empty_moov+default_base_moof",
        "pipe:1",
    ]

    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, bufsize=0)

    def generate():
        try:
            while True:
                chunk = proc.stdout.read(1024 * 1024)
                if not chunk:
                    break
                yield chunk
        finally:
            try:
                proc.terminate()
            except Exception:
                pass

    # 这里无法提前给出 Content-Length，采用分块传输
    resp = Response(stream_with_context(generate()), mimetype="video/mp4")
    resp.headers["Cache-Control"] = "no-cache"
    resp.headers["Accept-Ranges"] = "none"
    return resp

# -------- 健康检查 --------
@app.get("/health")
def health():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    # Windows 本地开发默认 0.0.0.0:5000
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", "5000"))
    debug = bool(int(os.environ.get("DEBUG", "0")))
    app.run(host=host, port=port, debug=debug, threaded=True)
