from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
import os
import openai
import google.generativeai as genai

router = APIRouter(prefix="/ai", tags=["AI Assistant"])

class ChatRequest(BaseModel):
    message: str
    provider: str # 'gemini' or 'chatgpt'

import json

MEMORY_FILE = "data/ai_memory.json"

def load_memory():
    if not os.path.exists(MEMORY_FILE):
        return []
    try:
        with open(MEMORY_FILE, "r") as f:
            return json.load(f)
    except:
        return []

def save_memory(fact):
    mem = load_memory()
    if fact not in mem:
        mem.append(fact)
        os.makedirs("data", exist_ok=True)
        with open(MEMORY_FILE, "w") as f:
            json.dump(mem, f)

@router.post("/ask")
async def ask_ai(request: ChatRequest):
    try:
        # 1. Setup Gemini
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return {"response": "Error: GEMINI_API_KEY not configured. Please set it in docker-compose.yml"}
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-flash-latest')

        # 2. Build Context (System Prompt + Memory)
        facts = load_memory()
        system_prompt = (
            "You are GOKU, an advanced AI manufacturing assistant for Englabs MES. "
            "You are helpful, precise, and friendly. "
            "You have access to the following 'Learned Knowledge' from previous conversations: \n"
            + "\n".join([f"- {f}" for f in facts]) + "\n\n"
            "IMPORTANT INSTRUCTION ON LEARNING:\n"
            "If the user explicitly teaches you a new fact (e.g., 'The wifi password is 123', 'My name is John'), "
            "you MUST acknowledge it in your reply, AND include a hidden tag at the end of your response like this: "
            "[MEMORY: The wifi password is 123]. "
            "Only use this tag for permanent facts the user wants you to remember. Do not use it for temporary context."
        )

        # 3. Chat with History (Simplified: We just send current message + system context for now as 'history' isn't passed from frontend yet)
        # To truly support chat history, we'd need the frontend to send it. 
        # For now, we prepend system prompt to the user message.
        full_prompt = f"{system_prompt}\n\nUser: {request.message}"

        # 4. Generate
        response = model.generate_content(full_prompt)
        text = response.text

        # 5. Process Memory Tags
        if "[MEMORY:" in text:
            # Extract and save
            import re
            match = re.search(r"\[MEMORY:\s*(.*?)\]", text)
            if match:
                fact = match.group(1)
                save_memory(fact)
                # Remove tag from user output
                text = text.replace(match.group(0), "").strip()

        return {"response": text}

    except Exception as e:
        print(f"AI Error: {e}")
        return {"response": f"I are currently offline or encountered an error: {str(e)}"}
