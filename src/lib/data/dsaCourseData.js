import topInterviewQuestionsEasy from './top-interview-questions-easy.json' with { type: 'json' };
import topInterviewQuestionsMedium from './top-interview-questions-medium.json' with { type: 'json' };
import topInterviewQuestionsHard from './top-interview-questions-hard.json' with { type: 'json' };
import allCompaniesQuestions from './all-companies-questions.json' with { type: 'json' };
import amazonQuestions from './amazon.json' with { type: 'json' };
import appleQuestions from './apple.json' with { type: 'json' };
import facebookQuestions from './facebook.json' with { type: 'json' };
import googleQuestions from './google.json' with { type: 'json' };
import microsoftQuestions from './microsoft.json' with { type: 'json' };
import {
  extractPracticeCases,
  parseLanguageTemplates,
  parseQuestionMeta,
  supportsLocalWasmPractice
} from '../dsa/practice.js';

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function uniqueQuestions(questions) {
  /** @type {Set<string>} */
  const seen = new Set();
  return questions.filter((question) => {
    const key = question.frontendId || question.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function prioritizeQuestions(questions) {
  const deduped = uniqueQuestions(questions);
  return [
    ...deduped.filter((question) => question.supportsLocalWasmRun),
    ...deduped.filter((question) => !question.supportsLocalWasmRun)
  ];
}

function toQuestionReference(item, source) {
  if (item?.type !== 1 || !item?.questionData?.questionTitle) return null;
  const questionData = item.questionData;
  const practiceMeta = parseQuestionMeta(questionData.metaData);
  const languageTemplates = parseLanguageTemplates(questionData.codeDefinition);
  const practiceCases = extractPracticeCases(questionData.content, questionData.sampleTestCase);
  const supportsLocalWasmRun = supportsLocalWasmPractice({ practiceMeta, languageTemplates });
  return {
    title: questionData.questionTitle,
    frontendId: questionData.questionFrontendId,
    titleSlug: questionData.titleSlug || slugify(questionData.questionTitle),
    note: item.info || source.note || '',
    company: source.company || null,
    difficulty: source.difficulty || null,
    chapterTitle: source.chapterTitle || '',
    paidOnly: Boolean(item.paidOnly),
    contentHtml: questionData.content || '',
    hints: questionData.hints ?? [],
    sampleTestCase: questionData.sampleTestCase || '',
    practiceMeta,
    languageTemplates,
    practiceCases,
    supportsLocalWasmRun,
    runtimeMode: 'browser-wasm'
  };
}

function selectQuestions(chapters, chapterKeywords, source, limit = 6) {
  const normalizedKeywords = chapterKeywords.map((keyword) => keyword.toLowerCase());
  const orderedChapters = [
    ...chapters.filter((chapter) => normalizedKeywords.some((keyword) => chapter.title.toLowerCase().includes(keyword))),
    ...chapters.filter((chapter) => !normalizedKeywords.some((keyword) => chapter.title.toLowerCase().includes(keyword)))
  ];

  /** @type {ReturnType<typeof toQuestionReference>[]} */
  const collected = [];
  for (const chapter of orderedChapters) {
    for (const item of chapter.items ?? []) {
      const reference = toQuestionReference(item, { ...source, chapterTitle: chapter.title });
      if (!reference) continue;
      collected.push(reference);
    }
  }

  return prioritizeQuestions(collected).slice(0, limit);
}

function selectQuestionsFromCompanyMap(companyNames, chapterKeywords, limit = 8) {
  /** @type {ReturnType<typeof toQuestionReference>[]} */
  const collected = [];
  for (const companyName of companyNames) {
    const chapters = allCompaniesQuestions[companyName.toLowerCase()] ?? [];
    collected.push(...selectQuestions(chapters, chapterKeywords, { company: companyName, note: 'Commonly reported in interview prep datasets.' }, limit));
  }
  return prioritizeQuestions(collected).slice(0, limit);
}

function formatQuestionBullet(question) {
  const tags = [question.company, question.difficulty, question.chapterTitle, question.note]
    .filter(Boolean)
    .slice(0, 3)
    .join(' · ');
  return tags ? `${question.title} · ${tags}` : question.title;
}

function buildPracticeLesson({ slug, title, summary, whyItMatters, patternFocus, executionFocus, interviewPrompts, questions }) {
  const runnableQuestions = questions.filter((question) => question.supportsLocalWasmRun);
  const spotlight = (runnableQuestions.length ? runnableQuestions : questions).slice(0, 6);
  const questionNames = spotlight.slice(0, 3).map((question) => question.title).join(', ');
  return {
    slug,
    title,
    summary,
    duration: '30-45 min',
    whyItMatters,
    sections: [
      {
        heading: 'Pattern lens',
        body: patternFocus,
        bullets: [
          'Name the core data structure choice before you code.',
          'State the target time and space complexity up front.',
          'Use one invariant or pointer relationship to guide the implementation.'
        ]
      },
      {
        heading: 'Practice set',
        body: `Use this cluster to rehearse the same solving pattern across multiple prompts. Start with ${questionNames || 'the first question'} and keep your explanation focused on why the pattern applies.`,
        bullets: spotlight.map((question) => formatQuestionBullet(question))
      },
      {
        heading: 'Execution focus',
        body: executionFocus,
        bullets: [
          'Walk one example manually before finalizing the code.',
          'Call out the edge case that is most likely to break the first draft.',
          'Finish by restating the complexity and one possible follow-up optimization.'
        ]
      }
    ],
    checklist: [
      'Clarify constraints, input shape, and expected output before coding.',
      'Choose the intended pattern and defend its complexity.',
      'Narrate the invariant that keeps the solution correct.',
      'Test at least one edge case and one representative happy path aloud.'
    ],
    pitfalls: [
      'Jumping into code without naming the dominant pattern or invariant.',
      'Optimizing too early instead of getting the first correct version working.',
      'Ignoring duplicates, empty inputs, or off-by-one boundaries until the end.'
    ],
    interviewPrompts,
    diagram: null,
    related: [],
    practiceMode: 'coding',
    runtimeTarget: 'browser-wasm',
    questionHighlights: spotlight
  };
}

const generalSources = {
  easy: topInterviewQuestionsEasy,
  medium: topInterviewQuestionsMedium,
  hard: topInterviewQuestionsHard
};

const companySources = {
  amazon: amazonQuestions,
  apple: appleQuestions,
  facebook: facebookQuestions,
  google: googleQuestions,
  microsoft: microsoftQuestions
};

const arraysAndHashingQuestions = uniqueQuestions([
  ...selectQuestions(generalSources.easy, ['array', 'strings'], { difficulty: 'Easy' }, 4),
  ...selectQuestions(companySources.amazon, ['arrays and strings'], { company: 'Amazon' }, 4)
]).slice(0, 6);

const linkedListAndSearchQuestions = uniqueQuestions([
  ...selectQuestions(generalSources.easy, ['linked list', 'sorting', 'search'], { difficulty: 'Easy' }, 4),
  ...selectQuestions(generalSources.medium, ['linked list', 'sorting', 'search'], { difficulty: 'Medium' }, 4)
]).slice(0, 6);

const treesAndDpQuestions = uniqueQuestions([
  ...selectQuestions(generalSources.easy, ['trees', 'dynamic programming'], { difficulty: 'Easy' }, 4),
  ...selectQuestions(generalSources.medium, ['trees and graphs', 'dynamic programming'], { difficulty: 'Medium' }, 4)
]).slice(0, 6);

const slidingWindowQuestions = uniqueQuestions([
  ...selectQuestions(generalSources.medium, ['array and strings'], { difficulty: 'Medium' }, 4),
  ...selectQuestions(companySources.google, ['arrays and strings'], { company: 'Google' }, 4)
]).slice(0, 6);

const recursionAndBacktrackingQuestions = uniqueQuestions([
  ...selectQuestions(generalSources.medium, ['backtracking', 'trees and graphs'], { difficulty: 'Medium' }, 4),
  ...selectQuestions(companySources.facebook, ['recursion', 'trees and graphs'], { company: 'Meta' }, 4)
]).slice(0, 6);

const hardOptimizationQuestions = uniqueQuestions([
  ...selectQuestions(generalSources.hard, ['dynamic programming', 'sorting', 'trees and graphs'], { difficulty: 'Hard' }, 5),
  ...selectQuestions(companySources.google, ['dynamic programming', 'sorting and searching'], { company: 'Google' }, 4)
]).slice(0, 6);

const amazonRoundQuestions = uniqueQuestions([
  ...selectQuestions(companySources.amazon, ['arrays and strings', 'trees and graphs'], { company: 'Amazon' }, 6),
  ...selectQuestions(companySources.amazon, ['dynamic programming', 'sorting and searching'], { company: 'Amazon' }, 4)
]).slice(0, 6);

const googleRoundQuestions = uniqueQuestions([
  ...selectQuestions(companySources.google, ['arrays and strings', 'trees and graphs'], { company: 'Google' }, 6),
  ...selectQuestions(companySources.google, ['dynamic programming', 'design'], { company: 'Google' }, 4)
]).slice(0, 6);

const mixedCompanyQuestions = uniqueQuestions([
  ...selectQuestions(companySources.microsoft, ['arrays and strings', 'trees and graphs'], { company: 'Microsoft' }, 4),
  ...selectQuestions(companySources.facebook, ['arrays and strings', 'trees and graphs'], { company: 'Meta' }, 4),
  ...selectQuestions(companySources.apple, ['arrays and strings', 'sorting and searching'], { company: 'Apple' }, 4)
]).slice(0, 6);

const warmupQuestions = uniqueQuestions([
  ...selectQuestions(generalSources.easy, ['array', 'strings', 'trees'], { difficulty: 'Easy' }, 8)
]).slice(0, 6);

const companyHotlistQuestions = selectQuestionsFromCompanyMap(['Amazon', 'Google', 'Microsoft', 'Facebook'], ['arrays and strings', 'trees and graphs', 'dynamic programming'], 8);

const stretchQuestions = uniqueQuestions([
  ...selectQuestions(generalSources.hard, ['array and strings', 'dynamic programming', 'trees and graphs'], { difficulty: 'Hard' }, 6),
  ...selectQuestions(companySources.google, ['design', 'dynamic programming'], { company: 'Google' }, 4),
  ...selectQuestions(companySources.amazon, ['dynamic programming'], { company: 'Amazon' }, 4)
]).slice(0, 6);

export const rawDsaModules = [
  {
    slug: 'dsa-foundations',
    title: 'DSA foundations and warm-ups',
    summary: 'Start with the patterns that dominate coding screens: arrays, strings, linked lists, trees, and the first layer of dynamic programming.',
    objectives: [
      'Recognize common coding-round patterns quickly from the prompt shape',
      'Write a correct first-pass solution before optimizing under follow-up pressure',
      'Explain invariants, edge cases, and complexity clearly while coding'
    ],
    lessons: [
      buildPracticeLesson({
        slug: 'arrays-hashmaps-and-two-pointers',
        title: 'Arrays, hash maps, and two pointers',
        summary: 'Practice the fastest path from brute force to linear or near-linear array solutions.',
        whyItMatters: 'A large share of DSA screens begin here. Interviewers want to hear how you choose between indexing, frequency maps, sorting, and pointer movement.',
        patternFocus: 'Use this set to rehearse when to trade space for time with a hash map, when to sort first, and how to keep left/right pointer invariants stable through duplicates and boundary cases.',
        executionFocus: 'Aim to state the brute-force baseline first, then replace it with the intended hash-map or pointer invariant without losing correctness around duplicates and empty inputs.',
        interviewPrompts: [
          'When does sorting unlock a two-pointer solution that beats a hash-map approach?',
          'Which invariant keeps your left and right pointers from skipping the correct answer?',
          'How would you explain the trade-off between O(n) space and O(n log n) sorting in an interview?' 
        ],
        questions: arraysAndHashingQuestions
      }),
      buildPracticeLesson({
        slug: 'linked-lists-binary-search-and-ordering',
        title: 'Linked lists, binary search, and ordering problems',
        summary: 'Move from pointer manipulation into partitioning, ordering, and search-space pruning.',
        whyItMatters: 'These questions expose whether you can manage mutable state, midpoint logic, and off-by-one boundaries without getting lost in implementation details.',
        patternFocus: 'Practice slow-fast pointers, dummy nodes, partitioned search spaces, and the conditions that let you discard half the search region safely.',
        executionFocus: 'Keep pointer ownership explicit, draw one example list or sorted range, and say exactly why your midpoint or pointer updates cannot loop forever.',
        interviewPrompts: [
          'How do you decide whether a binary-search problem is searching an index, a value, or an answer space?',
          'What dummy-node setup makes a linked-list problem easier to reason about?',
          'Which boundary cases do you test first when the search region is size 0, 1, or 2?'
        ],
        questions: linkedListAndSearchQuestions
      }),
      buildPracticeLesson({
        slug: 'trees-heaps-and-intro-dp',
        title: 'Trees, heaps, and intro dynamic programming',
        summary: 'Rehearse recursive traversal, state propagation, priority-based selection, and small DP recurrences.',
        whyItMatters: 'Once an interviewer moves beyond arrays, they are often testing whether you can preserve state across recursion and build a concise recurrence without overcomplicating the code.',
        patternFocus: 'Use these prompts to practice DFS versus BFS selection, heap usage for top-k style problems, and the moment a recursive relation becomes a DP table or memoized search.',
        executionFocus: 'State what each recursive call returns, what global or accumulated state exists, and how you avoid recomputing overlapping subproblems.',
        interviewPrompts: [
          'What information should a tree DFS return to its caller versus keep globally?',
          'When is a heap cleaner than sorting the whole input?',
          'How do you know a recursive solution should become memoized dynamic programming?'
        ],
        questions: treesAndDpQuestions
      })
    ]
  },
  {
    slug: 'dsa-core-patterns',
    title: 'Core patterns for coding rounds',
    summary: 'Sharpen the medium-to-hard patterns that appear in stronger interview loops: sliding windows, recursion, graphs, and optimization-heavy DP.',
    objectives: [
      'Recognize the prompt signals that suggest windows, recursion trees, or memoization',
      'Talk through state transitions cleanly before writing implementation details',
      'Handle follow-ups that change constraints without restarting from zero'
    ],
    lessons: [
      buildPracticeLesson({
        slug: 'sliding-window-prefix-and-interval-style-thinking',
        title: 'Sliding windows, prefix thinking, and interval-style problems',
        summary: 'Use window expansion, shrinking rules, and accumulated state to solve substring and range problems efficiently.',
        whyItMatters: 'This family of problems is common because it tests whether you can maintain a live invariant while the input changes one step at a time.',
        patternFocus: 'Practice defining exactly what must remain true inside the current window, what forces a shrink, and when prefix state helps replace repeated range scans.',
        executionFocus: 'Name the variable that proves the current window is valid, then update it in a fixed order every time the left or right boundary moves.',
        interviewPrompts: [
          'What makes a problem a sliding-window problem instead of a prefix-sum or brute-force scan?',
          'Which invariant tells you when to shrink versus expand the window?',
          'How do you explain window validity without waving your hands around the implementation?'
        ],
        questions: slidingWindowQuestions
      }),
      buildPracticeLesson({
        slug: 'recursion-backtracking-and-search-trees',
        title: 'Recursion, backtracking, and search trees',
        summary: 'Practice generating combinations, traversing choice trees, and pruning branches that cannot lead to a valid answer.',
        whyItMatters: 'Interviewers use these problems to evaluate structure: can you model decisions, stop conditions, and backtracking cleanup without losing track of the stack state?',
        patternFocus: 'Use these prompts to rehearse state snapshots, choice ordering, pruning conditions, and the differences between exhaustive search, DFS, and memoized recursion.',
        executionFocus: 'Write the base case first, then say what state is chosen, recursed on, and undone when control returns.',
        interviewPrompts: [
          'How do you know when a recursive choice should be undone during backtracking?',
          'What pruning rule meaningfully shrinks the search tree for this problem family?',
          'When should a recursion tree become memoized instead of enumerated?' 
        ],
        questions: recursionAndBacktrackingQuestions
      }),
      buildPracticeLesson({
        slug: 'graphs-greedy-and-harder-dp',
        title: 'Graphs, greedy reasoning, and harder dynamic programming',
        summary: 'Handle problems where correctness depends on state transitions, reachability, or proving why a local choice is globally safe.',
        whyItMatters: 'This is where many rounds separate solid implementers from candidates who can defend correctness under deeper follow-ups.',
        patternFocus: 'Rehearse how to model graph state, when to topologically or breadth-first traverse it, and how to justify a recurrence or greedy choice with more than intuition.',
        executionFocus: 'State the subproblem, the transition, and the reason the transition covers all valid futures before diving into code.',
        interviewPrompts: [
          'How do you decide between BFS, DFS, Dijkstra-style expansion, or DP over states?',
          'What proof sketch makes a greedy choice believable in an interview?',
          'Which dimensions of state are essential before you build a DP table or memo?' 
        ],
        questions: hardOptimizationQuestions
      })
    ]
  },
  {
    slug: 'dsa-company-rounds',
    title: 'Company-specific DSA rounds',
    summary: 'Practice question clusters that resemble Amazon, Google, and other large-company coding loops, using the company datasets directly.',
    objectives: [
      'Get comfortable switching between general patterns and company-specific question mixes',
      'Rehearse explaining trade-offs in the style commonly expected in major tech interviews',
      'Use company sets to simulate tighter, more targeted mock rounds'
    ],
    lessons: [
      buildPracticeLesson({
        slug: 'amazon-online-assessment-practice',
        title: 'Amazon online assessment practice set',
        summary: 'Work through Amazon-style arrays, strings, trees, and DP prompts with an emphasis on clarity and correctness under time pressure.',
        whyItMatters: 'Amazon screens frequently reward clean implementation, pragmatic edge-case handling, and quick selection of a standard pattern without overengineering.',
        patternFocus: 'Use this set to practice arriving at a workable solution quickly, then tightening it once the main data structure and invariant are correct.',
        executionFocus: 'Pretend you are in an OA or early technical screen: finish the first correct version, test the main edge cases, then improve only if time remains.',
        interviewPrompts: [
          'What is the fastest correct baseline you would code first under a timed assessment?',
          'Which follow-up optimization would you mention only after the initial solution is stable?',
          'How do you keep your code readable when the timer is the main pressure?' 
        ],
        questions: amazonRoundQuestions
      }),
      buildPracticeLesson({
        slug: 'google-phone-and-onsite-practice',
        title: 'Google phone and onsite practice set',
        summary: 'Rehearse the kind of DSA prompts and follow-up depth that show up in Google-style phone screens and onsite loops.',
        whyItMatters: 'Google rounds often probe the reasoning behind the solution as much as the implementation. Strong answers make the invariant, recurrence, or graph state explicit before coding.',
        patternFocus: 'Practice solving one question, then immediately fielding follow-ups about alternative data structures, complexity trade-offs, or tighter constraints.',
        executionFocus: 'Narrate your thought process while coding so the interviewer can see the structure: problem restatement, approach choice, invariant, code, tests, and optimization.',
        interviewPrompts: [
          'How would you explain your approach before writing any code into a shared doc?',
          'What alternative approach would you compare against if the interviewer asks for a different angle?',
          'How do you keep follow-up optimizations tied to the original invariant instead of rewriting the whole answer?' 
        ],
        questions: googleRoundQuestions
      }),
      buildPracticeLesson({
        slug: 'mixed-big-tech-round-practice',
        title: 'Microsoft, Meta, and Apple practice mix',
        summary: 'Use a mixed-company set to simulate rounds where the prompt is less predictable and the company signal comes from the style of follow-up questions.',
        whyItMatters: 'Mixed-company practice is useful when you need broader DSA readiness instead of optimizing only for one interview format.',
        patternFocus: 'Treat this as a generalist loop: identify the pattern quickly, justify the chosen complexity, and be ready to discuss production-quality edge cases and readability.',
        executionFocus: 'Keep your first implementation compact, then spend the remaining time on test cases, complexity, and one alternate strategy you rejected.',
        interviewPrompts: [
          'What makes a solution feel robust enough for an onsite coding round instead of just LeetCode-complete?',
          'How do you pivot when the interviewer changes the constraint after you finish the first pass?',
          'Which parts of your explanation are reusable across companies even when the prompt mix changes?' 
        ],
        questions: mixedCompanyQuestions
      })
    ]
  },
  {
    slug: 'dsa-mock-loops',
    title: 'Mock loops and progression',
    summary: 'Use warm-up, cross-company, and stretch sets to simulate a full DSA study progression from easy reps to harder follow-up-heavy rounds.',
    objectives: [
      'Build a repeatable practice cadence across easy, medium, and hard problem sets',
      'Blend general and company datasets into realistic mixed mock rounds',
      'Track which patterns still break down under time pressure'
    ],
    lessons: [
      buildPracticeLesson({
        slug: 'easy-warmup-round',
        title: 'Easy warm-up round',
        summary: 'Use short, representative questions to warm up core patterns before a longer mock session.',
        whyItMatters: 'Warm-up reps help you regain fluency in the standard patterns so the first real mock round is not wasted on syntax or mechanical mistakes.',
        patternFocus: 'Focus on clean restatement, one-pass scans, map usage, and simple traversals rather than exotic optimizations.',
        executionFocus: 'Solve quickly, speak clearly, and use the time to reinforce consistency in explanation rather than to chase trickier variants.',
        interviewPrompts: [
          'Which core patterns should feel automatic before you start harder rounds?',
          'How would you keep a warm-up question from turning into unnecessary over-analysis?',
          'What signals tell you the warm-up served its purpose and you are ready to move on?' 
        ],
        questions: warmupQuestions
      }),
      buildPracticeLesson({
        slug: 'cross-company-medium-round',
        title: 'Cross-company medium round',
        summary: 'Simulate a realistic mid-level loop with cross-company medium-difficulty questions collected from the shared company dataset.',
        whyItMatters: 'This is often the sweet spot of interview difficulty: not pure trivia, but not impossible either. The goal is structured reasoning under moderate pressure.',
        patternFocus: 'Use these prompts to practice identifying the right pattern quickly and spending most of your time defending correctness and edge-case handling.',
        executionFocus: 'Run this lesson like a real interview: one problem, one clear approach, live coding, then follow-up tests and refinement.',
        interviewPrompts: [
          'How do you recover when your first chosen pattern is not quite right?',
          'What is the minimum test suite you would speak aloud before declaring the answer done?',
          'How do you balance speed with proof of correctness in a medium-difficulty round?' 
        ],
        questions: companyHotlistQuestions
      }),
      buildPracticeLesson({
        slug: 'hard-stretch-round',
        title: 'Hard stretch round and review',
        summary: 'Use a harder set to practice decomposition, state design, and staying coherent when the problem does not yield immediately.',
        whyItMatters: 'Harder prompts are useful not because every company asks them, but because they expose where your reasoning breaks when the pattern is less obvious.',
        patternFocus: 'Slow down enough to model the subproblem, state transition, or graph structure before typing. The main win here is disciplined decomposition, not raw speed.',
        executionFocus: 'Treat the round as a review exercise: if you do not finish, aim to leave behind a correct direction, partial proof, and a clean next step.',
        interviewPrompts: [
          'What do you say when the right state or recurrence is not obvious yet?',
          'How would you break a hard prompt into solvable subproblems for the interviewer?',
          'When is it better to present a well-reasoned partial solution than to force buggy code?' 
        ],
        questions: stretchQuestions
      })
    ]
  }
];
