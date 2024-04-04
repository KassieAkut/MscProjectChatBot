import uvicorn
from fastapi import FastAPI, Request, File, UploadFile
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import openai
import os
from dotenv import load_dotenv
from transcribe import synthesize_text
from transcribe import speechtotext
# from text import textinput

# To run this program in the terminal run "uvicorn main:app --reload"
# I added the requirement.txt file but to shorten it install openai, fastapi, uvicorn, assemblyai, google-cloud-texttospeech and jinja2

# FastAPI reference from Learn Chatbot Development course on Udemy.com by Eric Roby.

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this based on your needs
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

load_dotenv()

openai_api_key = os.environ.get("OPENAI_API_KEY")


app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")


system_prompt = "You are a virtual assistant for the University of Dundee. Your goal is to assist users with information related to academic programs, admission procedures, campus facilities, events, and general inquiries. Provide helpful and detailed responses to user queries. If needed, you can ask clarifying questions to gather more context. Always aim for accuracy and a friendly tone in your interactions."

chat_log = [{'role': 'system', 'content': system_prompt}]

class ChatRequest(BaseModel):
    message: str

@app.post("/chatbot")
async def chatbot_endpoint(request: Request, message: ChatRequest):
    user_message = message.message

    try:
        response = openai.chat.completions.create(
            model='ft:gpt-3.5-turbo-1106:personal::9478spmG',
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.6
        )

        bot_response = response.choices[0].message.content

        chat_log.append({"role": "user", "content": user_message})
        chat_log.append({"role": "bot", "content": bot_response})

        audio_content = synthesize_text(bot_response)

        with open("temp_audio.mp3", "wb") as f:
            f.write(audio_content)
        
        return JSONResponse({"bot_response": bot_response, "audio_file_path": "temp_audio.mp3"})
    except Exception as e:
        return JSONResponse({"error": str(e)})
    
# Route to serve audio file
@app.get("/audio/{file_path}")
async def get_audio(file_path: str):
    return FileResponse(file_path)

# Route for GET requests to the root endpoint
@app.get("/")
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "chat_log": chat_log})


# Run the app
if __name__ == '__main__':
    uvicorn.run(app, host="127.0.0.1", port=4000)




# Clean up temporary audio file
# @app.on_event("shutdown")
# async def cleanup_temp_files():
#     if os.path.exists("temp_audio.mp3"):
#         os.remove("temp_audio.mp3")