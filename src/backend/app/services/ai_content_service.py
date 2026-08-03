from google import genai

from app.config import settings


client = genai.Client(api_key=settings.gemini_api_key)


def generate_post_content(prompt: str) -> str:
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    if response.text is None:
        raise ValueError("Gemini returned an empty response")

    return response.text