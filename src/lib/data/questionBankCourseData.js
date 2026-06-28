/**
 * Data definitions for the "Coding interview question bank" learning + practice
 * flow. This flow mirrors the standalone dsalgo questions browser: learners pick
 * a company or category bucket, browse every question in that bucket grouped by
 * section, read the problem, and practice runnable ones in an in-browser editor.
 *
 * The heavy per-bucket question datasets are NOT imported here. They are loaded
 * lazily, on demand, inside `QuestionBankIDE.svelte` (one chunk per bucket) so
 * lesson pages stay light. Each lesson only carries authored study scaffolding
 * plus a `questionBank` descriptor pointing at the dataset key to load.
 */

/**
 * @typedef {Object} QuestionBankDescriptor
 * @property {string} key Dataset key matching a loader in QuestionBankIDE.
 * @property {string} label Human-friendly bucket label.
 * @property {'company' | 'category' | 'strategy'} kind Bucket category.
 */

/**
 * @param {{
 *   slug: string,
 *   title: string,
 *   summary: string,
 *   whyItMatters: string,
 *   focus: string,
 *   practiceFocus: string,
 *   reviewFocus: string,
 *   interviewPrompts: string[],
 *   questionBank: QuestionBankDescriptor
 * }} config
 */
function buildQuestionBankLesson(config) {
  const { slug, title, summary, whyItMatters, focus, practiceFocus, reviewFocus, interviewPrompts, questionBank } = config
  const isReading = questionBank.kind === 'strategy'

  return {
    slug,
    title,
    summary,
    duration: isReading ? '20-30 min' : '45-90 min',
    whyItMatters,
    sections: [
      {
        heading: 'How to use this bank',
        body: focus,
        bullets: [
          'Skim the sections in the sidebar to see how the bucket is organized before diving in.',
          'Pick a target pattern or section instead of solving questions in random order.',
          'Mark questions complete as you go so you can resume where you left off.'
        ]
      },
      {
        heading: isReading ? 'Reading focus' : 'Practice focus',
        body: practiceFocus,
        bullets: isReading
          ? [
              'Read actively: restate each idea in your own words before moving on.',
              'Note the one habit or framework you want to carry into live practice.',
              'Translate the reading into a concrete checklist you can rehearse later.'
            ]
          : [
              'Open a runnable question and write a first correct version before optimizing.',
              'Run the provided example cases in the browser to confirm your output shape.',
              'Switch languages (Python, C++, Java) only after the approach is clear.'
            ]
      },
      {
        heading: 'Review and retention',
        body: reviewFocus,
        bullets: [
          'Summarize the dominant pattern after each question so it transfers to new prompts.',
          'Revisit anything you flagged as shaky within a day or two.',
          'Track which sections still feel slow and schedule a focused second pass.'
        ]
      }
    ],
    checklist: [
      'Choose a section and a clear goal before you start the timer.',
      'Restate each problem and its constraints before writing any code.',
      isReading
        ? 'Capture one actionable takeaway from each reading item.'
        : 'Run at least one example case in the browser before declaring a solution done.',
      'Mark finished items complete so your progress persists across sessions.'
    ],
    pitfalls: [
      'Grinding questions in random order instead of by pattern or section.',
      'Skipping the example run, then missing an obvious output-format bug.',
      'Never revisiting flagged questions, so weak patterns stay weak.'
    ],
    interviewPrompts,
    diagram: null,
    related: [],
    practiceMode: 'question-bank',
    runtimeTarget: 'browser-wasm',
    questionBank
  }
}

export const rawQuestionBankModules = [
  {
    slug: 'question-bank-top-sets',
    title: 'Top interview question sets',
    summary: 'Work the classic easy, medium, and hard interview question collections, grouped by topic, with in-browser practice for runnable prompts.',
    objectives: [
      'Build fluency across the most frequently asked interview questions by difficulty tier',
      'Practice runnable prompts directly in the browser without leaving the lesson',
      'Track completion per question so study sessions stay resumable'
    ],
    lessons: [
      buildQuestionBankLesson({
        slug: 'top-interview-easy',
        title: 'Top interview questions · Easy',
        summary: 'Warm up with the canonical easy interview set spanning arrays, strings, trees, and more.',
        whyItMatters: 'Easy questions build the reflexes interviewers expect to be automatic, freeing your attention for the harder follow-ups later in a loop.',
        focus: 'This bucket gathers the widely circulated easy interview questions, grouped by topic so you can build one pattern at a time.',
        practiceFocus: 'Use the runnable prompts to lock in clean, idiomatic first solutions. Speed and correctness here pay off when the timer matters.',
        reviewFocus: 'Because these are foundational, aim for fluency: you should be able to re-solve any of them quickly and explain the pattern crisply.',
        interviewPrompts: [
          'Which easy patterns should feel completely automatic before an onsite?',
          'How do you keep an easy question from turning into a careless bug?',
          'What is the cleanest way to explain an easy solution without over-explaining?'
        ],
        questionBank: { key: 'top-interview-questions-easy', label: 'Top interview questions · Easy', kind: 'category' }
      }),
      buildQuestionBankLesson({
        slug: 'top-interview-medium',
        title: 'Top interview questions · Medium',
        summary: 'Drill the medium interview set where most coding rounds actually live.',
        whyItMatters: 'Medium questions are the heart of most interview loops, testing whether you can pick a pattern and defend its complexity under light pressure.',
        focus: 'This bucket collects the medium-difficulty interview staples, organized by topic so related patterns sit together.',
        practiceFocus: 'Practice arriving at the right pattern quickly, then spend your time defending correctness and edge cases rather than micro-optimizing.',
        reviewFocus: 'Track which medium patterns still cost you time and schedule focused repeats until the approach is automatic.',
        interviewPrompts: [
          'How do you decide between competing patterns on a medium prompt?',
          'What is your minimum spoken test suite before calling a medium solution done?',
          'How do you recover when your first medium approach turns out wrong?'
        ],
        questionBank: { key: 'top-interview-questions-medium', label: 'Top interview questions · Medium', kind: 'category' }
      }),
      buildQuestionBankLesson({
        slug: 'top-interview-hard',
        title: 'Top interview questions · Hard',
        summary: 'Stretch into the hard interview set to practice decomposition and staying coherent on tough prompts.',
        whyItMatters: 'Hard questions expose where your reasoning breaks when the pattern is not obvious, which is exactly where strong candidates separate themselves.',
        focus: 'This bucket contains the harder interview questions, grouped by topic so you can target a specific weak spot.',
        practiceFocus: 'Slow down to model the subproblem, state, or graph before coding. The win here is disciplined decomposition, not raw speed.',
        reviewFocus: 'If you cannot finish a hard prompt, leave behind a correct direction and a clean next step, then return to it after reviewing the pattern.',
        interviewPrompts: [
          'What do you say when the right state or recurrence is not obvious yet?',
          'How would you break a hard prompt into solvable subproblems out loud?',
          'When is a well-reasoned partial answer better than forcing buggy code?'
        ],
        questionBank: { key: 'top-interview-questions-hard', label: 'Top interview questions · Hard', kind: 'category' }
      })
    ]
  },
  {
    slug: 'question-bank-faang',
    title: 'FAANG company question banks',
    summary: 'Practice question banks reported from Google, Amazon, Meta, Apple, and Microsoft loops, with in-browser execution for runnable prompts.',
    objectives: [
      'Target the question style and topic mix associated with each large-company loop',
      'Rehearse switching between general patterns and company-specific question sets',
      'Use per-question completion tracking to simulate a focused company prep sprint'
    ],
    lessons: [
      buildQuestionBankLesson({
        slug: 'google-questions',
        title: 'Google question bank',
        summary: 'Browse and practice Google-reported interview questions grouped by topic.',
        whyItMatters: 'Google rounds often probe the reasoning behind a solution as much as the code, so practicing the reported set helps you rehearse clear, defensible explanations.',
        focus: 'This bucket gathers Google-reported questions organized by topic and round, from the interview process overview to algorithm-heavy sections.',
        practiceFocus: 'Solve one question, then immediately field your own follow-ups about alternative structures, complexity, or tighter constraints.',
        reviewFocus: 'Note which Google-style follow-ups still surprise you and rehearse those explanations until they feel natural.',
        interviewPrompts: [
          'How would you explain your approach before writing any code into a shared doc?',
          'What alternative approach would you compare against if asked for a different angle?',
          'How do you keep follow-up optimizations tied to your original invariant?'
        ],
        questionBank: { key: 'google', label: 'Google', kind: 'company' }
      }),
      buildQuestionBankLesson({
        slug: 'amazon-questions',
        title: 'Amazon question bank',
        summary: 'Browse and practice Amazon-reported interview questions grouped by topic.',
        whyItMatters: 'Amazon screens frequently reward clean implementation and pragmatic edge-case handling under time pressure, so timed practice on the reported set is valuable.',
        focus: 'This bucket collects Amazon-reported questions organized by topic, including the online assessment style prompts.',
        practiceFocus: 'Treat runnable prompts like an OA: finish the first correct version, test the main edge cases, then improve only if time remains.',
        reviewFocus: 'Track which question types you can finish under time and which still feel slow, then repeat the slow ones.',
        interviewPrompts: [
          'What is the fastest correct baseline you would code under a timed assessment?',
          'Which optimization would you mention only after the first solution is stable?',
          'How do you keep code readable when the timer is the main pressure?'
        ],
        questionBank: { key: 'amazon', label: 'Amazon', kind: 'company' }
      }),
      buildQuestionBankLesson({
        slug: 'meta-questions',
        title: 'Meta question bank',
        summary: 'Browse and practice Meta-reported interview questions grouped by topic.',
        whyItMatters: 'Meta loops move quickly and value strong communication, so rehearsing the reported set helps you pace yourself and narrate cleanly.',
        focus: 'This bucket gathers Meta-reported questions organized by topic, covering arrays, strings, trees, graphs, and more.',
        practiceFocus: 'Practice a tight loop: restate, plan briefly, code the clean version, then test out loud at a steady pace.',
        reviewFocus: 'Because pacing matters at Meta, review where you spent too long and rehearse a faster path through that pattern.',
        interviewPrompts: [
          'How do you keep a fast-paced round structured without rushing into bugs?',
          'What signals tell you to commit to an approach versus keep exploring?',
          'How do you narrate clearly while still making steady coding progress?'
        ],
        questionBank: { key: 'facebook', label: 'Meta', kind: 'company' }
      }),
      buildQuestionBankLesson({
        slug: 'apple-questions',
        title: 'Apple question bank',
        summary: 'Browse and practice Apple-reported interview questions grouped by topic.',
        whyItMatters: 'Apple rounds can vary by team, so a broad, well-organized question set helps you stay ready for a less predictable prompt mix.',
        focus: 'This bucket collects Apple-reported questions organized by topic so you can build broad readiness.',
        practiceFocus: 'Use this as generalist practice: identify the pattern quickly, justify the complexity, and keep the implementation clean.',
        reviewFocus: 'Spot the patterns that feel least familiar and give them a focused second pass.',
        interviewPrompts: [
          'How do you stay ready when the prompt style is hard to predict?',
          'Which fundamentals do you fall back on when a question is unfamiliar?',
          'How do you keep an implementation production-quality, not just correct?'
        ],
        questionBank: { key: 'apple', label: 'Apple', kind: 'company' }
      }),
      buildQuestionBankLesson({
        slug: 'microsoft-questions',
        title: 'Microsoft question bank',
        summary: 'Browse and practice Microsoft-reported interview questions grouped by topic.',
        whyItMatters: 'Microsoft loops emphasize solid fundamentals and clear reasoning, so the reported set is great for rehearsing dependable, well-explained solutions.',
        focus: 'This bucket gathers Microsoft-reported questions organized by topic, from core data structures to harder follow-ups.',
        practiceFocus: 'Prioritize correctness and clarity: a clean, well-explained solution beats a clever but shaky one here.',
        reviewFocus: 'Review the questions where your explanation wandered and tighten the narration.',
        interviewPrompts: [
          'How do you make your reasoning easy for an interviewer to follow?',
          'What fundamentals do you double-check before declaring a solution correct?',
          'How do you handle a follow-up that changes the constraints mid-solution?'
        ],
        questionBank: { key: 'microsoft', label: 'Microsoft', kind: 'company' }
      })
    ]
  },
  {
    slug: 'question-bank-more-companies',
    title: 'More company question banks',
    summary: 'Broaden your practice with reported question banks from Adobe, Bloomberg, LinkedIn, Uber, and Yelp.',
    objectives: [
      'Diversify practice beyond the largest companies to avoid overfitting to one format',
      'Recognize how question mixes shift across different engineering cultures',
      'Use varied buckets to build resilient, transferable problem-solving habits'
    ],
    lessons: [
      buildQuestionBankLesson({
        slug: 'adobe-questions',
        title: 'Adobe question bank',
        summary: 'Browse and practice Adobe-reported interview questions grouped by topic.',
        whyItMatters: 'Practicing a wider range of company sets keeps your pattern recognition general instead of tuned to a single interview format.',
        focus: 'This bucket collects Adobe-reported questions organized by topic for broad coverage.',
        practiceFocus: 'Use runnable prompts to confirm your solution shape, then explain the trade-offs as if to an interviewer.',
        reviewFocus: 'Compare how these questions overlap with the FAANG sets to reinforce shared patterns.',
        interviewPrompts: [
          'Which patterns recur across companies regardless of the prompt wording?',
          'How do you adapt your explanation depth to different interviewers?',
          'What is your default approach when a prompt does not match a known pattern?'
        ],
        questionBank: { key: 'adobe', label: 'Adobe', kind: 'company' }
      }),
      buildQuestionBankLesson({
        slug: 'bloomberg-questions',
        title: 'Bloomberg question bank',
        summary: 'Browse and practice Bloomberg-reported interview questions grouped by topic.',
        whyItMatters: 'Bloomberg interviews often emphasize clean data handling and careful edge cases, which broad practice helps reinforce.',
        focus: 'This bucket gathers Bloomberg-reported questions organized by topic.',
        practiceFocus: 'Pay extra attention to input parsing and edge cases as you run the example cases.',
        reviewFocus: 'Revisit any question where an edge case tripped you up and lock in the fix.',
        interviewPrompts: [
          'Which edge cases do you check first on data-heavy prompts?',
          'How do you keep parsing logic from hiding the core algorithm?',
          'What is your habit for validating output format before finishing?'
        ],
        questionBank: { key: 'bloomberg', label: 'Bloomberg', kind: 'company' }
      }),
      buildQuestionBankLesson({
        slug: 'linkedin-questions',
        title: 'LinkedIn question bank',
        summary: 'Browse and practice LinkedIn-reported interview questions grouped by topic.',
        whyItMatters: 'A varied set of company banks helps you rehearse the same core patterns across many surface forms.',
        focus: 'This bucket collects LinkedIn-reported questions organized by topic.',
        practiceFocus: 'Focus on clear structure: restate, plan, implement, and test in a repeatable rhythm.',
        reviewFocus: 'Note the patterns that show up here and across other buckets to prioritize study.',
        interviewPrompts: [
          'How do you keep a consistent solving rhythm across different prompts?',
          'Which transferable patterns appear most often in your practice?',
          'How do you decide when a brute-force baseline is worth stating first?'
        ],
        questionBank: { key: 'linkedin', label: 'LinkedIn', kind: 'company' }
      }),
      buildQuestionBankLesson({
        slug: 'uber-questions',
        title: 'Uber question bank',
        summary: 'Browse and practice Uber-reported interview questions grouped by topic.',
        whyItMatters: 'Broader practice keeps you adaptable when a loop mixes familiar and unfamiliar prompt styles.',
        focus: 'This bucket gathers Uber-reported questions organized by topic.',
        practiceFocus: 'Practice committing to an approach quickly and adjusting cleanly when a follow-up shifts constraints.',
        reviewFocus: 'Revisit prompts where you hesitated to commit and rehearse a faster decision.',
        interviewPrompts: [
          'How do you commit to an approach without prematurely locking in a bug?',
          'What is your plan when a follow-up changes the constraints?',
          'How do you keep momentum on an unfamiliar prompt?'
        ],
        questionBank: { key: 'uber', label: 'Uber', kind: 'company' }
      }),
      buildQuestionBankLesson({
        slug: 'yelp-questions',
        title: 'Yelp question bank',
        summary: 'Browse and practice Yelp-reported interview questions grouped by topic.',
        whyItMatters: 'Rounding out practice with smaller, varied banks reinforces that strong fundamentals transfer everywhere.',
        focus: 'This bucket collects Yelp-reported questions organized by topic.',
        practiceFocus: 'Treat these as fundamentals reps: clean solutions, clear explanations, and solid edge-case coverage.',
        reviewFocus: 'Use this bucket as a confidence check that core patterns are solid before a loop.',
        interviewPrompts: [
          'Which fundamentals do you most want to feel automatic before a loop?',
          'How do you confirm your core patterns are solid, not just familiar?',
          'What is your final-pass routine before declaring a solution complete?'
        ],
        questionBank: { key: 'yelp', label: 'Yelp', kind: 'company' }
      })
    ]
  },
  {
    slug: 'question-bank-strategy',
    title: 'Interview strategy and specialized sets',
    summary: 'Read interview strategy guidance and work specialized prep collections that complement raw question grinding.',
    objectives: [
      'Build a deliberate interview strategy instead of only grinding questions',
      'Use specialized collections to round out preparation',
      'Turn reading into concrete, rehearsable habits'
    ],
    lessons: [
      buildQuestionBankLesson({
        slug: 'coding-interview-strategy',
        title: 'Coding interview strategy',
        summary: 'Read through structured guidance on how to approach coding interviews end to end.',
        whyItMatters: 'Strategy ties the patterns together: knowing how to frame, communicate, and pace an answer often matters as much as the algorithm itself.',
        focus: 'This bucket is a reading collection covering the interview process and how to approach it deliberately.',
        practiceFocus: 'Read each section actively and convert the advice into a personal checklist you can rehearse in mock rounds.',
        reviewFocus: 'Revisit the strategy notes before mock interviews so the habits stay front of mind.',
        interviewPrompts: [
          'What is your repeatable structure for opening any coding interview?',
          'How do you communicate progress without narrating every keystroke?',
          'How do you budget time across understanding, coding, and testing?'
        ],
        questionBank: { key: 'coding-interview-strategy', label: 'Coding interview strategy', kind: 'strategy' }
      }),
      buildQuestionBankLesson({
        slug: 'leap-ai-questions',
        title: 'Specialized prep collection',
        summary: 'Work through a specialized prep collection that complements the standard company and category banks.',
        whyItMatters: 'Specialized collections fill gaps the mainstream sets miss, keeping your preparation well-rounded.',
        focus: 'This bucket contains a specialized prep collection organized by section.',
        practiceFocus: 'Read or solve each item deliberately and connect it back to the core patterns you already practice.',
        reviewFocus: 'Identify any unique ideas here and fold them into your main study checklist.',
        interviewPrompts: [
          'Which gaps in your preparation does this collection help fill?',
          'How do you integrate niche material without losing focus on fundamentals?',
          'What is one new habit you want to carry forward from this set?'
        ],
        questionBank: { key: 'leapai', label: 'Specialized prep collection', kind: 'strategy' }
      })
    ]
  }
]
