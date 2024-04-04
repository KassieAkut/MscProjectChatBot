from openai import OpenAI
import time 
import os
from dotenv import load_dotenv

# Code reference from Youtube ChatGPT Fine-Tuning SO EASY, You Won't Believe It! By Mervin Praison
load_dotenv()

api_key = os.environ.get("OPENAI_API_KEY")

client = OpenAI(api_key=api_key)

file = client.files.create(
    file=open("demo.jsonl", "rb"),
    purpose="fine-tune"
)

print(f"File ID: {file.id}, File Status: {file.status}")

job = client.fine_tuning.jobs.create(
    training_file=file.id,
    model="gpt-3.5-turbo-1106"
)




