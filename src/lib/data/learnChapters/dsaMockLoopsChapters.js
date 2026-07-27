/** @type {Record<string, import('../learnChapters.js').LessonLearnChapter>} */
export const dsaMockLoopsChapters = {
  'dsa-mock-loops/easy-warmup-round': {
    title: 'Easy warm-up round',
    readingTime: '70-90 min',
    premise:
      'Warm-ups restore interview rhythm: clarify, approach, code, test, complexity—in five to twelve minutes—before a scored medium mock. This chapter teaches how to practice easy prompts as cadence trainers, not as places to over-analyze or chase clever tricks.',
    parts: [
      {
        id: 'purpose-of-warmups',
        heading: 'Warm-ups train rhythm, not novelty',
        paragraphs: [
          'An easy round exists to bring core templates online: hash maps, two pointers, simple tree recursion, light counting. If you spend twenty minutes optimizing an easy problem, the warm-up failed its job. Stop when the full loop feels smooth.',
          'Syntax rust and narration rust both show up here. Speaking the invariant on a “simple” task is how seniors sound on mediums later. Mute speedruns teach the wrong lesson for phone screens.',
          'Schedule warm-ups immediately before harder mocks, not as a separate ego grind of fifty easies with no timer.'
        ],
        keyTerms: [
          {
            term: 'cadence loop',
            definition:
              'The fixed sequence: restate → approach → code → tests → complexity, used even on easy prompts.'
          },
          {
            term: 'fluency rep',
            definition:
              'A short timed repetition meant to make pattern selection automatic.'
          },
          {
            term: 'over-analysis',
            definition:
              'Spending medium-round energy on an easy prompt instead of closing the cadence cleanly.'
          }
        ],
        callout: {
          tone: 'tip',
          body:
            'Cap each warm-up problem at twelve minutes. When the cap hits, finish the closing sentence and move on.'
        },
        checkYourself: [
          {
            prompt: 'Which core patterns should feel automatic before harder rounds?',
            reveal:
              'Membership via maps, paired two-pointer walks, basic BFS/DFS or tree returns, and stating brute force versus intended complexity in one breath.'
          }
        ]
      },
      {
        id: 'warmup-rubric',
        heading: 'Communication rubric for easy prompts',
        paragraphs: [
          'Score 0–2 on: speed to pattern, invariant spoken, edge cases named, complexity closed, calm pacing. Easy rounds with missing narration are failed rehearsals.',
          'Edges still matter: empty, single element, duplicates. Saying them aloud on easies prevents skipping them on mediums.',
          'If your code is correct but you cannot explain why, redo the same problem as a teaching exercise to an empty chair.'
        ],
        callout: {
          tone: 'interview',
          body:
            'Interviewers infer seniority from explanation quality on simple tasks. Treat easies as communication reps.'
        },
        checkYourself: [
          {
            prompt: 'How do you keep a warm-up from turning into unnecessary over-analysis?',
            reveal:
              'Enforce a short timer, forbid alternate-algorithm rabbit holes once a correct clear approach works, and stop when cadence—not cleverness—is proven.'
          }
        ]
      },
      {
        id: 'timebox-warmup-session',
        heading: 'Timeboxing a warm-up session',
        paragraphs: [
          'A healthy block: three problems × ~10 minutes, or two × 12, totaling ~30 minutes before the real mock. Do not let warm-ups consume the mock slot.',
          'Phase cut per problem: 1 minute restate, 1 minute approach, 5–7 code, 2 tests/complexity. If stuck at minute six on an easy, your fundamentals need a foundations revisit—not a hard stretch today.',
          'Differentiate OA-silent warm-ups vs phone-narrated warm-ups based on what you will mock next.'
        ],
        keyTerms: [
          {
            term: 'warm-up budget',
            definition:
              'A hard cap (about 25–35 minutes) reserved to activate fluency before scored mocks.'
          }
        ],
        callout: {
          tone: 'warning',
          body:
            'Skipping warm-ups before a hard mock often wastes the first scored problem on rust instead of difficulty.'
        },
        checkYourself: [
          {
            prompt: 'What signals tell you the warm-up served its purpose?',
            reveal:
              'Pattern selection feels immediate, narration is steady, and you are eager to stop easies—not hunting another easy AC for comfort.'
          }
        ]
      },
      {
        id: 'representative-warmup-patterns',
        heading: 'Representative patterns with a worked example',
        paragraphs: [
          'Rotate: one map/count, one two-pointer or sort, one simple tree or stack. That trio covers the universal baseline this module cares about.',
          'Keep solutions boring. Interview-ready easy code is readable and tested, not golfed.',
          'After the trio, write one line per problem: family + complexity. That micro-log primes the medium round.'
        ],
        workedExample: {
          title: 'Valid anagram via counts (warm-up cadence)',
          body: 'Restate: same multiset of characters. Approach: count array or Counter. Test: empty, unicode-insensitive assumptions, length mismatch early exit. Complexity: O(n) time, O(Σ) space.',
          code: `from collections import Counter

def is_anagram(s, t):
    if len(s) != len(t):
        return False
    return Counter(s) == Counter(t)

print(is_anagram("anagram", "nagaram"))  # True
print(is_anagram("rat", "car"))          # False
print(is_anagram("", ""))                # True`,
          language: 'python'
        },
        callout: {
          tone: 'tip',
          body:
            'Practice the closing sentence even when the function is five lines.'
        },
        checkYourself: [
          {
            prompt: 'Why verbalize the invariant on a short warm-up solution?',
            reveal:
              'It builds the habit you need under pressure and proves you know why the code is correct, not only that samples passed.'
          }
        ]
      },
      {
        id: 'failure-recovery-warmup',
        heading: 'Failure recovery when easies feel hard',
        paragraphs: [
          'If easies feel slow, do not jump to hard stretch rounds. Return to arrays/hash maps foundations and complexity thinking labs. Warm-up failure is diagnostic.',
          'Common issues: reading too fast, skipping examples, implementing before naming the structure. Force a written one-sentence approach before typing for three sessions.',
          'If anxiety spikes, use a two-problem warm-up only. Success is activation, not volume.'
        ],
        callout: {
          tone: 'interview',
          body:
            'It is acceptable to say on an easy screen: “Clear approach is a frequency map; I’ll implement that.” Brevity with structure wins.'
        },
        checkYourself: [
          {
            prompt: 'What should you do if warm-ups consistently overrun twelve minutes?',
            reveal:
              'Diagnose whether the miss is reading, template recall, or coding speed; remediate that skill in foundations practice instead of starting a hard mock.'
          }
        ]
      },
      {
        id: 'handoff-to-medium',
        heading: 'Handoff into the medium mock',
        paragraphs: [
          'Take a two-minute break after warm-ups: stand, water, reset timer. Do not carry an unfinished easy into the medium slot.',
          'Bring forward only the cadence and the micro-log of families touched. Leave perfectionism behind.',
          'If warm-ups were narrated, keep narrating on mediums. If they were OA-silent, keep silent only if the medium mock is OA-shaped.'
        ],
        callout: {
          tone: 'tip',
          body:
            'Format fidelity continues from warm-up into the scored round—do not switch narration modes mid-session without intent.'
        },
        checkYourself: [
          {
            prompt: 'What do you carry from warm-up into the medium round?',
            reveal:
              'The cadence loop and activated templates—not leftover unfinished easy problems or a need to “fix” something.'
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        'Warm-ups activate cadence and core templates under a short cap.',
        'Narration and edge cases still score on easy prompts.',
        'Overrunning easies is a foundations signal, not a badge of thoroughness.',
        'Hand off to mediums with format fidelity and a clear stop.'
      ],
      nextSteps: [
        'Run a 30-minute warm-up trio with twelve-minute caps before your next medium mock.',
        'Score the five warm-up rubric axes once.',
        'If slow, schedule a foundations arrays session instead of a hard stretch.'
      ]
    }
  },

  'dsa-mock-loops/cross-company-medium-round': {
    title: 'Cross-company medium round',
    readingTime: '80-100 min',
    premise:
      'Medium mocks are the common phone/onsite difficulty band: pattern choice and edge-case narration under moderate pressure matter more than trivia. This chapter shows how to run a realistic cross-company medium loop—timeboxes, rubrics, recovery when the first pattern is wrong, and review that improves the next session.',
    parts: [
      {
        id: 'medium-round-goals',
        heading: 'What a medium mock is scoring',
        paragraphs: [
          'Target one problem in 25–35 minutes with a full interview loop, or two problems in a 60–75 minute block with a short break. The score is structured reasoning: right family, defended correctness, tests, complexity—not only acceptance.',
          'Cross-company mixes mash windows, recursion, and graphs/DP. Expect to classify quickly, then spend most minutes on implementation quality and proof, not on hunting exotic algorithms.',
          'Simulate the real channel: shared doc narration for phone, quieter submit discipline for OA-shaped mediums. Label the session type before you start.'
        ],
        keyTerms: [
          {
            term: 'medium band',
            definition:
              'The difficulty where O(n²) traps exist and an O(n)/O(n log n) path is intended—with follow-ups possible.'
          },
          {
            term: 'scored loop',
            definition:
              'A timed mock where process axes are graded, not only final correctness.'
          }
        ],
        callout: {
          tone: 'interview',
          body:
            'Name both the O(n²) trap and the intended better bound early—even if you only code the better one.'
        },
        checkYourself: [
          {
            prompt: 'How do you balance speed with proof of correctness in a medium round?',
            reveal:
              'Spend a few minutes locking the invariant before coding, then protect the end of the slot for tests and complexity instead of rewriting for elegance.'
          }
        ]
      },
      {
        id: 'medium-rubric',
        heading: 'Communication and process rubric',
        paragraphs: [
          'Axes (0–2): classification, invariant/recurrence quality, implementation care, test suite, complexity + alternate. Aim for ≥8/10 before increasing difficulty volume.',
          'Minimum spoken test suite: sample, empty/degenerate, duplicate or boundary, and one adversarial case for your invariant. That set is the “done” bar.',
          'Peer mocks beat solo for mediums when possible; solo with voice recording is next best.'
        ],
        callout: {
          tone: 'tip',
          body:
            'Write the five axis scores immediately when the timer ends—before looking at an editorial.'
        },
        checkYourself: [
          {
            prompt: 'What is the minimum test suite you should speak aloud before declaring done?',
            reveal:
              'The sample, a degenerate/empty case, a duplicate or boundary case, and one case that would break a wrong invariant.'
          }
        ]
      },
      {
        id: 'timebox-and-first-pattern',
        heading: 'Timeboxing and first-pattern commitment',
        paragraphs: [
          'Split for ~30 minutes: 4 restate/examples, 5 approach (+brute), 15 code, 6 tests/complexity. If classification is unclear at minute eight, pick the best-fit universal baseline and move—do not thrash.',
          'Commit to one approach through a thin vertical slice. Mid-code switching without a spoken pivot usually loses the round.',
          'Leave two minutes for an alternate sentence even if you do not code it. That sentence is free signal.'
        ],
        callout: {
          tone: 'warning',
          body:
            'If stuck after eight minutes on the same broken invariant, switch approaches deliberately rather than debugging forever.'
        },
        checkYourself: [
          {
            prompt: 'How do you recover when your first chosen pattern is not quite right?',
            reveal:
              'Name the failure (“window invariant isn’t monotonic here”), pick the next family (prefix/DP/graph), and restart from the invariant—not from random code patches.'
          }
        ]
      },
      {
        id: 'worked-medium-pattern',
        heading: 'Worked medium pattern under mock rules',
        paragraphs: [
          'Practice the full narration on a classic medium: longest substring without repeating characters—window + last-seen index. Speak shrink rules and complexity as you would on a phone.',
          'After coding, invent the test suite from the rubric, not from the editorial.',
          'Then ask yourself the cross-company question: which firm’s flavor does this resemble, and what follow-up might they ask (exactly k distinct, stream of characters, memory limit)?'
        ],
        workedExample: {
          title: 'Longest substring without repeating characters',
          body: 'Maintain last-seen indices; move left past repeats; track best length. Narrate amortized O(n).',
          code: `def length_of_longest_substring(s):
    last = {}
    left = best = 0
    for right, ch in enumerate(s):
        if ch in last and last[ch] >= left:
            left = last[ch] + 1
        last[ch] = right
        best = max(best, right - left + 1)
    return best

print(length_of_longest_substring("abcabcbb"))  # 3
print(length_of_longest_substring("bbbbb"))     # 1
print(length_of_longest_substring(""))          # 0`,
          language: 'python'
        },
        callout: {
          tone: 'interview',
          body:
            '“Left only jumps forward; each index enters the window once—time O(n), space O(Σ).”'
        },
        checkYourself: [
          {
            prompt: 'What follow-up might mutate this window medium?',
            reveal:
              'At most k distinct, exactly k distinct, streaming input, or returning the substring instead of length—reuse counts with a changed validity predicate.'
          }
        ]
      },
      {
        id: 'cross-company-twists',
        heading: 'Cross-company twist types to expect',
        paragraphs: [
          'Recurring twists: duplicates, negatives in sums, implicit graphs, stateful DP transitions, and matrix boundaries. After each mock, log the twist you missed in one sentence.',
          'Spaced repetition on weak twists beats volume on already-green families. Your review list should shrink over weeks.',
          'Mix sources: company hotlists plus general mediums. The blend matches real loops better than one list.'
        ],
        callout: {
          tone: 'tip',
          body:
            'Keep a “twist journal”: date, family, twist, invariant fix. Review it every Sunday.'
        },
        checkYourself: [
          {
            prompt: 'Why use cross-company sets instead of only one employer’s tags?',
            reveal:
              'Real loops vary; mixed twists expose gaps that a single-company grind can hide through over-fitting.'
          }
        ]
      },
      {
        id: 'debrief-and-progression',
        heading: 'Debrief and progression gates',
        paragraphs: [
          'Debrief 10 minutes: rubric scores, twist journal, one remediation task for tomorrow. Skipping debrief wastes the mock.',
          'Progression gate to hard stretch: stable ≥8/10 on mediums across a week, with successful recovery demonstrated at least once (spoken pivot that still finished tests).',
          'If scores stall, cut volume and remediate the weakest axis with targeted pattern lessons—not more random mediums.'
        ],
        callout: {
          tone: 'interview',
          body:
            'A medium mock without debrief is entertainment. A medium mock with scores and a twist note is training.'
        },
        checkYourself: [
          {
            prompt: 'When should you advance from medium mocks to hard stretch rounds?',
            reveal:
              'When classification, invariants, tests, and recovery are consistently strong—not merely when you crave harder labels.'
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        'Medium mocks score process under a 25–35 minute band.',
        'Protect tests and an alternate sentence in the timebox.',
        'Pivot deliberately when the first pattern fails.',
        'Debrief with rubric scores and a twist journal.'
      ],
      nextSteps: [
        'Run one full narrated medium mock with the five-axis score sheet.',
        'Add one twist-journal entry even if you solved the problem.',
        'Schedule remediation for the lowest axis before the next mock.'
      ]
    }
  },

  'dsa-mock-loops/hard-stretch-round': {
    title: 'Hard stretch round and review',
    readingTime: '85-100 min',
    premise:
      'Hard stretch mocks stress decomposition and composure more than finishing every editorial. Success means modeling state or graph structure early, making measurable progress, and leaving a coherent partial with complexity and next steps when the clock ends—then reviewing without ego.',
    parts: [
      {
        id: 'redefine-success-on-hard',
        heading: 'Redefine success for hard mocks',
        paragraphs: [
          'It is normal not to finish every hard problem in interview time. Graders at strong companies still reward a well-argued partial over silent buggy code. Train that outcome on purpose.',
          'Success checklist: family identified, brute force or small-state DP written, transitions clear, helpers tested, complexity of remaining work named. Green acceptance is a bonus, not the only KPI.',
          'If you only practice hard problems until AC without a timer, you train editorial reading—not interview stretch behavior.'
        ],
        keyTerms: [
          {
            term: 'coherent partial',
            definition:
              'An incomplete solution that still communicates correct direction, tested pieces, and explicit next steps.'
          },
          {
            term: 'decomposition',
            definition:
              'Breaking a hard prompt into named subproblems with clear interfaces before full implementation.'
          },
          {
            term: 'stretch KPI',
            definition:
              'Process metrics for hard mocks: modeling quality, progress, and narration under time—not only AC rate.'
          }
        ],
        callout: {
          tone: 'interview',
          body:
            'When stuck: “Here is the state I think we need; here is the brute force; here is what I would optimize next.”'
        },
        checkYourself: [
          {
            prompt: 'When is it better to present a well-reasoned partial than to force buggy code?',
            reveal:
              'When the remaining time cannot safely finish a correct implementation; a clear partial preserves trust, while rushed wrong code destroys it.'
          }
        ]
      },
      {
        id: 'hard-rubric-and-timebox',
        heading: 'Rubric and timebox for stretch rounds',
        paragraphs: [
          'Axes (0–2): problem modeling, decomposition, progress under uncertainty, test discipline on helpers, closing narration (complexity + next step). Finishing is a separate binary flag—track it, but do not let it erase process scores.',
          'Timebox ~45–50 minutes: 8–10 minutes model/examples/brute, 25 implement a vertical slice, 10 wrap with tests on helpers and spoken next steps. Do not open a second hard problem until the wrap is done.',
          'Phone vs onsite: stretch phones need more continuous talk; stretch onsites may allow deeper silent thought—but still surface structure every few minutes.'
        ],
        callout: {
          tone: 'tip',
          body:
            'Set a midpoint alarm. If modeling is still fuzzy at minute twenty, simplify the state on a tiny instance before writing more code.'
        },
        checkYourself: [
          {
            prompt: 'What do you say when the right state or recurrence is not obvious yet?',
            reveal:
              'Admit uncertainty, propose a brute-force or reduced instance, enumerate candidate state dimensions, and invite constraint confirmation—then refine.'
          }
        ]
      },
      {
        id: 'decomposition-patterns',
        heading: 'Decomposition patterns for hard prompts',
        paragraphs: [
          'Common moves: add a DP dimension (index + resource), search on a monotonic answer, build an implicit graph of states, apply bitmask on n ≤ 20, or compose known subroutines (shortest path + greedy packing). Name the move before coding.',
          'Write brute force first when possible. Optimizing a wrong recurrence is the classic hard-round failure. Correct slow → memoize/table → optimize space.',
          'Draw the dependency order for bottom-up. If you cannot, stay top-down with memo until the dependencies are clear.'
        ],
        workedExample: {
          title: 'Edit distance as hard-but-structured DP',
          body: 'State dp[i][j] = edits to transform first i chars into first j. Transitions: insert, delete, replace/match. Count states × O(1) work.',
          code: `def min_distance(word1, word2):
    m, n = len(word1), len(word2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if word1[i - 1] == word2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(
                    dp[i - 1][j],      # delete
                    dp[i][j - 1],      # insert
                    dp[i - 1][j - 1],  # replace
                )
    return dp[m][n]

print(min_distance("horse", "ros"))  # 3
print(min_distance("intention", "execution"))  # 5`,
          language: 'python'
        },
        callout: {
          tone: 'interview',
          body:
            '“States (m+1)(n+1), O(1) work each → time O(mn), space O(mn) or rolled to O(n).”'
        },
        checkYourself: [
          {
            prompt: 'How would you break a hard prompt into solvable subproblems for the interviewer?',
            reveal:
              'Name the state or graph nodes, define a brute solver for one state, show how states combine, then discuss memoization or algorithms on that graph.'
          }
        ]
      },
      {
        id: 'failure-recovery-hard',
        heading: 'Failure recovery and pivots on stretch',
        paragraphs: [
          'If the state space is wrong, delete rather than patch. Re-derive on n=3. Forcing a broken table wastes the remaining clock and teaches panic.',
          'If exponential search is too slow, ask what structure enables pruning, Dijkstra on a state graph, or DP. Speak the pivot.',
          'Emotional recovery: hard mocks bruise ego. Separate identity from one problem. Debrief with scores, then walk away for thirty minutes before editorial reading.'
        ],
        callout: {
          tone: 'warning',
          body:
            'Reading an editorial immediately after a timed fail can feel good and teach little. Score first, break second, editorial third.'
        },
        checkYourself: [
          {
            prompt: 'What is a healthy pivot when bitmask DP feels forced?',
            reveal:
              'Check whether n is truly tiny; if not, look for graph shortest path on compressed states, greedy structure, or a different dimension—and say why bitmask assumptions failed.'
          }
        ]
      },
      {
        id: 'closing-narration-hard',
        heading: 'Closing narration when unfinished',
        paragraphs: [
          'Practice an unfinished closing script: what works, what is tested, what remains, expected final complexity, risks. Deliver it in under ninety seconds.',
          'Interviewers remember composure. Apologizing without structure scores worse than a crisp partial.',
          'Complexity narration still happens: bound the brute, bound the intended, say which you implemented.'
        ],
        workedExample: {
          title: 'Helper-first vertical slice (knapsack count)',
          body: 'In a stretch, you might only finish the feasibility helper and memo skeleton—still a coherent partial.',
          code: `from functools import lru_cache

def can_partition(nums):
    total = sum(nums)
    if total % 2:
        return False
    need = total // 2

    @lru_cache(None)
    def dfs(i, rest):
        if rest == 0:
            return True
        if i == len(nums) or rest < 0:
            return False
        return dfs(i + 1, rest - nums[i]) or dfs(i + 1, rest)

    return dfs(0, need)

print(can_partition([1, 5, 11, 5]))  # True
print(can_partition([1, 2, 3, 5]))   # False`,
          language: 'python'
        },
        callout: {
          tone: 'interview',
          body:
            'Unfinished closing: “Memoized feasibility is done; next I’d tabulate for O(n·sum) and discuss rolling space.”'
        },
        checkYourself: [
          {
            prompt: 'What belongs in a ninety-second unfinished close?',
            reveal:
              'Working pieces, tests run, remaining transitions, final complexity target, and the single next coding step.'
          }
        ]
      },
      {
        id: 'review-cadence-after-stretch',
        heading: 'Review cadence after stretch rounds',
        paragraphs: [
          'Weekly stretch: one or two timed hards max. More than that without recovery tanks learning. Alternate with medium maintenance so fundamentals do not decay.',
          'Review pipeline: rubric → twist/state journal → targeted lesson (DP cookbook, graphs, tries, design) → redo the same prompt narrated after 72 hours.',
          'Progression is flatter here: measure modeling scores over a month, not daily AC streaks. Stretch is a stress test layered on a healthy medium cadence.'
        ],
        callout: {
          tone: 'tip',
          body:
            'If modeling scores are low, pause stretch for a week of state-design drills from core patterns.'
        },
        checkYourself: [
          {
            prompt: 'How should hard stretch fit into a weekly prep cadence?',
            reveal:
              'As a limited stress layer atop warm-ups and mediums—timed, debriefed, and remediated—not as an all-day AC grind.'
          }
        ]
      }
    ],
    wrapUp: {
      takeaways: [
        'Hard mocks score modeling, decomposition, and coherent partials.',
        'Brute-force correctness before optimization; delete wrong states early.',
        'Practice unfinished closing narration with complexity and next steps.',
        'Debrief before editorials; keep stretch volume limited and intentional.'
      ],
      nextSteps: [
        'Run one 45-minute hard mock with midpoint alarm and unfinished-close script.',
        'Score modeling and decomposition even if you finish.',
        'Redo the same prompt 72 hours later with full narration after remediation.'
      ]
    }
  }
};
