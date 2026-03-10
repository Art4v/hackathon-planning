import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
db = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_KEY"])

class StatementBody(BaseModel):
    text: str

@app.get("/statements")
def get_all():
    res = db.table("statements").select("*").execute()
    return res.data

@app.get("/statements/{id}")
def get_one(id: int):
    res = db.table("statements").select("*").eq("id", id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Statement not found")
    return res.data[0]

@app.post("/statements")
def create(body: StatementBody):
    res = db.table("statements").insert({"text": body.text}).execute()
    return res.data[0]

@app.put("/statements/{id}")
def update(id: int, body: StatementBody):
    res = db.table("statements").update({"text": body.text}).eq("id", id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Statement not found")
    return res.data[0]

@app.delete("/statements/{id}")
def delete(id: int):
    res = db.table("statements").select("*").eq("id", id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Statement not found")
    db.table("statements").delete().eq("id", id).execute()
    return {"message": f"Statement {id} deleted"}
