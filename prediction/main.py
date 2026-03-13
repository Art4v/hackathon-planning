# main.py — Minimal FastAPI application for the prediction service
#
# Run directly:   python main.py
# Run with reload: uvicorn main:app --reload
# Auto-docs:      http://localhost:8000/docs

from fastapi import FastAPI
import uvicorn

# Create the FastAPI application instance.
# The title and version show up in the auto-generated /docs UI.
app = FastAPI(title="Prediction Service", version="0.1.0")


@app.get("/health")
def health_check():
    """Return a simple status message confirming the server is running."""
    return {"status": "ok"}


if __name__ == "__main__":
    # Run the server directly when executing `python main.py`.
    # host="0.0.0.0" makes it reachable on the local network;
    # change to "127.0.0.1" to restrict to localhost only.
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
