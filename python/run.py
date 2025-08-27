import uvicorn

if __name__ == "__main__":
    # 指向 python/app.py 里的 app 变量
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
