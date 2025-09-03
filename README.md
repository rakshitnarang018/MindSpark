# MindSpark

**Personalized learning, powered by AI.** MindSpark converts raw learning material into concise summaries, interactive quizzes, visual mind maps, and audio overviews — delivering a faster, more engaging study experience.

---

## 🔥 Why MindSpark?

Students and learners face information overload. MindSpark extracts the signal from the noise by converting documents, lecture notes, and podcasts into digestible, actionable learning artifacts. It’s built for speed, accuracy, and reusability:

* Save time with high-quality **summaries** (short & long form).
* Reinforce learning with **auto-generated quizzes** and explanations.
* Visualize concepts using **mind maps** that can be embedded or exported.
* Learn on the go with **audio overviews** (server-side TTS).
* Get **personalized recommendations** that adapt to user progress.

---

## 📁 Project Structure

```
/
├── backend/          # FastAPI backend implementing LangGraph workflows
├── frontend/         # Next.js 15 frontend (TypeScript + Tailwind)
└── training/         # Jupyter notebooks for experiments & model development
```

---

## 🧰 Tech Stack

**Backend**

* FastAPI — API & async workers
* LangGraph — orchestrated agent workflows
* LangChain — LLM adapters and prompts
* Supabase — Postgres DB + object storage
* TTS integration

**Frontend**

* Next.js 15 + React 19 (TypeScript)
* Tailwind CSS — design system
* Clerk — authentication
* Supabase client — realtime and storage access

**Dev / Data**

* Python 3.12+
* Node.js 18+
* UV — Python dependency manager
* Jupyter Notebooks — reproducible experiments

---

## ✨ Features (at a glance)

* **Multimodal Summaries:** Accepts text & PDFs, produces structured summaries and highlight snippets.
* **Quiz Generator:** Generates MCQs, short answers, and explanation text with difficulty metadata.
* **Mind Map Export:** Outputs hierarchical JSON or image assets for frontend rendering.
* **Audio Overviews:** Generate downloadable audio using AWS Polly; caching supported.
* **Personalized Recommendations:** Learner-aware recommendations and adaptive learning paths.

---

## 🚀 Quickstart (Local)

### Prerequisites

* Python 3.12+
* Node.js 18+
* UV package manager
* Supabase project and keys
* (Optional) AWS credentials for Polly

### Backend

```bash
cd backend
uv sync            # install Python deps
cp .env.example .env
# update .env with keys
uv run src/main.py
```

Backend default: `http://localhost:7007`

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Frontend default: `http://localhost:3000`

---

## 🔌 API Endpoints (high level)

* `GET /` — Health check
* `POST /api/workflows/{workflow_name}` — Trigger workflows (summary, quiz, mindmap, audio, recommendations)

> See `backend/src/` for concrete route names, request schemas, and sample payloads.

---

## ⚙️ Environment Variables (examples)

**backend/.env**

```
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
LLM_API_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
POLLY_VOICE=Joanna
S3_BUCKET=
```

**frontend/.env.local**

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
NEXT_PUBLIC_AGENT_API=
```

> *Never commit real secrets — use your host's secret manager.*

---

## 🧪 Training & Experiments

The `training/` folder contains Jupyter notebooks used for:

* Multimodal data preprocessing (text + PDF)
* Prompt engineering and output parsing
* Quiz & podcast generation workflows
* TTS experiments and caching strategies
* Recommendation model prototyping

Use these notebooks to iterate quickly and reproduce results.

---

## 📦 Deployment Notes

* Keep secrets in platform secret managers (Vercel, Render, Railway, AWS Secrets Manager).
* Offload heavy LLM/TTS calls to worker instances or serverless functions.
* Cache generated assets (summaries/audio) using content-hash keys to reduce costs.
* Monitor costs and rate limits for LLM providers.

---

## 📸 Screenshots

Place screenshot images under `/frontend/public/screenshots/` and reference them on demo pages. Include before/after examples for summaries and generated mind maps.

---

## 🤝 Contributing

1. Fork the repository
2. Create a branch: `feat/your-feature`
3. Add tests and documentation
4. Open a PR with a clear description and screenshots

Include an issue if you want to propose larger architectural changes.

---

## 📝 License

MindSpark is released under the **MIT License**.

Which one should I add next?
