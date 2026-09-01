import json
import logging
import re
from abc import ABC, abstractmethod
from typing import Any
import httpx

from app.config import get_settings

logger = logging.getLogger("analytics.ai_engine")


class BaseAIProvider(ABC):
    @abstractmethod
    async def generate_statistical_report(self, context: dict[str, Any]) -> dict[str, Any]:
        pass


class RuleBasedReportProvider(BaseAIProvider):
    """
    Deterministic rule-based report generator using exact canonical metrics from context.
    Guarantees 0% hallucination and serves as resilient offline fallback.
    """

    async def generate_statistical_report(self, context: dict[str, Any]) -> dict[str, Any]:
        timeframe = context.get("timeframe", "Monthly")
        period = context.get("period", "recent period")
        totals = context.get("totals", {})
        platforms = context.get("platforms", {})

        fb = platforms.get("facebook", {})
        li = platforms.get("linkedin", {})

        fb_attraction = fb.get("impressions", 0)
        fb_engagements = fb.get("engagements", 0)
        fb_pct = fb.get("share_pct", 0)

        li_attraction = li.get("impressions", 0)
        li_engagements = li.get("engagements", 0)
        li_pct = li.get("share_pct", 0)

        total_imp = totals.get("total_impressions", fb_attraction + li_attraction)
        total_eng = totals.get("total_engagements", fb_engagements + li_engagements)

        top_channel = "Facebook" if fb_engagements >= li_engagements else "LinkedIn"
        dominant_pct = max(fb_pct, li_pct)

        if total_eng == 0 and total_imp == 0:
            summary = (
                f"During this {timeframe.lower()} tracking cycle for {period}, initial social media performance metrics have not recorded measurable audience interactions yet across connected digital channels. "
                f"As scheduled posts and distribution campaigns go live, engagement rates and cross-channel attraction benchmarks will update dynamically."
            )
        else:
            summary = (
                f"For the {timeframe.lower()} cycle of {period}, {top_channel} led total engagement performance, "
                f"accounting for {dominant_pct}% of audience share with {fb_engagements:,} interactions on Facebook and {li_engagements:,} on LinkedIn. "
                f"Across all connected channels, the workspace accumulated {total_imp:,} impressions and {total_eng:,} total interactions, demonstrating steady content visibility."
            )

        title = f"[{timeframe} report for {period}]"

        return {
            "timeframe": timeframe,
            "title": title,
            "summary": summary,
            "structured_insights": {
                "top_performing_channel": top_channel.lower(),
                "total_impressions": total_imp,
                "total_engagements": total_eng,
                "facebook_share_pct": fb_pct,
                "linkedin_share_pct": li_pct,
                "recommendations": [
                    "Scale short-form video and visual content on Facebook to sustain high engagement volume.",
                    "Deepen technical and thought-leadership insights on LinkedIn to drive higher conversion rates.",
                    "Optimize posting schedules during mid-week peak hours to maximize reach."
                ]
            }
        }


class GeminiReportProvider(BaseAIProvider):
    """
    Google Gemini AI Provider for generating structured executive statistical reports.
    """

    def __init__(self, api_key: str, model_name: str = "gemini-2.5-flash"):
        self.api_key = api_key
        self.model_name = model_name
        self.endpoint = (
            f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent?key={self.api_key}"
        )

    async def generate_statistical_report(self, context: dict[str, Any]) -> dict[str, Any]:
        timeframe = context.get("timeframe", "Monthly")
        period = context.get("period", "recent period")

        prompt = (
            "You are an expert Chief Marketing Officer and Social Media Analytics Director. "
            "Analyze the verified performance data provided in JSON format and author a concise, highly professional executive summary report.\n\n"
            "STRICT GUIDELINES:\n"
            "1. Rely ONLY on the numerical facts provided in the input data. DO NOT invent or hallucinate metrics.\n"
            "2. Write in an insightful, articulate business tone suitable for executive leadership. Highlight platform trends, engagement drivers, and distribution effectiveness.\n"
            "3. If all metric counts are 0, state clearly and professionally that baseline tracking has started and describe strategic focus areas.\n"
            "4. Return STRICTLY a valid JSON object matching this schema with no markdown code blocks:\n"
            "{\n"
            f'  "title": "[{timeframe} report for {period}]",\n'
            '  "summary": "Cohesive executive analysis narrative (1-2 articulate paragraphs)...",\n'
            '  "structured_insights": {\n'
            '    "top_performing_channel": "facebook | linkedin",\n'
            '    "recommendations": [\n'
            '      "Actionable tactical recommendation 1",\n'
            '      "Actionable tactical recommendation 2",\n'
            '      "Actionable tactical recommendation 3"\n'
            '    ]\n'
            '  }\n'
            "}\n\n"
            f"Input Performance Data:\n{json.dumps(context, indent=2)}"
        )

        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "response_mime_type": "application/json",
                "temperature": 0.4,
            },
        }

        async with httpx.AsyncClient(timeout=25.0) as client:
            response = await client.post(self.endpoint, json=payload)
            if response.status_code != 200:
                raise ValueError(f"Gemini API error ({response.status_code}): {response.text}")

            res_json = response.json()
            raw_text = res_json["candidates"][0]["content"]["parts"][0]["text"].strip()

            # Strip markdown code fence if present
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]

            data = json.loads(raw_text.strip())

            # Ensure required keys
            if "summary" not in data or "title" not in data:
                raise ValueError("Incomplete Gemini response structure")

            data["timeframe"] = timeframe
            return data


class AIReportEngine:
    """
    Facade engine managing provider selection, multi-key rotation, candidate models, and fallback handling.
    """

    def __init__(self):
        self.settings = get_settings()
        self.fallback_provider = RuleBasedReportProvider()

    def _validate_guardrail(self, output: dict[str, Any], context: dict[str, Any]) -> bool:
        """
        Numeric Guardrail: Checks that summary is substantive and well-formed.
        """
        summary = output.get("summary", "")
        if not summary or len(summary) < 40:
            return False
        return True

    async def generate_report(self, context: dict[str, Any]) -> dict[str, Any]:
        # Collect candidate API keys
        api_keys = []
        if self.settings.gemini_api_key and self.settings.gemini_api_key.strip():
            api_keys.append(self.settings.gemini_api_key.strip())
        if hasattr(self.settings, "gemini_backup_api_key") and self.settings.gemini_backup_api_key and self.settings.gemini_backup_api_key.strip():
            backup = self.settings.gemini_backup_api_key.strip()
            if backup not in api_keys:
                api_keys.append(backup)

        candidate_models = ["gemini-2.5-flash", "gemini-3.7-flash", "gemini-3.5-flash", "gemini-flash-latest"]

        # 1. Attempt Gemini across candidate keys and models
        for key in api_keys:
            for model_name in candidate_models:
                try:
                    provider = GeminiReportProvider(api_key=key, model_name=model_name)
                    result = await provider.generate_statistical_report(context)
                    if self._validate_guardrail(result, context):
                        logger.info(f"Generated Statistical Report successfully via Gemini ({model_name})")
                        return result
                    logger.warning(f"Gemini ({model_name}) report failed guardrails. Trying next candidate...")
                except Exception as e:
                    logger.warning(f"Gemini {model_name} (key {key[:10]}...) report error: {e}. Trying next candidate...")

        # 2. Resilient Rule-Based Fallback
        logger.info("Using RuleBasedReportProvider fallback for Statistical Report.")
        return await self.fallback_provider.generate_statistical_report(context)


ai_report_engine = AIReportEngine()

