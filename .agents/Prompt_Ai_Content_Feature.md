# AI Content Generation Feature

## 1. Mục tiêu

Thêm tính năng sử dụng AI để tạo hoặc cải thiện nội dung bài viết khi `Enable AI` được bật.

Tính năng cần tận dụng các nguồn input hiện có trên giao diện:

- `Prompt Template`
- `Knowledge Base`
- `Manually Prompt`
- Nội dung hiện có trong ô `Post`

Mục tiêu là cho phép người dùng generate nội dung linh hoạt mà không bắt buộc phải chọn đầy đủ tất cả các nguồn.

---

## 2. Điều kiện kích hoạt

### Enable AI = OFF

- Không thực hiện AI generation.
- Giữ nguyên hành vi hiện tại của form.
- Các chức năng `Submit` và `Save as Draft` không bị ảnh hưởng.

### Enable AI = ON

Cho phép người dùng sử dụng nút `Generate` để tạo/cải thiện nội dung bằng AI.

---

## 3. Logic sử dụng Input

Cần phân biệt rõ ba loại dữ liệu:

### Instruction

Quy định AI phải viết như thế nào.

- `Prompt Template`
- `Manually Prompt`

### Context

Thông tin AI có thể sử dụng để tạo nội dung.

- `Knowledge Base`

### Existing Input

Nội dung người dùng đã nhập.

- Nội dung hiện tại trong ô `Post`

---

## 4. Thứ tự ưu tiên

Logic tổng quát:

```text
Prompt Template + Knowledge Base
        ↓
Prompt Template / Knowledge Base
        ↓
Manually Prompt
        ↓
Existing Post Content
```

Tuy nhiên, đây là logic fallback, không có nghĩa là khi thiếu một nguồn thì phải bỏ qua nguồn còn lại.

### Trường hợp 1: Có Prompt Template + Knowledge Base

Sử dụng cả hai.

```text
Prompt Template = Instruction
Knowledge Base = Context
```

AI tạo nội dung dựa trên Template và thông tin từ Knowledge Base.

---

### Trường hợp 2: Chỉ có Prompt Template

Sử dụng Prompt Template.

Không yêu cầu người dùng phải chọn Knowledge Base.

```text
Prompt Template = Instruction
```

Nếu có Existing Post Content thì có thể sử dụng nội dung đó làm input/reference để AI rewrite hoặc improve.

---

### Trường hợp 3: Chỉ có Knowledge Base

Sử dụng Knowledge Base làm context.

```text
Knowledge Base = Context
```

AI tự tạo nội dung dựa trên thông tin có trong Knowledge Base.

Nếu có Existing Post Content thì có thể sử dụng nội dung đó làm input/reference.

---

### Trường hợp 4: Không có Prompt Template và không có Knowledge Base

Kiểm tra `Manually Prompt`.

Nếu có Manual Prompt:

```text
Manually Prompt = Instruction
```

AI thực hiện yêu cầu dựa trên Manual Prompt.

---

### Trường hợp 5: Không có Prompt Template + Knowledge Base + Manually Prompt

Sử dụng nội dung hiện có trong ô `Post`.

AI có thể:

- Rewrite
- Improve
- Expand
- Correct grammar
- Improve readability
- Optimize content

tùy theo behavior mặc định của hệ thống.

---

## 5. Quy tắc kết hợp Prompt

Nếu đồng thời tồn tại `Prompt Template` và `Manually Prompt`, không nên loại bỏ Prompt Template.

Quy tắc đề xuất:

```text
System Instruction
        ↓
Prompt Template
        ↓
Manually Prompt
        ↓
Knowledge Base Context
        ↓
Existing Post Content
```

Trong đó:

- `Prompt Template` cung cấp instruction mặc định.
- `Manually Prompt` được xem là instruction tùy chỉnh của người dùng.
- `Manually Prompt` có thể bổ sung hoặc override các yêu cầu trong Prompt Template khi có mâu thuẫn.
- `Knowledge Base` cung cấp thông tin/context.
- Existing Post Content cung cấp nội dung hiện tại để AI tham khảo hoặc chỉnh sửa.

### Ví dụ

Prompt Template:

```text
Write a professional LinkedIn post for software developers.
```

Manually Prompt:

```text
Make the tone more friendly and add a short call-to-action.
```

Knowledge Base:

```text
Information about Omni Platforms and its AI content generation feature.
```

Existing Post:

```text
We have just completed our new AI feature.
```

AI nên kết hợp tất cả các input trên để tạo ra bài viết cuối cùng.

---

## 6. Existing Post Content

Nội dung hiện có trong ô `Post` không nhất thiết phải bị bỏ qua khi có Prompt Template hoặc Knowledge Base.

Nếu Existing Post Content tồn tại, AI nên xem nó là nội dung đầu vào/reference.

Ví dụ:

```text
Existing Post:
"We just launched a new feature."

Prompt Template:
"Write a professional LinkedIn post."

Knowledge Base:
"Feature allows users to generate social media content using AI."

Result:
AI rewrite/expand the existing content using the selected instruction
and knowledge context.
```

Nếu Existing Post Content rỗng, AI có thể tạo nội dung hoàn toàn mới dựa trên các input khác.

---

## 7. Generate Flow

Khi người dùng nhấn `Generate`:

### Step 1 — Kiểm tra Enable AI

```text
if Enable AI == OFF:
    do not call AI
```

### Step 2 — Thu thập input

Kiểm tra:

```text
promptTemplate
knowledgeBase
manualPrompt
existingPostContent
```

### Step 3 — Xác định instruction

Ưu tiên:

```text
Prompt Template
+
Manual Prompt
```

Trong trường hợp có xung đột, Manual Prompt của người dùng được ưu tiên.

### Step 4 — Xác định context

Nếu có Knowledge Base:

```text
Knowledge Base → AI Context
```

Nếu không có:

```text
AI Context = empty
```

### Step 5 — Xác định existing content

Nếu Post Content có dữ liệu:

```text
Existing Post Content → Reference/Input
```

Nếu rỗng:

```text
Existing Post Content = empty
```

### Step 6 — Gọi AI

AI nhận các input khả dụng và generate content.

### Step 7 — Hiển thị kết quả

Kết quả AI được đưa trở lại ô `Post`.

Người dùng có thể kiểm tra/chỉnh sửa trước khi:

- `Submit`
- `Save as Draft`

---

## 8. Không được bắt buộc chọn đủ dữ liệu

Đây là requirement quan trọng.

Không được implement logic:

```text
Prompt Template AND Knowledge Base
    ↓
Generate
```

và từ chối generate nếu thiếu một trong hai.

Thay vào đó:

```text
Prompt Template + Knowledge Base → Use both

Prompt Template only → Use Template

Knowledge Base only → Use Knowledge Base

Neither → Check Manual Prompt

No Manual Prompt → Use Existing Post Content
```

---

## 9. Suggested Prompt Construction

Có thể xây dựng AI prompt theo cấu trúc:

```text
[SYSTEM INSTRUCTION]

You are an AI content generation assistant.
Generate high-quality content based on the available instructions,
context, and existing content.

[PROMPT TEMPLATE]
{prompt_template}

[MANUAL PROMPT]
{manual_prompt}

[KNOWLEDGE BASE]
{knowledge_base_context}

[EXISTING POST CONTENT]
{existing_post_content}

[TASK]

Generate or improve the post content based on the available inputs.

Rules:
- Follow the user's manual prompt when it conflicts with the template.
- Use Knowledge Base information as factual context.
- Do not invent facts that are not supported by the provided context.
- If existing post content is provided, preserve useful information while
  improving the content according to the instructions.
- If existing post content is empty, generate new content.
- Return only the final post content unless the application explicitly
  requires additional metadata.
```

Các section không có dữ liệu có thể được bỏ qua khi build prompt.

---

## 10. Validation / Empty State

Nếu tất cả các input đều rỗng:

```text
Prompt Template = empty
Knowledge Base = empty
Manual Prompt = empty
Existing Post Content = empty
```

Không nên gọi AI một cách vô nghĩa.

Hiển thị thông báo cho người dùng, ví dụ:

```text
Please provide a prompt, select a Prompt Template or Knowledge Base,
or enter some post content before generating.
```

---

## 11. Error Handling

Nếu AI generation thất bại:

- Không làm mất nội dung hiện tại của người dùng.
- Giữ nguyên Existing Post Content.
- Hiển thị lỗi rõ ràng.
- Cho phép người dùng thử `Generate` lại.

Không được overwrite Existing Post Content trước khi AI trả về kết quả thành công.

---

## 12. UI Behavior

### Generate Button

Nút `Generate` chỉ thực hiện AI generation.

Flow:

```text
User enters/selects input
        ↓
Click Generate
        ↓
Validate input
        ↓
Build AI prompt
        ↓
Call AI API
        ↓
Receive result
        ↓
Update Post Content
```

### Submit Button

Không thay đổi logic hiện tại.

```text
Generate → Review/Edit → Submit
```

### Save as Draft

Không thay đổi logic hiện tại.

```text
Generate → Review/Edit → Save as Draft
```

---

## 13. Acceptance Criteria

Feature được xem là hoàn thành khi đáp ứng tất cả các trường hợp sau:

| Case | Prompt Template | Knowledge Base | Manual Prompt | Existing Post | Expected Behavior |
|---|---|---|---|---|---|
| 1 | Yes | Yes | No | Empty | Generate using Template + KB |
| 2 | Yes | No | No | Empty | Generate using Template |
| 3 | No | Yes | No | Empty | Generate using KB |
| 4 | No | No | Yes | Empty | Generate using Manual Prompt |
| 5 | No | No | No | Yes | Improve/rewrite Existing Post |
| 6 | Yes | Yes | Yes | Yes | Use all; Manual Prompt has priority on instruction conflicts |
| 7 | Yes | No | Yes | Yes | Use Template + Manual Prompt + Existing Post |
| 8 | No | Yes | Yes | Yes | Use KB + Manual Prompt + Existing Post |
| 9 | No | No | No | No | Show validation message; do not call AI |
| 10 | AI OFF | Any | Any | Any | Do not call AI |

---

## 14. Important Implementation Principles

1. Không hard-code logic chỉ cho LinkedIn. Feature nên được thiết kế để có thể sử dụng cho các platform khác như Facebook trong tương lai.

2. Prompt Template, Knowledge Base và Manual Prompt phải là các input độc lập.

3. Không yêu cầu Prompt Template và Knowledge Base phải tồn tại đồng thời.

4. Không làm mất Existing Post Content khi AI request thất bại.

5. AI generation chỉ xảy ra khi `Enable AI` được bật.

6. `Generate` và `Submit` là hai action khác nhau.

7. Kết quả AI phải được đưa về editor để người dùng review trước khi publish.

8. Không để AI tự bịa thông tin khi Knowledge Base được cung cấp. Ưu tiên thông tin từ Knowledge Base.

9. Thiết kế logic theo dạng modular để sau này có thể bổ sung thêm:
   - Tone
   - Language
   - Target Audience
   - Content Length
   - SEO/GEO
   - Platform-specific formatting
   - Hashtag generation

---

## 15. Tóm tắt Logic

```text
                    Enable AI?
                    /        \
                  NO          YES
                  ↓            ↓
             Normal Flow   Collect Inputs
                               ↓
                     Prompt Template?
                         /        \
                       YES         NO
                        ↓           ↓
                  Add Template   Skip
                        \         /
                         ↓       ↓
                      Manual Prompt?
                         ↓
                  Add / Override
                         ↓
                    Knowledge Base?
                         ↓
                    Add Context
                         ↓
                  Existing Post?
                         ↓
                   Add Reference
                         ↓
                    Generate AI
                         ↓
                  Update Post Editor
                         ↓
                  User Review/Edit
                    ↙          ↘
                Submit      Save Draft
```

## Final Requirement

Implement AI Content Generation theo nguyên tắc:

**Instruction → Context → Existing Content → AI Generation → User Review → Submit/Save**

Trong đó:

- `Prompt Template` là instruction mặc định.
- `Manually Prompt` là instruction tùy chỉnh và có quyền override Template khi có conflict.
- `Knowledge Base` là context.
- Existing Post Content là input/reference.
- Không có Template/Knowledge Base thì fallback về Manual Prompt.
- Không có Manual Prompt thì fallback về Existing Post Content.
- Không có bất kỳ input nào thì yêu cầu người dùng cung cấp dữ liệu.
