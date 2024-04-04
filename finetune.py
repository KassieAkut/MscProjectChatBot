from openai import OpenAI
import time 

client = OpenAI(api_key= "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")

file = client.files.create(
    file=open("demo.jsonl", "rb"),
    purpose="fine-tune"
)

print(f"File ID: {file.id}, File Status: {file.status}")

job = client.fine_tuning.jobs.create(
    training_file=file.id,
    model="gpt-3.5-turbo-1106"
)



