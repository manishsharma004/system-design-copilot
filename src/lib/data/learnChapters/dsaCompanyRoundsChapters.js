/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const dsaCompanyRoundsChapters = {
  'dsa-company-rounds/amazon-online-assessment-practice': {
    title: 'Amazon online assessment practice',
    readingTime: '75-95 min',
    premise:
      'Amazon-style early screens reward breadth and finish-correct-first discipline more than fragile cleverness. This chapter trains an OA-first policy: identify the family quickly, ship a readable baseline, test edges, narrate complexity, and only then tighten—plus how that policy differs from phone and onsite narration.',
    parts: [
      {
        id: 'oa-vs-phone-vs-onsite',
        heading: 'OA vs phone vs onsite: what the clock scores',
        paragraphs: [
          'Online assessments score submitted correctness under a hard timer, often with limited feedback. Incomplete or wrong outputs dominate failure modes. Micro-optimizations that risk bugs are negative EV. Phone screens add a human: narration, collaboration, and recovery matter as much as the final code. Onsites deepen follow-ups, multiple problems, and behavioral signal alongside coding.',
          'For Amazon OA practice, simulate silence and submit pressure: fixed minutes, no interviewer hints, custom tests before “submit.” For Amazon phone loops, reuse the same baselines but speak Leadership-Principle-flavored ownership: clarify, decide, verify, bias for action without reckless code.',
          'Do not train only on OA silence if your next loop is a phone screen—or only on chatty narration if your next gate is an OA. Calendar which format you are simulating each session.'
        ],
        keyTerms: [
          {
            term: 'OA-first policy',
            definition:
              'Prioritize a correct, tested baseline under the timer; optimize only with leftover time.'
          },
          {
            term: 'submit pressure',
            definition:
              'The assessment reality that hidden tests grade binaries, not almost-right reasoning.'
          },
          {
            term: 'format fidelity',
            definition:
              'Practicing under the same communication and tooling constraints as the real round type.'
          }
        ],
        callout: {
          tone: 'interview',
          body:
            'OA: correctness first. Phone: correctness plus spoken structure. Onsite: structure plus follow-up agility.'
        },
        checkYourself: [
          {
            prompt: 'What changes between Amazon OA practice and phone practice?',
            reveal:
              'OA emphasizes silent, tested submissions under a clock; phone adds continuous narration, clarifying questions, and collaborative debugging while keeping the same pattern baselines.'
          }
        ]
      },
      {
        id: 'communication-rubric-amazon',
        heading: 'Communication rubric for Amazon-shaped rounds',
        paragraphs: [
          'Score yourself 0–2 on five axes after each drill: restatement clarity, pattern identification speed, edge-case testing, complexity narration, and code readability. A green test with zeros on narration is a weak phone rehearsal.',
          'Restatement: inputs, outputs, constraints, and one example in your words. Pattern ID: name the family (window, map, BFS/DFS, DP, design DS) within two minutes. Testing: invent empties, duplicates, and singles—not only the sample. Complexity: time and space in one closing sentence. Readability: names and structure a stranger can scan.',
          'Amazon’s bar also listens for ownership tone: you drive tests, you mention trade-offs, you do not blame the prompt. Practice that voice even alone.'
        ],
        callout: {
          tone: 'tip',
          body:
            'Print the five axes on a sticky note. Circling scores after every problem beats vague “felt okay.”'
        },
        checkYourself: [
          {
            prompt: 'Name the five axes of the practice communication rubric.',
            reveal:
              'Restatement, pattern identification, edge-case testing, complexity narration, and readability—each scored honestly after the drill.'
          }
        ]
      },
      {
        id: 'timeboxing-oa',
        heading: 'Timeboxing an OA-style problem',
        paragraphs: [
          'A practical split for a ~30–40 minute OA coding item: 3 minutes restatement and examples, 5 minutes pattern and brute-force baseline, 15–20 minutes coding the intended approach, 5 minutes custom tests, 2 minutes complexity and cleanup. If design-flavored (LRU-like), spend extra minutes on API and capacity/eviction before code.',
          'If the intended approach is unclear at minute eight, ship the correct slower baseline if constraints allow, and note the optimization. An unfinished clever idea scores zero on OAs.',
          'Use a visible timer. When a phase expires, force the next phase. Practicing without phase cuts teaches perfectionism that OAs punish.'
        ],
        keyTerms: [
          {
            term: 'phase cut',
            definition:
              'A hard stop that moves you from design to code to tests even if the previous phase feels incomplete.'
          },
          {
            term: 'baseline ship',
            definition:
              'Submitting or locking a correct simpler solution when the optimized idea is not ready.'
          }
        ],
        callout: {
          tone: 'warning',
          body:
            'Do not spend the last ten minutes refactoring style. Spend them on failing cases and complexity comments.'
        },
        checkYourself: [
          {
            prompt: 'What is the fastest correct baseline you should prefer under OA pressure?',
            reveal:
              'The simplest pattern-faithful solution that meets constraints—often a clear O(n) map/window/BFS or an O(n log n) sort—implemented readably and tested, not a fragile clever trick.'
          }
        ]
      },
      {
        id: 'breadth-pattern-menu',
        heading: 'Breadth-first pattern menu for Amazon sets',
        paragraphs: [
          'Amazon-tagged mixes often span arrays/strings, hashing, windows, trees, light graph BFS/DFS, intro DP, and design (LRU). Prep is breadth: identify the family fast, then execute a known template. Deep obscure algorithms are rarer than clean mediums.',
          'Design prompts: state capacity, eviction policy, hash map + list (or language OrderedDict) roles, and amortized complexity before coding. Interviewers and graders both punish vague APIs.',
          'Worked practice should rotate families day by day rather than grinding ten windows. Breadth is the point of this lesson’s question set.'
        ],
        workedExample: {
          title: 'OA-friendly LRU sketch with OrderedDict',
          body: 'State capacity and eviction first. get/put move keys to most-recent; evict least-recent when over capacity. Narrate amortized O(1).',
          code: `from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity):
        self.cap = capacity
        self.data = OrderedDict()

    def get(self, key):
        if key not in self.data:
            return -1
        self.data.move_to_end(key)
        return self.data[key]

    def put(self, key, value):
        if key in self.data:
            self.data.move_to_end(key)
        self.data[key] = value
        if len(self.data) > self.cap:
            self.data.popitem(last=False)

cache = LRUCache(2)
cache.put(1, 1)
cache.put(2, 2)
print(cache.get(1))  # 1
cache.put(3, 3)
print(cache.get(2))  # -1`,
          language: 'python'
        },
        callout: {
          tone: 'interview',
          body:
            'For design: “Hash map for O(1) lookup; ordering structure for eviction; capacity checked on write.”'
        },
        checkYourself: [
          {
            prompt: 'Which follow-up optimization do you mention only after the baseline is stable?',
            reveal:
              'Micro-optimizations, constant-factor tweaks, or alternate structures—only after happy path and main edge cases pass and the timer still allows.'
          }
        ]
      },
      {
        id: 'failure-recovery-oa',
        heading: 'Failure recovery when tests fail or time is short',
        paragraphs: [
          'When a sample fails: bisect your invariant, do not randomly edit. Print or mentally trace one failing case. When hidden-test anxiety hits in practice, invent harsher custom cases: empty, single, duplicates, max constraints.',
          'When time is nearly gone: freeze features, fix compile/runtime errors, ensure the main path returns something defined. Partial correct with clear TODOs is for phones; OAs need runnable correctness—prefer trimming scope to a solved sub-API if the prompt allows multiple functions.',
          'After each failed mock OA, log: misread constraint, wrong family, botched edge, or slow coding. Next session attacks the top log item only.'
        ],
        callout: {
          tone: 'tip',
          body:
            'Keep a “last five minutes” checklist: run samples, empty input, complexity comment, remove debug prints.'
        },
        checkYourself: [
          {
            prompt: 'How do you keep code readable when the timer is the main pressure?',
            reveal:
              'Use boring names, one responsibility per helper, and refuse clever one-liners; readability reduces self-induced bugs under submit pressure.'
          }
        ]
      },
      {
        id: 'complexity-narration-habit',
        heading: 'Complexity narration as a closing habit',
        paragraphs: [
          'Even when the OA UI does not ask, write a one-line complexity comment. It trains phone/onsite muscle and catches hidden O(n²) scans. Include space for maps and queues.',
          'Tie Big-O to constraints: if n ≤ 10⁵, justify why your O(n log n) is safe. If you shipped O(n²), say when it breaks—honesty matters on phones and still helps you self-check on OAs.',
          'Rehearse aloud once after silent OA drills to switch formats without losing the closing sentence.'
        ],
        callout: {
          tone: 'interview',
          body:
            'Closing template: “Time … because …; space … for …; I checked … edge cases.”'
        },
        checkYourself: [
          {
            prompt: 'Why narrate complexity on a silent OA rehearsal?',
            reveal:
              'It catches asymptotic mistakes before submit and builds the closing habit you need when the next loop is a phone or onsite.'
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        'Match practice format to OA, phone, or onsite scoring.',
        'Use a five-axis communication rubric after every drill.',
        'Timebox phases; ship baselines before clever optimizations.',
        'Recover with invariant traces and a last-five-minutes checklist.'
      ],
      nextSteps: [
        'Run one timed OA-silent set from this lesson’s prompts with phase cuts.',
        'Score yourself on the five rubric axes and log the weakest.',
        'Implement LRU or a window/hash medium under a 35-minute timer.'
      ]
    }
  },

  'dsa-company-rounds/google-phone-and-onsite-practice': {
    title: 'Google phone and onsite practice',
    readingTime: '80-100 min',
    premise:
      'Google-shaped coding rounds still ship working code, but the score is judgment: invariants, approach comparison, and calm follow-up handling. This chapter trains phone narration and onsite depth—predicate search, graph reasoning, and trade-off talk—without treating the round as a silent LeetCode submit.',
    parts: [
      {
        id: 'google-signal-model',
        heading: 'What Google-shaped rounds are listening for',
        paragraphs: [
          'Phone screens often center one medium/hard problem with live collaboration in a shared doc. Interviewers watch how you clarify, propose options, pick one, implement carefully, and respond to hints. Onsites stack more problems, harder twists, and cross-interview consistency.',
          'Memorized templates without invariants score poorly. A slightly slower solution with a crisp predicate proof and a named alternate can beat a fragile turbo hack. Practice thinking aloud as the product, not as optional commentary.',
          'Company tags on problem lists are noisy. Train the behaviors—predicate search, graph state clarity, DP state design, comparison of approaches—more than chasing a Google-tagged volume grind.'
        ],
        keyTerms: [
          {
            term: 'approach comparison',
            definition:
              'Explicitly contrasting two viable strategies on time, space, and implementation risk before or after coding.'
          },
          {
            term: 'shared-doc hygiene',
            definition:
              'Readable structure, spoken intent, and incremental coding that a remote interviewer can follow.'
          },
          {
            term: 'follow-up agility',
            definition:
              'Adapting constraints or asking for a different angle without discarding the original invariant blindly.'
          }
        ],
        callout: {
          tone: 'interview',
          body:
            'Before typing: restatement → options → chosen approach + invariant → then code.'
        },
        checkYourself: [
          {
            prompt: 'How would you explain your approach before writing any code into a shared doc?',
            reveal:
              'Restate the problem, list one or two approaches with trade-offs, commit to one with an invariant or recurrence, and outline test cases you will run afterward.'
          }
        ]
      },
      {
        id: 'phone-timebox-and-rubric',
        heading: 'Phone timebox and communication rubric',
        paragraphs: [
          'Typical phone coding block ~35–45 minutes. Suggested split: 5 clarify/examples, 5–8 approaches and pick, 20 implement, 5–8 tests and complexity, leftover for a light follow-up. If implementation slips, protect the last five minutes for tests and narration—not new features.',
          'Rubric axes (0–2): clarifying questions, invariant quality, coding care, test inventiveness, follow-up handling. Google-shaped feedback often maps to these even when not labeled that way.',
          'Record yourself once a week. Cringe is useful: filler silence, skipped examples, and unread errors become obvious.'
        ],
        callout: {
          tone: 'tip',
          body:
            'Ask about constraints and input sizes early—even if you can guess. Clarifying is scored.'
        },
        checkYourself: [
          {
            prompt: 'What alternative approach should you compare if asked for a different angle?',
            reveal:
              'Keep a ready second: e.g., sort+two-pointers vs hash map, BFS vs Dijkstra, top-down memo vs bottom-up, or binary search on answer vs linear scan—tied to the same problem goal.'
          }
        ]
      },
      {
        id: 'predicate-search-and-graphs',
        heading: 'Predicate search and graph reasoning under narration',
        paragraphs: [
          'Binary search on answer spaces is a Google-frequent texture: define monotonic feasibility, binary search the answer, prove the predicate. Speak why mid is discarded. Off-by-one narration matters as much as the loop.',
          'Graphs: name BFS vs Dijkstra vs topo vs Union-Find before coding. Implicit graphs need an explicit node definition. Distances, connectivity, and ordering are different questions—say which you are answering.',
          'Practice one predicate-search and one graph problem with a peer or rubber duck each week in this module.'
        ],
        workedExample: {
          title: 'Minimum capacity via binary search on answer',
          body: 'Feasibility: can we ship all weights in D days with capacity mid? Predicate is monotonic in mid; binary search the minimum true.',
          code: `def ship_within_days(weights, days):
    def ok(cap):
        need, cur = 1, 0
        for w in weights:
            if cur + w > cap:
                need += 1
                cur = 0
            cur += w
        return need <= days

    lo, hi = max(weights), sum(weights)
    while lo < hi:
        mid = (lo + hi) // 2
        if ok(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo

print(ship_within_days([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5))  # 15`,
          language: 'python'
        },
        callout: {
          tone: 'interview',
          body:
            '“Predicate ok(mid) is monotonic, so the first feasible capacity is binary-searchable.”'
        },
        checkYourself: [
          {
            prompt: 'How do you keep follow-up optimizations tied to the original invariant?',
            reveal:
              'Revisit the invariant sentence first; change representation or constants only if the sentence still holds, otherwise re-derive rather than patching unrelated code.'
          }
        ]
      },
      {
        id: 'onsite-depth-and-partials',
        heading: 'Onsite depth, hints, and coherent partials',
        paragraphs: [
          'Onsites may push harder DP/graph twists or “what if memory is limited?” extensions. Treat hints as collaboration: restate the hint in your words, then adjust. Arguing past a hint wastes score.',
          'If time expires, leave a coherent partial: correct brute force or incomplete DP with clear next transitions, tested helpers, and complexity of what remains. Silent unfinished code is weaker than a spoken roadmap.',
          'Between onsite interviews, reset emotionally. Do not re-litigate the previous problem into the next intro.'
        ],
        callout: {
          tone: 'warning',
          body:
            'Do not silently grind for ten minutes after a hint. Incorporate it out loud within a minute.'
        },
        checkYourself: [
          {
            prompt: 'What does a strong partial solution contain when the clock ends?',
            reveal:
              'A correct direction, named invariant or state, any tested helpers, known edge cases, and the next concrete coding step—not apologetic silence.'
          }
        ]
      },
      {
        id: 'failure-recovery-google',
        heading: 'Failure recovery mid-phone',
        paragraphs: [
          'Wrong approach: say so, compare a new option, and switch. Interviewers prefer an explicit pivot at minute twelve over debugging a doomed invariant until minute thirty.',
          'Bug hunt: reproduce with a tiny example, state the failing expectation, then fix. Random edits without a hypothesis look like panic.',
          'Blank mind: restate constraints and try brute force. Brute force is a valid bridge to the intended idea and proves you can still move.'
        ],
        workedExample: {
          title: 'Narrated pivot sketch (map → sort+pointers)',
          body: 'Practice saying the pivot, then coding the second approach cleanly on a small pair-sum variant.',
          code: `def pair_sum_modes(nums, target):
    # Approach A: hash map complements — great when indices matter.
    seen = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            return ("map", seen[target - x], i)
        seen[x] = i
    # Approach B: if only values matter and space is tight, sort + two pointers.
    a = sorted(nums)
    lo, hi = 0, len(a) - 1
    while lo < hi:
        s = a[lo] + a[hi]
        if s == target:
            return ("two-pointers", a[lo], a[hi])
        if s < target:
            lo += 1
        else:
            hi -= 1
    return None

print(pair_sum_modes([2, 7, 11, 15], 9))`,
          language: 'python'
        },
        callout: {
          tone: 'tip',
          body:
            'Script three pivot sentences and reuse them until they feel natural under stress.'
        },
        checkYourself: [
          {
            prompt: 'When should you abandon an approach mid-phone?',
            reveal:
              'When the invariant is broken or constraints make the complexity impossible—and you can name a better-fitting alternative—ideally before half the time is gone.'
          }
        ]
      },
      {
        id: 'practice-plan-google',
        heading: 'Practice plan for this lesson’s set',
        paragraphs: [
          'Session recipe: one predicate-search, one graph, one DP or trade-off-heavy prompt across a week—not three silent grinds. At least two sessions must be fully narrated aloud or with a peer.',
          'After each, write the alternate approach you did not code. That notebook becomes your follow-up warm list.',
          'Diff vs Amazon OA practice: more talking, more comparison, less submit-binary panic—but still ship working code.'
        ],
        callout: {
          tone: 'interview',
          body:
            'End every Google-shaped drill by stating one alternate strategy you rejected and why.'
        },
        checkYourself: [
          {
            prompt: 'How does Google-shaped practice differ from OA-silent practice?',
            reveal:
              'It prioritizes spoken invariants, approach comparison, and hint incorporation while still finishing correct code—not only hidden-test submission.'
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        'Judgment and invariants are the product; code is the evidence.',
        'Timebox phones to protect tests and follow-ups.',
        'Predicate search and graph modeling need spoken proofs.',
        'Explicit pivots and coherent partials beat silent thrash.'
      ],
      nextSteps: [
        'Record one full narrated phone mock from this set.',
        'Solve one answer-space binary search with a monotonic proof aloud.',
        'Keep an alternate-approach log for every problem you practice.'
      ]
    }
  },

  'dsa-company-rounds/mixed-big-tech-round-practice': {
    title: 'Microsoft, Meta, and Apple practice mix',
    readingTime: '75-100 min',
    premise:
      'Not every loop looks like Google or Amazon OA. Meta leans windows and hashing; Microsoft often probes matrix/search variants; Apple still rewards clean fundamentals. This chapter trains cross-company fluency: spot the company-shaped signal, fall back to universal templates, and adapt communication without over-fitting one firm.',
    parts: [
      {
        id: 'company-shaped-signals',
        heading: 'Company-shaped signals without trivia worship',
        paragraphs: [
          'Treat company flavors as priors, not scripts. Meta-shaped: hash maps, sliding windows, and design implementations under time pressure. Microsoft-shaped: multi-dimensional search, matrices, careful boundaries. Apple-shaped: fundamentals depth—pointers, counting, readable code, fewer carnival tricks.',
          'Your job in a mixed set is rapid classification, then universal execution: counting, windows, prefix, binary search, backtracking, BFS, light DP, design DS. If the prior is wrong, the universal baseline still saves you.',
          'Avoid studying only one company’s tagged list for weeks. Mixed practice prevents brittle pattern matching to flavor instead of structure.'
        ],
        keyTerms: [
          {
            term: 'flavor prior',
            definition:
              'A soft expectation about prompt families for a company, used only to bias first guesses.'
          },
          {
            term: 'universal baseline',
            definition:
              'The cross-company core templates you can execute regardless of which prior fired.'
          },
          {
            term: 'over-fitting a firm',
            definition:
              'Training so narrowly on one company’s tags that mixed loops feel foreign.'
          }
        ],
        callout: {
          tone: 'interview',
          body:
            'Say the prior lightly: “This looks window/hash flavored; I’ll start there, and I can fall back to prefix if the invariant fails.”'
        },
        checkYourself: [
          {
            prompt: 'What reusable parts of your explanation transfer across companies?',
            reveal:
              'Restatement, invariant/recurrence, edge-case tests, complexity, and approach comparison—the rubric axes stay stable even when prompt mixes change.'
          }
        ]
      },
      {
        id: 'adaptive-communication',
        heading: 'Adaptive communication across loop styles',
        paragraphs: [
          'Some loops are pure coding speed; others are collaborative with partial implementations and design talk. Ask early (or infer from the interviewer) how interactive they want to be, then match. Dumping a silent perfect solution can undersell collaboration; endless chatter without code undersells delivery.',
          'Rubric for mixed practice: classification speed, baseline quality, test suite, complexity, and pivot quality when constraints change. Score after each problem.',
          'When the interviewer changes a constraint after you finish, do not rewrite from zero. Mark which invariant still holds and what state must grow.'
        ],
        callout: {
          tone: 'tip',
          body:
            'Practice one “constraint mutation” follow-up on every mixed-set problem.'
        },
        checkYourself: [
          {
            prompt: 'How do you pivot when the interviewer changes a constraint after the first pass?',
            reveal:
              'Re-validate the invariant, name what breaks, reuse helpers that still apply, and only redesign the pieces tied to the new constraint.'
          }
        ]
      },
      {
        id: 'meta-window-hash-design',
        heading: 'Meta-shaped: windows, hashing, and design fluency',
        paragraphs: [
          'Drill variable windows with spoken shrink rules, anagram/frequency maps, and one design DS (LRU/LFU-style or iterator design). Speed of template recognition is the Meta-flavored skill; still narrate invariants.',
          'Keep implementations compact. Prefer clear helpers over mega-functions. Onsites still read code quality.',
          'Failure mode: recognizing “window” but botching min vs max record timing. Rehearse both families the same week.'
        ],
        workedExample: {
          title: 'Group anagrams with signature hashing',
          body: 'Map a sorted-signature (or count-tuple) to lists. Narrate expected O(n · k log k) with sorting signatures or O(n · k) with counts.',
          code: `from collections import defaultdict

def group_anagrams(strs):
    buckets = defaultdict(list)
    for s in strs:
        key = tuple(sorted(s))
        buckets[key].append(s)
    return list(buckets.values())

print(group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"]))`,
          language: 'python'
        },
        callout: {
          tone: 'interview',
          body:
            'For Meta-shaped design: APIs first, complexity second, then code—same as Amazon design but with tighter chat.'
        },
        checkYourself: [
          {
            prompt: 'What makes a solution feel robust enough for an onsite coding round?',
            reveal:
              'Clear structure, tested edges, honest complexity, and a known alternate—not only that a happy-path sample passed.'
          }
        ]
      },
      {
        id: 'microsoft-matrix-search',
        heading: 'Microsoft-shaped: matrices and multi-dimensional search',
        paragraphs: [
          'Matrix search, flood fill, path counting, and boundary-heavy binary search appear often enough to deserve dedicated reps. Draw the grid; state index conventions; watch off-by-ones at last row/col.',
          'Treat a matrix as an implicit graph when paths matter; as a search space when sorted rows/columns allow elimination. Name which view you are using.',
          'Practice writing clean loops with early continues rather than deep nesting—readability under scrutiny.'
        ],
        workedExample: {
          title: 'Search in a row/column-sorted matrix',
          body: 'Start top-right: if too large move left, if too small move down—monotonic elimination.',
          code: `def search_matrix(matrix, target):
    if not matrix or not matrix[0]:
        return False
    r, c = 0, len(matrix[0]) - 1
    while r < len(matrix) and c >= 0:
        val = matrix[r][c]
        if val == target:
            return True
        if val > target:
            c -= 1
        else:
            r += 1
    return False

print(search_matrix([[1, 4, 7], [2, 5, 8], [3, 6, 9]], 5))  # True
print(search_matrix([[1, 4, 7], [2, 5, 8], [3, 6, 9]], 10)) # False`,
          language: 'python'
        },
        callout: {
          tone: 'warning',
          body:
            'State empty-matrix behavior before indexing matrix[0].'
        },
        checkYourself: [
          {
            prompt: 'Why does top-right elimination work on a sorted matrix?',
            reveal:
              'From top-right, leftward values only decrease and downward values only increase, so each comparison safely discards a row or column.'
          }
        ]
      },
      {
        id: 'apple-fundamentals-and-timebox',
        heading: 'Apple-shaped fundamentals and mixed-set timeboxing',
        paragraphs: [
          'Fundamentals depth means clean two pointers, linked-list hygiene, tree recursion returns, and careful complexity—even on “easy” looking prompts. Do not over-engineer. Interviewers notice elegant simplicity.',
          'Mixed-set timebox per problem (~30–35 min): 4 minutes classify+restate, 18 code, 6 tests, 4 complexity+alternate. Rotate flavors across a session deliberately: window, matrix, fundamental tree/list.',
          'Failure recovery: if the flavor prior misfires, say “switching to universal baseline X” and move. Stubborn loyalty to the wrong prior burns mixed mocks.'
        ],
        callout: {
          tone: 'tip',
          body:
            'Build a three-column warm list: Meta / Microsoft / Apple flavor drills, and pull one from each per mixed session.'
        },
        checkYourself: [
          {
            prompt: 'How do you avoid over-fitting one company profile?',
            reveal:
              'Schedule mixed sessions that force window/hash, matrix/search, and fundamentals in the same week, scored on the same universal rubric.'
          }
        ]
      },
      {
        id: 'cross-company-review-loop',
        heading: 'Review loop after mixed practice',
        paragraphs: [
          'After a mixed set, tag each miss as flavor-misread, template-gap, or execution-bug. Template gaps go back to core-pattern lessons; execution bugs get edge-case drills; flavor misreads get classification flashcards (prompt → family in 30 seconds).',
          'Reuse complexity narration templates across firms—only the problem family changes. That reuse is the point of mixed training.',
          'Graduate to mock loops when you can finish three mixed mediums in a sitting with stable rubric scores ≥7/10 average.'
        ],
        callout: {
          tone: 'interview',
          body:
            'Closing across companies: tests spoken, complexity spoken, one rejected alternate spoken.'
        },
        checkYourself: [
          {
            prompt: 'What three miss tags drive your review loop?',
            reveal:
              'Flavor misread, template gap, and execution bug—each routes to a different remediation (classification drills, pattern lessons, or edge-case practice).'
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        'Use company flavor as a prior, universal templates as the plan.',
        'Adapt talkativeness to the loop; keep the same rubric axes.',
        'Rotate windows/hash, matrix/search, and fundamentals deliberately.',
        'Tag misses to route practice instead of grinding random tags.'
      ],
      nextSteps: [
        'Run a mixed session with one Meta-shaped, one matrix-search, and one fundamentals prompt.',
        'Practice a constraint-mutation follow-up on each.',
        'Start a miss-tag log and remediate the top tag next week.'
      ]
    }
  }
};
