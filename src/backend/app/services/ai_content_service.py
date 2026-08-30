import json
import logging
import re
from typing import Any
import httpx

from app.config import get_settings

logger = logging.getLogger("services.ai_content")


class AIContentService:
    """
    AI Content Generation Service conforming to Prompt_Ai_Content_Feature.md specification.
    Combines Instruction (Prompt Template + Manual Prompt), Context (Knowledge Base),
    and Reference Input (Existing Post Content).
    """

    def __init__(self):
        self.settings = get_settings()
        self.api_key = self.settings.gemini_api_key

    def build_prompt(
        self,
        prompt_template: str | None = None,
        manual_prompt: str | None = None,
        knowledge_base_context: str | None = None,
        existing_title: str | None = None,
        existing_content: str | None = None,
        target_platforms: list[str] | None = None,
    ) -> str:
        platforms_str = ", ".join(target_platforms) if target_platforms else "LinkedIn, Facebook"

        sections = [
            "[SYSTEM INSTRUCTION]",
            "You are an expert Social Media Content Creator and Copywriter.",
            f"Your goal is to generate high-performing, engaging content tailored for: {platforms_str}.",
            "Follow the instructions, factual context, and reference content provided below.\n",
        ]

        if prompt_template and prompt_template.strip():
            sections.extend([
                "[PROMPT TEMPLATE (Default Instruction)]",
                prompt_template.strip(),
                "",
            ])

        if manual_prompt and manual_prompt.strip():
            sections.extend([
                "[MANUAL PROMPT (Custom Instruction / Priority Override)]",
                manual_prompt.strip(),
                "",
            ])

        if knowledge_base_context and knowledge_base_context.strip():
            sections.extend([
                "[KNOWLEDGE BASE (Factual Context)]",
                knowledge_base_context.strip(),
                "",
            ])

        existing_text_parts = []
        if existing_title and existing_title.strip():
            existing_text_parts.append(f"Title: {existing_title.strip()}")
        if existing_content and existing_content.strip():
            existing_text_parts.append(f"Content:\n{existing_content.strip()}")

        if existing_text_parts:
            sections.extend([
                "[EXISTING POST CONTENT (Reference / Content to Rewrite or Improve)]",
                "\n".join(existing_text_parts),
                "",
            ])

        sections.extend([
            "[TASK & RULES]",
            "1. If Manual Prompt is provided, it takes priority and can override or refine instructions from the Prompt Template.",
            "2. Use Knowledge Base information as factual context without hallucinating non-supported facts.",
            "3. If Existing Post Content is provided, improve, expand, rewrite, or optimize it while preserving key details.",
            "4. If Existing Post Content is empty, generate fresh, compelling content from scratch using the instructions and context.",
            "5. Output MUST be valid JSON format only, with no surrounding markdown backticks or commentary outside JSON.",
            '6. The JSON object must strictly match this structure:',
            '{',
            '  "title": "Engaging Post Title (or empty string if not applicable)",',
            '  "content": "Full text of the post with engaging paragraphs, bullet points if helpful, and clean formatting",',
            '  "suggested_hashtags": ["#Tag1", "#Tag2", "#Tag3"]',
            '}',
        ])

        return "\n".join(sections)

    async def generate_content(
        self,
        prompt_template: str | None = None,
        manual_prompt: str | None = None,
        knowledge_base_context: str | None = None,
        existing_title: str | None = None,
        existing_content: str | None = None,
        target_platforms: list[str] | None = None,
    ) -> dict[str, Any]:
        """
        Main method to generate or improve post content.
        Uses Google Gemini with automatic rule-based fallback.
        """
        # Validate that at least one input exists
        has_template = bool(prompt_template and prompt_template.strip())
        has_manual = bool(manual_prompt and manual_prompt.strip())
        has_kb = bool(knowledge_base_context and knowledge_base_context.strip())
        has_existing = bool(
            (existing_title and existing_title.strip()) or (existing_content and existing_content.strip())
        )

        if not (has_template or has_manual or has_kb or has_existing):
            raise ValueError(
                "Please provide a prompt, select a Prompt Template or Knowledge Base, "
                "or enter some post content before generating."
            )

        prompt_str = self.build_prompt(
            prompt_template=prompt_template,
            manual_prompt=manual_prompt,
            knowledge_base_context=knowledge_base_context,
            existing_title=existing_title,
            existing_content=existing_content,
            target_platforms=target_platforms,
        )

        # Collect candidate API keys
        api_keys = []
        if self.api_key and self.api_key.strip():
            api_keys.append(self.api_key.strip())
        if hasattr(self.settings, "gemini_backup_api_key") and self.settings.gemini_backup_api_key and self.settings.gemini_backup_api_key.strip():
            backup = self.settings.gemini_backup_api_key.strip()
            if backup not in api_keys:
                api_keys.append(backup)

        # Candidate models in order of priority
        candidate_models = ["gemini-2.5-flash", "gemini-3.7-flash", "gemini-3.5-flash", "gemini-flash-latest"]

        # Attempt Google Gemini calls across available keys and models
        for key in api_keys:
            for model_name in candidate_models:
                try:
                    result = await self._call_gemini(prompt_str, api_key=key, model_name=model_name)
                    if result and isinstance(result, dict) and "content" in result and result["content"]:
                        return result
                except Exception as exc:
                    logger.warning(f"Gemini {model_name} (key {key[:10]}...) error: {exc}. Trying next candidate...")

        # Resilient Offline Fallback
        return self._offline_fallback_generator(
            prompt_template=prompt_template,
            manual_prompt=manual_prompt,
            knowledge_base_context=knowledge_base_context,
            existing_title=existing_title,
            existing_content=existing_content,
            target_platforms=target_platforms,
        )

    async def _call_gemini(self, prompt: str, api_key: str, model_name: str = "gemini-2.5-flash") -> dict[str, Any]:
        endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.7,
                "responseMimeType": "application/json",
            },
        }

        async with httpx.AsyncClient(timeout=25.0) as client:
            resp = await client.post(endpoint, json=payload)
            if resp.status_code != 200:
                raise RuntimeError(f"Gemini API Error: {resp.status_code}")

            data = resp.json()
            raw_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()

            # Clean potential markdown backticks
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            if raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]

            parsed = json.loads(raw_text.strip())
            return {
                "title": str(parsed.get("title") or "").strip(),
                "content": str(parsed.get("content") or "").strip(),
                "suggested_hashtags": list(parsed.get("suggested_hashtags") or []),
            }

    def _offline_fallback_generator(
        self,
        prompt_template: str | None = None,
        manual_prompt: str | None = None,
        knowledge_base_context: str | None = None,
        existing_title: str | None = None,
        existing_content: str | None = None,
        target_platforms: list[str] | None = None,
    ) -> dict[str, Any]:
        """
        Intelligent offline fallback content generator that synthesizes inputs.
        """
        platform_name = (target_platforms[0].title() if target_platforms else "LinkedIn")

        # Detect Vietnamese language context
        combined_text = f"{manual_prompt or ''} {existing_title or ''} {existing_content or ''} {prompt_template or ''}"
        is_vietnamese = any(c in combined_text for c in "àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ")

        # 1. Determine Title
        if existing_title and existing_title.strip():
            title = existing_title.strip()
        elif manual_prompt and len(manual_prompt) < 60:
            title = manual_prompt.strip().capitalize()
        elif is_vietnamese:
            title = f"Bài viết chia sẻ kiến thức & trải nghiệm ({platform_name})"
        elif prompt_template:
            title = f"Professional {platform_name} Update: Industry Insights"
        else:
            title = f"{platform_name} Special Report & Highlights"

        # 2. Synthesize Content Paragraphs
        paragraphs = []

        if is_vietnamese:
            # Vietnamese intelligent synthesis
            if manual_prompt and manual_prompt.strip():
                paragraphs.append(f"✨ {manual_prompt.strip()}\n\nDưới đây là góc nhìn chuyên sâu và những chia sẻ hữu ích dành cho bạn:")
            elif existing_content and existing_content.strip():
                paragraphs.append(f"✨ {existing_content.strip()}\n\nMột chủ đề rất đáng để chúng ta cùng nhau phân tích và thảo luận kỹ lưỡng.")
            elif prompt_template and prompt_template.strip():
                paragraphs.append(f"📌 {prompt_template.strip()}\n\nChia sẻ những thông tin và kiến thức giá trị đến cộng đồng.")

            if knowledge_base_context and knowledge_base_context.strip():
                paragraphs.append(f"Dữ liệu & bối cảnh thực tế:\n• {knowledge_base_context.strip()}")

            paragraphs.append("Bạn có cảm nhận hoặc trải nghiệm gì về nội dung này? Hãy để lại bình luận chia sẻ bên dưới nhé! 👇")
            hashtags = ["#OmniPlatforms", f"#{platform_name.replace(' ', '')}", "#ChiaSeKienThuc", "#GocNhin", "#XuHuong"]
        else:
            # English standard synthesis
            if existing_content and existing_content.strip():
                paragraphs.append(
                    f"🚀 {existing_content.strip()}\n\n"
                    f"In today's fast-evolving landscape, delivering impactful results requires continuous adaptation, precision, and strategic focus."
                )
            elif manual_prompt and manual_prompt.strip():
                paragraphs.append(
                    f"💡 {manual_prompt.strip()}\n\n"
                    f"Here is a comprehensive breakdown designed to maximize reach and drive high engagement across your target audience."
                )
            elif prompt_template and prompt_template.strip():
                paragraphs.append(
                    f"🌟 {prompt_template.strip()}\n\n"
                    f"Sharing key takeaways and strategic methodologies to elevate your brand's digital presence."
                )
            else:
                paragraphs.append(
                    f"📈 Exploring key trends and strategic growth opportunities across the ecosystem."
                )

            if knowledge_base_context and knowledge_base_context.strip():
                paragraphs.append(
                    f"Key Context & Knowledge Points:\n"
                    f"• {knowledge_base_context.strip()}\n"
                    f"• Built with high reliability, scalable architecture, and data-driven intelligence."
                )

            if manual_prompt and ("call-to-action" in manual_prompt.lower() or "cta" in manual_prompt.lower()):
                paragraphs.append("👉 What are your thoughts on this? Let us know in the comments below! 💬")
            else:
                paragraphs.append("What strategies have worked best for your team? Share your experiences in the comments! 👇")

            hashtags = ["#OmniPlatforms", f"#{platform_name.replace(' ', '')}", "#SocialMediaStrategy", "#Innovation", "#Growth"]

        content = "\n\n".join(paragraphs)

        return {
            "title": title,
            "content": content,
            "suggested_hashtags": hashtags,
        }


ai_content_service = AIContentService()
