/**
 * Generates src/lib/data/aiLearnChapterEnrichment.js for all 44 AI Engineer lessons.
 * Run: node scripts/generate-ai-learn-chapter-enrichment.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { lessonLearnChapterIndex } from '../src/lib/data/learnChapters.js';
import { getModulesByFlow } from '../src/lib/data/courseData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../src/lib/data/aiLearnChapterEnrichment.js');

const MERMAID_INIT =
  "%%{init: {'theme':'dark','themeVariables':{'primaryColor':'#696cff','primaryTextColor':'#e4e4e7','primaryBorderColor':'#5658d4','lineColor':'#a1a1aa','secondaryColor':'#2b2c40','tertiaryColor':'#232333'}}}%%";

/** @param {string} body */
function code(body) {
  return body.trim();
}

/** @param {string} title @param {string} flow */
function mermaid(title, flow) {
  return { title, caption: title, code: `${MERMAID_INIT}\n${flow.trim()}` };
}

const DIAGRAMS = {
  featurePipeline: mermaid(
    'Feature → model pipeline',
    'flowchart LR\n  A[Raw table] --> B[Clean]\n  B --> C[Encode]\n  C --> D[Scale]\n  D --> E[Model]\n  E --> F[Metrics]'
  ),
  trainValDeploy: mermaid(
    'Train / validate / deploy loop',
    'flowchart TD\n  A[Train split] --> B[Fit model]\n  B --> C[Validate]\n  C --> D{Gate?}\n  D -->|pass| E[Serve]\n  D -->|fail| A'
  ),
  ingestQuery: mermaid(
    'RAG ingest and query paths',
    'flowchart LR\n  subgraph ingest [Ingest]\n    I1[Docs] --> I2[Chunk]\n    I2 --> I3[Embed]\n    I3 --> I4[Index]\n  end\n  subgraph query [Query]\n    Q1[Question] --> Q2[Retrieve]\n    Q2 --> Q3[Prompt]\n    Q3 --> Q4[Answer]\n  end\n  I4 --> Q2'
  ),
  agentLoop: mermaid(
    'Agent control loop',
    'flowchart LR\n  A[Plan] --> B[Select tool]\n  B --> C[Execute]\n  C --> D[Observe]\n  D --> E{Done?}\n  E -->|no| A\n  E -->|yes| F[Respond]'
  ),
  mlPipelineDag: mermaid(
    'ML pipeline DAG',
    'flowchart TD\n  A[Data ingest] --> B[Validate]\n  B --> C[Features]\n  C --> D[Train]\n  D --> E[Evaluate]\n  E --> F[Register]\n  F --> G[Deploy]'
  ),
  servingPaths: mermaid(
    'Serving paths',
    'flowchart LR\n  A[Client] --> B{Mode}\n  B -->|sync| C[Online API]\n  B -->|stream| D[SSE tokens]\n  B -->|batch| E[Queue worker]'
  ),
  driftAlert: mermaid(
    'Drift to rollback',
    'flowchart LR\n  A[Live scores] --> B[Drift test]\n  B --> C{Threshold?}\n  C -->|yes| D[Alert]\n  D --> E[Rollback alias]'
  ),
  fairnessWorkflow: mermaid(
    'Fairness workflow',
    'flowchart TD\n  A[Define harms] --> B[Slice metrics]\n  B --> C[Compare groups]\n  C --> D[Mitigate]\n  D --> E[Monitor]'
  ),
  tokenFlow: mermaid(
    'Token lifecycle',
    'flowchart LR\n  A[Text] --> B[Tokenize]\n  B --> C[Embed]\n  C --> D[Attention]\n  D --> E[Decode]'
  ),
  attentionMap: mermaid(
    'Scaled dot-product attention',
    'flowchart LR\n  Q[Queries] --> S[Scores]\n  K[Keys] --> S\n  S --> SM[Softmax]\n  SM --> V[Values]\n  V --> O[Context]'
  ),
  cnnStack: mermaid(
    'CNN block stack',
    'flowchart LR\n  A[Image] --> B[Conv]\n  B --> C[ReLU]\n  C --> D[Pool]\n  D --> E[Conv]\n  E --> F[FC head]'
  ),
  dataLineage: mermaid(
    'Dataset lineage',
    'flowchart TD\n  A[Raw dump] --> B[Snapshot v1]\n  B --> C[Clean v1.1]\n  C --> D[Train set]\n  C --> E[Serve features]'
  ),
  evalHarness: mermaid(
    'Eval harness',
    'flowchart LR\n  A[Golden set] --> B[Run model]\n  B --> C[Score]\n  C --> D{Pass gate?}\n  D -->|yes| E[Ship]\n  D -->|no| F[Block]'
  ),
  tenantAcl: mermaid(
    'Tenant isolation',
    'flowchart LR\n  A[Request] --> B[Auth]\n  B --> C[ACL filter]\n  C --> D[Index query]\n  D --> E[Ranked hits]'
  ),
  shipGates: mermaid(
    'Release gates',
    'flowchart LR\n  A[Shadow] --> B[Canary]\n  B --> C[Partial]\n  C --> D[Full rollout]'
  ),
  workshopLoop: mermaid(
    'Lab iteration loop',
    'flowchart LR\n  A[Hypothesis] --> B[Code]\n  B --> C[Run]\n  C --> D[Plot]\n  D --> E{Learned?}\n  E -->|yes| F[Next topic]\n  E -->|no| A'
  ),
  kvCache: mermaid(
    'KV-cache decode steps',
    'flowchart LR\n  A[Prefill] --> B[Cache K/V]\n  B --> C[Decode step]\n  C --> D[Append token]\n  D --> C'
  ),
  hybridRetrieval: mermaid(
    'Hybrid retrieval funnel',
    'flowchart LR\n  A[Query] --> B[BM25]\n  A --> C[Dense]\n  B --> D[RRF merge]\n  C --> D\n  D --> E[Rerank]\n  E --> F[Top-k]'
  )
};

const WORKED = {
  numpyDistance: {
    title: 'Feature scale changes distances',
    body: 'Compare Euclidean distance before and after scaling one coordinate by 100×.',
    language: 'python',
    code: code(`
import numpy as np
a = np.array([1.0, 0.0])
b = np.array([2.0, 100.0])
print("raw distance:", round(np.linalg.norm(a - b), 3))
scale = np.array([1.0, 0.01])
print("scaled distance:", round(np.linalg.norm((a - b) * scale), 3))
`)
  },
  gradientStep: {
    title: 'One gradient descent step',
    body: 'Manual update on a quadratic bowl to connect calculus to code.',
    language: 'python',
    code: code(`
x = 10.0
lr = 0.1
for step in range(5):
    grad = 2.0 * (x - 3.0)
    x -= lr * grad
print("x after 5 steps:", round(x, 4))
`)
  },
  bayesPrior: {
    title: 'Bayes with a rare event prior',
    body: 'A high-accuracy test can still yield many false positives when the prior is tiny.',
    language: 'python',
    code: code(`
prior = 0.001
sensitivity = 0.99
specificity = 0.95
likelihood_pos = sensitivity
likelihood_neg = 1 - specificity
post = (likelihood_pos * prior) / (likelihood_pos * prior + likelihood_neg * (1 - prior))
print("posterior spam:", round(post, 4))
`)
  },
  cvCompare: {
    title: 'Cross-validation score spread',
    body: 'Train three sklearn estimators on the same folds and print mean metrics.',
    language: 'python',
    code: code(`
from sklearn.datasets import make_classification
from sklearn.model_selection import cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
X, y = make_classification(n_samples=400, n_features=8, random_state=0)
models = {
    "logistic": LogisticRegression(max_iter=200),
    "tree": DecisionTreeClassifier(max_depth=4, random_state=0),
    "knn": KNeighborsClassifier(n_neighbors=7),
}
for name, model in models.items():
    scores = cross_val_score(model, X, y, cv=3)
    print(name, "mean acc", round(scores.mean(), 3), "std", round(scores.std(), 3))
`)
  },
  leakageDemo: {
    title: 'Leakage inflates validation score',
    body: 'Fit a scaler on all data vs inside each CV fold.',
    language: 'python',
    code: code(`
import numpy as np
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.datasets import make_classification
X, y = make_classification(n_samples=300, n_features=6, random_state=1)
leaky = Pipeline([("scale", StandardScaler()), ("clf", LogisticRegression(max_iter=200))])
leaky.named_steps["scale"].fit(X)
safe = Pipeline([("scale", StandardScaler()), ("clf", LogisticRegression(max_iter=200))])
print("leaky CV:", round(cross_val_score(leaky, X, y, cv=3).mean(), 3))
print("safe CV:", round(cross_val_score(safe, X, y, cv=3).mean(), 3))
`)
  },
  toySampling: {
    title: 'Temperature changes token diversity',
    body: 'Sample from a toy logit vector with different temperatures.',
    language: 'python',
    code: code(`
import numpy as np
logits = np.array([2.0, 1.0, 0.2, -0.5])
for temp in [0.3, 1.0, 1.8]:
    scaled = logits / temp
    exp = np.exp(scaled - scaled.max())
    probs = exp / exp.sum()
    print(f"T={temp}", np.round(probs, 3))
`)
  },
  loraParams: {
    title: 'LoRA parameter budget',
    body: 'Compare full weight matrix params vs low-rank adapters.',
    language: 'python',
    code: code(`
d_in, d_out = 768, 768
rank = 16
full = d_in * d_out
lora = d_in * rank + rank * d_out
print("full params", full)
print("lora params", lora)
print("ratio", round(lora / full, 4))
`)
  },
  cosineNeighbors: {
    title: 'Cosine nearest neighbors',
    body: 'Rank five toy vectors against a query embedding.',
    language: 'python',
    code: code(`
import numpy as np
vecs = np.array([[1,0,0],[0.9,0.1,0],[0,1,0],[0.8,0.2,0],[0,0,1]])
query = np.array([1.0, 0.0, 0.0])
def cos(a,b):
    return float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))
scores = [(i, cos(query, v)) for i,v in enumerate(vecs)]
for i,s in sorted(scores, key=lambda x: -x[1]):
    print(i, round(s, 3))
`)
  },
  jsonRepair: {
    title: 'JSON schema validation loop',
    body: 'Parse model JSON output and flag missing required keys.',
    language: 'python',
    code: code(`
import json
samples = ['{"name":"Ada","role":"eng"}', '{"name":"Bob"}', 'not json']
required = {"name", "role"}
for raw in samples:
    try:
        obj = json.loads(raw)
        missing = required - set(obj)
        print(raw[:20], "valid", not missing, "missing", sorted(missing))
    except json.JSONDecodeError:
        print(raw, "invalid JSON")
`)
  },
  ragChunkRecall: {
    title: 'Chunk and recall@k toy index',
    body: 'Split text into chunks and score whether gold chunk is in top-k.',
    language: 'python',
    code: code(`
text = "Refund within 30 days. Password reset via email. SSO uses SAML."
chunks = [text]
for sep in [". ", " "]:
    if len(chunks) == 1 and len(chunks[0]) > 40:
        chunks = [c.strip() for c in text.split(sep) if c.strip()]
query = "password reset"
def score(c):
    return sum(1 for w in query.split() if w in c.lower())
ranked = sorted(chunks, key=score, reverse=True)
print("top chunk:", ranked[0])
print("recall@1", "password" in ranked[0].lower())
`)
  },
  toolRouter: {
    title: 'Mock tool router',
    body: 'Route a JSON tool call to mock_search or mock_sql fixtures.',
    language: 'python',
    code: code(`
def mock_search(q):
    return [{"id":"doc-a", "snippet":"reset via email"}] if "reset" in q else []
def mock_sql(table):
    return [{"order_id":101,"status":"shipped"}] if table=="orders" else []
call = {"tool":"search", "args":{"query":"password reset"}}
if call["tool"] == "search":
    print(mock_search(call["args"]["query"]))
else:
    print(mock_sql(call.get("args",{}).get("table","")))
`)
  },
  agentState: {
    title: 'Agent state machine step',
    body: 'Simulate three ReAct-style steps with a budget counter.',
    language: 'python',
    code: code(`
state = {"steps": 0, "budget": 3, "answer": None}
trace = []
while state["budget"] > 0 and state["answer"] is None:
    state["steps"] += 1
    state["budget"] -= 1
    trace.append(f"step {state['steps']} act=search")
    if state["steps"] >= 2:
        state["answer"] = 42.0
print("trace:", trace)
print("answer:", state["answer"])
`)
  },
  psiThreshold: {
    title: 'Population stability index toy',
    body: 'Flag drift when PSI crosses a threshold on binned counts.',
    language: 'python',
    code: code(`
import numpy as np
expected = np.array([50, 30, 20], dtype=float)
actual = np.array([35, 35, 30], dtype=float)
def psi(e, a):
    e = e / e.sum()
    a = a / a.sum()
    return float(np.sum((a - e) * np.log((a + 1e-6) / (e + 1e-6))))
value = psi(expected, actual)
print("PSI", round(value, 3), "alert", value > 0.2)
`)
  },
  fairnessGap: {
    title: 'Subgroup true-positive rate gap',
    body: 'Compute TPR gap on synthetic binary labels and scores.',
    language: 'python',
    code: code(`
import numpy as np
rng = np.random.default_rng(0)
groups = rng.integers(0, 2, size=200)
scores = rng.normal(size=200)
labels = (scores + groups * 0.5 > 0).astype(int)
pred = scores > 0
def tpr(mask):
    m = mask & (labels == 1)
    return float(pred[m].mean()) if m.any() else 0.0
tpr0, tpr1 = tpr(groups==0), tpr(groups==1)
print("TPR gap", round(abs(tpr0 - tpr1), 3))
`)
  },
  manifestHash: {
    title: 'Dataset manifest fingerprint',
    body: 'Hash sorted file paths for a reproducible dataset manifest.',
    language: 'python',
    code: code(`
import hashlib
files = sorted(["train.parquet", "val.parquet", "features/schema.json"])
digest = hashlib.sha256("\\n".join(files).encode()).hexdigest()[:12]
print("manifest id", digest)
`)
  },
  batchWindow: {
    title: 'Batch window aggregator',
    body: 'Aggregate events into hourly buckets deterministically.',
    language: 'python',
    code: code(`
from collections import defaultdict
events = [(0, 2), (15, 1), (70, 4), (125, 3)]
buckets = defaultdict(int)
for ts, val in events:
    buckets[ts // 60] += val
for hour in sorted(buckets):
    print(f"hour {hour}: total {buckets[hour]}")
`)
  },
  streamLatency: {
    title: 'Streaming latency stack',
    body: 'Sum per-stage latency budget for an SSE chat path.',
    language: 'python',
    code: code(`
stages = {"auth": 12, "retrieve": 45, "prefill": 80, "first_token": 35, "decode": 120}
total = sum(stages.values())
print("stage ms:", stages)
print("p50 budget ms:", total)
print("headroom if SLO 400ms", 400 - total)
`)
  },
  tenantFilter: {
    title: 'Tenant filter on mock index',
    body: 'Apply ACL tenant id before ranking retrieval hits.',
    language: 'python',
    code: code(`
docs = [
    {"id":"a", "tenant":"t1", "text":"reset"},
    {"id":"b", "tenant":"t2", "text":"reset"},
    {"id":"c", "tenant":"t1", "text":"billing"},
]
tenant = "t1"
visible = [d for d in docs if d["tenant"] == tenant]
print("visible ids", [d["id"] for d in visible])
`)
  },
  gateChecklist: {
    title: 'Release gate checklist score',
    body: 'Score shadow/canary gates before full rollout.',
    language: 'python',
    code: code(`
gates = {"eval_pass": True, "latency_ok": True, "error_budget": True, "guardrails": False}
score = sum(gates.values())
print("gates", gates)
print("ready", score >= 3)
`)
  },
  scalerKnn: {
    title: 'StandardScaler before KNN',
    body: 'Show neighbor label changes after scaling a dominant feature.',
    language: 'python',
    code: code(`
import numpy as np
from sklearn.preprocessing import StandardScaler
X = np.array([[1, 1000],[2, 1100],[10, 50]])
query = np.array([[1.5, 1050]])
def nn(X, q):
    d = np.linalg.norm(X - q, axis=1)
    return int(np.argmin(d))
print("raw nn label idx", nn(X, query))
Xs = StandardScaler().fit_transform(X)
qs = StandardScaler().fit(X).transform(query)
print("scaled nn label idx", nn(Xs, qs))
`)
  },
  decisionBoundary: {
    title: '2D classifier benchmark',
    body: 'Fit logistic regression on synthetic 2D blobs and print accuracy.',
    language: 'python',
    code: code(`
from sklearn.datasets import make_blobs
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
X, y = make_blobs(n_samples=180, centers=2, random_state=3)
clf = LogisticRegression(max_iter=300)
print("cv acc", round(cross_val_score(clf, X, y, cv=3).mean(), 3))
`)
  },
  kmeansSweep: {
    title: 'K-means inertia sweep',
    body: 'Plot inertia vs k on synthetic clusters (table printed).',
    language: 'python',
    code: code(`
from sklearn.cluster import KMeans
from sklearn.datasets import make_blobs
import numpy as np
X, _ = make_blobs(n_samples=200, centers=3, random_state=4)
for k in [2, 3, 4, 5]:
    km = KMeans(n_clusters=k, n_init=10, random_state=0)
    km.fit(X)
    print("k", k, "inertia", round(km.inertia_, 1))
`)
  },
  perceptronStep: {
    title: 'Perceptron weight update',
    body: 'One mistake-driven update on a labeled point.',
    language: 'python',
    code: code(`
import numpy as np
w = np.zeros(2)
x = np.array([1.0, 2.0])
y = 1
lr = 0.1
pred = 1 if w @ x >= 0 else -1
if pred != y:
    w = w + lr * y * x
print("w after update", w.round(3))
`)
  },
  attentionToy: {
    title: 'Scaled dot-product attention',
    body: 'Compute attention weights for three toy tokens.',
    language: 'python',
    code: code(`
import numpy as np
Q = np.array([[1,0],[0,1],[1,1]])
K = Q.copy()
V = np.array([[1,2],[3,4],[5,6]])
scores = Q @ K.T / np.sqrt(Q.shape[1])
weights = np.exp(scores - scores.max(axis=-1, keepdims=True))
weights /= weights.sum(axis=-1, keepdims=True)
out = weights @ V
print("weights\\n", np.round(weights, 3))
print("context shape", out.shape)
`)
  },
  causalMask: {
    title: 'Causal mask positions',
    body: 'Build a lower-triangular mask for autoregressive attention.',
    language: 'python',
    code: code(`
import numpy as np
seq = 4
mask = np.tril(np.ones((seq, seq)))
scores = np.random.randn(seq, seq)
masked = np.where(mask, scores, -1e9)
print(mask.astype(int))
print("masked max per row", masked.max(axis=-1).round(2))
`)
  },
  bpeCounts: {
    title: 'Character pair counting',
    body: 'One step of naive BPE merge candidate selection.',
    language: 'python',
    code: code(`
from collections import Counter
text = "low low low"
pairs = Counter()
chars = list(text)
for i in range(len(chars)-1):
    pairs[(chars[i], chars[i+1])] += 1
print("top pair", pairs.most_common(1)[0])
`)
  },
  tfidfTopk: {
    title: 'TF-IDF top-k by hand',
    body: 'Score two documents for a query term overlap.',
    language: 'python',
    code: code(`
docs = ["neural networks train deep", "graph database index"]
query = "neural train"
def score(doc):
    dset = set(doc.split())
    qset = set(query.split())
    return len(dset & qset)
for i,d in enumerate(docs):
    print(i, score(d), d)
`)
  },
  recallAtK: {
    title: 'Recall@k on gold ids',
    body: 'Check whether any gold chunk id appears in retrieved top-k.',
    language: 'python',
    code: code(`
gold = {"chunk-2", "chunk-5"}
retrieved = ["chunk-1", "chunk-2", "chunk-3"][:2]
hit = bool(gold & set(retrieved))
print("recall@2", hit)
`)
  },
  safePipeline: {
    title: 'Pipeline inside CV fold',
    body: 'Ensure preprocessing is fit only on training folds.',
    language: 'python',
    code: code(`
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.datasets import make_classification
X, y = make_classification(n_samples=200, random_state=9)
pipe = Pipeline([("s", StandardScaler()), ("c", LogisticRegression(max_iter=200))])
print("cv acc", round(cross_val_score(pipe, X, y, cv=3).mean(), 3))
`)
  },
  p99Budget: {
    title: 'p99 latency budget calculator',
    body: 'Sum stage budgets and compare to an SLO ceiling.',
    language: 'python',
    code: code(`
stages = [20, 35, 90, 40, 25]
slo = 200
total = sum(stages)
print("budget sum", total, "within slo", total <= slo)
`)
  },
  evalGate: {
    title: 'Eval harness pass/fail',
    body: 'Score answers against gold strings with a simple overlap gate.',
    language: 'python',
    code: code(`
def score(answer, gold):
    a = set(answer.lower().split())
    g = set(gold.lower().split())
    return len(a & g) / max(1, len(g))
cases = [("reset via email link", "users reset password using email link")]
for ans, gold in cases:
    s = score(ans, gold)
    print(round(s,3), "pass", s >= 0.4)
`)
  },
  costTokens: {
    title: 'Token cost estimate',
    body: 'Estimate USD from prompt + completion token counts.',
    language: 'python',
    code: code(`
prompt_tokens = 1200
completion_tokens = 350
price_in, price_out = 0.15, 0.60  # per 1M tokens (illustrative)
cost = (prompt_tokens * price_in + completion_tokens * price_out) / 1_000_000
print("est USD", round(cost, 6))
`)
  },
  guardrailScore: {
    title: 'Risk-tier gate score',
    body: 'Combine eval, guardrail, and latency signals into a ship decision.',
    language: 'python',
    code: code(`
signals = {"eval": 0.82, "guardrails": True, "latency_ok": True}
tier = "high" if signals["eval"] < 0.7 else "standard"
ship = signals["guardrails"] and signals["latency_ok"] and signals["eval"] >= 0.75
print("tier", tier, "ship", ship)
`)
  }
};

/** lessonId -> [diagramKey, diagramKey] */
const LESSON_DIAGRAMS = {
  'ml-foundations/math-for-ml': ['featurePipeline', 'trainValDeploy'],
  'ml-foundations/classical-ml-algorithms': ['featurePipeline', 'trainValDeploy'],
  'ml-foundations/model-evaluation': ['trainValDeploy', 'evalHarness'],
  'deep-learning/neural-network-fundamentals': ['tokenFlow', 'attentionMap'],
  'deep-learning/cnn-and-computer-vision': ['cnnStack', 'featurePipeline'],
  'deep-learning/transformer-architecture': ['attentionMap', 'tokenFlow'],
  'llms-and-nlp/llm-fundamentals': ['tokenFlow', 'kvCache'],
  'llms-and-nlp/fine-tuning-techniques': ['trainValDeploy', 'featurePipeline'],
  'llms-and-nlp/embeddings-and-vector-search': ['hybridRetrieval', 'ingestQuery'],
  'prompt-engineering-and-rag/prompt-engineering': ['evalHarness', 'ingestQuery'],
  'prompt-engineering-and-rag/rag-systems': ['ingestQuery', 'hybridRetrieval'],
  'prompt-engineering-and-rag/building-with-frameworks': ['agentLoop', 'servingPaths'],
  'ai-agents/agent-fundamentals': ['agentLoop', 'evalHarness'],
  'ai-agents/tool-use-and-function-calling': ['agentLoop', 'servingPaths'],
  'ai-agents/agent-evaluation-and-safety': ['evalHarness', 'agentLoop'],
  'mlops-and-deployment/ml-pipeline-design': ['mlPipelineDag', 'dataLineage'],
  'mlops-and-deployment/model-serving': ['servingPaths', 'trainValDeploy'],
  'mlops-and-deployment/monitoring-and-observability': ['driftAlert', 'evalHarness'],
  'ai-safety-and-ethics/bias-and-fairness': ['fairnessWorkflow', 'evalHarness'],
  'ai-safety-and-ethics/explainability': ['fairnessWorkflow', 'featurePipeline'],
  'ai-safety-and-ethics/ai-governance': ['evalHarness', 'fairnessWorkflow'],
  'data-engineering-for-ml/data-pipelines-at-scale': ['mlPipelineDag', 'dataLineage'],
  'data-engineering-for-ml/dataset-management': ['dataLineage', 'mlPipelineDag'],
  'ai-application-lab/chat-api-and-streaming': ['servingPaths', 'kvCache'],
  'ai-application-lab/multi-tenant-rag-products': ['tenantAcl', 'ingestQuery'],
  'ai-application-lab/shipping-ai-features': ['shipGates', 'evalHarness'],
  'ml-interactive-lab/feature-engineering-playground': ['featurePipeline', 'workshopLoop'],
  'ml-interactive-lab/supervised-learning-workshop': ['trainValDeploy', 'workshopLoop'],
  'ml-interactive-lab/unsupervised-learning-workshop': ['workshopLoop', 'featurePipeline'],
  'deep-learning-from-scratch/perceptron-and-mlp-numpy': ['featurePipeline', 'attentionMap'],
  'deep-learning-from-scratch/backpropagation-by-hand': ['attentionMap', 'tokenFlow'],
  'deep-learning-from-scratch/cnn-building-blocks-numpy': ['cnnStack', 'workshopLoop'],
  'transformers-attention-lab/attention-from-scratch': ['attentionMap', 'tokenFlow'],
  'transformers-attention-lab/multi-head-and-blocks': ['attentionMap', 'cnnStack'],
  'transformers-attention-lab/positional-encoding-and-causal-mask': ['kvCache', 'attentionMap'],
  'llm-retrieval-lab/tokenization-workshop': ['tokenFlow', 'workshopLoop'],
  'llm-retrieval-lab/embeddings-and-similarity-lab': ['hybridRetrieval', 'ingestQuery'],
  'llm-retrieval-lab/rag-evaluation-workshop': ['evalHarness', 'hybridRetrieval'],
  'ml-production-lab/leakage-safe-pipelines': ['trainValDeploy', 'mlPipelineDag'],
  'ml-production-lab/drift-and-monitoring-lab': ['driftAlert', 'evalHarness'],
  'ml-production-lab/serving-contracts-lab': ['servingPaths', 'evalHarness'],
  'llmops-eval-lab/llm-evaluation-harness': ['evalHarness', 'shipGates'],
  'llmops-eval-lab/cost-latency-and-observability': ['servingPaths', 'kvCache'],
  'llmops-eval-lab/shipping-gates-and-guardrails': ['shipGates', 'evalHarness']
};

/** lessonId -> [workedKey, workedKey, workedKey] preferred snippets */
const LESSON_WORKED = {
  'ml-foundations/math-for-ml': ['numpyDistance', 'gradientStep', 'bayesPrior'],
  'ml-foundations/classical-ml-algorithms': ['cvCompare', 'numpyDistance', 'gradientStep'],
  'ml-foundations/model-evaluation': ['leakageDemo', 'cvCompare', 'evalGate'],
  'llms-and-nlp/llm-fundamentals': ['toySampling', 'costTokens', 'bpeCounts'],
  'llms-and-nlp/fine-tuning-techniques': ['loraParams', 'cvCompare', 'bayesPrior'],
  'llms-and-nlp/embeddings-and-vector-search': ['cosineNeighbors', 'numpyDistance', 'tfidfTopk'],
  'prompt-engineering-and-rag/prompt-engineering': ['jsonRepair', 'evalGate', 'toySampling'],
  'prompt-engineering-and-rag/rag-systems': ['ragChunkRecall', 'recallAtK', 'cosineNeighbors'],
  'prompt-engineering-and-rag/building-with-frameworks': ['toolRouter', 'jsonRepair', 'agentState'],
  'ai-agents/agent-fundamentals': ['agentState', 'toolRouter', 'evalGate'],
  'ai-agents/tool-use-and-function-calling': ['toolRouter', 'jsonRepair', 'agentState'],
  'ai-agents/agent-evaluation-and-safety': ['evalGate', 'agentState', 'guardrailScore'],
  'mlops-and-deployment/ml-pipeline-design': ['safePipeline', 'manifestHash', 'batchWindow'],
  'mlops-and-deployment/model-serving': ['p99Budget', 'streamLatency', 'costTokens'],
  'mlops-and-deployment/monitoring-and-observability': ['psiThreshold', 'evalGate', 'leakageDemo'],
  'ai-safety-and-ethics/bias-and-fairness': ['fairnessGap', 'evalGate', 'cvCompare'],
  'ai-safety-and-ethics/explainability': ['numpyDistance', 'cvCompare', 'fairnessGap'],
  'ai-safety-and-ethics/ai-governance': ['manifestHash', 'gateChecklist', 'evalGate'],
  'data-engineering-for-ml/data-pipelines-at-scale': ['batchWindow', 'manifestHash', 'safePipeline'],
  'data-engineering-for-ml/dataset-management': ['manifestHash', 'leakageDemo', 'batchWindow'],
  'ai-application-lab/chat-api-and-streaming': ['streamLatency', 'costTokens', 'p99Budget'],
  'ai-application-lab/multi-tenant-rag-products': ['tenantFilter', 'ragChunkRecall', 'cosineNeighbors'],
  'ai-application-lab/shipping-ai-features': ['gateChecklist', 'evalGate', 'guardrailScore'],
  'ml-interactive-lab/feature-engineering-playground': ['scalerKnn', 'numpyDistance', 'cvCompare'],
  'ml-interactive-lab/supervised-learning-workshop': ['decisionBoundary', 'cvCompare', 'leakageDemo'],
  'ml-interactive-lab/unsupervised-learning-workshop': ['kmeansSweep', 'numpyDistance', 'decisionBoundary'],
  'llm-retrieval-lab/tokenization-workshop': ['bpeCounts', 'toySampling', 'costTokens'],
  'llm-retrieval-lab/embeddings-and-similarity-lab': ['tfidfTopk', 'cosineNeighbors', 'ragChunkRecall'],
  'llm-retrieval-lab/rag-evaluation-workshop': ['recallAtK', 'evalGate', 'ragChunkRecall'],
  'ml-production-lab/leakage-safe-pipelines': ['safePipeline', 'leakageDemo', 'cvCompare'],
  'ml-production-lab/drift-and-monitoring-lab': ['psiThreshold', 'evalGate', 'leakageDemo'],
  'ml-production-lab/serving-contracts-lab': ['p99Budget', 'streamLatency', 'safePipeline'],
  'llmops-eval-lab/llm-evaluation-harness': ['evalGate', 'recallAtK', 'guardrailScore'],
  'llmops-eval-lab/cost-latency-and-observability': ['costTokens', 'streamLatency', 'p99Budget'],
  'llmops-eval-lab/shipping-gates-and-guardrails': ['guardrailScore', 'gateChecklist', 'evalGate']
};

/** Interactive demos with sliders — one per lesson where topic fits */
const INTERACTIVE = {
  'ml-foundations/math-for-ml': {
    partId: 'least-squares-pca-and-conditioning',
    title: 'Conditioning playground',
    body: 'Increase feature noise and watch the condition number grow.',
    sliders: [{ id: 'noise', label: 'Noise σ', min: 0.01, max: 2, step: 0.05, value: 0.05 }],
    codeTemplate: code(`
import numpy as np
rng = np.random.default_rng(7)
noise = {{noise}}
X = rng.normal(size=(8, 3))
w = np.array([1.5, -2.0, 0.7])
y = X @ w + rng.normal(scale=noise, size=8)
_, _, _, sv = np.linalg.lstsq(X, y, rcond=None)
print("noise", noise)
print("condition", round(sv[0]/sv[-1], 3))
`)
  },
  'ml-foundations/classical-ml-algorithms': {
    partId: 'trees-forests-and-boosting',
    title: 'Tree depth vs flexibility',
    body: 'Sweep tree depth on a toy dataset (printed accuracy).',
    sliders: [{ id: 'depth', label: 'Max depth', min: 1, max: 8, step: 1, value: 3 }],
    codeTemplate: code(`
from sklearn.tree import DecisionTreeClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import cross_val_score
depth = int({{depth}})
X, y = make_classification(n_samples=300, random_state=2)
clf = DecisionTreeClassifier(max_depth=depth, random_state=0)
acc = cross_val_score(clf, X, y, cv=3).mean()
print("depth", depth, "cv acc", round(acc, 3))
`)
  },
  'llms-and-nlp/llm-fundamentals': {
    partId: 'sampling-temperature-and-output-control',
    title: 'Decoding temperature',
    body: 'See how temperature reshapes a toy probability vector.',
    sliders: [{ id: 'temp', label: 'Temperature', min: 0.2, max: 2.5, step: 0.1, value: 1.0 }],
    codeTemplate: code(`
import numpy as np
logits = np.array([2.0, 1.0, 0.2, -0.5])
temp = {{temp}}
scaled = logits / temp
exp = np.exp(scaled - scaled.max())
probs = exp / exp.sum()
print("temp", temp, "probs", np.round(probs, 3))
`)
  },
  'prompt-engineering-and-rag/rag-systems': {
    partId: 'hybrid-retrieval-rrf-and-rerank-funnel',
    title: 'Recall@k sweep',
    body: 'Adjust k and see whether the gold chunk stays in the retrieved set.',
    sliders: [{ id: 'topk', label: 'Top-k', min: 1, max: 5, step: 1, value: 2 }],
    codeTemplate: code(`
gold = {"chunk-2"}
retrieved = ["chunk-1", "chunk-2", "chunk-3", "chunk-4"]
k = int({{topk}})
hit = bool(gold & set(retrieved[:k]))
print("k", k, "recall@", k, hit)
`)
  },
  'ai-agents/agent-fundamentals': {
    partId: 'planning-patterns',
    title: 'Agent step budget',
    body: 'Simulate how many tool steps run before the budget is exhausted.',
    sliders: [{ id: 'budget', label: 'Step budget', min: 1, max: 6, step: 1, value: 3 }],
    codeTemplate: code(`
budget = int({{budget}})
steps = 0
answer = None
while budget > 0 and answer is None:
    steps += 1
    budget -= 1
    if steps >= 2:
        answer = "done"
print("steps used", steps, "answer", answer)
`)
  },
  'mlops-and-deployment/monitoring-and-observability': {
    partId: 'drift-label-delay-and-slices',
    title: 'PSI alert threshold',
    body: 'Shift bin counts and compare PSI to a threshold.',
    sliders: [{ id: 'shift', label: 'Distribution shift', min: 0, max: 30, step: 5, value: 10 }],
    codeTemplate: code(`
import numpy as np
shift = int({{shift}})
expected = np.array([50, 30, 20], dtype=float)
actual = np.array([50 - shift, 30, 20 + shift], dtype=float)
e, a = expected/expected.sum(), actual/actual.sum()
psi = float(np.sum((a-e)*np.log((a+1e-6)/(e+1e-6))))
print("shift", shift, "PSI", round(psi,3), "alert", psi>0.2)
`)
  },
  'ml-interactive-lab/feature-engineering-playground': {
    partId: 'pipeline-discipline',
    title: 'Scaling multiplier',
    body: 'Change the dominant feature scale and watch KNN neighbor index.',
    sliders: [{ id: 'mult', label: 'Feature-2 scale', min: 1, max: 200, step: 10, value: 100 }],
    codeTemplate: code(`
import numpy as np
mult = {{mult}}
X = np.array([[1, 1.0],[2, 1.1],[10, 0.05]])
X[:,1] *= mult / 100.0
q = np.array([[1.5, mult/100.0 * 1.05]])
d = np.linalg.norm(X - q, axis=1)
print("mult", mult, "nn idx", int(np.argmin(d)))
`)
  },
  'llm-retrieval-lab/rag-evaluation-workshop': {
    partId: 'faithfulness-answer-quality',
    title: 'Overlap pass threshold',
    body: 'Tune the overlap gate used by score_rag-style checks.',
    sliders: [{ id: 'thresh', label: 'Pass threshold', min: 0.1, max: 0.8, step: 0.05, value: 0.35 }],
    codeTemplate: code(`
answer = "reset password using email link"
gold = "users reset password via email link"
thresh = {{thresh}}
a, g = set(answer.split()), set(gold.split())
overlap = len(a & g) / max(1, len(g))
print("overlap", round(overlap,3), "pass", overlap >= thresh)
`)
  }
};

/** @type {Record<string, string>} */
const exerciseByLesson = {};
const modules = getModulesByFlow('ai-engineer');
for (const m of modules) {
  for (const l of m.lessons) {
    const coding = (l.exercises ?? []).filter((e) => e.type === 'coding' && e.starterCode);
    if (coding[0]) exerciseByLesson[l.id] = coding[0].id;
  }
}

/** @type {Record<string, any>} */
const enrichment = {};

for (const m of modules) {
  for (const l of m.lessons) {
    const lessonId = l.id;
    const chapter = lessonLearnChapterIndex[lessonId];
    if (!chapter) continue;

    const partsPatch = {};
    const partIds = chapter.parts.map((p) => p.id);

    const diagramKeys = LESSON_DIAGRAMS[lessonId] ?? ['featurePipeline', 'trainValDeploy'];
    const partsNeedingMermaid = chapter.parts.filter((p) => !p.mermaid).slice(0, 2);
    partsNeedingMermaid.forEach((part, idx) => {
      const key = diagramKeys[idx] ?? diagramKeys[0];
      partsPatch[part.id] = { mermaid: DIAGRAMS[key] };
    });

    const workedCount = chapter.parts.filter((p) => p.workedExample?.code).length;
    const needed = Math.max(0, 3 - workedCount);
    const workedKeys = LESSON_WORKED[lessonId] ?? ['cvCompare', 'numpyDistance', 'gradientStep'];
    const partsNeedingWorked = chapter.parts.filter((p) => !p.workedExample?.code).slice(0, needed);
    partsNeedingWorked.forEach((part, idx) => {
      const key = workedKeys[idx] ?? workedKeys[0];
      const snippet = WORKED[key];
      if (!snippet) return;
      partsPatch[part.id] = { ...partsPatch[part.id], workedExample: snippet };
    });

    const interactive = INTERACTIVE[lessonId];
    if (interactive && partsPatch[interactive.partId]) {
      partsPatch[interactive.partId].interactiveDemo = {
        title: interactive.title,
        body: interactive.body,
        sliders: interactive.sliders,
        codeTemplate: interactive.codeTemplate,
        language: 'python'
      };
    } else if (interactive) {
      partsPatch[interactive.partId] = {
        ...partsPatch[interactive.partId],
        interactiveDemo: {
          title: interactive.title,
          body: interactive.body,
          sliders: interactive.sliders,
          codeTemplate: interactive.codeTemplate,
          language: 'python'
        }
      };
    }

    const [moduleSlug, lessonSlug] = lessonId.split('/');
    const exerciseId = exerciseByLesson[lessonId];
    const wrapUp = {
      nextSteps: [
        {
          label: 'Open the topic lab diagram and decision guide',
          href: `/module/${moduleSlug}/lesson/${lessonSlug}#topic-lab`
        },
        {
          label: 'Run the primary Python lab exercise',
          href: `/module/${moduleSlug}/lesson/${lessonSlug}#ml-practice-lab`,
          exerciseId
        }
      ]
    };

    enrichment[lessonId] = { parts: partsPatch, wrapUp };
  }
}

const file = `/** @type {Record<string, {
 *   parts: Record<string, Partial<import('./learnChapters.js').LearnChapterPart>>,
 *   wrapUp?: { nextSteps?: import('./learnChapters.js').LearnNextStep[] }
 * }>} */
export const aiLearnChapterEnrichment = ${JSON.stringify(enrichment, null, 2)};
`;

fs.writeFileSync(OUT, file);
console.log('Wrote', OUT, 'lessons:', Object.keys(enrichment).length);
