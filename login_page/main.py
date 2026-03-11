from fastapi import FastAPI, Request, Form, Depends, HTTPException # import app and request functionality
from fastapi.templating import Jinja2Templates # import page rendering functionality as json
from fastapi.responses import HTMLResponse, RedirectResponse # ensures that the output is rendered as a web page, rather than json
from fastapi.staticfiles import StaticFiles # makes static files such as css and images accessable via fastapi
from starlette.middleware.sessions import SessionMiddleware # makes session accessable on every request 

import hashlib

# supabase setup
from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv()

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

''' CONFIGURATION '''

# initialise app and templates
app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key="key") # adds an encrypted signed cookie to every response
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static") # configuration for static files

''' Functions '''
def hash_password(password: str) -> str:   
    return hashlib.sha256(password.encode()).hexdigest()

def require_login(request: Request):
    # Dependancy: redirects to login if user is not in session
    if "username" not in request.session: # checks if username in session to verify login
        raise HTTPException(status_code=303, headers={"Location": "/"}) # abort if not
    
    # else get username
    return request.session["username"]
    

''' GET routes '''
# main route
@app.get("/", response_class=HTMLResponse)
def home(request: Request): # request is required, this is the default value, but we can take in any input from the client
    return templates.TemplateResponse("login.html", {"request": request}) # again, a request is mandatory, but we can send back any information

# signup route
@app.get("/signup", response_class=HTMLResponse)
def signup(request: Request):
    return templates.TemplateResponse("signup.html", {"request": request})

# dashboard route
@app.get("/dashboard", response_class=HTMLResponse)
def dashboard(request: Request, username: str = Depends(require_login)):
    return templates.TemplateResponse("dashboard.html", {"request": request, "username": username})

''' POST routes '''
# signup route
@app.post("/signup")
def signup(username: str = Form(...), password: str = Form(...)):
    existing = supabase.table("users").select("username").eq("username", username).execute()
    
    # check if username already exists
    if existing.data:
        return {"error": "username exists"}
    
    # add to database
    supabase.table("users").insert({"username": username, "password": hash_password(password)}).execute()
    return RedirectResponse(url="/", status_code=303)


# login route
@app.post("/login")
def login(request: Request, username: str = Form(...), password: str = Form(...)):
    
    # verify credentials
    result = supabase.table("users").select("password").eq("username", username).execute()
    if not result.data or result.data[0]["password"] != hash_password(password):
        return {"error": "invalid credentials"}
    
    # update session
    request.session["username"] = username
    return RedirectResponse(url="/dashboard", status_code=303)

# logout route
@app.post("/logout")
def logout(request: Request):
    request.session.clear()
    return RedirectResponse(url="/", status_code=303)