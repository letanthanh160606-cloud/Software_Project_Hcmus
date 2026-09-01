"""
SEO / GEO Suggest Service
─────────────────────────
Analyzes post content with Gemini AI and returns:
  - seo_keywords: list of searchable keywords to embed in content
  - hashtags: platform-appropriate hashtags
  - geo_tip: one actionable tip to improve Generative Engine Optimization
"""
import json
import logging
from typing import Any

import httpx

from app.config import get_settings

logger = logging.getLogger("services.seo")


class SEOSuggestService:
    def __init__(self):
        self.settings = get_settings()

    def _build_prompt(self, title: str, content: str, platforms: list[str]) -> str:
        platforms_str = ", ".join(platforms) if platforms else "LinkedIn, Facebook"
        return f"""You are an expert Digital Marketing Strategist specializing in SEO and Generative Engine Optimization (GEO).

Analyze the following social media post and provide optimization suggestions for: {platforms_str}.

POST TITLE: {title or "(no title)"}

POST CONTENT:
{content or "(no content)"}

TASK:
Respond ONLY with a valid JSON object matching this exact structure (no markdown, no extra text):
{{
  "seo_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "hashtags": ["#Hashtag1", "#Hashtag2", "#Hashtag3", "#Hashtag4", "#Hashtag5"],
  "geo_tip": "One specific, actionable tip to improve this post so AI search engines (Google AI Overviews, Perplexity, ChatGPT Search) are more likely to cite or surface it."
}}

RULES:
- seo_keywords: 4-6 short, high-value keywords (no # prefix) relevant to the post topic.
- hashtags: 4-6 platform-appropriate hashtags with # prefix. Mix broad and niche tags.
- geo_tip: One concrete recommendation (max 2 sentences) about structure, specificity, or question-answering format.
- All items must be directly relevant to the post content — no generic filler.
"""

    async def suggest(
        self,
        title: str | None,
        content: str | None,
        target_platforms: list[str] | None = None,
    ) -> dict[str, Any]:
        if not title and not content:
            raise ValueError("Please enter a post title or content before applying GEO/SEO analysis.")

        platforms = target_platforms or ["linkedin", "facebook"]
        prompt = self._build_prompt(title or "", content or "", platforms)

        # Collect API keys (primary + backup)
        api_keys = []
        if self.settings.gemini_api_key and self.settings.gemini_api_key.strip():
            api_keys.append(self.settings.gemini_api_key.strip())
        if (
            hasattr(self.settings, "gemini_backup_api_key")
            and self.settings.gemini_backup_api_key
            and self.settings.gemini_backup_api_key.strip()
        ):
            backup = self.settings.gemini_backup_api_key.strip()
            if backup not in api_keys:
                api_keys.append(backup)

        candidate_models = ["gemini-2.5-flash", "gemini-3.7-flash", "gemini-1.5-flash", "gemini-flash-latest"]

        for key in api_keys:
            for model in candidate_models:
                try:
                    result = await self._call_gemini(prompt, api_key=key, model=model)
                    if result:
                        return result
                except Exception as exc:
                    logger.warning(f"SEO Gemini {model} (key {key[:10]}...) error: {exc}. Trying next...")

        # Rule-based fallback if Gemini unavailable
        return self._fallback(title, content, platforms)

    async def _call_gemini(self, prompt: str, api_key: str, model: str) -> dict[str, Any]:
        endpoint = (
            f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        )
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.4,
                "responseMimeType": "application/json",
            },
        }

        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(endpoint, json=payload)
            if resp.status_code != 200:
                raise RuntimeError(f"Gemini API Error: {resp.status_code}")

            data = resp.json()
            raw_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()

            # Strip markdown fences if present
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]

            parsed = json.loads(raw_text.strip())
            return {
                "seo_keywords": list(parsed.get("seo_keywords") or []),
                "hashtags": list(parsed.get("hashtags") or []),
                "geo_tip": str(parsed.get("geo_tip") or ""),
            }

    def _fallback(self, title: str | None, content: str | None, platforms: list[str]) -> dict[str, Any]:
        """Basic rule-based fallback when AI is unavailable."""
        words = ((title or "") + " " + (content or "")).lower().split()
        # Extract likely keywords from common long words
        keywords = list({w.strip(".,!?;:") for w in words if len(w) > 6})[:5]
        is_linkedin = any("linkedin" in p.lower() for p in platforms)
        hashtags = ["#ContentMarketing", "#SocialMedia", "#Marketing", "#Brand", "#DigitalMarketing"]
        if is_linkedin:
            hashtags[0] = "#LinkedInMarketing"
        return {
            "seo_keywords": keywords if keywords else ["content", "marketing", "social media", "brand", "growth"],
            "hashtags": hashtags,
            "geo_tip": (
                "Structure your post with a clear question in the first sentence, "
                "followed by a direct answer, to increase the chance of being cited by AI search engines."
            ),
        }


seo_suggest_service = SEOSuggestService()
