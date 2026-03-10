from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

statements: dict[int, str] = {}
next_id = 1

class StatementBody(BaseModel):
    text: str

@app.get("/statements")
def get_all():
    return statements

@app.get("/statements/{id}")
def get_one(id: int):
    if id not in statements:
        raise HTTPException(status_code=404, detail="Statement not found")
    return {"id": id, "text": statements[id]}

@app.post("/statements")
def create(body: StatementBody):
    global next_id
    statements[next_id] = body.text
    created_id = next_id
    next_id += 1
    return {"id": created_id, "text": statements[created_id]}

@app.put("/statements/{id}")
def update(id: int, body: StatementBody):
    if id not in statements:
        raise HTTPException(status_code=404, detail="Statement not found")
    statements[id] = body.text
    return {"id": id, "text": statements[id]}

@app.delete("/statements/{id}")
def delete(id: int):
    if id not in statements:
        raise HTTPException(status_code=404, detail="Statement not found")
    del statements[id]
    return {"message": f"Statement {id} deleted"}
