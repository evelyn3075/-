import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Set up Gemini Client with custom User-Agent as instructed in gemini-api skill
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("WARNING: GEMINI_API_KEY environment variable is missing.");
}

const ai = new GoogleGenAI({
  apiKey: apiKey || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const SYSTEM_PROMPT = `[ROLE]
You are an expert Pharmaceutical Quality Control (QC) Specialist and a Senior GMP Auditor. Your mission is to guide users through an physicochemical deviation and Out-of-Specification (OOS) investigation compliant with FDA/gGMP guidelines.
[WORKFLOW & CORE RULES]
1. Phase Transition: [1차 분류 (classification)] -> [5Why 근본원인분석 (why)] -> [CAPA 제안 (capa)] -> [최종 보고서 초안 (report)] 순으로 엄격하게 진행한다.
2. Lab Error First Policy: 초기 평가 시 실험실 내부 요인(인적 오류, 장비, 시약, 시험법 등)을 먼저 완벽히 조사 및 배제하기 전까지는 재시험(Re-test)이나 제조 공정 조사를 제안하지 않는다.
3. Formatting Constraint (CRITICAL): 모든 번호 목록은 줄바꿈 처리를 하여 한 줄에 하나씩만 표시해야 한다. JSON의 특성상 문자열 내부에서 각 항목 뒤에 반드시 '\\n' 이스케이프 문자 하나만 추가하고 실제 줄바꿈(개행문자)을 넣지 않는다.
4. 5Why Generation Rule: 'why' 단계에서는 이화학 QC 실무(칭량/희석 오류, 컬럼 노후화, 이동상 pH, 기기 검출기 드리프트, 표준품 흡습 등)에 기반한 구체적이고 현실적인 원인 후보를 5~7개 생성하고, 마지막 보기는 무조건 "기타 (주관식 직접 입력)"로 고정한다.
5. CAPA & Effectiveness Rule: 'capa' 단계에서는 Correction(시정조치), Preventive Action(예방조치), Effectiveness Check(효과성 평가 계획)를 각각 독립된 문단으로 엄격하게 분리하여 제시한다. 효과성 평가는 반드시 구체적인 기한(예: 3개월 후)과 정량적 기준(예: "연속 n회 이상 일탈 없을 시 종결")을 명시한다.
[OUTPUT FORMAT]
- Return ONLY a single, valid JSON object.
- DO NOT wrap the output in markdown code blocks (\`\`\`json ... \`\`\`). No conversational text before or after the JSON.
- Every string containing numbered lists MUST use Explicit '\\n' for newlines.
[JSON SCHEMA]
{
  "stage": "classification" | "why" | "capa" | "report",
  "why_number": 0, 
  "narrative": "Detailed contextual guide text for the current phase. (If list includes numbers, format strictly with '\\n')",
  "options": ["Option 1", "Option 2", "Option 3", "기타 (주관식 직접 입력)"],
  "report": {
    "overview": "1. 개요\\n- 제품명/배치: ...\\n- 시험 항목: ...\\n- 규격 vs 결과: ...",
    "incident": "2. 발생 경위\\n- ...",
    "initial_assessment": "3. 초기 평가 (Lab error 여부)\\n- ...",
    "root_cause": "4. 근본원인분석 결과\\n- ...",
    "correction": "5. 시정조치 (Correction)\\n- ...",
    "preventive_action": "6. 예방조치 (CAPA)\\n- ...",
    "effectiveness_check": "7. 효과성 평가 및 후속 모니터링\\n- ..."
  }
}
[DYNAMIC SCHEMA RULES]
- When stage is 'classification' or 'why': 'why_number' must accurately represent the current Why count (1 to 5). 'options' must be a populated array. 'report' must be null.
- When stage is 'capa': 'why_number' must be 0. 'options' must be []. 'narrative' must contain all CAPA & Effectiveness verification details. 'report' must be null.
- When stage is 'report': 'why_number' must be 0. 'options' must be []. 'narrative' should be a congratulatory closing statement. 'report' must fully populate all inner strings using the numbered prefix format with '\\n'.`;

app.post("/api/oos/investigate", async (req, res) => {
  try {
    const { product_info, history = [], current_stage, current_why_number, user_selection, custom_api_key } = req.body;

    const activeApiKey = req.headers["x-gemini-api-key"] || custom_api_key || process.env.GEMINI_API_KEY;

    if (!activeApiKey) {
      return res.status(400).json({ error: "Google Gemini API Key가 누락되었습니다. 랜딩페이지에서 개인 API Key를 입력해주시거나 서버 환경변수를 설정해주세요." });
    }

    if (!product_info || !product_info.productName) {
      return res.status(400).json({ error: "Product information is required." });
    }

    const oosContext = `
[OOS INCIDENT CONTEXT]
- Product Name (제품명): ${product_info.productName}
- Batch/Lot No (배치 번호): ${product_info.batchNo}
- Test Parameter (시험 항목): ${product_info.testItem}
- Specification vs Result (규격 및 결과): ${product_info.specResult}
- Detailed Incident Description (발생 경위 상세): ${product_info.incidentDetail}

[INVESTIGATION HISTORY (이전 진행 이력)]
${history.map((h: any, index: number) => `Step ${index + 1}:
  - Stage (단계): ${h.stage}
  - Why Number (이유 번호): ${h.why_number}
  - Narrative/Question provided by AI (질문/안내): ${h.narrative}
  - User selected option/Answer (사용자 답변): ${h.selected_option}
`).join('\n')}

[CURRENT PROGRESS STATUS]
- Previous Stage: ${current_stage || "None"}
- Previous Why Number: ${current_why_number || 0}
- Current User Choice: ${user_selection || "N/A"}

[INSTRUCTIONS FOR STAGE TRANSITION]
1. If history is empty, you must output stage 'classification'. The narrative should outline the initial GMP lab investigation assessment based on the incident. Generate 4 to 6 relevant lab-error-related assessment options (e.g. 칭량 오류, 희석 배수 오류, 시험자 숙련도, 장비 캘리브레이션 유무, 시약 만료일 등), always with the last option as "기타 (주관식 직접 입력)".
2. If the previous stage is 'classification' and the user has provided a choice, transition to 'why' stage with 'why_number' = 1.
3. If the previous stage is 'why' and why_number is less than 5, keep stage as 'why' and increment why_number by 1 (e.g., if previous why_number was 1, next is 2). Generate 5-7 highly specific, realistic physicochemical QC lab reasons for the next 'why' level based on the previous selection, always ending with "기타 (주관식 직접 입력)".
4. If the previous stage is 'why' and why_number is 5, and the user has answered, transition to 'capa' stage. In 'capa' stage:
   - 'why_number' must be 0
   - 'options' must be []
   - 'narrative' must contain detailed CAPA recommendations (Correction, Preventive Action, and Effectiveness Check separated by independent paragraphs/headers. Effectiveness Check must have a specific timeline e.g., 3개월 후, and a quantitative criteria e.g., 연속 10회 이상 일탈 없을 시 종결).
   - 'report' must be null.
5. If the previous stage is 'capa', transition to 'report' stage. In 'report' stage:
   - 'why_number' must be 0
   - 'options' must be []
   - 'narrative' should be a congratulatory or closing statement.
   - 'report' must be fully populated with all keys (overview, incident, initial_assessment, root_cause, correction, preventive_action, effectiveness_check). Every text block within report keys must strictly use Explicit '\\n' for any lists or bullet points.

[OUTPUT FORMAT REQUIREMENT]
Return ONLY a single, valid JSON object matching the JSON SCHEMA. Do NOT wrap the output in markdown code blocks (\`\`\`json ... \`\`\`). No conversational text before or after the JSON.
`;

    const dynamicAi = new GoogleGenAI({
      apiKey: activeApiKey as string,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const response = await dynamicAi.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { text: SYSTEM_PROMPT },
        { text: oosContext }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            stage: {
              type: Type.STRING,
              description: "Must be 'classification', 'why', 'capa', or 'report'."
            },
            why_number: {
              type: Type.INTEGER,
              description: "The current Why count (1 to 5) during the why stage. Otherwise, must be 0."
            },
            narrative: {
              type: Type.STRING,
              description: "Detailed contextual guide text for the current phase. For lists, format strictly with explicit '\\n'."
            },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of options. The last option must be '기타 (주관식 직접 입력)' if not empty."
            },
            report: {
              type: Type.OBJECT,
              properties: {
                overview: { type: Type.STRING },
                incident: { type: Type.STRING },
                initial_assessment: { type: Type.STRING },
                root_cause: { type: Type.STRING },
                correction: { type: Type.STRING },
                preventive_action: { type: Type.STRING },
                effectiveness_check: { type: Type.STRING }
              },
              description: "Report details. Populated only when stage is 'report', otherwise must be null."
            }
          },
          required: ["stage", "why_number", "narrative", "options"]
        }
      }
    });

    const textOutput = response.text || "{}";
    let cleanedOutput = textOutput.trim();
    // Sometimes models wrap JSON in markdown block even with responseMimeType
    if (cleanedOutput.startsWith("```json")) {
      cleanedOutput = cleanedOutput.replace(/```json\s?/, "").replace(/```$/, "");
    } else if (cleanedOutput.startsWith("```")) {
      cleanedOutput = cleanedOutput.replace(/```\s?/, "").replace(/```$/, "");
    }
    
    const parsedData = JSON.parse(cleanedOutput.trim());
    return res.json(parsedData);
  } catch (error: any) {
    console.error("Gemini OOS API Error:", error);
    return res.status(500).json({ error: error.message || "Failed to process OOS investigation request." });
  }
});

// Route to verify Gemini API Key
app.post("/api/oos/verify-key", async (req, res) => {
  try {
    const { custom_api_key } = req.body;
    const activeApiKey = custom_api_key || process.env.GEMINI_API_KEY;

    if (!activeApiKey) {
      return res.status(400).json({ error: "검증할 API Key가 제공되지 않았습니다." });
    }

    const testAi = new GoogleGenAI({
      apiKey: activeApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    // Run a tiny lightweight query to test the key
    const response = await testAi.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ text: "API key validation check. Output only one word: OK" }]
    });

    if (response.text) {
      return res.json({ success: true, message: "API Key가 성공적으로 인증되었습니다." });
    } else {
      return res.json({ success: true, message: "API Key 검증에 성공했습니다." });
    }
  } catch (error: any) {
    console.error("Gemini Verification Error:", error);
    return res.status(400).json({ error: error.message || "유효하지 않은 API Key이거나 통신 장애가 발생했습니다. 키 값을 다시 한번 확인해주세요." });
  }
});

// Setup Vite Dev server or static asset serving in Production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[OOS Server] Running on port ${PORT}`);
  });
}

startServer();
