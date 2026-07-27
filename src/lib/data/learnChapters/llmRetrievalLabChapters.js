/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const llmRetrievalLabChapters = {
  "llm-retrieval-lab/tokenization-workshop": {
    "title": "Chapter: Tokenization workshop",
    "readingTime": "55-70 min",
    "premise": "Compare whitespace, character, and BPE-like merge tokenization using pure Python and NumPy—no tiktoken or external tokenizer libraries. This Learn chapter expands the short lesson summary into a full study unit you can read continuously, with interactive checks and selection-based AI search when a phrase needs a second opinion.",
    "parts": [
      {
        "id": "orientation",
        "heading": "Why this chapter exists",
        "paragraphs": [
          "Tokenization defines the atomic units an LLM sees. Interview answers about vocabulary size, rare words, multilingual text, and sequence length all depend on understanding how text becomes token ids.",
          "This chapter treats \"Tokenization workshop\" as a readable study unit: intuition first, then the mechanics you must be able to explain, then the failure modes that show up in interviews and production, and finally how to talk about the topic under time pressure.",
          "Read it like a book chapter. When a phrase is unclear, select it inside the Learn reader and use Search with AI to open Google, Perplexity, or DuckDuckGo without abandoning the chapter."
        ],
        "callout": {
          "tone": "tip",
          "body": "Target reading time is paced for depth, not skimming. Pause at each Check yourself prompt and answer out loud before revealing the guide answer."
        }
      },
      {
        "id": "models-never-see-raw-characters-unless-you-choose-that",
        "heading": "Models never see raw characters unless you choose that",
        "paragraphs": [
          "A tokenizer converts a string into a sequence of integer ids from a fixed vocabulary. Whitespace splitting is the simplest word-ish baseline: 'Transformers attend carefully' becomes three tokens. It fails on punctuation ('carefully.' vs 'carefully'), casing, and languages without spaces. Character tokenization turns the same sentence into one token per character, which makes rare words easy to represent but creates long sequences and forces the model to learn spelling from scratch. Subword methods sit in between: common words stay intact, rare words break into pieces. In interviews, state the tradeoff clearly: shorter sequences vs flexible open-vocabulary coverage vs implementation complexity. Always measure sequence length after tokenization because that length drives attention cost.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Whitespace tokenizers are brittle around punctuation and morphology.",
          "• Character tokenizers maximize coverage but lengthen sequences.",
          "• Subword tokenizers balance frequency and generalization.",
          "Production lens — Tokenization as learned compression: Tokenizers turn raw text into integer IDs the model was trained to consume. Subword algorithms—BPE, WordPiece, Unigram—balance vocabulary size against sequence length by keeping frequent chunks intact and splitting rare strings. That is lossy compression with a model-specific codebook: the \"same\" sentence can become very different ID sequences under different tokenizers, and those IDs are not interchangeable across model families.\n\nSpecial tokens, normalization (Unicode, lowercasing, space markers), and pre-tokenization rules are part of the contract. Hand-editing token IDs without understanding BOS/EOS, padding, or mask tokens corrupts inputs silently. In RAG and agents, count tokens with the same tokenizer the model uses; character or whitespace heuristics drift from billed context and truncate mid-subword in surprising ways."
        ],
        "keyTerms": [
          {
            "term": "Whitespace tokenizers are brittle around punc…",
            "definition": "Whitespace tokenizers are brittle around punctuation and morphology."
          },
          {
            "term": "Character tokenizers maximize coverage but le…",
            "definition": "Character tokenizers maximize coverage but lengthen sequences."
          },
          {
            "term": "Subword tokenizers balance frequency and gene…",
            "definition": "Subword tokenizers balance frequency and generalization."
          }
        ],
        "workedExample": {
          "title": "Whitespace vs character tokenization",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "text = 'Transformers attend carefully.'\nws = text.lower().replace('.', ' .').split()\nchars = list(text.lower())\nprint('whitespace:', ws)\nprint('char count:', len(chars))\nprint('chars head:', chars[:12])",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can contrast whitespace, character, and subword tokenization tradeoffs.",
            "reveal": "Tokenizers turn raw text into integer IDs the model was trained to consume. Subword algorithms—BPE, WordPiece, Unigram—balance vocabulary size against sequence length by keeping frequent chunks intact and splitting rare strings. That is lossy compression with a model-specific codebook: the \"same\" sentence can become very different ID sequences under different tokenizers, and those IDs are not interchangeable across model families.\n\nSpecial tokens, normalization (Unicode, lowercasing, space markers), and pre-tokenization rules are part of the contract. Hand-editing token IDs without understanding BOS/EOS, padding, or mask tokens corrupts inputs silently. In RAG and agents, count tokens with the same tokenizer the model uses; character or whitespace heuristics drift from billed context and truncate mid-subword in surprising ways."
          }
        ]
      },
      {
        "id": "vocabulary-size-sets-a-compression-vs-learning-tradeoff",
        "heading": "Vocabulary size sets a compression vs learning tradeoff",
        "paragraphs": [
          "Suppose your corpus has 50,000 distinct whitespace words. A word vocabulary of 50k can represent frequent terms in one id, but unseen words become UNK. A character vocabulary might be under 100 symbols for English lowercase plus punctuation, so nothing is unknown, yet a 100-word sentence may become hundreds of tokens and hit context limits sooner. Subword vocabularies commonly land between a few thousand and about 100k ids. Larger vocabularies usually shorten sequences and can improve quality, but they grow embedding matrices: vocab_size * d_model parameters. For d_model=768 and vocab=50,000, embeddings alone are about 38.4 million parameters. That is why tokenizer choice is both an NLP decision and a systems decision. Interview answers should connect vocab size to memory, latency, and rare-word behavior together.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Embedding tables scale with vocabulary size times embedding dimension.",
          "• Unknown tokens are a symptom of too little coverage or domain shift.",
          "• Sequence length after tokenization drives attention cost.",
          "Production lens — Fertility drives cost and fairness: Fertility—tokens per word or per character—determines how fast you burn context length and money. Code with long identifiers, JSON, and some non-English scripts often tokenize poorly under general English-centric vocabularies, so a fixed character budget becomes an unfair or inefficient token budget. Measure fertility on your real corpora (code vs prose vs languages) before blaming the model for \"short\" context.\n\nProduct limits should follow tokens, not characters, and may need language-aware or domain-aware policy. A code-oriented tokenizer or light preprocessing (normalizing identifiers, stripping inert boilerplate) can fit more useful signal per window than blindly buying a longer context. Interview answers that connect tokenization to latency, cost, and multilingual equity score higher than answers that treat tokenizers as an opaque library call."
        ],
        "keyTerms": [
          {
            "term": "Embedding tables scale with vocabulary size",
            "definition": "Embedding tables scale with vocabulary size times embedding dimension."
          },
          {
            "term": "Unknown tokens are a symptom of",
            "definition": "Unknown tokens are a symptom of too little coverage or domain shift."
          },
          {
            "term": "Sequence length after tokenization drives att…",
            "definition": "Sequence length after tokenization drives attention cost."
          }
        ],
        "workedExample": {
          "title": "Estimate embedding table size",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "def embedding_params(vocab_size, d_model):\n    return vocab_size * d_model\n\nfor vocab in [100, 8000, 50000]:\n    print(vocab, '->', embedding_params(vocab, 768), 'params')",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can estimate embedding parameters from vocabulary size.",
            "reveal": "Fertility—tokens per word or per character—determines how fast you burn context length and money. Code with long identifiers, JSON, and some non-English scripts often tokenize poorly under general English-centric vocabularies, so a fixed character budget becomes an unfair or inefficient token budget. Measure fertility on your real corpora (code vs prose vs languages) before blaming the model for \"short\" context.\n\nProduct limits should follow tokens, not characters, and may need language-aware or domain-aware policy. A code-oriented tokenizer or light preprocessing (normalizing identifiers, stripping inert boilerplate) can fit more useful signal per window than blindly buying a longer context. Interview answers that connect tokenization to latency, cost, and multilingual equity score higher than answers that treat tokenizers as an opaque library call."
          }
        ]
      },
      {
        "id": "bpe-like-merges-learn-frequent-pairs",
        "heading": "BPE-like merges learn frequent pairs",
        "paragraphs": [
          "Byte Pair Encoding style training starts from characters (or bytes) and repeatedly merges the most frequent adjacent pair into a new symbol. Example corpus: low, low, low, lower, newer, newer. Initial tokens are characters. The pair ('l','o') may be frequent, merge to 'lo'; then ('lo','w') to 'low'. Over many merges you learn subwords like 'er' and whole words like 'low'. Encoding a new word applies the learned merges in order. This is not the full industrial tokenizer pipeline, but it teaches the core interview idea: merges compress frequent patterns while leaving a path to compose rare words. Implement pair counting with Python dictionaries and strings; NumPy is optional for frequency histograms. Keep merges ordered because encoding depends on that order.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• BPE training greedily merges the most frequent adjacent pair.",
          "• Encoding applies merges deterministically to a base symbol sequence.",
          "• Word-boundary markers are often used in production BPE variants.",
          "Production lens — Domain mismatch and vocab strategy: Medical notes, legalese, log lines, and programming languages expose domain mismatch: pieces that should be atomic split into many tokens, while irrelevant common words occupy vocab slots. Options include continuing tokenizer training / adding vocab for a domain (with embedding resize and continued model training), choosing a model whose tokenizer already fits the domain, or accepting higher fertility and budgeting for it. There is no free lunch—new tokens need learned embeddings.\n\nWhen evaluating tokenizer changes, track not only compression but downstream retrieval and generation quality. A more compact tokenization that destroys meaningful boundaries can hurt. Round-trip encode/decode fidelity, unknown-token rates, and fertility by slice are the basic dashboard. Never assume two \"open\" models share tokenization even if both claim similar parameter counts."
        ],
        "keyTerms": [
          {
            "term": "BPE training greedily merges the most",
            "definition": "BPE training greedily merges the most frequent adjacent pair."
          },
          {
            "term": "Encoding applies merges deterministically to a",
            "definition": "Encoding applies merges deterministically to a base symbol sequence."
          },
          {
            "term": "Word-boundary markers are often used in",
            "definition": "Word-boundary markers are often used in production BPE variants."
          }
        ],
        "workedExample": {
          "title": "Count adjacent pairs in a toy corpus",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "from collections import Counter\n\ncorpus = ['l o w', 'l o w', 'l o w e r', 'n e w e r', 'n e w e r']\npair_counts = Counter()\nfor sent in corpus:\n    syms = sent.split()\n    for a, b in zip(syms, syms[1:]):\n        pair_counts[(a, b)] += 1\nprint(pair_counts.most_common(5))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can implement pair counting and one BPE-like merge step.",
            "reveal": "Medical notes, legalese, log lines, and programming languages expose domain mismatch: pieces that should be atomic split into many tokens, while irrelevant common words occupy vocab slots. Options include continuing tokenizer training / adding vocab for a domain (with embedding resize and continued model training), choosing a model whose tokenizer already fits the domain, or accepting higher fertility and budgeting for it. There is no free lunch—new tokens need learned embeddings.\n\nWhen evaluating tokenizer changes, track not only compression but downstream retrieval and generation quality. A more compact tokenization that destroys meaningful boundaries can hurt. Round-trip encode/decode fidelity, unknown-token rates, and fertility by slice are the basic dashboard. Never assume two \"open\" models share tokenization even if both claim similar parameter counts."
          }
        ]
      },
      {
        "id": "implement-a-tiny-trainable-merger",
        "heading": "Implement a tiny trainable merger",
        "paragraphs": [
          "A minimal workshop implementation keeps each word as a list of symbols. For a fixed number of merges: count neighboring pairs across the corpus, pick the best pair, replace adjacent occurrences with a single joined symbol, and record the merge. After training, vocabulary is base characters plus merge products. To encode, start from characters and apply merges in the learned order when both parts are adjacent. Example: after learning ('e','r')->'er' and ('l','o')->'lo', the word 'lower' can become ['lo','w','er']. This is enough to discuss tokenization bugs such as inconsistent normalization, accidental merges across spaces, and why special tokens like PAD/BOS/EOS are reserved outside merge learning. Unit tests should freeze merge order and expected encodings for a golden corpus.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Store merges as an ordered list; order matters for encoding.",
          "• Operate inside word boundaries unless you intentionally tokenize bytes globally.",
          "• Reserve special tokens so merges cannot collide with control ids.",
          "Production lens — Debugging tokenization in systems: Many \"model bugs\" are tokenizer bugs: truncated prompts, split markers that break tool formats, whitespace-sensitive chat templates, or mismatched pad/eos handling between training and inference. Log the tokenized prompt in staging (IDs and decoded pieces) when outputs look inexplicable. For constrained formats (JSON tools, SQL), verify that structural characters are single tokens or at least stably tokenized so constrained decoding remains feasible.\n\nIn interviews and design docs, state which tokenizer version ships with the model, how context limits are enforced, and how user-visible character limits map to tokens. Tokenization is the first stage of every LLM system; treating it as infrastructure with metrics prevents expensive misdiagnosis further down the stack."
        ],
        "keyTerms": [
          {
            "term": "Store merges as an ordered list;",
            "definition": "Store merges as an ordered list; order matters for encoding."
          },
          {
            "term": "Operate inside word boundaries unless you",
            "definition": "Operate inside word boundaries unless you intentionally tokenize bytes globally."
          },
          {
            "term": "Reserve special tokens so merges cannot",
            "definition": "Reserve special tokens so merges cannot collide with control ids."
          }
        ],
        "workedExample": {
          "title": "Perform one greedy BPE merge step",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "from collections import Counter\n\ndef get_stats(words):\n    stats = Counter()\n    for syms in words:\n        for a, b in zip(syms, syms[1:]):\n            stats[(a, b)] += 1\n    return stats\n\ndef merge_pair(words, pair):\n    a, b = pair\n    merged = a + b\n    out = []\n    for syms in words:\n        row, i = [], 0\n        while i < len(syms):\n            if i < len(syms) - 1 and syms[i] == a and syms[i + 1] == b:\n                row.append(merged); i += 2\n            else:\n                row.append(syms[i]); i += 1\n        out.append(row)\n    return out\n\nwords = [list(w) for w in ['low', 'low', 'lower', 'newer', 'newer']]\npair, _ = get_stats(words).most_common(1)[0]\nwords2 = merge_pair(words, pair)\nprint('merged pair:', pair)\nprint(words2)",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can measure token fertility on example text.",
            "reveal": "Many \"model bugs\" are tokenizer bugs: truncated prompts, split markers that break tool formats, whitespace-sensitive chat templates, or mismatched pad/eos handling between training and inference. Log the tokenized prompt in staging (IDs and decoded pieces) when outputs look inexplicable. For constrained formats (JSON tools, SQL), verify that structural characters are single tokens or at least stably tokenized so constrained decoding remains feasible.\n\nIn interviews and design docs, state which tokenizer version ships with the model, how context limits are enforced, and how user-visible character limits map to tokens. Tokenization is the first stage of every LLM system; treating it as infrastructure with metrics prevents expensive misdiagnosis further down the stack."
          }
        ]
      },
      {
        "id": "evaluate-tokenizers-with-length-and-fertility",
        "heading": "Evaluate tokenizers with length and fertility",
        "paragraphs": [
          "Tokenizer quality is not only linguistic elegance. Measure tokens per word (fertility), sequence length distributions, and unknown rates on held-out domain text. If a legal document averages 2.5 tokens/word with a general English tokenizer but 1.3 with a domain-adapted one, attention cost and latency change materially. Also inspect splits for names, numbers, and code. A tokenizer that breaks every digit separately may hurt arithmetic; one that over-merges code operators may hurt programming models. For this lab, compare whitespace, character, and a few BPE merges on the same sentences and report token counts. Interviewers appreciate candidates who connect tokenization metrics to cost and quality rather than treating tokenizers as black boxes. Keep a small dashboard of fertility by domain in real systems.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Fertility = tokens / words is a practical comparison metric.",
          "• Domain mismatch shows up as longer sequences and odd splits.",
          "• Numbers, names, and code deserve explicit tokenizer spot checks.",
          "Production lens — Tokenization as learned compression: Tokenizers turn raw text into integer IDs the model was trained to consume. Subword algorithms—BPE, WordPiece, Unigram—balance vocabulary size against sequence length by keeping frequent chunks intact and splitting rare strings. That is lossy compression with a model-specific codebook: the \"same\" sentence can become very different ID sequences under different tokenizers, and those IDs are not interchangeable across model families.\n\nSpecial tokens, normalization (Unicode, lowercasing, space markers), and pre-tokenization rules are part of the contract. Hand-editing token IDs without understanding BOS/EOS, padding, or mask tokens corrupts inputs silently. In RAG and agents, count tokens with the same tokenizer the model uses; character or whitespace heuristics drift from billed context and truncate mid-subword in surprising ways."
        ],
        "keyTerms": [
          {
            "term": "Fertility = tokens / words is",
            "definition": "Fertility = tokens / words is a practical comparison metric."
          },
          {
            "term": "Domain mismatch shows up as longer",
            "definition": "Domain mismatch shows up as longer sequences and odd splits."
          },
          {
            "term": "Numbers, names, and code deserve explicit",
            "definition": "Numbers, names, and code deserve explicit tokenizer spot checks."
          }
        ],
        "workedExample": {
          "title": "Compare fertility across tokenizers",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "text = 'newer lower transformers attend carefully'\nwords = text.split()\nws_tokens = words\nchar_tokens = list(text.replace(' ', ''))\nbpe_tokens = ['new', 'er', 'low', 'er', 'transform', 'ers', 'attend', 'care', 'fully']\nfor name, toks in [('whitespace', ws_tokens), ('char', char_tokens), ('bpe-ish', bpe_tokens)]:\n    print(name, 'tokens', len(toks), 'fertility', round(len(toks) / len(words), 3))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can explain why tokenizer versioning matters in production.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to evaluate tokenizers with length and fertility."
          }
        ]
      },
      {
        "id": "interview-talking-points-that-sound-senior",
        "heading": "Interview talking points that sound senior",
        "paragraphs": [
          "Be ready to explain why LLMs use subwords, how vocabulary size affects embedding parameters, and what happens with multilingual text when a tokenizer was trained mostly on English. Mention normalization (Unicode, lowercasing, NFKC) as a silent source of train/serve mismatch. Discuss special tokens for chat templates and why changing tokenizer/template without adapting the model breaks behavior. If asked to implement something, a pair-counting merge loop is a classic whiteboard exercise. If asked about production, talk about versioning tokenizer files with model artifacts so ids never drift between training and inference. Strong candidates also mention that detokenization and trailing spaces can affect exact string match evaluations.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Version tokenizer artifacts with the model.",
          "• Normalization mismatches create invisible production bugs.",
          "• Chat/special tokens are part of the product contract, not an afterthought.",
          "Production lens — Fertility drives cost and fairness: Fertility—tokens per word or per character—determines how fast you burn context length and money. Code with long identifiers, JSON, and some non-English scripts often tokenize poorly under general English-centric vocabularies, so a fixed character budget becomes an unfair or inefficient token budget. Measure fertility on your real corpora (code vs prose vs languages) before blaming the model for \"short\" context.\n\nProduct limits should follow tokens, not characters, and may need language-aware or domain-aware policy. A code-oriented tokenizer or light preprocessing (normalizing identifiers, stripping inert boilerplate) can fit more useful signal per window than blindly buying a longer context. Interview answers that connect tokenization to latency, cost, and multilingual equity score higher than answers that treat tokenizers as an opaque library call."
        ],
        "keyTerms": [
          {
            "term": "Version tokenizer artifacts with the model.",
            "definition": "Version tokenizer artifacts with the model."
          },
          {
            "term": "Normalization mismatches create invisible pro…",
            "definition": "Normalization mismatches create invisible production bugs."
          },
          {
            "term": "Chat/special tokens are part of the",
            "definition": "Chat/special tokens are part of the product contract, not an afterthought."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Interview framing: define the term, give a tiny example, say when you would not use it, and name the metric that proves it worked."
        }
      },
      {
        "id": "failure-modes",
        "heading": "Failure modes and anti-patterns",
        "paragraphs": [
          "Most interview answers fail not because the definition is wrong, but because the candidate never names how the approach breaks. Use this section as a trap checklist for tokenization workshop.",
          "Trap: Ignoring punctuation and casing in naive whitespace tokenization. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Assuming character tokenization is free because the vocab is small. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Implementing merges without preserving merge order for encoding. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Forgetting special tokens when designing a vocabulary. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Shipping a model with a different tokenizer than it was trained with. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first."
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name a failure mode, you do not yet understand the technique well enough to ship or defend it."
        },
        "checkYourself": [
          {
            "prompt": "Pick the most dangerous pitfall for Tokenization workshop and explain how you would detect it in production or on a whiteboard.",
            "reveal": "Start with: \"Ignoring punctuation and casing in naive whitespace tokenization.\" Then add a detection signal (metric, test, or review question) and a mitigation."
          }
        ]
      },
      {
        "id": "deeper-lens",
        "heading": "A deeper production lens",
        "paragraphs": [
          "Tokenization as learned compression. Tokenizers turn raw text into integer IDs the model was trained to consume. Subword algorithms—BPE, WordPiece, Unigram—balance vocabulary size against sequence length by keeping frequent chunks intact and splitting rare strings. That is lossy compression with a model-specific codebook: the \"same\" sentence can become very different ID sequences under different tokenizers, and those IDs are not interchangeable across model families.\n\nSpecial tokens, normalization (Unicode, lowercasing, space markers), and pre-tokenization rules are part of the contract. Hand-editing token IDs without understanding BOS/EOS, padding, or mask tokens corrupts inputs silently. In RAG and agents, count tokens with the same tokenizer the model uses; character or whitespace heuristics drift from billed context and truncate mid-subword in surprising ways.",
          "Fertility drives cost and fairness. Fertility—tokens per word or per character—determines how fast you burn context length and money. Code with long identifiers, JSON, and some non-English scripts often tokenize poorly under general English-centric vocabularies, so a fixed character budget becomes an unfair or inefficient token budget. Measure fertility on your real corpora (code vs prose vs languages) before blaming the model for \"short\" context.\n\nProduct limits should follow tokens, not characters, and may need language-aware or domain-aware policy. A code-oriented tokenizer or light preprocessing (normalizing identifiers, stripping inert boilerplate) can fit more useful signal per window than blindly buying a longer context. Interview answers that connect tokenization to latency, cost, and multilingual equity score higher than answers that treat tokenizers as an opaque library call.",
          "Domain mismatch and vocab strategy. Medical notes, legalese, log lines, and programming languages expose domain mismatch: pieces that should be atomic split into many tokens, while irrelevant common words occupy vocab slots. Options include continuing tokenizer training / adding vocab for a domain (with embedding resize and continued model training), choosing a model whose tokenizer already fits the domain, or accepting higher fertility and budgeting for it. There is no free lunch—new tokens need learned embeddings.\n\nWhen evaluating tokenizer changes, track not only compression but downstream retrieval and generation quality. A more compact tokenization that destroys meaningful boundaries can hurt. Round-trip encode/decode fidelity, unknown-token rates, and fertility by slice are the basic dashboard. Never assume two \"open\" models share tokenization even if both claim similar parameter counts.",
          "Debugging tokenization in systems. Many \"model bugs\" are tokenizer bugs: truncated prompts, split markers that break tool formats, whitespace-sensitive chat templates, or mismatched pad/eos handling between training and inference. Log the tokenized prompt in staging (IDs and decoded pieces) when outputs look inexplicable. For constrained formats (JSON tools, SQL), verify that structural characters are single tokens or at least stably tokenized so constrained decoding remains feasible.\n\nIn interviews and design docs, state which tokenizer version ships with the model, how context limits are enforced, and how user-visible character limits map to tokens. Tokenization is the first stage of every LLM system; treating it as infrastructure with metrics prevents expensive misdiagnosis further down the stack."
        ],
        "keyTerms": [
          {
            "term": "Tokenization as learned compression",
            "definition": "Tokenizers turn raw text into integer IDs the model was trained to consume. Subword algorithms—BPE, WordPiece, Unigram—balance vocabulary size against sequence length by keeping frequent chunks intact and splitting rare …"
          },
          {
            "term": "Fertility drives cost and fairness",
            "definition": "Fertility—tokens per word or per character—determines how fast you burn context length and money. Code with long identifiers, JSON, and some non-English scripts often tokenize poorly under general English-centric vocabul…"
          },
          {
            "term": "Domain mismatch and vocab strategy",
            "definition": "Medical notes, legalese, log lines, and programming languages expose domain mismatch: pieces that should be atomic split into many tokens, while irrelevant common words occupy vocab slots. Options include continuing toke…"
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "These notes stretch past the primer. Reach for them when the interviewer asks what you would worry about at scale."
        }
      },
      {
        "id": "synthesis",
        "heading": "Putting it together",
        "paragraphs": [
          "You should now be able to teach tokenization workshop as a story: what problem it solves, how the mechanism works, which assumptions it depends on, and how you would know it failed.",
          "Close the loop by writing a 90-second spoken answer out loud. If you freeze on definitions, return to the orientation and the first technical part. If you freeze on trade-offs, return to failure modes.",
          "Practice prompts from this lesson: Why do modern LLMs use subword tokenization? | How does vocabulary size affect model parameters and sequence length? | Walk through one BPE merge step on a tiny corpus."
        ],
        "checkYourself": [
          {
            "prompt": "Give a 90-second spoken overview of Tokenization workshop as if starting an interview answer.",
            "reveal": "Structure: (1) one-sentence definition, (2) one concrete example, (3) one trade-off or limitation, (4) one metric or validation step. Keep jargon only where it earns precision."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Strong candidates narrate decisions. Weak candidates list buzzwords. Prefer a small correct example over a broad incomplete taxonomy."
        }
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Can contrast whitespace, character, and subword tokenization tradeoffs.",
        "Can estimate embedding parameters from vocabulary size.",
        "Can implement pair counting and one BPE-like merge step.",
        "Can measure token fertility on example text.",
        "Can explain why tokenizer versioning matters in production."
      ],
      "nextSteps": [
        "Return to the lesson page and attempt the practice / topic lab with this chapter still open if needed.",
        "Revisit any Check yourself prompts you could not answer out loud.",
        "Optional deeper reading: Neural Machine Translation of Rare Words with Subword Units (arXiv) — https://arxiv.org/abs/1508.07909",
        "Optional deeper reading: Hugging Face Tokenizers documentation (Hugging Face) — https://huggingface.co/docs/tokenizers/index"
      ]
    }
  },
  "llm-retrieval-lab/embeddings-and-similarity-lab": {
    "title": "Chapter: Embeddings and similarity lab",
    "readingTime": "55-70 min",
    "premise": "Build bag-of-words and hashing embeddings, compute cosine similarity, and implement top-k retrieval with NumPy and scikit-learn. This Learn chapter expands the short lesson summary into a full study unit you can read continuously, with interactive checks and selection-based AI search when a phrase needs a second opinion.",
    "parts": [
      {
        "id": "orientation",
        "heading": "Why this chapter exists",
        "paragraphs": [
          "Retrieval systems stand on embedding geometry. If you can build simple vectorizers and rank documents by cosine similarity, you can reason about semantic search, RAG chunk stores, and nearest-neighbor evaluation without treating embeddings as magic.",
          "This chapter treats \"Embeddings and similarity lab\" as a readable study unit: intuition first, then the mechanics you must be able to explain, then the failure modes that show up in interviews and production, and finally how to talk about the topic under time pressure.",
          "Read it like a book chapter. When a phrase is unclear, select it inside the Learn reader and use Search with AI to open Google, Perplexity, or DuckDuckGo without abandoning the chapter."
        ],
        "callout": {
          "tone": "tip",
          "body": "Target reading time is paced for depth, not skimming. Pause at each Check yourself prompt and answer out loud before revealing the guide answer."
        }
      },
      {
        "id": "embeddings-place-text-in-a-vector-space",
        "heading": "Embeddings place text in a vector space",
        "paragraphs": [
          "An embedding maps a document or query to a vector so that related texts are near each other under a chosen metric. Classic bag-of-words (BoW) counts how often each vocabulary term appears. If the vocabulary is [attention, mask, token, loss], the sentence 'attention mask' becomes [1, 1, 0, 0]. TF-IDF reweights counts so common words contribute less. Hashing embeddings skip a fitted vocabulary by hashing terms into a fixed number of buckets; collisions happen, but the vector size stays bounded. Dense neural embeddings are popular in production LLMs, yet the geometry lessons are the same: choose a representation, define similarity, retrieve neighbors, and measure whether the right documents rank highly. Start with BoW so every dimension is inspectable.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Sparse BoW vectors are interpretable because dimensions are terms.",
          "• Hashing trades interpretability for a fixed-width feature space.",
          "• Dense embeddings compress meaning but need learned encoders.",
          "Production lens — Geometry depends on the metric contract: Dense embeddings place text in a vector space where nearby points should be semantically related for your task. Cosine similarity cares about angle; dot product cares about angle and magnitude; Euclidean distance is another geometry again. If you L2-normalize vectors, cosine similarity and inner product agree. If you do not normalize but your ANN index assumes inner product, offline cosine experiments will not match online ranking.\n\nStandardize the contract: train or evaluate with the same similarity the index uses, document normalization in the index config, and freeze that choice across offline eval, online retrieval, and re-ranking. Metric mismatch is one of the highest-frequency reasons \"embedding improvements\" disappear in production. For hybrid search, keep dense scores calibrated or fused carefully with BM25 so one channel does not dominate by raw scale."
        ],
        "keyTerms": [
          {
            "term": "Sparse BoW vectors are interpretable because",
            "definition": "Sparse BoW vectors are interpretable because dimensions are terms."
          },
          {
            "term": "Hashing trades interpretability for a fixed-w…",
            "definition": "Hashing trades interpretability for a fixed-width feature space."
          },
          {
            "term": "Dense embeddings compress meaning but need",
            "definition": "Dense embeddings compress meaning but need learned encoders."
          }
        ],
        "workedExample": {
          "title": "Bag-of-words vectors with CountVectorizer",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "from sklearn.feature_extraction.text import CountVectorizer\nimport numpy as np\n\ndocs = [\n    'attention is a weighted sum of values',\n    'causal masks block future tokens',\n    'tokenization splits text into subwords',\n]\nvec = CountVectorizer()\nX = vec.fit_transform(docs).toarray()\nprint(vec.get_feature_names_out())\nprint(X)",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can build BoW/TF-IDF vectors with scikit-learn.",
            "reveal": "Dense embeddings place text in a vector space where nearby points should be semantically related for your task. Cosine similarity cares about angle; dot product cares about angle and magnitude; Euclidean distance is another geometry again. If you L2-normalize vectors, cosine similarity and inner product agree. If you do not normalize but your ANN index assumes inner product, offline cosine experiments will not match online ranking.\n\nStandardize the contract: train or evaluate with the same similarity the index uses, document normalization in the index config, and freeze that choice across offline eval, online retrieval, and re-ranking. Metric mismatch is one of the highest-frequency reasons \"embedding improvements\" disappear in production. For hybrid search, keep dense scores calibrated or fused carefully with BM25 so one channel does not dominate by raw scale."
          }
        ]
      },
      {
        "id": "cosine-similarity-focuses-on-direction",
        "heading": "Cosine similarity focuses on direction",
        "paragraphs": [
          "Euclidean distance is sensitive to vector length. A long document with many repeated terms can have a huge BoW norm and look far from a short related query even if they share the same direction. Cosine similarity is cos(theta) = (a · b) / (||a|| ||b||), which ignores magnitude. Values range from -1 to 1 for real vectors; for non-negative BoW counts they fall in [0, 1]. Example: a=[1,1,0], b=[2,2,0], c=[0,0,1]. cos(a,b)=1 even though b is longer; cos(a,c)=0. In retrieval, score every document by cosine against the query vector and take the top k. Always L2-normalize rows if you want cosine to become a simple dot product, which is a common ANN optimization.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Cosine similarity removes pure length effects.",
          "• For non-negative BoW features, cosine is between 0 and 1.",
          "• Normalized vectors let you rank by dot product alone.",
          "Production lens — Hard negatives sharpen the boundary: Random in-batch negatives are often too easy: the model only learns coarse topical separation. Hard negatives—near neighbors that are wrong for the query, such as refund shipping delays versus refund payment failures in an FAQ—force the embedding space to separate confusable intents. Mine them from a current index (top-k wrong documents), review for label noise, and retrain or fine-tune with those pairs.\n\nError analysis should feed the next mining round. If the same confusion class keeps winning, add targeted pairs or fix chunking so documents are not mixing intents. Easy-pair loss curves can look healthy while retrieval@k stays flat; always judge embeddings with retrieval metrics on a labeled query set, not only with intrinsic similarity on hand-picked examples."
        ],
        "keyTerms": [
          {
            "term": "Cosine similarity removes pure length effects.",
            "definition": "Cosine similarity removes pure length effects."
          },
          {
            "term": "For non-negative BoW features, cosine is",
            "definition": "For non-negative BoW features, cosine is between 0 and 1."
          },
          {
            "term": "Normalized vectors let you rank by",
            "definition": "Normalized vectors let you rank by dot product alone."
          }
        ],
        "workedExample": {
          "title": "Cosine similarity matrix for tiny docs",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\nfrom sklearn.feature_extraction.text import TfidfVectorizer\nfrom sklearn.metrics.pairwise import cosine_similarity\n\ndocs = [\n    'scaled dot product attention',\n    'attention masks and softmax',\n    'gradient descent for linear regression',\n]\nX = TfidfVectorizer().fit_transform(docs)\nS = cosine_similarity(X)\nprint(np.round(S, 3))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can compute cosine similarity and explain why it ignores magnitude.",
            "reveal": "Random in-batch negatives are often too easy: the model only learns coarse topical separation. Hard negatives—near neighbors that are wrong for the query, such as refund shipping delays versus refund payment failures in an FAQ—force the embedding space to separate confusable intents. Mine them from a current index (top-k wrong documents), review for label noise, and retrain or fine-tune with those pairs.\n\nError analysis should feed the next mining round. If the same confusion class keeps winning, add targeted pairs or fix chunking so documents are not mixing intents. Easy-pair loss curves can look healthy while retrieval@k stays flat; always judge embeddings with retrieval metrics on a labeled query set, not only with intrinsic similarity on hand-picked examples."
          }
        ]
      },
      {
        "id": "hashing-embeddings-keep-width-fixed",
        "heading": "Hashing embeddings keep width fixed",
        "paragraphs": [
          "HashingVectorizer maps terms through a hash function into n_features buckets. You do not store a vocabulary dictionary, which helps streaming and memory. The cost is collisions: 'attention' and 'regression' might land in the same bucket and become indistinguishable on that axis. With enough features, collisions are rare for small corpora. In interviews, mention hashing when asked how to vectorize high-cardinality text features without maintaining a giant vocab. Practically, compare top-k retrieval quality for CountVectorizer vs HashingVectorizer on the same queries. If hashing collapses important terms, increase n_features or move to learned embeddings. Also note that hashing is one-way: you cannot easily inspect which term produced a coordinate.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Hashing enables fixed-size text features without a fitted vocab.",
          "• Collisions are the primary quality risk.",
          "• Increase n_features when retrieval quality drops from collisions.",
          "Production lens — Intrinsic scores need extrinsic eval: A high cosine between two sentences is meaningless if your task is FAQ retrieval, code search, or entity-heavy support tickets. Build golden queries with relevant document IDs and report recall@k, MRR, or nDCG. Slice by query type: navigational, conceptual, long-tail, adversarial paraphrases. Domain fine-tuning of a smaller embedding model often beats a larger general model on niche corpora when the eval matches production queries.\n\nWatch for train/eval leakage in embedding experiments too: queries paraphrased from the same template, or documents duplicated across splits, inflate metrics. When chunking changes, re-embed and re-eval; comparing scores across incompatible chunk inventories is not an A/B. The lab habit is closed-loop: change representation → rebuild index → measure retrieval → mine new hard negatives."
        ],
        "keyTerms": [
          {
            "term": "Hashing enables fixed-size text features without",
            "definition": "Hashing enables fixed-size text features without a fitted vocab."
          },
          {
            "term": "Collisions are the primary quality risk.",
            "definition": "Collisions are the primary quality risk."
          },
          {
            "term": "Increase n_features when retrieval quality drops",
            "definition": "Increase n_features when retrieval quality drops from collisions."
          }
        ],
        "workedExample": {
          "title": "Hashing vectorizer retrieval sketch",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "from sklearn.feature_extraction.text import HashingVectorizer\nfrom sklearn.metrics.pairwise import cosine_similarity\nimport numpy as np\n\ndocs = [\n    'kv cache speeds up autoregressive decoding',\n    'cosine similarity ranks related documents',\n    'dropout randomly zeros activations in training',\n]\nvec = HashingVectorizer(n_features=32, alternate_sign=False, norm='l2')\nX = vec.transform(docs)\nq = vec.transform(['how does kv caching help decoding'])\nscores = cosine_similarity(q, X).ravel()\nprint(list(np.round(scores, 3)))\nprint('top doc index:', int(scores.argmax()))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can use hashing vectorizers and describe collision tradeoffs.",
            "reveal": "A high cosine between two sentences is meaningless if your task is FAQ retrieval, code search, or entity-heavy support tickets. Build golden queries with relevant document IDs and report recall@k, MRR, or nDCG. Slice by query type: navigational, conceptual, long-tail, adversarial paraphrases. Domain fine-tuning of a smaller embedding model often beats a larger general model on niche corpora when the eval matches production queries.\n\nWatch for train/eval leakage in embedding experiments too: queries paraphrased from the same template, or documents duplicated across splits, inflate metrics. When chunking changes, re-embed and re-eval; comparing scores across incompatible chunk inventories is not an A/B. The lab habit is closed-loop: change representation → rebuild index → measure retrieval → mine new hard negatives."
          }
        ]
      },
      {
        "id": "top-k-retrieval-is-ranking-not-generation",
        "heading": "Top-k retrieval is ranking, not generation",
        "paragraphs": [
          "Given query q and document matrix X with rows as documents, compute scores = cosine(q, X), then choose the indices of the k largest scores. That is dense or sparse retrieval depending on the embedding type. Example: scores [0.12, 0.81, 0.44], k=2 -> indices [1, 2]. In RAG, those documents become context for a generator. Keep retrieval evaluation separate from generation quality: a perfect writer cannot fix missing evidence if the retriever never surfaces it. Implement argsort carefully: np.argsort(scores)[::-1][:k]. Ties can be broken by doc id for determinism. Also filter trivial matches like exact query duplicates when measuring generalization.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Retrieval returns ranked evidence; generation consumes it later.",
          "• Use stable top-k selection for reproducible experiments.",
          "• Evaluate retrievers before blaming the generator in RAG systems.",
          "Production lens — Operational properties of embedding spaces: Embedding dimension, quantization, and ANN parameters (HNSW M/ef, IVF lists, etc.) trade recall for latency and memory. Dimensionality reduction or int8/PQ compression can be fine if you re-validate recall@k. Version embeddings with model ID and chunking config; mixing vectors from two models in one index is undefined geometry. Schedule re-embeds when the encoder changes, and dual-read during migrations.\n\nAlso monitor query embedding drift and empty-result rates. Sudden shifts may mean tokenizer/model skew between services, not \"users changed.\" Treat the embedding service as a versioned contract: input text normalization, max tokens, similarity metric, and vector dim are as important as the neural weights."
        ],
        "keyTerms": [
          {
            "term": "Retrieval returns ranked evidence; generation…",
            "definition": "Retrieval returns ranked evidence; generation consumes it later."
          },
          {
            "term": "Use stable top-k selection for reproducible",
            "definition": "Use stable top-k selection for reproducible experiments."
          },
          {
            "term": "Evaluate retrievers before blaming the generator",
            "definition": "Evaluate retrievers before blaming the generator in RAG systems."
          }
        ],
        "workedExample": {
          "title": "Implement top-k indices",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "import numpy as np\n\nscores = np.array([0.12, 0.81, 0.44, 0.80])\nk = 2\ntop = np.argsort(scores)[::-1][:k]\nprint('top indices:', top)\nprint('top scores:', scores[top])",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can implement top-k document retrieval for a query.",
            "reveal": "Embedding dimension, quantization, and ANN parameters (HNSW M/ef, IVF lists, etc.) trade recall for latency and memory. Dimensionality reduction or int8/PQ compression can be fine if you re-validate recall@k. Version embeddings with model ID and chunking config; mixing vectors from two models in one index is undefined geometry. Schedule re-embeds when the encoder changes, and dual-read during migrations.\n\nAlso monitor query embedding drift and empty-result rates. Sudden shifts may mean tokenizer/model skew between services, not \"users changed.\" Treat the embedding service as a versioned contract: input text normalization, max tokens, similarity metric, and vector dim are as important as the neural weights."
          }
        ]
      },
      {
        "id": "build-a-mini-search-index-end-to-end",
        "heading": "Build a mini search index end to end",
        "paragraphs": [
          "A workshop-scale pipeline: fit a TF-IDF vectorizer on a corpus, transform documents once, store the sparse or dense matrix, transform each query with the same vectorizer, compute cosine similarities, return top-k texts. This is enough to demo semantic-ish search for shared terminology. Limitations are obvious: synonyms ('mask' vs 'blocking future tokens') may not match without denser embeddings; word order is weak in bag-of-words; long documents dominate unless you chunk. Still, interviewers often ask for a baseline before neural retrieval. Being able to code this baseline in a few minutes with sklearn shows practical competence. Add a simple invert index mental model too: term -> posting list, even if you use vectorized cosine for the exercise.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Fit vectorizers on the corpus, then transform queries with the same fitted object.",
          "• Chunk long documents before embedding for fairer retrieval.",
          "• Keep a lexical baseline even when testing dense retrievers.",
          "Production lens — Geometry depends on the metric contract: Dense embeddings place text in a vector space where nearby points should be semantically related for your task. Cosine similarity cares about angle; dot product cares about angle and magnitude; Euclidean distance is another geometry again. If you L2-normalize vectors, cosine similarity and inner product agree. If you do not normalize but your ANN index assumes inner product, offline cosine experiments will not match online ranking.\n\nStandardize the contract: train or evaluate with the same similarity the index uses, document normalization in the index config, and freeze that choice across offline eval, online retrieval, and re-ranking. Metric mismatch is one of the highest-frequency reasons \"embedding improvements\" disappear in production. For hybrid search, keep dense scores calibrated or fused carefully with BM25 so one channel does not dominate by raw scale."
        ],
        "keyTerms": [
          {
            "term": "Fit vectorizers on the corpus, then",
            "definition": "Fit vectorizers on the corpus, then transform queries with the same fitted object."
          },
          {
            "term": "Chunk long documents before embedding for",
            "definition": "Chunk long documents before embedding for fairer retrieval."
          },
          {
            "term": "Keep a lexical baseline even when",
            "definition": "Keep a lexical baseline even when testing dense retrievers."
          }
        ],
        "workedExample": {
          "title": "End-to-end TF-IDF top-k search",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "from sklearn.feature_extraction.text import TfidfVectorizer\nfrom sklearn.metrics.pairwise import cosine_similarity\nimport numpy as np\n\ncorpus = [\n    'Positional encodings add order information to transformers.',\n    'Dropout reduces overfitting by randomly zeroing units.',\n    'Causal masks prevent attending to future tokens.',\n    'Batch normalization stabilizes deep network training.',\n]\nvectorizer = TfidfVectorizer()\ndoc_m = vectorizer.fit_transform(corpus)\nquery = 'How do causal masks protect autoregressive decoding?'\nscores = cosine_similarity(vectorizer.transform([query]), doc_m).ravel()\nfor idx in np.argsort(scores)[::-1][:2]:\n    print(round(float(scores[idx]), 3), corpus[idx])",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can outline how dense embeddings plug into the same ranking pattern.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to build a mini search index end to end."
          }
        ]
      },
      {
        "id": "what-to-say-about-neural-embeddings-without-using-them-here",
        "heading": "What to say about neural embeddings without using them here",
        "paragraphs": [
          "In production RAG you may call an embedding API or local encoder that returns 384- to 3072-dimensional dense vectors. The retrieval math remains cosine or dot product over an index such as FAISS or a vector database. The failure modes also rhyme with this lab: domain shift, poor chunking, and metric mismatch. Mentally replace CountVectorizer rows with dense rows and the rest of your top-k code stays. Interview strength comes from knowing when sparse lexical retrieval beats dense retrieval (exact identifiers, error codes) and when dense wins (paraphrases). Hybrid retrieval often combines both scores. This lesson stays on sklearn/NumPy so it runs in Pyodide, while still preparing you to discuss denser systems.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Dense retrieval changes the encoder, not the ranking skeleton.",
          "• Hybrid lexical-plus-dense ranking is a common production pattern.",
          "• Chunking and metric choice often matter more than tiny model upgrades.",
          "Production lens — Hard negatives sharpen the boundary: Random in-batch negatives are often too easy: the model only learns coarse topical separation. Hard negatives—near neighbors that are wrong for the query, such as refund shipping delays versus refund payment failures in an FAQ—force the embedding space to separate confusable intents. Mine them from a current index (top-k wrong documents), review for label noise, and retrain or fine-tune with those pairs.\n\nError analysis should feed the next mining round. If the same confusion class keeps winning, add targeted pairs or fix chunking so documents are not mixing intents. Easy-pair loss curves can look healthy while retrieval@k stays flat; always judge embeddings with retrieval metrics on a labeled query set, not only with intrinsic similarity on hand-picked examples."
        ],
        "keyTerms": [
          {
            "term": "Dense retrieval changes the encoder, not",
            "definition": "Dense retrieval changes the encoder, not the ranking skeleton."
          },
          {
            "term": "Hybrid lexical-plus-dense ranking is a common",
            "definition": "Hybrid lexical-plus-dense ranking is a common production pattern."
          },
          {
            "term": "Chunking and metric choice often matter",
            "definition": "Chunking and metric choice often matter more than tiny model upgrades."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Interview framing: define the term, give a tiny example, say when you would not use it, and name the metric that proves it worked."
        }
      },
      {
        "id": "failure-modes",
        "heading": "Failure modes and anti-patterns",
        "paragraphs": [
          "Most interview answers fail not because the definition is wrong, but because the candidate never names how the approach breaks. Use this section as a trap checklist for embeddings and similarity lab.",
          "Trap: Fitting a vectorizer on queries and documents inconsistently. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Using Euclidean distance on raw counts without considering length bias. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Choosing too few hashing features and suffering collisions. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Evaluating RAG generators while ignoring retriever recall. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Embedding entire long documents without chunking. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first."
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name a failure mode, you do not yet understand the technique well enough to ship or defend it."
        },
        "checkYourself": [
          {
            "prompt": "Pick the most dangerous pitfall for Embeddings and similarity lab and explain how you would detect it in production or on a whiteboard.",
            "reveal": "Start with: \"Fitting a vectorizer on queries and documents inconsistently.\" Then add a detection signal (metric, test, or review question) and a mitigation."
          }
        ]
      },
      {
        "id": "deeper-lens",
        "heading": "A deeper production lens",
        "paragraphs": [
          "Geometry depends on the metric contract. Dense embeddings place text in a vector space where nearby points should be semantically related for your task. Cosine similarity cares about angle; dot product cares about angle and magnitude; Euclidean distance is another geometry again. If you L2-normalize vectors, cosine similarity and inner product agree. If you do not normalize but your ANN index assumes inner product, offline cosine experiments will not match online ranking.\n\nStandardize the contract: train or evaluate with the same similarity the index uses, document normalization in the index config, and freeze that choice across offline eval, online retrieval, and re-ranking. Metric mismatch is one of the highest-frequency reasons \"embedding improvements\" disappear in production. For hybrid search, keep dense scores calibrated or fused carefully with BM25 so one channel does not dominate by raw scale.",
          "Hard negatives sharpen the boundary. Random in-batch negatives are often too easy: the model only learns coarse topical separation. Hard negatives—near neighbors that are wrong for the query, such as refund shipping delays versus refund payment failures in an FAQ—force the embedding space to separate confusable intents. Mine them from a current index (top-k wrong documents), review for label noise, and retrain or fine-tune with those pairs.\n\nError analysis should feed the next mining round. If the same confusion class keeps winning, add targeted pairs or fix chunking so documents are not mixing intents. Easy-pair loss curves can look healthy while retrieval@k stays flat; always judge embeddings with retrieval metrics on a labeled query set, not only with intrinsic similarity on hand-picked examples.",
          "Intrinsic scores need extrinsic eval. A high cosine between two sentences is meaningless if your task is FAQ retrieval, code search, or entity-heavy support tickets. Build golden queries with relevant document IDs and report recall@k, MRR, or nDCG. Slice by query type: navigational, conceptual, long-tail, adversarial paraphrases. Domain fine-tuning of a smaller embedding model often beats a larger general model on niche corpora when the eval matches production queries.\n\nWatch for train/eval leakage in embedding experiments too: queries paraphrased from the same template, or documents duplicated across splits, inflate metrics. When chunking changes, re-embed and re-eval; comparing scores across incompatible chunk inventories is not an A/B. The lab habit is closed-loop: change representation → rebuild index → measure retrieval → mine new hard negatives.",
          "Operational properties of embedding spaces. Embedding dimension, quantization, and ANN parameters (HNSW M/ef, IVF lists, etc.) trade recall for latency and memory. Dimensionality reduction or int8/PQ compression can be fine if you re-validate recall@k. Version embeddings with model ID and chunking config; mixing vectors from two models in one index is undefined geometry. Schedule re-embeds when the encoder changes, and dual-read during migrations.\n\nAlso monitor query embedding drift and empty-result rates. Sudden shifts may mean tokenizer/model skew between services, not \"users changed.\" Treat the embedding service as a versioned contract: input text normalization, max tokens, similarity metric, and vector dim are as important as the neural weights."
        ],
        "keyTerms": [
          {
            "term": "Geometry depends on the metric contract",
            "definition": "Dense embeddings place text in a vector space where nearby points should be semantically related for your task. Cosine similarity cares about angle; dot product cares about angle and magnitude; Euclidean distance is anot…"
          },
          {
            "term": "Hard negatives sharpen the boundary",
            "definition": "Random in-batch negatives are often too easy: the model only learns coarse topical separation. Hard negatives—near neighbors that are wrong for the query, such as refund shipping delays versus refund payment failures in …"
          },
          {
            "term": "Intrinsic scores need extrinsic eval",
            "definition": "A high cosine between two sentences is meaningless if your task is FAQ retrieval, code search, or entity-heavy support tickets. Build golden queries with relevant document IDs and report recall@k, MRR, or nDCG. Slice by …"
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "These notes stretch past the primer. Reach for them when the interviewer asks what you would worry about at scale."
        }
      },
      {
        "id": "synthesis",
        "heading": "Putting it together",
        "paragraphs": [
          "You should now be able to teach embeddings and similarity lab as a story: what problem it solves, how the mechanism works, which assumptions it depends on, and how you would know it failed.",
          "Close the loop by writing a 90-second spoken answer out loud. If you freeze on definitions, return to the orientation and the first technical part. If you freeze on trade-offs, return to failure modes.",
          "Practice prompts from this lesson: How does cosine similarity differ from Euclidean distance for text vectors? | When would you prefer hashing vectorizers over a fitted vocabulary? | How would you implement top-k retrieval for TF-IDF documents?"
        ],
        "checkYourself": [
          {
            "prompt": "Give a 90-second spoken overview of Embeddings and similarity lab as if starting an interview answer.",
            "reveal": "Structure: (1) one-sentence definition, (2) one concrete example, (3) one trade-off or limitation, (4) one metric or validation step. Keep jargon only where it earns precision."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Strong candidates narrate decisions. Weak candidates list buzzwords. Prefer a small correct example over a broad incomplete taxonomy."
        }
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Can build BoW/TF-IDF vectors with scikit-learn.",
        "Can compute cosine similarity and explain why it ignores magnitude.",
        "Can use hashing vectorizers and describe collision tradeoffs.",
        "Can implement top-k document retrieval for a query.",
        "Can outline how dense embeddings plug into the same ranking pattern."
      ],
      "nextSteps": [
        "Return to the lesson page and attempt the practice / topic lab with this chapter still open if needed.",
        "Revisit any Check yourself prompts you could not answer out loud.",
        "Optional deeper reading: Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks (arXiv) — https://arxiv.org/abs/1908.10084",
        "Optional deeper reading: Dense Passage Retrieval for Open-Domain Question Answering (arXiv) — https://arxiv.org/abs/2004.04906"
      ]
    }
  },
  "llm-retrieval-lab/rag-evaluation-workshop": {
    "title": "Chapter: RAG evaluation workshop",
    "readingTime": "60-75 min",
    "premise": "Chunk documents, measure retrieval with recall@k and MRR, and run simple grounded-answer checks using string overlap—all in NumPy/sklearn-friendly Python. This Learn chapter expands the short lesson summary into a full study unit you can read continuously, with interactive checks and selection-based AI search when a phrase needs a second opinion.",
    "parts": [
      {
        "id": "orientation",
        "heading": "Why this chapter exists",
        "paragraphs": [
          "RAG systems fail in distinct stages: chunking, retrieval, and grounded generation. Interviewers want candidates who can measure each stage instead of only demoing a happy-path answer.",
          "This chapter treats \"RAG evaluation workshop\" as a readable study unit: intuition first, then the mechanics you must be able to explain, then the failure modes that show up in interviews and production, and finally how to talk about the topic under time pressure.",
          "Read it like a book chapter. When a phrase is unclear, select it inside the Learn reader and use Search with AI to open Google, Perplexity, or DuckDuckGo without abandoning the chapter."
        ],
        "callout": {
          "tone": "tip",
          "body": "Target reading time is paced for depth, not skimming. Pause at each Check yourself prompt and answer out loud before revealing the guide answer."
        }
      },
      {
        "id": "rag-is-a-pipeline-with-separable-failure-modes",
        "heading": "RAG is a pipeline with separable failure modes",
        "paragraphs": [
          "Retrieval-augmented generation first finds evidence, then asks a model to answer using that evidence. If retrieval misses the needed chunk, the generator may hallucinate confidently. If retrieval is fine but the prompt is weak, the model may ignore evidence. If both are fine but evaluation only checks fluent answers, you can ship grounded-looking falsehoods. A practical evaluation stack measures: (1) chunk coverage and sizes, (2) retrieval recall@k / MRR against labeled relevant docs, (3) answer groundedness via overlap or entailment-style checks, and (4) final task metrics such as exact match or rubric scores. This lesson implements (1)-(3) with simple tools that run in-browser. Keep the stages separate in dashboards and in interview answers.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Evaluate retrieval before judging generator quality.",
          "• Chunking choices change both recall and noise in context windows.",
          "• Groundedness checks whether answers stick to retrieved evidence.",
          "Production lens — Retrieval quality is the ceiling: RAG systems have at least two stages: retrieve evidence, then generate an answer conditioned on that evidence. If the right chunks never enter the context window, no prompt tweak can ground the answer in them. Measure recall@k, precision@k, and nDCG on a labeled retrieval set before spending weeks on prompt wording. Component metrics turn \"the bot is wrong\" into \"chunking misses section headers\" or \"hybrid fusion under-weights BM25.\"\n\nEnd-to-end scores alone conflate failures. An LLM-as-judge helpfulness number can stay flat while you fix retrieval, or look good while the model hallucinates fluently past weak evidence. Always keep a retrieval dashboard next to answer quality. The practical rule: raise the retrieval ceiling first, then tune generation under the constraint of real top-k context."
        ],
        "keyTerms": [
          {
            "term": "Evaluate retrieval before judging generator q…",
            "definition": "Evaluate retrieval before judging generator quality."
          },
          {
            "term": "Chunking choices change both recall and",
            "definition": "Chunking choices change both recall and noise in context windows."
          },
          {
            "term": "Groundedness checks whether answers stick to",
            "definition": "Groundedness checks whether answers stick to retrieved evidence."
          }
        ],
        "workedExample": {
          "title": "Tiny RAG stages as data structures",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "query = 'What does a causal mask do?'\nchunks = [\n    'Causal masks block future tokens during decoding.',\n    'Dropout randomly zeroes activations during training.',\n]\nretrieved = [chunks[0]]\nanswer = 'A causal mask prevents attending to future tokens.'\nprint({'query': query, 'retrieved': retrieved, 'answer': answer})",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can chunk text with fixed windows and overlap.",
            "reveal": "RAG systems have at least two stages: retrieve evidence, then generate an answer conditioned on that evidence. If the right chunks never enter the context window, no prompt tweak can ground the answer in them. Measure recall@k, precision@k, and nDCG on a labeled retrieval set before spending weeks on prompt wording. Component metrics turn \"the bot is wrong\" into \"chunking misses section headers\" or \"hybrid fusion under-weights BM25.\"\n\nEnd-to-end scores alone conflate failures. An LLM-as-judge helpfulness number can stay flat while you fix retrieval, or look good while the model hallucinates fluently past weak evidence. Always keep a retrieval dashboard next to answer quality. The practical rule: raise the retrieval ceiling first, then tune generation under the constraint of real top-k context."
          }
        ]
      },
      {
        "id": "chunking-trades-context-completeness-against-precision",
        "heading": "Chunking trades context completeness against precision",
        "paragraphs": [
          "Long documents rarely fit into prompts and dilute embeddings. Chunking splits them into passages. Fixed-size character or token windows with overlap are common baselines. Example: text length 1000, chunk 300, overlap 50 -> starts at 0, 250, 500, 750. Too-small chunks lose surrounding definitions; too-large chunks add irrelevant sentences and hurt cosine ranking. Overlap reduces boundary tears where an answer spans two windows. In interviews, mention structure-aware chunking (by headings, paragraphs, functions) as an improvement over naive windows. For evaluation, store chunk_id and parent_doc_id so you can compute document-level or chunk-level recall. Always log chunk length histograms; extreme lengths are a smell.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Overlap helps when answers cross chunk boundaries.",
          "• Track parent document ids for aggregation metrics.",
          "• Prefer structure-aware splits when documents have clear sections.",
          "Production lens — Faithfulness versus fluency: Users punish confident fabrication more than short refusals. Faithfulness/groundedness checks ask whether claims in the answer are supported by retrieved snippets—via NLI-style models, citation coverage, or LLM-as-judge protocols that only see the evidence. Helpfulness without faithfulness rewards eloquent lies. Make groundedness a release gate alongside latency and cost.\n\nDesign failure modes deliberately: refuse when evidence is weak, ask a clarifying question when the query is ambiguous, or cite snippets so users can verify. Adversarial and out-of-corpus queries belong in the golden set. A demo that answers everything from parametric memory is not a RAG success; it is an untested hallucination path."
        ],
        "keyTerms": [
          {
            "term": "Overlap helps when answers cross chunk",
            "definition": "Overlap helps when answers cross chunk boundaries."
          },
          {
            "term": "Track parent document ids for aggregation",
            "definition": "Track parent document ids for aggregation metrics."
          },
          {
            "term": "Prefer structure-aware splits when documents …",
            "definition": "Prefer structure-aware splits when documents have clear sections."
          }
        ],
        "workedExample": {
          "title": "Fixed-window chunking with overlap",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "def chunk_text(text, size=40, overlap=10):\n    chunks, start = [], 0\n    while start < len(text):\n        end = min(len(text), start + size)\n        chunks.append(text[start:end])\n        if end == len(text):\n            break\n        start += size - overlap\n    return chunks\n\ntext = 'Causal masks block future tokens. Softmax turns scores into weights. Values are mixed by those weights.'\nfor i, ch in enumerate(chunk_text(text, size=45, overlap=12)):\n    print(i, repr(ch))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can compute recall@k from relevant and retrieved ids.",
            "reveal": "Users punish confident fabrication more than short refusals. Faithfulness/groundedness checks ask whether claims in the answer are supported by retrieved snippets—via NLI-style models, citation coverage, or LLM-as-judge protocols that only see the evidence. Helpfulness without faithfulness rewards eloquent lies. Make groundedness a release gate alongside latency and cost.\n\nDesign failure modes deliberately: refuse when evidence is weak, ask a clarifying question when the query is ambiguous, or cite snippets so users can verify. Adversarial and out-of-corpus queries belong in the golden set. A demo that answers everything from parametric memory is not a RAG success; it is an untested hallucination path."
          }
        ]
      },
      {
        "id": "recall-k-asks-whether-evidence-made-the-shortlist",
        "heading": "Recall@k asks whether evidence made the shortlist",
        "paragraphs": [
          "For one query, let R be the set of relevant chunk ids and let Pred_k be the top-k retrieved ids. Recall@k = |R intersect Pred_k| / |R|. If two chunks are relevant and top-3 retrieval finds one, recall@3 is 0.5. Macro-average over queries for a dataset score. Recall ignores order except through k. It answers: did we fetch enough evidence for the generator to have a chance? If recall@5 is 0.4, improving the prompt alone is unlikely to fix correctness. Use labeled pairs (query -> relevant chunk ids) from synthetic or hand-built sets in workshops; production systems may derive labels from clicks or adjudicated eval sets. Report confidence intervals when n_queries is small.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Recall@k is set overlap, not generation quality.",
          "• Choose k based on how many chunks you actually put in the prompt.",
          "• Low recall means the retriever is the bottleneck.",
          "Production lens — Golden sets need coverage, not vanity: A useful eval set covers navigational lookups, conceptual how-to questions, multi-hop needs, near-duplicate FAQs, and adversarial paraphrases. Include cases where the correct answer is \"not in corpus.\" Size matters less than diversity and label quality: fifty well-labeled queries with document IDs beat five hundred noisy ones. Version the set with corpus snapshots so you know whether a regression is model or data.\n\nAttribute failures: retrieval miss, correctly retrieved but poorly ranked, context truncated, prompt ignores citation, or generator invents unsupported detail. Attribution drives the backlog—chunk size, hybrid search, re-ranker, or generation policy. Without attribution, teams thrash on the wrong stage."
        ],
        "keyTerms": [
          {
            "term": "Recall@k is set overlap, not generation",
            "definition": "Recall@k is set overlap, not generation quality."
          },
          {
            "term": "Choose k based on how many",
            "definition": "Choose k based on how many chunks you actually put in the prompt."
          },
          {
            "term": "Low recall means the retriever is",
            "definition": "Low recall means the retriever is the bottleneck."
          }
        ],
        "workedExample": {
          "title": "Compute recall@k for one query",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "def recall_at_k(relevant, retrieved, k):\n    pred = set(retrieved[:k])\n    rel = set(relevant)\n    if not rel:\n        return 0.0\n    return len(rel & pred) / len(rel)\n\nprint(recall_at_k([1, 4], [4, 2, 1, 7], k=3))\nprint(recall_at_k([1, 4], [3, 2, 7, 1], k=3))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can compute MRR / reciprocal rank.",
            "reveal": "A useful eval set covers navigational lookups, conceptual how-to questions, multi-hop needs, near-duplicate FAQs, and adversarial paraphrases. Include cases where the correct answer is \"not in corpus.\" Size matters less than diversity and label quality: fifty well-labeled queries with document IDs beat five hundred noisy ones. Version the set with corpus snapshots so you know whether a regression is model or data.\n\nAttribute failures: retrieval miss, correctly retrieved but poorly ranked, context truncated, prompt ignores citation, or generator invents unsupported detail. Attribution drives the backlog—chunk size, hybrid search, re-ranker, or generation policy. Without attribution, teams thrash on the wrong stage."
          }
        ]
      },
      {
        "id": "mrr-rewards-early-relevant-hits",
        "heading": "MRR rewards early relevant hits",
        "paragraphs": [
          "Mean Reciprocal Rank focuses on the rank of the first relevant document. For a query, find the smallest rank i (1-based) where the retrieved item is relevant, then contribute 1/i; if none, contribute 0. Average over queries. Example: relevant doc appears at ranks 1, 2, and 5 across three queries -> RR values 1, 0.5, 0.2 -> MRR=0.567. Compared with recall@k, MRR cares about putting something useful near the top, which matters when the prompt can afford only one or two chunks. In interviews, be ready to compare MRR, recall@k, nDCG, and precision@k and pick metrics that match product constraints. Implement MRR with a simple loop before jumping to libraries.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Reciprocal rank uses 1/rank of the first relevant hit.",
          "• MRR is sensitive to top-of-list quality.",
          "• Use MRR when only a tiny context budget is available.",
          "Production lens — Online feedback closes the loop: Offline golden sets lag product reality. Log retrieval IDs, clicked citations, explicit thumbs, and downstream task success (ticket resolved, checkout completed). Use them to sample hard queries for human labeling, not as unconstrained automatic training labels without review. Canary new chunking or embedding versions on traffic slices with paired retrieval and groundedness metrics.\n\nRAG evaluation is a product discipline: own the metrics, the failure taxonomy, and the gates. Interview-ready answers separate recall@k from answer correctness, name faithfulness checks, and describe how production logs refresh the eval set. That story is more credible than claiming a single BLEU-like number for the whole system."
        ],
        "keyTerms": [
          {
            "term": "Reciprocal rank uses 1/rank of the",
            "definition": "Reciprocal rank uses 1/rank of the first relevant hit."
          },
          {
            "term": "MRR is sensitive to top-of-list quality.",
            "definition": "MRR is sensitive to top-of-list quality."
          },
          {
            "term": "Use MRR when only a tiny",
            "definition": "Use MRR when only a tiny context budget is available."
          }
        ],
        "workedExample": {
          "title": "Mean reciprocal rank over queries",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "def reciprocal_rank(relevant, retrieved):\n    rel = set(relevant)\n    for i, doc_id in enumerate(retrieved, start=1):\n        if doc_id in rel:\n            return 1.0 / i\n    return 0.0\n\nrrs = [\n    reciprocal_rank([4], [4, 2, 1]),\n    reciprocal_rank([1, 4], [3, 1, 4]),\n    reciprocal_rank([7], [1, 2, 3]),\n]\nprint(rrs, 'MRR=', round(sum(rrs) / len(rrs), 3))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can run a simple answer-evidence overlap groundedness check.",
            "reveal": "Offline golden sets lag product reality. Log retrieval IDs, clicked citations, explicit thumbs, and downstream task success (ticket resolved, checkout completed). Use them to sample hard queries for human labeling, not as unconstrained automatic training labels without review. Canary new chunking or embedding versions on traffic slices with paired retrieval and groundedness metrics.\n\nRAG evaluation is a product discipline: own the metrics, the failure taxonomy, and the gates. Interview-ready answers separate recall@k from answer correctness, name faithfulness checks, and describe how production logs refresh the eval set. That story is more credible than claiming a single BLEU-like number for the whole system."
          }
        ]
      },
      {
        "id": "grounded-answer-checks-with-string-overlap",
        "heading": "Grounded-answer checks with string overlap",
        "paragraphs": [
          "A lightweight groundedness heuristic asks whether answer content appears in retrieved evidence. Token-overlap precision: tokenize answer and evidence into words, then compute |ans_tokens intersect evidence_tokens| / |ans_tokens|. If the answer is 'Causal masks block future tokens' and evidence contains those words, overlap is high. This is imperfect: paraphrases score low, and copying irrelevant shared stopwords can score medium. Still, it is a useful regression test for workshops and CI smoke tests. Stronger systems use NLI models or LLM-as-judge, but those are heavier and not Pyodide-friendly here. Pair overlap with retrieval metrics: high overlap and low recall can mean the model is parroting incomplete evidence. Low overlap and high recall can mean the generator ignored context.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Overlap checks are brittle but cheap smoke tests for grounding.",
          "• Remove stopwords if you want a stricter content overlap score.",
          "• Combine groundedness with retrieval recall for diagnosis.",
          "Production lens — Retrieval quality is the ceiling: RAG systems have at least two stages: retrieve evidence, then generate an answer conditioned on that evidence. If the right chunks never enter the context window, no prompt tweak can ground the answer in them. Measure recall@k, precision@k, and nDCG on a labeled retrieval set before spending weeks on prompt wording. Component metrics turn \"the bot is wrong\" into \"chunking misses section headers\" or \"hybrid fusion under-weights BM25.\"\n\nEnd-to-end scores alone conflate failures. An LLM-as-judge helpfulness number can stay flat while you fix retrieval, or look good while the model hallucinates fluently past weak evidence. Always keep a retrieval dashboard next to answer quality. The practical rule: raise the retrieval ceiling first, then tune generation under the constraint of real top-k context."
        ],
        "keyTerms": [
          {
            "term": "Overlap checks are brittle but cheap",
            "definition": "Overlap checks are brittle but cheap smoke tests for grounding."
          },
          {
            "term": "Remove stopwords if you want a",
            "definition": "Remove stopwords if you want a stricter content overlap score."
          },
          {
            "term": "Combine groundedness with retrieval recall for",
            "definition": "Combine groundedness with retrieval recall for diagnosis."
          }
        ],
        "workedExample": {
          "title": "Answer-evidence token overlap",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "def overlap_precision(answer, evidence):\n    a = set(answer.lower().split())\n    e = set(evidence.lower().split())\n    if not a:\n        return 0.0\n    return len(a & e) / len(a)\n\nevidence = 'Causal masks block future tokens during decoding.'\ngood = 'Causal masks block future tokens'\nbad = 'Dropout improves causal attention accuracy'\nprint('good', round(overlap_precision(good, evidence), 3))\nprint('bad', round(overlap_precision(bad, evidence), 3))",
          "language": "python"
        },
        "checkYourself": [
          {
            "prompt": "Can explain how to diagnose RAG failures by stage.",
            "reveal": "Explain the idea in two sentences, name one metric or invariant you would watch, and state one mistake juniors make. Then connect it back to grounded-answer checks with string overlap."
          }
        ]
      },
      {
        "id": "put-metrics-together-into-an-evaluation-harness",
        "heading": "Put metrics together into an evaluation harness",
        "paragraphs": [
          "A complete workshop harness builds chunks, runs a TF-IDF retriever, computes recall@k and MRR on labeled queries, generates or stubs answers, and reports overlap groundedness. Example synthetic label: query about causal masks maps to chunk_id 0. If retriever returns [0, 2, 1], recall@3=1 and RR=1. If the stub answer copies the chunk, overlap is high. In interviews, describe gates: do not tune prompts when recall@k is below a threshold; do not expand context k forever because noise and cost rise; track metric slices by question type. Production adds citation requirements, human review, and adversarial questions. Showing that you can implement the skeleton without frameworks signals ownership of quality, not just model choice.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Gate prompt work on minimum retrieval recall.",
          "• Slice metrics by query type and document domain.",
          "• Keep an automated harness even when human eval is the gold standard.",
          "Production lens — Faithfulness versus fluency: Users punish confident fabrication more than short refusals. Faithfulness/groundedness checks ask whether claims in the answer are supported by retrieved snippets—via NLI-style models, citation coverage, or LLM-as-judge protocols that only see the evidence. Helpfulness without faithfulness rewards eloquent lies. Make groundedness a release gate alongside latency and cost.\n\nDesign failure modes deliberately: refuse when evidence is weak, ask a clarifying question when the query is ambiguous, or cite snippets so users can verify. Adversarial and out-of-corpus queries belong in the golden set. A demo that answers everything from parametric memory is not a RAG success; it is an untested hallucination path."
        ],
        "keyTerms": [
          {
            "term": "Gate prompt work on minimum retrieval",
            "definition": "Gate prompt work on minimum retrieval recall."
          },
          {
            "term": "Slice metrics by query type and",
            "definition": "Slice metrics by query type and document domain."
          },
          {
            "term": "Keep an automated harness even when",
            "definition": "Keep an automated harness even when human eval is the gold standard."
          }
        ],
        "workedExample": {
          "title": "Mini harness numbers for one labeled query",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "from sklearn.feature_extraction.text import TfidfVectorizer\nfrom sklearn.metrics.pairwise import cosine_similarity\nimport numpy as np\n\nchunks = [\n    'Causal masks block future tokens during decoding.',\n    'Random forests average many decision trees.',\n    'Batch norm stabilizes layer activations.',\n]\nquery = 'Why use a causal mask?'\nrelevant = [0]\nvec = TfidfVectorizer().fit(chunks)\nscores = cosine_similarity(vec.transform([query]), vec.transform(chunks)).ravel()\nranking = np.argsort(scores)[::-1].tolist()\npred = ranking[:2]\nrecall = len(set(relevant) & set(pred)) / len(relevant)\nrr = 1.0 / (ranking.index(relevant[0]) + 1)\nprint('ranking', ranking, 'recall@2', recall, 'RR', rr)",
          "language": "python"
        }
      },
      {
        "id": "ragas-style-metrics-llm-as-judge-caveats-and-ci-golden-sets",
        "heading": "RAGAS-style metrics, LLM-as-judge caveats, and CI golden sets",
        "paragraphs": [
          "Workshop metrics (recall@k, MRR, token overlap) are necessary but not sufficient for 2026 production RAG. RAGAS-style evaluation popularized decomposing quality into signals such as faithfulness/groundedness, answer relevance, and context precision/recall—scored with embeddings or LLM judges against the retrieved context. Use the idea even if you implement simplified proxies in NumPy: an answer that does not overlap evidence fails faithfulness; retrieved context that never appears in the answer may be wasted tokens (context precision). LLM-as-judge scales rubrics but brings position bias, verbosity bias, self-preference for the judge’s cousin models, and instability across temperatures—always calibrate against a human-labeled subset and freeze judge prompts/models as versioned artifacts. CI golden sets are the backbone: a few dozen to a few hundred queries with relevant chunk ids and acceptable answer keys, run on every chunker/embedder/prompt change. Fail the build on recall or faithfulness regressions beyond a delta. Keep goldens free of training/synthetic contamination, refresh them when products change, and slice by query type so one happy-path FAQ does not hide multi-hop failures.",
          "Hold these points explicitly while you study. Restate each one without looking at the list — recognition is not the interview bar; recall is.",
          "• Decompose RAG quality into faithfulness, relevance, and context precision/recall-style signals.",
          "• Calibrate LLM judges on human labels; version judge prompts and models.",
          "• Run golden retrieval/answer suites in CI on every index or prompt change.",
          "• Watch for contamination and slice metrics by query archetype.",
          "Production lens — Golden sets need coverage, not vanity: A useful eval set covers navigational lookups, conceptual how-to questions, multi-hop needs, near-duplicate FAQs, and adversarial paraphrases. Include cases where the correct answer is \"not in corpus.\" Size matters less than diversity and label quality: fifty well-labeled queries with document IDs beat five hundred noisy ones. Version the set with corpus snapshots so you know whether a regression is model or data.\n\nAttribute failures: retrieval miss, correctly retrieved but poorly ranked, context truncated, prompt ignores citation, or generator invents unsupported detail. Attribution drives the backlog—chunk size, hybrid search, re-ranker, or generation policy. Without attribution, teams thrash on the wrong stage."
        ],
        "keyTerms": [
          {
            "term": "Decompose RAG quality into faithfulness, rele…",
            "definition": "Decompose RAG quality into faithfulness, relevance, and context precision/recall-style signals."
          },
          {
            "term": "Calibrate LLM judges on human labels;",
            "definition": "Calibrate LLM judges on human labels; version judge prompts and models."
          },
          {
            "term": "Run golden retrieval/answer suites in CI",
            "definition": "Run golden retrieval/answer suites in CI on every index or prompt change."
          },
          {
            "term": "Watch for contamination and slice metrics",
            "definition": "Watch for contamination and slice metrics by query archetype."
          }
        ],
        "workedExample": {
          "title": "Tiny faithfulness proxy for CI",
          "body": "Narrate what each shape and step is doing. If you only recognize the API call, you do not own the idea yet — rewrite the example from memory after one pass.",
          "code": "def faithfulness_proxy(answer, contexts):\n    ans = set(answer.lower().split())\n    ctx = set(\" \".join(contexts).lower().split())\n    if not ans:\n        return 0.0\n    return len(ans & ctx) / len(ans)\n\nprint(round(faithfulness_proxy('causal masks block future tokens', ['Causal masks block future tokens during decoding.']), 2))\nprint(round(faithfulness_proxy('quantum flux capacitor unlocked', ['Causal masks block future tokens.']), 2))",
          "language": "python"
        },
        "callout": {
          "tone": "interview",
          "body": "Interview framing: define the term, give a tiny example, say when you would not use it, and name the metric that proves it worked."
        }
      },
      {
        "id": "failure-modes",
        "heading": "Failure modes and anti-patterns",
        "paragraphs": [
          "Most interview answers fail not because the definition is wrong, but because the candidate never names how the approach breaks. Use this section as a trap checklist for rag evaluation workshop.",
          "Trap: Judging RAG only by final answer fluency. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Using chunking without overlap when answers span boundaries. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Tuning prompts while recall@k is still poor. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Treating token overlap as perfect factuality. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first.",
          "Trap: Forgetting to label relevant chunks for retrieval offline eval. A strong answer preempts it — say what you would monitor, what fallback you would keep, or what simpler baseline you would try first."
        ],
        "callout": {
          "tone": "warning",
          "body": "If you cannot name a failure mode, you do not yet understand the technique well enough to ship or defend it."
        },
        "checkYourself": [
          {
            "prompt": "Pick the most dangerous pitfall for RAG evaluation workshop and explain how you would detect it in production or on a whiteboard.",
            "reveal": "Start with: \"Judging RAG only by final answer fluency.\" Then add a detection signal (metric, test, or review question) and a mitigation."
          }
        ]
      },
      {
        "id": "deeper-lens",
        "heading": "A deeper production lens",
        "paragraphs": [
          "Retrieval quality is the ceiling. RAG systems have at least two stages: retrieve evidence, then generate an answer conditioned on that evidence. If the right chunks never enter the context window, no prompt tweak can ground the answer in them. Measure recall@k, precision@k, and nDCG on a labeled retrieval set before spending weeks on prompt wording. Component metrics turn \"the bot is wrong\" into \"chunking misses section headers\" or \"hybrid fusion under-weights BM25.\"\n\nEnd-to-end scores alone conflate failures. An LLM-as-judge helpfulness number can stay flat while you fix retrieval, or look good while the model hallucinates fluently past weak evidence. Always keep a retrieval dashboard next to answer quality. The practical rule: raise the retrieval ceiling first, then tune generation under the constraint of real top-k context.",
          "Faithfulness versus fluency. Users punish confident fabrication more than short refusals. Faithfulness/groundedness checks ask whether claims in the answer are supported by retrieved snippets—via NLI-style models, citation coverage, or LLM-as-judge protocols that only see the evidence. Helpfulness without faithfulness rewards eloquent lies. Make groundedness a release gate alongside latency and cost.\n\nDesign failure modes deliberately: refuse when evidence is weak, ask a clarifying question when the query is ambiguous, or cite snippets so users can verify. Adversarial and out-of-corpus queries belong in the golden set. A demo that answers everything from parametric memory is not a RAG success; it is an untested hallucination path.",
          "Golden sets need coverage, not vanity. A useful eval set covers navigational lookups, conceptual how-to questions, multi-hop needs, near-duplicate FAQs, and adversarial paraphrases. Include cases where the correct answer is \"not in corpus.\" Size matters less than diversity and label quality: fifty well-labeled queries with document IDs beat five hundred noisy ones. Version the set with corpus snapshots so you know whether a regression is model or data.\n\nAttribute failures: retrieval miss, correctly retrieved but poorly ranked, context truncated, prompt ignores citation, or generator invents unsupported detail. Attribution drives the backlog—chunk size, hybrid search, re-ranker, or generation policy. Without attribution, teams thrash on the wrong stage.",
          "Online feedback closes the loop. Offline golden sets lag product reality. Log retrieval IDs, clicked citations, explicit thumbs, and downstream task success (ticket resolved, checkout completed). Use them to sample hard queries for human labeling, not as unconstrained automatic training labels without review. Canary new chunking or embedding versions on traffic slices with paired retrieval and groundedness metrics.\n\nRAG evaluation is a product discipline: own the metrics, the failure taxonomy, and the gates. Interview-ready answers separate recall@k from answer correctness, name faithfulness checks, and describe how production logs refresh the eval set. That story is more credible than claiming a single BLEU-like number for the whole system."
        ],
        "keyTerms": [
          {
            "term": "Retrieval quality is the ceiling",
            "definition": "RAG systems have at least two stages: retrieve evidence, then generate an answer conditioned on that evidence. If the right chunks never enter the context window, no prompt tweak can ground the answer in them. Measure re…"
          },
          {
            "term": "Faithfulness versus fluency",
            "definition": "Users punish confident fabrication more than short refusals. Faithfulness/groundedness checks ask whether claims in the answer are supported by retrieved snippets—via NLI-style models, citation coverage, or LLM-as-judge …"
          },
          {
            "term": "Golden sets need coverage, not vanity",
            "definition": "A useful eval set covers navigational lookups, conceptual how-to questions, multi-hop needs, near-duplicate FAQs, and adversarial paraphrases. Include cases where the correct answer is \"not in corpus.\" Size matters less …"
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "These notes stretch past the primer. Reach for them when the interviewer asks what you would worry about at scale."
        }
      },
      {
        "id": "synthesis",
        "heading": "Putting it together",
        "paragraphs": [
          "You should now be able to teach rag evaluation workshop as a story: what problem it solves, how the mechanism works, which assumptions it depends on, and how you would know it failed.",
          "Close the loop by writing a 90-second spoken answer out loud. If you freeze on definitions, return to the orientation and the first technical part. If you freeze on trade-offs, return to failure modes.",
          "Practice prompts from this lesson: How would you evaluate a RAG system beyond reading a few answers? | What does recall@k tell you that an answer BLEU score does not? | When is MRR more informative than recall@k?"
        ],
        "checkYourself": [
          {
            "prompt": "Give a 90-second spoken overview of RAG evaluation workshop as if starting an interview answer.",
            "reveal": "Structure: (1) one-sentence definition, (2) one concrete example, (3) one trade-off or limitation, (4) one metric or validation step. Keep jargon only where it earns precision."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Strong candidates narrate decisions. Weak candidates list buzzwords. Prefer a small correct example over a broad incomplete taxonomy."
        }
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Can chunk text with fixed windows and overlap.",
        "Can compute recall@k from relevant and retrieved ids.",
        "Can compute MRR / reciprocal rank.",
        "Can run a simple answer-evidence overlap groundedness check.",
        "Can explain how to diagnose RAG failures by stage."
      ],
      "nextSteps": [
        "Return to the lesson page and attempt the practice / topic lab with this chapter still open if needed.",
        "Revisit any Check yourself prompts you could not answer out loud.",
        "Optional deeper reading: Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (arXiv) — https://arxiv.org/abs/2005.11401",
        "Optional deeper reading: RAGAS: Automated Evaluation of Retrieval Augmented Generation (arXiv) — https://arxiv.org/abs/2309.15217"
      ]
    }
  }
};
