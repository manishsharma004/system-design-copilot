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

function selectQuestions(chapters, chapterKeywords, source, limit = 6, titleKeywords = [], options = {}) {
  const normalizedKeywords = chapterKeywords.map((keyword) => keyword.toLowerCase());
  const normalizedTitles = titleKeywords.map((keyword) => keyword.toLowerCase());
  const matchingChapters = chapters.filter((chapter) =>
    normalizedKeywords.some((keyword) => chapter.title.toLowerCase().includes(keyword))
  );
  const orderedChapters =
    options.strictChapters && matchingChapters.length
      ? matchingChapters
      : [
          ...matchingChapters,
          ...chapters.filter(
            (chapter) => !normalizedKeywords.some((keyword) => chapter.title.toLowerCase().includes(keyword))
          )
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

  let pool = collected;
  if (normalizedTitles.length) {
    const titleHits = collected.filter((question) => {
      if (!question?.title) return false;
      return normalizedTitles.some((keyword) => question.title.toLowerCase().includes(keyword));
    });
    const chapterHits = collected.filter((question) => {
      if (!question) return false;
      return normalizedKeywords.some((keyword) => (question.chapterTitle || '').toLowerCase().includes(keyword));
    });
    const preferred = uniqueQuestions([...titleHits, ...chapterHits]);
    // Prefer title/chapter hits; only fall back to the broader pool if the set is too thin.
    pool = preferred.length >= Math.min(limit, 3) ? preferred : uniqueQuestions([...preferred, ...collected]);
  }

  return prioritizeQuestions(pool).slice(0, limit);
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

function buildPracticeLesson({
  slug,
  title,
  summary,
  whyItMatters,
  patternFocus,
  executionFocus,
  interviewPrompts,
  questions,
  related = /** @type {string[]} */ ([]),
  studyBridge = '',
  patternSignals = /** @type {string[]} */ ([]),
  warmUpChecks = /** @type {string[]} */ ([])
}) {
  const runnableQuestions = questions.filter((question) => question.supportsLocalWasmRun);
  const spotlight = (runnableQuestions.length ? runnableQuestions : questions).slice(0, 6);
  const questionNames = spotlight.slice(0, 3).map((question) => question.title).join(', ');
  const signals =
    patternSignals.length > 0
      ? patternSignals
      : [
          'Name the core data structure choice before you code.',
          'State the target time and space complexity up front.',
          'Use one invariant or pointer relationship to guide the implementation.'
        ];
  const checks =
    warmUpChecks.length > 0
      ? warmUpChecks
      : [
          'Walk one example manually before finalizing the code.',
          'Call out the edge case that is most likely to break the first draft.',
          'Finish by restating the complexity and one possible follow-up optimization.'
        ];
  const bridgeBody =
    studyBridge ||
    'If the pattern still feels mechanical, revisit the matching DSA concept or pattern lab first. Study labs teach the invariant with worked Python examples; this lesson is for timed transfer into interview prompts.';
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
        bullets: signals
      },
      {
        heading: 'Study bridge',
        body: bridgeBody,
        bullets: [
          'Restate the invariant or recurrence in one sentence before opening the IDE.',
          'Skim one worked example from the linked study lab if the first prompt feels unfamiliar.',
          'Return here for timed drills once you can explain why the pattern is safe.'
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
        bullets: checks
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
    related,
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
  ...selectQuestions(generalSources.easy, ['array', 'strings'], { difficulty: 'Easy' }, 4, [
    'two sum',
    'valid anagram',
    'contains duplicate',
    'intersection of two arrays',
    'group anagram'
  ], { strictChapters: true }),
  ...selectQuestions(companySources.amazon, ['arrays and strings'], { company: 'Amazon' }, 4, [
    'two sum',
    'group anagram',
    'contains duplicate',
    'longest substring'
  ], { strictChapters: true })
]).slice(0, 6);

const linkedListAndSearchQuestions = uniqueQuestions([
  ...selectQuestions(generalSources.medium, ['sorting and searching'], { difficulty: 'Medium' }, 6, [
    'find first and last',
    'search in rotated',
    'find peak',
    'merge intervals',
    'sort colors',
    'meeting rooms',
    'kth largest',
    'top k frequent'
  ], { strictChapters: true }),
  ...selectQuestions(generalSources.easy, ['sorting and searching', 'array'], { difficulty: 'Easy' }, 3, [
    'merge sorted array',
    'remove duplicates from sorted',
    'first bad version'
  ], { strictChapters: true })
]).slice(0, 6);

const treesAndDpQuestions = uniqueQuestions([
  ...selectQuestions(generalSources.easy, ['dynamic programming', 'array'], { difficulty: 'Easy' }, 3, [
    'climbing stairs',
    'best time to buy',
    'single number',
    'contains duplicate'
  ], { strictChapters: true }),
  ...selectQuestions(generalSources.medium, ['dynamic programming'], { difficulty: 'Medium' }, 4, [
    'unique paths',
    'jump game',
    'coin change',
    'longest increasing subsequence'
  ], { strictChapters: true }),
  ...selectQuestions(generalSources.hard, ['trees and graphs'], { difficulty: 'Hard' }, 3, [
    'number of provinces',
    'course schedule',
    'word ladder'
  ], { strictChapters: true })
]).slice(0, 6);

const hardOptimizationQuestions = uniqueQuestions([
  ...selectQuestions(generalSources.hard, ['trees and graphs'], { difficulty: 'Hard' }, 5, [
    'course schedule',
    'word ladder',
    'alien dictionary',
    'number of provinces',
    'longest increasing path',
    'count of smaller'
  ], { strictChapters: true }),
  ...selectQuestions(generalSources.medium, ['dynamic programming'], { difficulty: 'Medium' }, 3, [
    'coin change',
    'jump game',
    'longest increasing subsequence',
    'unique paths'
  ], { strictChapters: true }),
  ...selectQuestions(generalSources.hard, ['dynamic programming'], { difficulty: 'Hard' }, 3, [
    'word break',
    'burst balloons',
    'decode ways',
    'perfect squares'
  ], { strictChapters: true })
]).slice(0, 6);

const slidingWindowQuestions = uniqueQuestions([
  ...selectQuestions(generalSources.medium, ['array and strings'], { difficulty: 'Medium' }, 5, [
    'longest substring without repeating',
    'longest palindromic substring',
    'group anagrams',
    'minimum window'
  ], { strictChapters: true }),
  ...selectQuestions(companySources.google, ['arrays and strings'], { company: 'Google' }, 4, [
    'longest substring',
    'minimum window',
    'group anagram',
    'find all anagram'
  ], { strictChapters: true }),
  ...selectQuestions(generalSources.hard, ['array and strings'], { difficulty: 'Hard' }, 2, [
    'minimum window substring',
    'substring with concatenation'
  ], { strictChapters: true })
]).slice(0, 6);

const recursionAndBacktrackingQuestions = uniqueQuestions([
  ...selectQuestions(generalSources.medium, ['backtracking'], { difficulty: 'Medium' }, 5, [
    'generate parentheses',
    'permutations',
    'subsets',
    'letter combinations',
    'word search',
    'combination sum'
  ], { strictChapters: true }),
  ...selectQuestions(companySources.facebook, ['recursion'], { company: 'Meta' }, 4, [
    'generate parentheses',
    'permutations',
    'subsets',
    'letter combinations',
    'combination'
  ], { strictChapters: true }),
  ...selectQuestions(generalSources.hard, ['backtracking'], { difficulty: 'Hard' }, 2, [
    'n-queens',
    'word search ii'
  ], { strictChapters: true })
]).slice(0, 6);

const amazonRoundQuestions = uniqueQuestions([
  ...selectQuestions(companySources.amazon, ['arrays and strings'], { company: 'Amazon' }, 4, [
    'two sum',
    'longest substring',
    'group anagram',
    'trapping rain',
    'container with most water'
  ], { strictChapters: true }),
  ...selectQuestions(companySources.amazon, ['trees and graphs'], { company: 'Amazon' }, 3, [
    'number of islands',
    'course schedule',
    'word ladder',
    'validate binary'
  ], { strictChapters: true }),
  ...selectQuestions(companySources.amazon, ['dynamic programming', 'design'], { company: 'Amazon' }, 3, [
    'lru cache',
    'coin change',
    'house robber',
    'climbing stairs'
  ], { strictChapters: true })
]).slice(0, 6);

const googleRoundQuestions = uniqueQuestions([
  ...selectQuestions(companySources.google, ['sorting and searching'], { company: 'Google' }, 3, [
    'find peak',
    'first bad',
    'search a 2d',
    'split array',
    'capacity to ship'
  ], { strictChapters: true }),
  ...selectQuestions(companySources.google, ['trees and graphs'], { company: 'Google' }, 4, [
    'course schedule',
    'word ladder',
    'alien dictionary',
    'number of islands',
    'network delay'
  ], { strictChapters: true }),
  ...selectQuestions(companySources.google, ['dynamic programming', 'design'], { company: 'Google' }, 3, [
    'edit distance',
    'unique paths',
    'lru cache',
    'serialize and deserialize'
  ], { strictChapters: true })
]).slice(0, 6);

const mixedCompanyQuestions = uniqueQuestions([
  ...selectQuestions(companySources.microsoft, ['arrays and strings', 'sorting and searching'], { company: 'Microsoft' }, 3, [
    'search a 2d',
    'longest substring',
    'two sum',
    'spiral matrix'
  ], { strictChapters: true }),
  ...selectQuestions(companySources.facebook, ['arrays and strings'], { company: 'Meta' }, 3, [
    'longest substring',
    'group anagram',
    '3sum',
    'move zeroes'
  ], { strictChapters: true }),
  ...selectQuestions(companySources.apple, ['arrays and strings', 'sorting and searching'], { company: 'Apple' }, 3, [
    'two sum',
    'valid parentheses',
    'merge sorted',
    'first bad'
  ], { strictChapters: true }),
  ...selectQuestions(generalSources.hard, ['design'], { difficulty: 'Hard' }, 2, [
    'lru cache',
    'implement trie',
    'insert delete getrandom'
  ], { strictChapters: true })
]).slice(0, 6);

const warmupQuestions = uniqueQuestions([
  ...selectQuestions(generalSources.easy, ['array'], { difficulty: 'Easy' }, 2, ['two sum', 'contains duplicate'], { strictChapters: true }),
  ...selectQuestions(generalSources.easy, ['strings'], { difficulty: 'Easy' }, 2, ['valid anagram', 'valid palindrome', 'valid parentheses'], { strictChapters: true }),
  ...selectQuestions(generalSources.easy, ['linked list'], { difficulty: 'Easy' }, 2, ['reverse linked', 'linked list cycle'], { strictChapters: true }),
  ...selectQuestions(generalSources.easy, ['trees', 'dynamic programming'], { difficulty: 'Easy' }, 2, ['maximum depth', 'climbing stairs'], { strictChapters: true })
]).slice(0, 6);

const companyHotlistQuestions = uniqueQuestions([
  ...selectQuestionsFromCompanyMap(['Amazon', 'Google', 'Microsoft', 'Facebook'], ['arrays and strings'], 4),
  ...selectQuestionsFromCompanyMap(['Amazon', 'Google', 'Microsoft', 'Facebook'], ['trees and graphs', 'dynamic programming'], 4)
]).slice(0, 8);

const stretchQuestions = uniqueQuestions([
  ...selectQuestions(generalSources.hard, ['array and strings'], { difficulty: 'Hard' }, 2, [
    'minimum window substring',
    'trapping rain water'
  ], { strictChapters: true }),
  ...selectQuestions(generalSources.hard, ['dynamic programming'], { difficulty: 'Hard' }, 2, [
    'edit distance',
    'wildcard matching'
  ], { strictChapters: true }),
  ...selectQuestions(generalSources.hard, ['trees and graphs'], { difficulty: 'Hard' }, 2, [
    'word ladder',
    'alien dictionary'
  ], { strictChapters: true }),
  ...selectQuestions(companySources.google, ['design', 'dynamic programming'], { company: 'Google' }, 2, [
    'lru cache',
    'serialize',
    'edit distance'
  ], { strictChapters: true }),
  ...selectQuestions(companySources.amazon, ['dynamic programming', 'design'], { company: 'Amazon' }, 2, [
    'lru cache',
    'coin change',
    'word ladder'
  ], { strictChapters: true })
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
        studyBridge:
          'Study first in Arrays, two pointers, and prefix sums plus Complexity and algorithmic thinking. Those labs teach the operation-first decision and the monotonic proof behind pointer movement; this drill transfers that judgment into timed prompts.',
        patternSignals: [
          'Ask whether the hot operation is membership, ordered pairing, range aggregation, or bulk update.',
          'Prefer a hash map when indices or counts must survive unsorted order.',
          'Prefer sorting plus two pointers when a monotonic move discards many candidates at once.'
        ],
        executionFocus: 'Aim to state the brute-force baseline first, then replace it with the intended hash-map or pointer invariant without losing correctness around duplicates and empty inputs.',
        interviewPrompts: [
          'When does sorting unlock a two-pointer solution that beats a hash-map approach?',
          'Which invariant keeps your left and right pointers from skipping the correct answer?',
          'How would you explain the trade-off between O(n) space and O(n log n) sorting in an interview?'
        ],
        related: ['arrays-two-pointers-and-prefix-sums', 'complexity-and-algorithmic-thinking'],
        questions: arraysAndHashingQuestions
      }),
      buildPracticeLesson({
        slug: 'linked-lists-binary-search-and-ordering',
        title: 'Linked lists, binary search, and ordering problems',
        summary: 'Move from pointer manipulation into partitioning, ordering, and search-space pruning.',
        whyItMatters: 'These questions expose whether you can manage mutable state, midpoint logic, and off-by-one boundaries without getting lost in implementation details.',
        patternFocus: 'Practice slow-fast pointers, dummy nodes, partitioned search spaces, and the conditions that let you discard half the search region safely.',
        studyBridge:
          'Use Linked lists and pointer invariants for pointer ownership theory, then Binary search on answer spaces for monotonic predicates. Linked-list prompts in the bank are often not single-method WASM-runnable, so this practice set drills the ordering/search half with live tests while you keep list mutation fluency from the study lab exercises.',
        patternSignals: [
          'Draw next-pointer ownership before mutating a list.',
          'Name whether binary search is over indices, values, or a feasibility answer space.',
          'Prove why each midpoint decision discards half the remaining region.'
        ],
        executionFocus: 'Keep pointer ownership explicit, draw one example list or sorted range, and say exactly why your midpoint or pointer updates cannot loop forever.',
        interviewPrompts: [
          'How do you decide whether a binary-search problem is searching an index, a value, or an answer space?',
          'What dummy-node setup makes a linked-list problem easier to reason about?',
          'Which boundary cases do you test first when the search region is size 0, 1, or 2?'
        ],
        related: ['linked-lists-and-pointer-invariants', 'binary-search-on-answer-spaces'],
        questions: linkedListAndSearchQuestions
      }),
      buildPracticeLesson({
        slug: 'trees-heaps-and-intro-dp',
        title: 'Trees, heaps, and intro dynamic programming',
        summary: 'Rehearse recursive traversal, state propagation, priority-based selection, and small DP recurrences.',
        whyItMatters: 'Once an interviewer moves beyond arrays, they are often testing whether you can preserve state across recursion and build a concise recurrence without overcomplicating the code.',
        patternFocus: 'Use these prompts to practice DFS versus BFS selection, heap usage for top-k style problems, and the moment a recursive relation becomes a DP table or memoized search.',
        studyBridge:
          'Pair Trees and graphs mental models with Heaps, top-k, and priority queues, then skim Dynamic programming cookbook for the first recurrence. Come back here once you can state return values, heap invariants, and overlapping subproblems cleanly.',
        patternSignals: [
          'Decide what a recursive call returns versus what stays global.',
          'Use a heap when you need repeated extract-min/max without full sorting.',
          'Promote recursion to DP only after naming state, transition, and overlapping work.'
        ],
        executionFocus: 'State what each recursive call returns, what global or accumulated state exists, and how you avoid recomputing overlapping subproblems.',
        interviewPrompts: [
          'What information should a tree DFS return to its caller versus keep globally?',
          'When is a heap cleaner than sorting the whole input?',
          'How do you know a recursive solution should become memoized dynamic programming?'
        ],
        related: ['trees-graphs-mental-models', 'heaps-topk-and-priority-queues', 'dynamic-programming-cookbook'],
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
        studyBridge:
          'Study Sliding window and substring invariants first, then refresh Arrays, two pointers, and prefix sums for prefix-state variants. The lab makes shrink rules explicit so this drill can focus on live narration.',
        patternSignals: [
          'Define the window invariant before moving either boundary.',
          'Shrink only when the invariant is broken, and update counts in a fixed order.',
          'Switch to prefix thinking when the question is aggregate ranges rather than a contiguous live window.'
        ],
        executionFocus: 'Name the variable that proves the current window is valid, then update it in a fixed order every time the left or right boundary moves.',
        interviewPrompts: [
          'What makes a problem a sliding-window problem instead of a prefix-sum or brute-force scan?',
          'Which invariant tells you when to shrink versus expand the window?',
          'How do you explain window validity without waving your hands around the implementation?'
        ],
        related: ['sliding-window-and-substring-invariants', 'arrays-two-pointers-and-prefix-sums'],
        questions: slidingWindowQuestions
      }),
      buildPracticeLesson({
        slug: 'recursion-backtracking-and-search-trees',
        title: 'Recursion, backtracking, and search trees',
        summary: 'Practice generating combinations, traversing choice trees, and pruning branches that cannot lead to a valid answer.',
        whyItMatters: 'Interviewers use these problems to evaluate structure: can you model decisions, stop conditions, and backtracking cleanup without losing track of the stack state?',
        patternFocus: 'Use these prompts to rehearse state snapshots, choice ordering, pruning conditions, and the differences between exhaustive search, DFS, and memoized recursion.',
        studyBridge:
          'Work through Recursion, backtracking, and pruning before this set. The study lab covers choose/explore/undo discipline and when memoization replaces enumeration; this lesson pressure-tests that structure on interview prompts.',
        patternSignals: [
          'Write the base case and the undo step before expanding the search tree.',
          'Order choices so pruning can fire early.',
          'Escalate to memoization only when overlapping states appear.'
        ],
        executionFocus: 'Write the base case first, then say what state is chosen, recursed on, and undone when control returns.',
        interviewPrompts: [
          'How do you know when a recursive choice should be undone during backtracking?',
          'What pruning rule meaningfully shrinks the search tree for this problem family?',
          'When should a recursion tree become memoized instead of enumerated?'
        ],
        related: ['recursion-backtracking-and-pruning'],
        questions: recursionAndBacktrackingQuestions
      }),
      buildPracticeLesson({
        slug: 'graphs-greedy-and-harder-dp',
        title: 'Graphs, greedy reasoning, and harder dynamic programming',
        summary: 'Handle problems where correctness depends on state transitions, reachability, or proving why a local choice is globally safe.',
        whyItMatters: 'This is where many rounds separate solid implementers from candidates who can defend correctness under deeper follow-ups.',
        patternFocus: 'Rehearse how to model graph state, when to topologically or breadth-first traverse it, and how to justify a recurrence or greedy choice with more than intuition.',
        studyBridge:
          'Refresh Shortest paths and union-find plus Dynamic programming cookbook before the harder prompts. Those labs supply representation choices, algorithm selection, and state-design language you can reuse under follow-ups.',
        patternSignals: [
          'Model the graph or DP state before choosing BFS, Dijkstra, greedy, or tabulation.',
          'Prove why a local greedy choice does not block a better global answer.',
          'Count states times transition work before claiming a DP bound.'
        ],
        executionFocus: 'State the subproblem, the transition, and the reason the transition covers all valid futures before diving into code.',
        interviewPrompts: [
          'How do you decide between BFS, DFS, Dijkstra-style expansion, or DP over states?',
          'What proof sketch makes a greedy choice believable in an interview?',
          'Which dimensions of state are essential before you build a DP table or memo?'
        ],
        related: ['shortest-paths-and-union-find', 'dynamic-programming-cookbook'],
        questions: hardOptimizationQuestions
      })
    ]
  },
  {
    slug: 'dsa-company-rounds',
    title: 'Company-specific DSA rounds',
    summary:
      'Practice question clusters shaped like current Amazon OA, Google phone/onsite, and Meta/Microsoft/Apple mixes — with company pattern profiles that differ in breadth versus reasoning depth.',
    objectives: [
      'Switch between Amazon breadth, Google reasoning depth, and Meta hash/window/design fluency',
      'Adapt explanation style for OA finish-correct-first versus phone narration versus onsite follow-ups',
      'Use company sets to simulate tighter, more targeted mock rounds without over-fitting one firm'
    ],
    lessons: [
      buildPracticeLesson({
        slug: 'amazon-online-assessment-practice',
        title: 'Amazon online assessment practice set',
        summary:
          'Work through Amazon-style arrays, strings, trees, DP, and design prompts with an OA-first policy: correct, tested, then improve only if time remains.',
        whyItMatters:
          'Amazon OAs and early screens still reward pattern recognition across a wide band (windows, hashing, graphs, DP, design). Current rounds punish incomplete submissions more than missing micro-optimizations.',
        patternFocus:
          'Treat Amazon prep as breadth-first: identify the family quickly (window, map, BFS/DFS, recurrence, or design DS), ship a correct baseline, then tighten only if the timer still allows.',
        studyBridge:
          'Refresh Arrays/two pointers, Sliding window, Graphs/DP, and Bits/strings/LRU design before this set. Amazon often mixes ordinary pattern prompts with design fluency follow-ups like LRU.',
        patternSignals: [
          'Prefer a correct O(n) or O(n log n) baseline over a fragile clever trick.',
          'Name edge cases early: empties, duplicates, single-element inputs, and overflow-ish bounds.',
          'If a design prompt appears, state capacity, eviction policy, and amortized complexity before coding.'
        ],
        executionFocus:
          'Simulate a timed OA: restatement → pattern → code → sample tests → complexity. Optimize or refactor only after the happy path and main edge cases pass.',
        interviewPrompts: [
          'What is the fastest correct baseline you would code first under a timed assessment?',
          'Which follow-up optimization would you mention only after the initial solution is stable?',
          'How do you keep your code readable when the timer is the main pressure?'
        ],
        related: [
          'arrays-two-pointers-and-prefix-sums',
          'sliding-window-and-substring-invariants',
          'bits-strings-hashing-and-lru-design'
        ],
        questions: amazonRoundQuestions
      }),
      buildPracticeLesson({
        slug: 'google-phone-and-onsite-practice',
        title: 'Google phone and onsite practice set',
        summary:
          'Rehearse Google-style prompts that lean on predicate search, graph reasoning, and explicit trade-off narration before and after coding.',
        whyItMatters:
          'Google rounds still use coding, but the signal is judgment: can you state the invariant, compare approaches, and survive constraint changes? Predicate search and graph depth show up more than raw memorization.',
        patternFocus:
          'Practice solving one question, then immediately fielding follow-ups about alternative data structures, tighter constraints, or a different search space formulation.',
        studyBridge:
          'Study Binary search on answer spaces plus Shortest paths/Union-Find and Dynamic programming cookbook first. Google-style loops reward monotonic predicates and graph state clarity.',
        patternSignals: [
          'Ask whether binary search is over an index, a value, or a feasibility answer.',
          'For graphs, name BFS vs Dijkstra vs topo vs Union-Find before coding.',
          'Leave time to compare a second approach even if you do not fully code it.'
        ],
        executionFocus:
          'Narrate the structure out loud: restatement, approach choice, invariant/recurrence, code, tests, then one alternate strategy. Do not silently grind to an answer.',
        interviewPrompts: [
          'How would you explain your approach before writing any code into a shared doc?',
          'What alternative approach would you compare against if the interviewer asks for a different angle?',
          'How do you keep follow-up optimizations tied to the original invariant instead of rewriting the whole answer?'
        ],
        related: [
          'binary-search-on-answer-spaces',
          'shortest-paths-and-union-find',
          'dynamic-programming-cookbook'
        ],
        questions: googleRoundQuestions
      }),
      buildPracticeLesson({
        slug: 'mixed-big-tech-round-practice',
        title: 'Microsoft, Meta, and Apple practice mix',
        summary:
          'Use a mixed-company set spanning Microsoft multi-dimensional search flavor, Meta hash/window/design fluency, and Apple fundamentals depth.',
        whyItMatters:
          'Not every loop looks like Google. Meta leans windows and hashing; Microsoft often probes matrix/search variants; Apple still rewards clean fundamentals. Mixed practice prevents over-fitting one company profile.',
        patternFocus:
          'Identify the company-shaped signal quickly, then fall back to the universal baseline: counting, windows, prefix sums, binary search, backtracking, and design DS.',
        studyBridge:
          'Pair Sliding window and Hash/memory labs with Monotonic stacks and Bits/strings/LRU design. Those cover the Meta-heavy and design-fluent gaps that mixed loops still surface.',
        patternSignals: [
          'Meta-shaped: hash maps, sliding windows, and design implementations.',
          'Microsoft-shaped: search over matrices/ranges and careful boundary reasoning.',
          'Apple-shaped: fundamentals first — clean counting, pointers, and readable code.'
        ],
        executionFocus:
          'Keep the first implementation compact, then spend remaining time on tests, complexity, and one alternate strategy you rejected for production-quality reasons.',
        interviewPrompts: [
          'What makes a solution feel robust enough for an onsite coding round instead of just LeetCode-complete?',
          'How do you pivot when the interviewer changes the constraint after you finish the first pass?',
          'Which parts of your explanation are reusable across companies even when the prompt mix changes?'
        ],
        related: [
          'sliding-window-and-substring-invariants',
          'monotonic-stacks-and-next-greater',
          'bits-strings-hashing-and-lru-design'
        ],
        questions: mixedCompanyQuestions
      })
    ]
  },
  {
    slug: 'dsa-mock-loops',
    title: 'Mock loops and progression',
    summary:
      'Use warm-up, cross-company, and stretch sets to simulate a full modern prep cadence: fluency reps, mid-level narration, then hard decomposition under follow-ups.',
    objectives: [
      'Build a repeatable cadence across easy fluency, medium company mixes, and hard stretch prompts',
      'Blend general and company datasets into realistic mixed mock rounds',
      'Track which patterns still break down under time pressure without over-optimizing too early'
    ],
    lessons: [
      buildPracticeLesson({
        slug: 'easy-warmup-round',
        title: 'Easy warm-up round',
        summary: 'Use short, high-frequency questions to warm up core universal patterns before a longer mock session.',
        whyItMatters:
          'Warm-up reps restore fluency in the universal baseline (counting, two pointers, simple trees/DP) so the first scored round is not wasted on syntax.',
        patternFocus:
          'Focus on clean restatement, one-pass scans, map usage, and simple traversals rather than exotic optimizations.',
        studyBridge:
          'If warm-ups feel slow, revisit Complexity and algorithmic thinking plus Arrays/two pointers. The goal is automatic pattern selection, not novelty.',
        executionFocus:
          'Solve quickly, speak clearly, and reinforce explanation consistency. Stop as soon as the warm-up proves the basics are online.',
        interviewPrompts: [
          'Which core patterns should feel automatic before you start harder rounds?',
          'How would you keep a warm-up question from turning into unnecessary over-analysis?',
          'What signals tell you the warm-up served its purpose and you are ready to move on?'
        ],
        related: ['complexity-and-algorithmic-thinking', 'arrays-two-pointers-and-prefix-sums'],
        questions: warmupQuestions
      }),
      buildPracticeLesson({
        slug: 'cross-company-medium-round',
        title: 'Cross-company medium round',
        summary:
          'Simulate a realistic mid-level loop with cross-company medium prompts where pattern choice and edge-case narration matter more than trivia.',
        whyItMatters:
          'This is the common onsite/phone difficulty band in current loops: not pure trivia, not impossible. Structured reasoning under moderate pressure is the score.',
        patternFocus:
          'Identify the right pattern quickly, then spend most of the time defending correctness, tests, and complexity.',
        studyBridge:
          'Rotate through Sliding window, Recursion/backtracking, and Graphs/DP labs before this mock. Medium rounds usually mash those families together.',
        executionFocus:
          'Run it like a real interview: one problem, one clear approach, live coding, sample tests, then refinement. Do not chase a second rewrite unless the first approach is wrong.',
        interviewPrompts: [
          'How do you recover when your first chosen pattern is not quite right?',
          'What is the minimum test suite you would speak aloud before declaring the answer done?',
          'How do you balance speed with proof of correctness in a medium-difficulty round?'
        ],
        related: [
          'sliding-window-and-substring-invariants',
          'recursion-backtracking-and-pruning',
          'shortest-paths-and-union-find'
        ],
        questions: companyHotlistQuestions
      }),
      buildPracticeLesson({
        slug: 'hard-stretch-round',
        title: 'Hard stretch round and review',
        summary:
          'Use harder prompts to practice decomposition, state design, and leaving a coherent partial solution when the pattern is not obvious.',
        whyItMatters:
          'Harder prompts matter less as exact company tags and more as stress tests for reasoning. Current loops still reward a well-argued partial over silent buggy code.',
        patternFocus:
          'Slow down enough to model the subproblem, state transition, or graph structure before typing. Disciplined decomposition beats raw speed.',
        studyBridge:
          'Review Dynamic programming cookbook, Tries, and Bits/strings/LRU design before stretching. Hard follow-ups often add state dimensions or design constraints.',
        executionFocus:
          'If you do not finish, leave a correct direction, partial proof, tested helpers, and a clean next step. Narrate uncertainty instead of freezing.',
        interviewPrompts: [
          'What do you say when the right state or recurrence is not obvious yet?',
          'How would you break a hard prompt into solvable subproblems for the interviewer?',
          'When is it better to present a well-reasoned partial solution than to force buggy code?'
        ],
        related: [
          'dynamic-programming-cookbook',
          'tries-and-prefix-decision-trees',
          'bits-strings-hashing-and-lru-design'
        ],
        questions: stretchQuestions
      })
    ]
  }
];
