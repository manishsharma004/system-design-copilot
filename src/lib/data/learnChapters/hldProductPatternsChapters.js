/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const hldProductPatternsChapters = {
  "product-patterns/feed-timeline": {
    "title": "Feeds and timelines",
    "readingTime": "80-100 min",
    "premise": "A home feed looks like a simple list, but the industrial design is a pipeline: ingest events, decide when to fan them out, retrieve candidates, rank, filter for safety and privacy, and paginate under extreme skew. This chapter builds the classic write-time versus read-time fan-out trade, then layers ranking, caching, and celebrity handling the way strong HLD interviews expect.",
    "parts": [
      {
        "id": "feed-as-pipeline",
        "heading": "A feed is a pipeline, not a single query",
        "paragraphs": [
          "Raw social activity—posts, likes, follows, shares—lands in durable event storage first. That log or table is the source of truth for what happened. The timeline a user scrolls is a derived view optimized for reading. Conflating those two leads to brittle schemas that cannot re-rank, backfill, or repair without rewriting history.",
          "Production feeds usually stage work as candidate generation, filtering, ranking, and assembly. Candidate generation gathers posts from followed graphs, groups, or topic affinities. Filtering applies blocks, mutes, age gates, and deleted content. Ranking orders by relevance and business constraints. Assembly hydrates media URLs and author cards for the page the client renders.",
          "This pipeline view also clarifies ownership across teams. Ingestion guarantees durability and ordering for an actor's posts. Ranking owns models and experiments. Delivery owns caches and pagination tokens. Interview diagrams that show only \"fan-out service → Redis\" miss half the product; interview diagrams that show the stages can absorb follow-up questions about ranking and privacy."
        ],
        "keyTerms": [
          {
            "term": "Activity event",
            "definition": "The durable record of something that happened—post created, follow added—used to derive timelines."
          },
          {
            "term": "Candidate generation",
            "definition": "The stage that retrieves a pool of items that might appear in a feed before ranking."
          },
          {
            "term": "Derived timeline",
            "definition": "A read-optimized structure built from events, not the canonical social graph itself."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "Say \"event store versus timeline view\" early. It frames every later choice about fan-out and ranking."
        },
        "checkYourself": [
          {
            "prompt": "Why keep raw posts separate from per-user timeline rows?",
            "reveal": "Posts are shared across many readers and need one authoritative body. Timeline rows are personalized projections that can be rebuilt, ranked differently, or discarded without mutating the post itself."
          }
        ]
      },
      {
        "id": "fanout-on-write",
        "heading": "Fan-out on write: push timelines",
        "paragraphs": [
          "Write-time fan-out pushes each new post into the timeline storage of every follower at publish time. Reads become cheap: load a precomputed list for the viewer, optionally merge with ads or recommendations, and return. Early Twitter-scale designs leaned this way because home timeline latency dominates engagement.",
          "The cost appears at publish. A user with ten million followers generates ten million timeline writes—or at least ten million enqueue operations—per post. Latency of publishing rises, worker fleets spike, and storage multiplies. Celebrity accounts can saturate writers even when ordinary accounts are fine. Push is wonderful for the median user and dangerous for the tail.",
          "Mitigations inside push models include asynchronous fan-out queues, sharded timeline stores, and rate limits on pathological accounts. Still, pure push rarely survives extreme skew without a hybrid escape hatch. Interviewers expect you to notice the follower-count cliff without being prompted."
        ],
        "keyTerms": [
          {
            "term": "Fan-out on write",
            "definition": "Precomputing timeline entries for followers when content is published."
          },
          {
            "term": "Timeline store",
            "definition": "A per-user (or per-device) structure holding ordered feed item references for fast reads."
          },
          {
            "term": "Publish amplification",
            "definition": "The multiplier from one post to many timeline writes under push fan-out."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "If your design push-fans to all followers synchronously in the publish API, celebrity posts will time out. Queue the fan-out."
        },
        "checkYourself": [
          {
            "prompt": "What resource scales with follower count in a pure push model?",
            "reveal": "Write QPS and storage for timeline entries (and fan-out queue depth), not merely the cost of storing the single post body."
          }
        ]
      },
      {
        "id": "fanout-on-read",
        "heading": "Fan-out on read: pull timelines",
        "paragraphs": [
          "Read-time fan-out stores posts with their authors and, at read time, fetches recent posts from the accounts the viewer follows, then merges them. Writes are cheap: insert one post. Reads do more work: fan-in from many sources, merge by timestamp or score, and truncate. Pull suits write-heavy graphs and extreme celebrities because publishing does not amplify.",
          "Pull costs explode for users who follow thousands of active accounts. Merge latency, cache misses on cold authors, and thundering herds when many users refresh after a big event all appear. Caching recent posts per author, limiting fan-in depth, and pre-aggregating active graphs mitigate but do not erase the read tax.",
          "Hybrid designs are the industry default narrative: push for ordinary accounts, pull for celebrities or very high-degree nodes, sometimes with selective push to online followers only. The hybrid needs a rule for classifying accounts and a merge step that combines inbox posts with live celebrity pulls. That merge is where correctness bugs hide—duplication, missed deletes, and pagination glitches."
        ],
        "keyTerms": [
          {
            "term": "Fan-out on read",
            "definition": "Building a viewer's feed at read time by merging posts from followed authors."
          },
          {
            "term": "Hybrid fan-out",
            "definition": "Pushing for normal accounts and pulling for high-degree or hot accounts."
          },
          {
            "term": "Fan-in merge",
            "definition": "Combining multiple author streams into one ordered viewer timeline."
          }
        ],
        "workedExample": {
          "title": "Hybrid fan-out cost sketch",
          "body": "Estimate write amplification and read fan-in under push, pull, and hybrid rules. Numbers are illustrative for interview math.",
          "code": "function estimate({ postsPerDay, avgFollowers, celebrityFollowers, celebrityFraction }) {\n  const pushWrites = postsPerDay * avgFollowers; // pure push approx\n  const pullReadsFanIn = 200; // viewer follows ~200 authors merged on read\n  const hybridWrites =\n    postsPerDay * (1 - celebrityFraction) * avgFollowers +\n    postsPerDay * celebrityFraction * 1; // celebrities store once\n  const hybridExtraPull = celebrityFraction > 0 ? 20 : 0; // pull top celebs\n  return { pushWrites, pullReadsFanIn, hybridWrites, hybridExtraPull, celebrityFollowers };\n}\n\nconsole.log(estimate({\n  postsPerDay: 1e6,\n  avgFollowers: 200,\n  celebrityFollowers: 5e6,\n  celebrityFraction: 0.001\n}));\n// Pure push: ~2e8 timeline writes/day from average alone; celebs would dominate further.\n// Hybrid keeps celeb publish O(1) and pays a small pull merge for viewers.",
          "language": "javascript"
        },
        "callout": {
          "tone": "interview",
          "body": "State your celebrity threshold, what gets pushed, what gets pulled, and how the merge deduplicates."
        },
        "checkYourself": [
          {
            "prompt": "Why can hybrid merge create duplicate items?",
            "reveal": "A post may already sit in the viewer's pushed inbox while also appearing in a pulled celebrity query if classification changed or a race occurred. Dedupe by post id before ranking."
          }
        ]
      },
      {
        "id": "ranking-caching-pagination",
        "heading": "Ranking, caching, and pagination",
        "paragraphs": [
          "Chronological feeds are a baseline; ranked feeds add candidate scores from affinity, freshness, media type, and predicted engagement. Ranking should be separable from storage so experiments can change models without migrating timeline rows. Feature lookups need their own latency budget; many systems score a limited candidate set rather than the entire possible graph each request.",
          "Caches sit at multiple layers: per-user timeline segments, per-author recent posts, and hydrated card objects. Short TTLs and explicit invalidation on deletes or visibility changes keep caches honest. Stampeding on cache expiry is a real risk when millions wake up at once; single-flight and staggered TTLs help.",
          "Pagination tokens should encode enough state to resume a merge stably—scores, timestamps, and version ids—without giving clients forgeable access to hidden content. Real-time inserts while scrolling create the classic \"missed tweet\" or duplicate problems; document whether the product prefers stable snapshots or live insertion."
        ],
        "keyTerms": [
          {
            "term": "Candidate set",
            "definition": "The limited pool of items scored for one feed request."
          },
          {
            "term": "Hydration",
            "definition": "Fetching display fields (author, media URLs) for ids selected by ranking."
          },
          {
            "term": "Pagination token",
            "definition": "An opaque cursor capturing merge and rank position for the next page."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "Separate id selection from hydration. It lets you cache ranks cheaply and fetch cards in parallel."
        },
        "checkYourself": [
          {
            "prompt": "What breaks if you cache fully rendered HTML feeds for hours?",
            "reveal": "Deletes, blocks, privacy changes, and ranking experiments will not appear promptly; you may also leak content to clients that should no longer see it."
          }
        ]
      },
      {
        "id": "correctness-controls",
        "heading": "Privacy, deletes, and product controls",
        "paragraphs": [
          "Feeds are correctness-sensitive in ways counters are not. Block and mute relationships must suppress content quickly. Protected accounts must not leak into public timelines. Deleted posts must disappear from inboxes and caches within a product SLA. These rules often require reverse indexes: given a post id, find timeline entries to patch, or rely on read-time filters when push cleanup is too slow.",
          "Moderation and legal takedowns add urgent invalidation paths. Design a kill switch that can ban an item id globally without waiting for natural TTL. Audit logs matter when mistakes remove legitimate content.",
          "Finally, multi-device and multi-session users expect coherent unread state. Unread counters, \"seen\" watermarks, and notification badges should derive from the same event stream as the feed when possible, to avoid contradictory UX."
        ],
        "keyTerms": [
          {
            "term": "Read-time filter",
            "definition": "Applying blocks, deletes, and authz checks when assembling a page even if inbox rows already exist."
          },
          {
            "term": "Invalidation path",
            "definition": "An explicit mechanism to drop cached or materialized feed entries before TTL."
          },
          {
            "term": "Seen watermark",
            "definition": "A per-user position marking what content has been acknowledged across devices."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "After fan-out, volunteer deletes and blocks. Interviewers often use them as the next probe."
        },
        "checkYourself": [
          {
            "prompt": "If push fan-out already wrote a post into a million inboxes, how do you handle a delete?",
            "reveal": "Mark the post deleted in source of truth, invalidate caches, and either asynchronously scrub inbox rows or filter deleted ids at read time until scrub completes."
          }
        ]
      },
      {
        "id": "feed-interview-close",
        "heading": "Closing a feed design interview",
        "paragraphs": [
          "A complete answer names ingest, fan-out strategy with celebrity handling, ranking stages, cache layers, and privacy invalidation. Quantify roughly: posts per day, average degree, celebrity tail, read QPS, and target latency. Those numbers justify push versus pull more convincingly than slogans.",
          "Call out failure modes: fan-out backlog delay, ranker timeout fallback to chronology, and cache stampedes. Fallback behavior is part of the design. Silent empty feeds during ranker outages are usually worse than chronological degradation.",
          "Related patterns—notifications, search, and stories—share the event spine. Showing how one activity stream feeds multiple derived products demonstrates systems thinking beyond a single screen."
        ],
        "callout": {
          "tone": "interview",
          "body": "Keep a one-minute version ready: hybrid fan-out, rank then hydrate, cache segments, filter blocks/deletes on read."
        },
        "checkYourself": [
          {
            "prompt": "What is a safe fallback when the ranking service times out?",
            "reveal": "Serve a chronological or lightly ranked candidate merge from cached author posts, with a shorter page size, rather than failing the home timeline entirely."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Treat feeds as derived pipelines over durable activity events, not as one SQL query.",
        "Push fan-out optimizes reads but amplifies celebrity writes; pull does the opposite; hybrids are common.",
        "Ranking, hydration, and pagination are separate stages with their own caches and failure modes.",
        "Blocks, deletes, and privacy need explicit invalidation or read-time filtering."
      ],
      "nextSteps": [
        "Compute publish amplification for a 5-million-follower account under pure push.",
        "Sketch a hybrid merge that dedupes pushed inbox ids with pulled celebrity posts.",
        "List caches you would keep and what event invalidates each."
      ]
    }
  },
  "product-patterns/file-storage-cdn": {
    "title": "File upload, processing, and distribution",
    "readingTime": "75-95 min",
    "premise": "Media products move large bytes through a different shape than JSON APIs: clients upload directly to object storage, metadata lives in databases, workers transform assets asynchronously, and CDNs deliver immutable or versioned objects globally. This chapter walks that pipeline end to end with the controls interviews expect—signed URLs, virus scanning, lifecycle policies, and cache-friendly URLs.",
    "parts": [
      {
        "id": "metadata-versus-bytes",
        "heading": "Separate metadata from blob bytes",
        "paragraphs": [
          "Object storage holds opaque bytes with high durability and low cost per GB. Application databases hold metadata: owner, content type, ACLs, processing status, and pointers to object keys. Mixing those roles—stuffing large blobs in OLTP rows or treating the bucket listing as your user gallery—creates pain around transactions, querying, and access control.",
          "Keys should be unguessable or authorized via signed access. Content-addressed keys (hash of bytes) enable deduplication; UUID keys simplify overwrite semantics. Many systems store a logical asset id in SQL and one or more storage keys for original and derived variants. The logical id is what product APIs speak; storage keys remain an implementation detail.",
          "Durability and consistency models differ. Object stores often provide strong read-after-write for new keys within a region, but listing and cross-region replication can lag. Design user flows so the app records metadata only after the upload completes, and so readers fetch objects by exact key rather than by eventually consistent listings."
        ],
        "keyTerms": [
          {
            "term": "Object storage",
            "definition": "A durable blob store addressing data by key, optimized for large immutable or versioned objects."
          },
          {
            "term": "Asset metadata",
            "definition": "Structured records describing ownership, ACLs, status, and pointers to storage keys."
          },
          {
            "term": "Content-addressed key",
            "definition": "A storage key derived from a hash of the bytes, enabling deduplication."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "Draw two stores in every media design: SQL/metadata and object/bytes. Almost every good answer starts there."
        },
        "checkYourself": [
          {
            "prompt": "Why not store multi-megabyte images directly in your primary OLTP database?",
            "reveal": "Blobs bloat backups, wreck buffer pools, and couple media bandwidth to transactional capacity. Object storage is built for large durable bytes; databases are built for querying metadata."
          }
        ]
      },
      {
        "id": "direct-uploads",
        "heading": "Direct uploads with signed URLs",
        "paragraphs": [
          "Routing every byte through application servers wastes CPU and sockets. The standard pattern issues a short-lived pre-signed upload URL (or POST policy) from the API after authz checks. The client uploads straight to the object store, then notifies the API with the object key and client checksum. The API verifies the object exists, records metadata, and enqueues processing.",
          "Constraints on the signed URL matter: allowed content types, max size, exact key prefix, and expiry measured in minutes. Without them, clients can upload arbitrary huge objects into your bucket. Multipart upload supports large video files with resumable parts; the completion step remains the moment metadata becomes authoritative.",
          "Mobile networks fail mid-upload. Idempotent complete callbacks and client retries need a stable intended key or upload session id. Incomplete multipart uploads should be aborted by lifecycle rules so they do not leak storage spend."
        ],
        "keyTerms": [
          {
            "term": "Pre-signed URL",
            "definition": "A time-limited URL granting specific upload or download permission without exposing long-lived credentials."
          },
          {
            "term": "Multipart upload",
            "definition": "Uploading a large object as independently retryable parts assembled on completion."
          },
          {
            "term": "Complete callback",
            "definition": "The client or worker call that finalizes metadata after bytes are durably stored."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Sequence: authz → sign URL → client PUT to storage → complete API → enqueue processing. Saying only \"upload to S3\" is incomplete."
        },
        "checkYourself": [
          {
            "prompt": "What should the API verify on upload complete before marking an asset ready?",
            "reveal": "That the object exists at the expected key, size/content-type match policy, the caller owns the upload session, and processing has been queued—not that the client merely claims success."
          }
        ]
      },
      {
        "id": "async-processing",
        "heading": "Asynchronous processing pipelines",
        "paragraphs": [
          "Virus scanning, image resizing, video transcoding, thumbnailing, and OCR are slow and bursty. They belong in workers triggered by upload events or queue messages. The asset metadata state machine typically moves through uploaded → scanning → processing → ready (or rejected). User APIs read that state instead of blocking on transforms.",
          "Derived variants get their own keys: `assetId/orig`, `assetId/w320.webp`, `assetId/hls/...`. Publishing to CDN only after readiness prevents clients from caching failures or partial files. Poison files that crash workers go to quarantine with operator alerts; infinite retry loops are a cost incident waiting to happen.",
          "Idempotent workers are mandatory because queues redeliver. A transcode job keyed by asset id and profile should overwrite the same output keys safely. Progress notifications can update metadata incrementally for long videos so UIs can show partial readiness."
        ],
        "keyTerms": [
          {
            "term": "Derived variant",
            "definition": "A transformed object produced from an original, such as a thumbnail or transcode."
          },
          {
            "term": "Asset state machine",
            "definition": "Explicit statuses tracking upload and processing progress for an asset."
          },
          {
            "term": "Quarantine",
            "definition": "Isolating suspicious or poison objects away from public serving paths."
          }
        ],
        "workedExample": {
          "title": "Upload-to-ready state transitions",
          "body": "A minimal state machine showing where async workers advance metadata after direct upload.",
          "code": "const transitions = {\n  initiated: [\"uploaded\", \"expired\"],\n  uploaded: [\"scanning\", \"rejected\"],\n  scanning: [\"processing\", \"rejected\"],\n  processing: [\"ready\", \"failed\"],\n  failed: [\"processing\"], // manual or automatic retry\n  ready: [\"deleted\"],\n  rejected: [\"deleted\"],\n  deleted: []\n};\n\nfunction canTransition(from, to) {\n  return (transitions[from] || []).includes(to);\n}\n\nconsole.log(canTransition(\"uploaded\", \"scanning\")); // true\nconsole.log(canTransition(\"ready\", \"processing\")); // false\n// Public CDN URLs should resolve only in ready (plus authz).",
          "language": "javascript"
        },
        "callout": {
          "tone": "warning",
          "body": "Never mark an asset public before scanning finishes if untrusted users can upload."
        },
        "checkYourself": [
          {
            "prompt": "Why are image thumbnails generated asynchronously instead of inline in the upload request?",
            "reveal": "Transcoding and resizing can exceed API latency budgets and amplify CPU under upload spikes. Async workers scale independently and keep the upload complete path fast."
          }
        ]
      },
      {
        "id": "cdn-serving",
        "heading": "CDN serving and cache-friendly URLs",
        "paragraphs": [
          "CDNs cache objects near users and shield origin buckets from repeated downloads. Cache behavior hinges on URL stability and cache headers. Immutable content—versioned filenames or content-hashed paths—can use long `max-age` and `immutable`. Mutable URLs need short TTLs or explicit purge APIs when content changes in place.",
          "Prefer versioned URLs over purging when possible. Purges are eventually consistent across POP footprints and easy to get wrong under incident stress. Signed download URLs protect private assets; the CDN may still cache them if signatures are part of the cache key, so design carefully for personalized private media.",
          "Range requests, compression, and image format negotiation (WebP/AVIF) further cut bytes. Origin shield tiers reduce stampedes to the bucket when caches expire. Monitor cache hit ratio and origin bandwidth; a design that \"has a CDN\" but uses constantly changing URLs may still hammer origin."
        ],
        "keyTerms": [
          {
            "term": "Edge cache",
            "definition": "CDN storage near clients that serves objects without contacting origin."
          },
          {
            "term": "Cache busting",
            "definition": "Changing the URL when content changes so caches fetch a fresh object."
          },
          {
            "term": "Origin shield",
            "definition": "An intermediate cache layer that collapses misses before they reach object storage."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "Default to immutable, content-hashed URLs for public media. Treat in-place overwrite as the special case."
        },
        "checkYourself": [
          {
            "prompt": "Why can long cache TTLs on a mutable `/avatar.jpg` URL be harmful?",
            "reveal": "Users and POPs may keep showing the old image after a replacement until TTL or purge. Versioned URLs make the new avatar a new cache key immediately."
          }
        ]
      },
      {
        "id": "lifecycle-security",
        "heading": "Lifecycle, retention, and security controls",
        "paragraphs": [
          "Buckets accumulate cost: incomplete multipart uploads, old versions, orphaned derivatives, and logs. Lifecycle policies abort stale multipart uploads, transition cold objects to cheaper storage classes, and expire temporary assets. Product deletion must remove metadata and schedule object deletes across originals and variants, including CDN invalidation when required.",
          "Security spans authz on sign APIs, bucket policies that block public writes, malware scanning, and encryption at rest. Least-privilege roles for workers should write only under allowed prefixes. Public buckets are a recurring breach pattern; prefer private buckets plus CDN or signed reads.",
          "Compliance adds retention holds and audit trails. Some assets cannot be deleted until a legal window expires; others must be deletable within days under user requests. Represent those constraints in metadata so automated lifecycle does not violate policy."
        ],
        "keyTerms": [
          {
            "term": "Lifecycle policy",
            "definition": "Automated rules for transitioning or expiring objects by age or prefix."
          },
          {
            "term": "Orphan object",
            "definition": "Bytes in storage without live metadata references, often from failed completes."
          },
          {
            "term": "Retention hold",
            "definition": "A policy preventing deletion until a compliance window elapses."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Mention orphan cleanup and multipart aborts—cost leaks show production empathy."
        },
        "checkYourself": [
          {
            "prompt": "What storage leak happens if clients start multipart uploads and never complete them?",
            "reveal": "Parts remain billed until aborted. Lifecycle rules should expire incomplete uploads after a bounded time."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Keep metadata in databases and bytes in object storage; link them with explicit keys and states.",
        "Direct signed uploads offload bandwidth; complete callbacks enqueue async processing.",
        "Serve ready assets via CDN with immutable or versioned URLs whenever possible.",
        "Lifecycle policies, scanning, and private buckets are part of the architecture, not afterthoughts."
      ],
      "nextSteps": [
        "Sequence an avatar upload from authz through CDN-ready thumbnail.",
        "Design URL strategy for replaceable profile photos versus immutable media posts.",
        "List lifecycle rules you would enable on day one of a media bucket."
      ]
    }
  },
  "product-patterns/search-autocomplete": {
    "title": "Search and autocomplete",
    "readingTime": "75-95 min",
    "premise": "Search systems succeed when they treat indexes as derived data, keep autocomplete structures tuned for prefix latency, and push heavy ranking offline where possible. This chapter covers ingestion, inverted indexes and tries, freshness under update lag, caching of hot prefixes, and the abuse controls that appear whenever suggestion endpoints meet the public internet.",
    "parts": [
      {
        "id": "index-is-derived",
        "heading": "The search index is derived, not the source of truth",
        "paragraphs": [
          "Canonical product records live in primary databases or service APIs. Search indexes—Elasticsearch/OpenSearch clusters, inverted indexes, suggestion dictionaries—are projections optimized for retrieval. Writes go to the source of truth first; asynchronous indexers update search documents. This separation lets you rebuild indexes, reanalyze text, and experiment with ranking without corrupting operational data.",
          "Dual writing from the app to both DB and index recreates the classic lost-update problem. Prefer change-data-capture, outbox events, or indexed views maintained by the owning service. Document what users see when the index lags: stale titles, missing new items, or deleted items still searchable until catch-up.",
          "Schema design for documents should match query patterns: denormalize fields needed for filters and ranking, keep payloads lean, and avoid treating the index as a general database. Parent/child and nested documents have costs; many teams flatten carefully instead."
        ],
        "keyTerms": [
          {
            "term": "Inverted index",
            "definition": "A mapping from terms to the documents that contain them, enabling fast keyword lookup."
          },
          {
            "term": "Indexer",
            "definition": "The pipeline that transforms source records into search documents."
          },
          {
            "term": "Index lag",
            "definition": "The delay between a source update and its visibility in search results."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "If the index is your only copy of catalog data, a cluster loss becomes a product data loss. Keep a primary store."
        },
        "checkYourself": [
          {
            "prompt": "What should happen when search is behind after a deploy bug?",
            "reveal": "Serve from the last good index or degrade gracefully, fix the indexer, and redrive from the source of truth or event log—not invent data only in the index."
          }
        ]
      },
      {
        "id": "autocomplete-structures",
        "heading": "Autocomplete data structures and update shape",
        "paragraphs": [
          "Autocomplete must answer prefix queries in a few milliseconds. Tries, finite-state transducers, and specialized completion indexes store prefixes with top-weight suggestions. In-memory structures deliver the lowest latency; search-engine completion suggesters trade a bit of latency for operational uniformity with the main index.",
          "Update patterns drive the choice. If suggestions change rarely—city names, static product taxonomy—rebuild snapshots and reload. If suggestions track user-generated content or trending queries, you need incremental updates and decay of stale popularity weights. Personalization blends global popularity with per-user history, often at a second stage after a global candidate fetch.",
          "Client behavior matters as much as servers. Debouncing keystrokes (150–300 ms), minimum prefix lengths, and session-level caching cut QPS dramatically. Edge caches for popular prefixes absorb celebrities of the query world: \"how to\", brand names, and seasonal terms."
        ],
        "keyTerms": [
          {
            "term": "Trie / prefix index",
            "definition": "A structure that walks characters of a prefix to find ranked completions."
          },
          {
            "term": "Completion suggester",
            "definition": "A search-engine feature optimized for prefix suggestion retrieval."
          },
          {
            "term": "Debouncing",
            "definition": "Waiting briefly after keystrokes before sending a request to reduce load."
          }
        ],
        "workedExample": {
          "title": "Tiny in-memory prefix scorer",
          "body": "A teaching sketch of prefix → top-k suggestions ranked by weight. Production systems use FSTs, shards, and compressed dictionaries.",
          "code": "const dict = [\n  { term: \"kubernetes\", w: 90 },\n  { term: \"kotlin\", w: 70 },\n  { term: \"kafka\", w: 85 },\n  { term: \"kite\", w: 20 },\n  { term: \"kangaroo\", w: 10 }\n];\n\nfunction autocomplete(prefix, k = 3) {\n  const p = prefix.toLowerCase();\n  return dict\n    .filter((e) => e.term.startsWith(p))\n    .sort((a, b) => b.w - a.w)\n    .slice(0, k)\n    .map((e) => e.term);\n}\n\nconsole.log(autocomplete(\"k\"));\nconsole.log(autocomplete(\"ka\"));\nconsole.log(autocomplete(\"ko\"));",
          "language": "javascript"
        },
        "callout": {
          "tone": "interview",
          "body": "Tie structure to update rate: snapshot trie for slow-changing dictionaries; incremental index for trending queries."
        },
        "checkYourself": [
          {
            "prompt": "Why debounce autocomplete on the client?",
            "reveal": "Each keystroke would otherwise become a request. Debouncing collapses bursts into one query after typing pauses, cutting QPS by orders of magnitude without hurting perceived speed much."
          }
        ]
      },
      {
        "id": "full-text-ranking",
        "heading": "Full-text retrieval and ranking layers",
        "paragraphs": [
          "Document search typically retrieves with Boolean or BM25-style relevance, then may re-rank a smaller set with learning-to-rank models, business boosts, and personalization. Expensive neural rerankers belong on the candidate set, not on the entire corpus. Latency budgets decide how deep the stack can go on the interactive path.",
          "Filters (category, price, geo) often use bitsets or doc values intersecting with text matches. Aggregations power facets. These features can dominate CPU if cardinality is wild; design indexes and shard routing around common filter shapes.",
          "Relevance debugging needs explain tools and offline evaluation sets. Interviewees who only say \"Elasticsearch\" without retrieval → filter → rerank stages sound thinner than those who allocate latency milliseconds across stages."
        ],
        "keyTerms": [
          {
            "term": "BM25",
            "definition": "A classic term-frequency/inverse-document-frequency ranking function used in many inverted indexes."
          },
          {
            "term": "Learning to rank",
            "definition": "ML models that reorder candidates using many features beyond text overlap."
          },
          {
            "term": "Facet / aggregation",
            "definition": "Counts over categories in the result set used for UI filters."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "Budget latency explicitly: e.g., 30ms retrieve, 20ms features, 30ms rerank, remainder for network and assembly."
        },
        "checkYourself": [
          {
            "prompt": "Why rerank only the top few hundred hits instead of the whole index?",
            "reveal": "Neural or heavy models cannot score billions of documents inline. Inverted indexes cheaply retrieve a candidate pool; expensive models refine that pool within the latency SLO."
          }
        ]
      },
      {
        "id": "freshness-cache-abuse",
        "heading": "Freshness, caching, and abuse controls",
        "paragraphs": [
          "Hot prefixes and identical queries should hit caches with short TTLs or explicit invalidation on dictionary updates. Cache keys must include locale, market, and personalization cohort when results differ. Stale autocomplete that suggests discontinued products can be a business bug, not just a tech bug.",
          "When the index is behind, products choose: hide incomplete categories, boost exact DB lookups for known ids, or show \"results may be delayed\" for admin tools. Public search usually prefers slightly stale over failing open with empty results after a bad reindex.",
          "Suggestion endpoints are enumeration and scraping surfaces. Rate limits, CAPTCHA on anomalies, authenticated APIs for sensitive catalogs, and padded responses help. Watch for bots walking the alphabet. Autocomplete without abuse controls becomes a data dump API."
        ],
        "keyTerms": [
          {
            "term": "Prefix cache",
            "definition": "An edge or application cache keyed by normalized prefix and locale."
          },
          {
            "term": "Reindex",
            "definition": "Rebuilding search documents from the source of truth after schema or analyzer changes."
          },
          {
            "term": "Enumeration attack",
            "definition": "Systematically querying prefixes to extract a large fraction of the dictionary."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "Public autocomplete without rate limits will be scraped. Design the endpoint as a potential exfiltration path."
        },
        "checkYourself": [
          {
            "prompt": "How would you keep autocomplete fresh after a product rename?",
            "reveal": "Update the source record, emit an index event, upsert the completion document with new weights, and invalidate cached prefixes for the old and new terms."
          }
        ]
      },
      {
        "id": "search-ops",
        "heading": "Sharding, analyzers, and operations",
        "paragraphs": [
          "Shard count, replica count, and heap sizing determine search stability. Oversharding burns memory; undersharding creates hot nodes for popular terms. Route by tenant or catalog when multi-tenant noisy neighbors appear. Analyzers (tokenization, stemming, synonyms) are part of relevance and must be versioned carefully during reindex.",
          "Blue/green index builds let you reanalyze into a new index and swap aliases atomically. That pattern is the safe answer for breaking mapping changes. Monitor reject threads, JVM GC, and query latency histograms as first-class SLOs.",
          "Close interviews by connecting autocomplete and document search: shared ingestion, different serving structures, shared abuse and freshness concerns. That shows a coherent search platform rather than two unrelated features."
        ],
        "keyTerms": [
          {
            "term": "Index alias",
            "definition": "A stable name that can atomically point at a new underlying index after rebuild."
          },
          {
            "term": "Analyzer",
            "definition": "The text pipeline that tokenizes and normalizes fields at index and query time."
          },
          {
            "term": "Oversharding",
            "definition": "Creating so many shards that overhead dominates and caches fragment."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Mention alias swap for reindex—it signals you have seen zero-downtime search operations."
        },
        "checkYourself": [
          {
            "prompt": "Why use an alias swap instead of deleting and recreating the live index in place?",
            "reveal": "Building in place risks partial visibility and downtime. Building a parallel index and flipping the alias keeps queries on a complete index until cutover."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Search indexes are derived from a primary source of truth and can lag or be rebuilt.",
        "Autocomplete needs prefix-optimized structures, client debouncing, and hot-prefix caching.",
        "Full-text systems retrieve cheaply then rerank a limited candidate set within latency budgets.",
        "Freshness, alias-based reindex, and abuse controls are mandatory production concerns."
      ],
      "nextSteps": [
        "Design ingestion for catalog updates into both document search and autocomplete dictionaries.",
        "Pick a structure for a mostly-static city suggester versus a trending-query suggester.",
        "Explain how you would reindex with a breaking analyzer change without downtime."
      ]
    }
  },
  "product-patterns/chat-notifications": {
    "title": "Chat, presence, and notifications",
    "readingTime": "80-100 min",
    "premise": "Messaging products combine durable history, real-time fan-out to connected devices, soft-state presence, and offline push. The failure modes—duplicate notifications, out-of-order messages, split-brain presence—are where interviews go deep. This chapter separates durability from delivery, orders messages per conversation, and designs notification paths that stay idempotent under retries.",
    "parts": [
      {
        "id": "persist-then-deliver",
        "heading": "Persist messages before treating them as sent",
        "paragraphs": [
          "A chat send path should write the canonical message to durable storage (and optionally a log) before acknowledging success to the sender and before fan-out to recipients. If you fan out first and crash before persist, recipients see ghosts the history API cannot confirm. If you ack the sender before durability, mobile clients believe a message survived when it did not.",
          "Message ids are client-generatable UUIDs or server-assigned monotonic ids within a conversation. Client ids enable optimistic UI and dedupe when retries occur. Server sequence numbers enable gap detection: if a device sees seq 41 after 39, it fetches the missing 40. Global ordering across all conversations is unnecessary and harmful; order per conversation (or per channel shard).",
          "Multi-device sync reads the durable history and applies delivery cursors per device. The same event stream can update unread counts. Delivery state—sent, delivered, read—is metadata layered on the immutable message body, not a reason to rewrite history."
        ],
        "keyTerms": [
          {
            "term": "Canonical message",
            "definition": "The durable history record that sync and audit treat as truth."
          },
          {
            "term": "Per-conversation sequence",
            "definition": "A monotonic counter used to order messages and detect gaps inside one chat."
          },
          {
            "term": "Delivery receipt",
            "definition": "Metadata indicating a device or user has received or read a message."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Say \"persist then fan-out\" in the first minute. It prevents a class of inconsistent-delivery designs."
        },
        "checkYourself": [
          {
            "prompt": "Why is global total order across all chats usually the wrong goal?",
            "reveal": "It creates a single sequencing bottleneck and is unnecessary for UX. Users need coherent order inside each conversation, not a global timeline of the entire product."
          }
        ]
      },
      {
        "id": "realtime-connections",
        "heading": "Connections, gateways, and fan-out to online users",
        "paragraphs": [
          "Online clients maintain WebSocket or long-poll connections to edge gateways. A presence/routing layer maps user id to connection ids so publishers can push new messages. Sticky sessions help, but users have many devices, so the map is one-to-many. Gateway fleets are horizontally scaled; pub/sub or a mesh carries events from the conversation service to the right gateways.",
          "Backpressure matters. Slow clients need bounded buffers and drop policies for ephemeral events like typing indicators, while durable messages must remain fetchable from history if realtime delivery fails. Heartbeats detect dead connections so the routing map does not accumulate zombies.",
          "At-least-once realtime delivery is the norm. Clients dedupe by message id. Exactly-once to the UI is achieved by client logic, not by magical sockets. When a device reconnects, it should sync from its last sequence watermark rather than relying only on what it happened to receive live."
        ],
        "keyTerms": [
          {
            "term": "Connection gateway",
            "definition": "An edge service terminating client sockets and forwarding events."
          },
          {
            "term": "Routing map",
            "definition": "A soft directory from user/device to the gateway hosting its connection."
          },
          {
            "term": "Sequence watermark",
            "definition": "The highest contiguous conversation sequence a device has applied."
          }
        ],
        "workedExample": {
          "title": "Gap detection on reconnect",
          "body": "Clients detect missing sequences and fetch history to fill gaps after flaky realtime delivery.",
          "code": "function nextFetch(lastContiguousSeq, incomingSeqs) {\n  const have = new Set(incomingSeqs);\n  let seq = lastContiguousSeq + 1;\n  const missing = [];\n  const maxSeen = Math.max(lastContiguousSeq, ...incomingSeqs);\n  while (seq <= maxSeen) {\n    if (!have.has(seq) && seq > lastContiguousSeq) missing.push(seq);\n    seq++;\n  }\n  return { missing, newWatermarkCandidate: maxSeen };\n}\n\nconsole.log(nextFetch(40, [41, 43]));\n// missing [42] — client should GET history for 42 before advancing contiguous watermark to 43",
          "language": "javascript"
        },
        "callout": {
          "tone": "tip",
          "body": "Realtime is a fast path; history sync is the correctness path. Design both."
        },
        "checkYourself": [
          {
            "prompt": "What should a client do if it receives message seq 51 while its watermark is 49?",
            "reveal": "Fetch the missing sequences (50) from history, apply in order, dedupe any duplicates, then advance the watermark."
          }
        ]
      },
      {
        "id": "presence-soft-state",
        "heading": "Presence and typing are soft state",
        "paragraphs": [
          "Presence answers \"is this user online?\" with soft state: heartbeats into a TTL key store, refreshed by connected gateways. Slight staleness is acceptable; showing someone online for a few seconds after disconnect is usually better than a globally consistent presence service on the request path. Do not store presence in the same durable log as messages.",
          "Typing indicators and \"ephemeral\" signals are high-frequency and low-value. Throttle them aggressively (one event per few seconds per conversation) and drop under load. They should never block message delivery. Fan-out only to participants currently viewing the conversation when possible.",
          "Privacy settings may hide presence entirely. Treat those flags as online authz for presence subscriptions, refreshed when settings change. Presence leaks are a product bug class with real-world impact."
        ],
        "keyTerms": [
          {
            "term": "Soft state",
            "definition": "Data that can be lost and refreshed, kept correct enough via TTLs and heartbeats."
          },
          {
            "term": "Presence TTL",
            "definition": "The expiry window after which a user is considered offline without heartbeat renewal."
          },
          {
            "term": "Ephemeral event",
            "definition": "A non-durable signal such as typing that may be dropped under pressure."
          }
        ],
        "callout": {
          "tone": "warning",
          "body": "Do not put typing indicators through the durable message log. You will drown storage and consumers."
        },
        "checkYourself": [
          {
            "prompt": "Why can presence tolerate more staleness than message history?",
            "reveal": "Wrong presence is a brief UX inaccuracy; missing or reordered history corrupts the conversation record users rely on later."
          }
        ]
      },
      {
        "id": "push-notifications",
        "heading": "Push notifications and offline fan-out",
        "paragraphs": [
          "When no active socket exists, the notification service sends mobile push (APNs/FCM) or email/SMS according to user preferences. Push payloads are small and may be data-only, waking the app to sync history. Collapse keys and notification ids prevent floods when many messages arrive in one chat before the user opens it.",
          "Fan-out should be preference-aware: mute, quiet hours, device tokens, and per-conversation settings. Retries from push providers are common; idempotent notification records keyed by message id + device prevent duplicate banners. Urgent versus digest paths can share the same event but different schedulers.",
          "Security and privacy constrain payloads: lock-screen previews may omit message bodies for sensitive chats. Tokens rotate and become invalid; workers must prune dead tokens on provider errors to protect send throughput."
        ],
        "keyTerms": [
          {
            "term": "Device token",
            "definition": "The provider-issued address used to deliver push to a specific app install."
          },
          {
            "term": "Collapse key",
            "definition": "A provider feature that replaces queued notifications of the same key instead of stacking them."
          },
          {
            "term": "Preference-aware fan-out",
            "definition": "Notification delivery that respects mutes, schedules, and channel settings."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Separate online socket delivery from offline push, both triggered from the same durable message event."
        },
        "checkYourself": [
          {
            "prompt": "How do you avoid double-notifying when a push retry and a late socket delivery both occur?",
            "reveal": "Key notifications by message id (and device), mark them sent in a dedupe store, and let the client dedupe display; do not treat provider retries as new messages."
          }
        ]
      },
      {
        "id": "chat-scale-and-failures",
        "heading": "Group chat scale, ordering, and failures",
        "paragraphs": [
          "Large groups amplify fan-out similarly to celebrity feeds. Strategies include fan-out on read for huge rooms, sharded channel logs, and online-only realtime push with history pull for lurkers. Read receipts in huge rooms may be sampled or omitted to save write amplification.",
          "Partitions and retries create duplicate deliveries and delayed messages. Clients already dedupe; servers must still keep history intact. Encryption and compliance add constraints on what workers can read while routing. Mentioning E2E encryption changes where fan-out metadata can live.",
          "Operational dashboards watch gateway connection counts, push error rates, history p99, and lag between persist and first delivery. Those four signals cover most user-visible pain."
        ],
        "keyTerms": [
          {
            "term": "Channel shard",
            "definition": "A partition of a busy conversation's log for write throughput."
          },
          {
            "term": "Online-only realtime",
            "definition": "Pushing live events only to currently connected members while others rely on sync."
          },
          {
            "term": "Read receipt amplification",
            "definition": "The write cost when every viewer records receipt in a large room."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "For huge rooms, propose hybrid delivery: realtime to active viewers, history sync for everyone else."
        },
        "checkYourself": [
          {
            "prompt": "Why might you disable precise read receipts in a 10,000-member group?",
            "reveal": "Each receipt is a write fan-in that can exceed message write volume. Sampling, aggregate counts, or omitting receipts protects the system."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Persist canonical messages first; use per-conversation sequences for order and gap fill.",
        "Realtime sockets are a fast path; history sync guarantees correctness after reconnects.",
        "Presence and typing are soft, throttled state—not durable chat history.",
        "Offline push is preference-aware and idempotent under provider retries."
      ],
      "nextSteps": [
        "Draw send → persist → online fan-out → push fallback for one DM.",
        "Describe client gap-fill when sequences skip.",
        "Design mute-aware notification fan-out with dedupe keys."
      ]
    }
  },
  "product-patterns/payments-ledger": {
    "title": "Payments and ledger-style systems",
    "readingTime": "80-100 min",
    "premise": "Money movement punishes hand-wavy consistency. Ledgers, idempotent APIs, reconciliation, and careful separation of the strongly correct core from asynchronous side effects are the backbone of wallets, marketplaces, and processors. This chapter teaches double-entry thinking, idempotency under retries and partner callbacks, and the operational safeguards interviewers look for when the domain is financial.",
    "parts": [
      {
        "id": "double-entry-ledger",
        "heading": "Double-entry ledgers and immutable events",
        "paragraphs": [
          "A ledger records balanced movements: every debit has corresponding credit(s) so the books remain accountable. Rather than updating a single balance field in place, systems append immutable entries (or journal lines) and compute balances from the log or from carefully maintained aggregates. In-place balance mutation without an audit trail makes disputes and incident recovery guesswork.",
          "Account types—customer wallet, merchant payable, platform fees, settlement clearing—make product flows explicit. A transfer becomes two or more lines in one journal transaction. That local transaction is the ACID heart of the money path. External card captures and bank rails sit outside and must reconcile against these lines.",
          "Immutability aids audit. Corrections are new reversing entries, not silent edits. Time travel becomes possible: balances as of a timestamp for statements. Interviewers listen for \"append-only journal\" language; it signals financial systems literacy beyond CRUD."
        ],
        "keyTerms": [
          {
            "term": "Double-entry",
            "definition": "Recording equal-and-opposite debits and credits so the ledger remains balanced."
          },
          {
            "term": "Journal entry",
            "definition": "An immutable, balanced set of lines representing one business movement."
          },
          {
            "term": "Reversing entry",
            "definition": "A new journal posting that undoes a prior posting without mutating history."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Never say \"we UPDATE balances.\" Say \"we append journal lines and derive balances.\""
        },
        "checkYourself": [
          {
            "prompt": "How do you correct a mistaken posting without destroying auditability?",
            "reveal": "Insert a reversing journal entry (and a correct new entry if needed), leaving the original lines intact for the audit trail."
          }
        ]
      },
      {
        "id": "idempotent-money-apis",
        "heading": "Idempotent money APIs and retries",
        "paragraphs": [
          "Clients retry charge requests; load balancers replay POSTs; mobile apps double-tap. Idempotency keys turn those retries into safe replays. Store the key with the canonical journal transaction id and response. Concurrent duplicates must not create two captures. Natural keys such as `orderId + capture` can complement random keys.",
          "Partner callbacks (card processor webhooks) also duplicate and arrive late. Persist processor event ids and ignore duplicates. Never trust the webhook alone to create money without verifying against the processor API when stakes are high. Signature verification and timestamp windows block forged callbacks.",
          "State machines for payment intents—created, authorized, captured, voided, refunded—prevent illegal transitions. Capturing twice should be rejected by state, not by hope. Model refunds as new ledger movements linked to the original, not as deletes."
        ],
        "keyTerms": [
          {
            "term": "Payment intent",
            "definition": "A state machine representing the lifecycle of a charge before and after capture."
          },
          {
            "term": "Idempotency key",
            "definition": "A client or partner token ensuring a mutation executes at most once effectively."
          },
          {
            "term": "Webhook dedupe",
            "definition": "Storing external event ids so processor retries do not double-apply effects."
          }
        ],
        "workedExample": {
          "title": "Idempotent transfer posting",
          "body": "Sketch of a wallet transfer that inserts balanced ledger lines once per idempotency key.",
          "code": "async function transfer(db, { idemKey, from, to, amount }) {\n  return db.tx(async (tx) => {\n    const existing = await tx.idempotency.find(idemKey);\n    if (existing) return existing.response;\n\n    const journalId = await tx.journal.insert({ type: \"transfer\" });\n    await tx.lines.insertMany([\n      { journalId, account: from, dir: \"debit\", amount },\n      { journalId, account: to, dir: \"credit\", amount }\n    ]);\n    // enforce balance and sufficient funds inside this local transaction\n    const response = { journalId, status: \"posted\" };\n    await tx.idempotency.put(idemKey, response);\n    await tx.outbox.add({ type: \"TransferPosted\", journalId });\n    return response;\n  });\n}\n// Email/analytics consumers read outbox; they are not the money source of truth.",
          "language": "javascript"
        },
        "callout": {
          "tone": "warning",
          "body": "Side effects like email must not define whether money moved. The ledger commit does."
        },
        "checkYourself": [
          {
            "prompt": "What happens if a partner callback for the same capture id arrives three days late?",
            "reveal": "Dedupe finds the event id already processed and ignores it; reconciliation confirms the ledger already matches the processor."
          }
        ]
      },
      {
        "id": "strong-core-async-edges",
        "heading": "Strong core, asynchronous edges",
        "paragraphs": [
          "The ledger posting path should be strongly consistent within its database (or tightly coupled cluster). Email, analytics, recommendation updates, and some CRM hooks follow via outbox events after commit. If those consumers fail, money remains correct and operators replay events. If those consumers were inline, a downed mailer could block checkouts or worse, encourage unsafe dual writes.",
          "Cross-currency, fees, and tax lines belong in the same journal transaction as the principal movement when they are part of the business truth. Approximate FX quotes used for UI should not silently diverge from the rates booked without recording the booked rate on the entry.",
          "Multi-region active-active money is extremely hard. Many designs keep a regional primary for a wallet or use deterministic shard ownership. If you propose multi-primary wallets in an interview, prepare a conflict story that does not invent money under partition—usually by avoiding it."
        ],
        "keyTerms": [
          {
            "term": "Money core",
            "definition": "The strongly consistent ledger posting path that defines balances."
          },
          {
            "term": "Outbox event",
            "definition": "A durable after-commit signal to asynchronous consumers."
          },
          {
            "term": "Booked rate",
            "definition": "The FX rate actually recorded on ledger lines for a conversion."
          }
        ],
        "callout": {
          "tone": "tip",
          "body": "Draw a bold box around the ledger DB. Everything outside can be eventually consistent."
        },
        "checkYourself": [
          {
            "prompt": "Why is sending \"payment succeeded\" email inside the ledger DB transaction a poor pattern?",
            "reveal": "Email IO extends transaction time, couples availability to the mail provider, and still can fail after commit without a replayable record. Use outbox-after-commit instead."
          }
        ]
      },
      {
        "id": "reconciliation-and-risk",
        "heading": "Reconciliation, holds, and risk controls",
        "paragraphs": [
          "Reconciliation jobs compare internal journals to processor statements, bank files, and marketplace payouts. Breaks generate tickets with enough lineage to repair. This offline loop is not optional polish; it is how financial systems accept that networks and partners are imperfect.",
          "Risk controls—velocity limits, device fingerprints, manual review queues, and fund holds—gate when money becomes withdrawable. Holds are ledger states or sub-accounts, not silent UI flags. Chargebacks and disputes add new movements and state transitions that must remain balanced.",
          "Observability includes imbalance alerts (sum of lines ≠ 0), negative balance violations, idempotency conflict rates, and webhook signature failures. A silent imbalance is an incident even if APIs still return 200."
        ],
        "keyTerms": [
          {
            "term": "Reconciliation break",
            "definition": "A mismatch between internal ledger totals and an external statement."
          },
          {
            "term": "Fund hold",
            "definition": "A restriction preventing withdrawal or capture until risk checks clear."
          },
          {
            "term": "Chargeback",
            "definition": "A disputed card payment that forces reversing and fee movements on the ledger."
          }
        ],
        "callout": {
          "tone": "interview",
          "body": "Volunteer daily reconciliation and imbalance alerts—signals you have thought past the happy-path charge API."
        },
        "checkYourself": [
          {
            "prompt": "Where should a \"pending review\" hold live?",
            "reveal": "In ledger-visible state (hold account or frozen balance flag backed by journal rules), so it cannot be bypassed by a UI-only flag."
          }
        ]
      },
      {
        "id": "payments-interview-close",
        "heading": "Interview playbook for payments designs",
        "paragraphs": [
          "Start with accounts and journal shape for the core transfer. Add idempotency keys and state machines. Place processors behind clear boundaries with webhook dedupe. Push notifications and analytics to outbox consumers. Finish with reconciliation and risk holds.",
          "Quantify carefully: money fields as integers in minor units, never floats. Time zones and settlement dates need explicit types. These details prevent entire classes of production bugs and show craft.",
          "If the prompt is a marketplace, clarify who holds funds (platform vs seller), when seller balances become payable, and how refunds claw back. Ledger accounts make those policy answers concrete instead of narrative."
        ],
        "callout": {
          "tone": "interview",
          "body": "Use minor units (cents) and append-only journals in your opening; many interviewers relax once those appear."
        },
        "checkYourself": [
          {
            "prompt": "Why store currency amounts as integers?",
            "reveal": "Binary floating point cannot represent many decimal currencies exactly, causing rounding drift. Integer minor units plus explicit rounding rules keep money deterministic."
          }
        ]
      }
    ],
    "wrapUp": {
      "takeaways": [
        "Model money as append-only, balanced journal entries—not in-place balance mutations.",
        "Idempotency keys and webhook dedupe make retries and partner callbacks safe.",
        "Keep the ledger core strongly consistent; emit asynchronous side effects via outbox.",
        "Reconciliation, holds, and imbalance alerts are required operational machinery."
      ],
      "nextSteps": [
        "Design a wallet transfer API with idempotency and double-entry lines.",
        "Describe handling of a duplicated capture webhook arriving days late.",
        "Sketch marketplace accounts for buyer, seller payable, and platform fee on one purchase."
      ]
    }
  }
};
