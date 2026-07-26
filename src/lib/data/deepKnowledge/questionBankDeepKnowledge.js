/** @type {Record<string, import('../lessonDeepKnowledge.js').LessonDeepKnowledge>} */
export const questionBankDeepKnowledge = {
  'question-bank-top-sets/top-interview-easy': {
    insights: [
      {
        heading: 'Treat easy as automatic, not optional',
        body: 'Interviewers expect easy questions to be solved quickly with clean code and no hesitation on fundamentals. Use this bucket to build muscle memory on two-pointer, hash map, and basic tree traversals so you never burn mental energy on setup during a real round. Aim to finish runnable prompts in under 15 minutes with a spoken complexity analysis before you move on.'
      },
      {
        heading: 'Study by pattern, not by list order',
        body: 'The top easy set repeats a small number of patterns across many surface forms. Group your practice by topic section in the sidebar—arrays before trees, for example—so you recognize the invariant instead of memorizing individual prompts. After each question, write one sentence naming the pattern; that habit transfers directly when a medium question wraps the same idea in trickier constraints.'
      }
    ],
    references: [
      {
        title: 'Top Interview Questions · Easy',
        url: 'https://leetcode.com/explore/interview/card/top-interview-questions-easy/',
        source: 'LeetCode',
        note: 'Official curated easy collection that this lesson bucket mirrors.'
      },
      {
        title: 'Blind 75',
        url: 'https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions',
        source: 'LeetCode Discuss',
        note: 'Widely used condensed list; many easy top-interview problems overlap these patterns.'
      },
      {
        title: 'How to prepare for your Google interview',
        url: 'https://careers.google.com/how-we-hire/interview/',
        source: 'Google Careers',
        note: 'Explains why fundamentals must feel effortless before harder onsite rounds.'
      }
    ]
  },

  'question-bank-top-sets/top-interview-medium': {
    insights: [
      {
        heading: 'Medium is where most loops are won or lost',
        body: 'Most coding screens and onsite rounds center on medium difficulty: enough structure to require a real pattern choice, but not so open-ended that you stall. Practice deciding between sliding window, BFS, heap, and DP within the first five minutes, then spend the rest of the time on correctness and edge cases. Interviewers often probe follow-ups on the same problem—optimize space, handle streaming input—so leave room to extend your first solution.'
      },
      {
        heading: 'Prioritize a correct baseline over premature optimization',
        body: 'A common failure mode is chasing an optimal solution before a working one exists. State the brute-force complexity aloud, implement the clean version, then optimize only if time and the interviewer invite it. Company-reported medium questions in this bucket frequently reward clear trade-off reasoning more than a clever one-liner.'
      }
    ],
    references: [
      {
        title: 'Top Interview Questions · Medium',
        url: 'https://leetcode.com/explore/interview/card/top-interview-questions-medium/',
        source: 'LeetCode',
        note: 'Canonical medium collection aligned with this lesson bucket.'
      },
      {
        title: 'Amazon SDE interview process',
        url: 'https://www.amazon.jobs/en/how-we-hire/program-software-development-engineers',
        source: 'Amazon Jobs',
        note: 'Describes bar-raiser expectations where medium implementation quality matters.'
      },
      {
        title: 'Meta coding interview preparation',
        url: 'https://www.metacareers.com/careerprograms/codinginterviewprep',
        source: 'Meta Careers',
        note: 'Official prep guidance emphasizing timed medium problem practice.'
      }
    ]
  },

  'question-bank-top-sets/top-interview-hard': {
    insights: [
      {
        heading: 'Hard questions test decomposition, not memorization',
        body: 'Hard prompts rarely map to a single LeetCode tag on sight; they combine ideas—graph plus DP, or binary search on an answer space. Slow down to define state, invariants, and subproblems before typing. In interviews, a well-structured partial solution with correct complexity often beats buggy complete code.'
      },
      {
        heading: 'Use hard practice to find ceiling gaps, not daily volume',
        body: 'Grinding every hard problem in random order leads to fatigue without transfer. Pick one topic section per week, attempt two or three hard problems, and deeply review solutions you could not derive. Track which failure mode repeats—wrong state definition, missing base case, or graph modeling—and target that in your next medium review pass.'
      }
    ],
    references: [
      {
        title: 'Top Interview Questions · Hard',
        url: 'https://leetcode.com/explore/interview/card/top-interview-questions-hard/',
        source: 'LeetCode',
        note: 'Official hard collection corresponding to this bucket.'
      },
      {
        title: 'Google technical interview guide',
        url: 'https://careers.google.com/how-we-hire/interview/',
        source: 'Google Careers',
        note: 'Covers how interviewers evaluate reasoning on non-obvious problems.'
      },
      {
        title: 'Dynamic Programming Patterns',
        url: 'https://leetcode.com/discuss/general-discussion/458695/dynamic-programming-patterns',
        source: 'LeetCode Discuss',
        note: 'Useful framework when many hard bucket problems reduce to DP variants.'
      }
    ]
  },

  'question-bank-faang/google-questions': {
    insights: [
      {
        heading: 'Google rounds stress clear reasoning over tricks',
        body: 'Google-reported questions often come with follow-ups about alternative data structures, tighter bounds, or production-scale constraints. Practice narrating your invariant before coding and explicitly comparing one or two rejected approaches. Shared-doc or virtual whiteboard formats reward structured thinking, so rehearse headings: clarify, approach, complexity, code, test.'
      },
      {
        heading: 'Expect follow-ups that change the problem shape',
        body: 'A graph question may become a streaming variant; an array problem may add memory limits. When working this bank, after solving, ask yourself what the interviewer would change next. Candidates who tie follow-up answers back to the original invariant score higher than those who restart from scratch.'
      }
    ],
    references: [
      {
        title: 'Google · LeetCode company tag',
        url: 'https://leetcode.com/company/google/',
        source: 'LeetCode',
        note: 'Community-reported Google questions that overlap this lesson dataset.'
      },
      {
        title: 'How we hire at Google',
        url: 'https://careers.google.com/how-we-hire/',
        source: 'Google Careers',
        note: 'Official overview of coding interview expectations and loop structure.'
      },
      {
        title: 'Google interview prep (technical)',
        url: 'https://careers.google.com/how-we-hire/interview/',
        source: 'Google Careers',
        note: 'Specific guidance on what technical interviews evaluate.'
      }
    ]
  },

  'question-bank-faang/amazon-questions': {
    insights: [
      {
        heading: 'Amazon values working code under time pressure',
        body: 'Online assessments and phone screens in Amazon loops often use straightforward prompts with strict time boxes. Treat runnable questions here like an OA: ship a correct first version, run the provided examples, then mention optimizations only if time remains. Leadership Principles matter in later rounds, but coding rounds still punish careless off-by-one errors and missing edge cases.'
      },
      {
        heading: 'Bar-raiser rounds look for scalable thinking',
        body: 'Reported Amazon questions lean on arrays, strings, trees, and occasional system-flavored twists at higher levels. When practicing, state assumptions about input size and whether data fits in memory. Interviewers frequently ask how your solution behaves at Amazon-scale traffic even when the prompt looks like a textbook problem.'
      }
    ],
    references: [
      {
        title: 'Amazon · LeetCode company tag',
        url: 'https://leetcode.com/company/amazon/',
        source: 'LeetCode',
        note: 'Reported Amazon interview questions aligned with this bank.'
      },
      {
        title: 'Software development engineer hiring',
        url: 'https://www.amazon.jobs/en/how-we-hire/program-software-development-engineers',
        source: 'Amazon Jobs',
        note: 'Official SDE hiring process including assessment and onsite stages.'
      },
      {
        title: 'Amazon Leadership Principles',
        url: 'https://www.amazon.jobs/content/en/our-workplace/leadership-principles',
        source: 'Amazon Jobs',
        note: 'Context for behavioral rounds that accompany coding interviews.'
      }
    ]
  },

  'question-bank-faang/meta-questions': {
    insights: [
      {
        heading: 'Meta interviews move fast—pace is part of the test',
        body: 'Meta-reported loops emphasize steady communication while coding. Practice a tight rhythm: restate constraints, outline approach in 60–90 seconds, implement, then test with a small example out loud. Hesitation is costly; it is better to commit to a reasonable approach and adjust than to stay silent while searching for a perfect one.'
      },
      {
        heading: 'Strong fundamentals beat niche tricks',
        body: 'The Meta bank spans standard patterns—BFS, topological sort, interval merging—with little room for obscure algorithms. Focus on clean templates you can write quickly in your chosen language. Interviewers often stack a medium problem with a short follow-up; reserve mental bandwidth by keeping variable names and helper functions consistent across rounds.'
      }
    ],
    references: [
      {
        title: 'Meta · LeetCode company tag',
        url: 'https://leetcode.com/company/facebook/',
        source: 'LeetCode',
        note: 'LeetCode still lists Meta under the facebook company slug.'
      },
      {
        title: 'Meta coding interview prep',
        url: 'https://www.metacareers.com/careerprograms/codinginterviewprep',
        source: 'Meta Careers',
        note: 'Official preparation resources from Meta recruiting.'
      },
      {
        title: 'Meta software engineer interview experience',
        url: 'https://www.metacareers.com/blog/interviewing-at-meta-software-engineer-technical-interviews',
        source: 'Meta Careers',
        note: 'Blog overview of technical interview format and expectations.'
      }
    ]
  },

  'question-bank-faang/apple-questions': {
    insights: [
      {
        heading: 'Apple loops vary by team—breadth beats overfitting',
        body: 'Unlike companies with a single standardized style, Apple interviews can differ sharply by organization. Use this bank for generalist readiness: solid data structures, careful edge cases, and production-quality code style. When a prompt feels unfamiliar, fall back on fundamentals—hash maps, sorting, two pointers—rather than hunting for a exotic pattern.'
      },
      {
        heading: 'Implementation quality matters as much as big-O',
        body: 'Apple interviewers often care whether your code looks maintainable: sensible naming, guard clauses, and clear separation of parsing versus core logic. After solving a runnable prompt, do a quick pass for readability as if a teammate would review it. That habit mirrors how many Apple teams evaluate craft alongside correctness.'
      }
    ],
    references: [
      {
        title: 'Apple · LeetCode company tag',
        url: 'https://leetcode.com/company/apple/',
        source: 'LeetCode',
        note: 'Community-reported Apple questions in this lesson bucket.'
      },
      {
        title: 'Apple careers',
        url: 'https://www.apple.com/careers/us/',
        source: 'Apple',
        note: 'Entry point for official hiring information and team-specific roles.'
      },
      {
        title: 'Cracking the Coding Interview',
        url: 'https://www.crackingthecodinginterview.com/',
        source: 'CTCI',
        note: 'Classic prep guide useful for generalist loops with variable formats.'
      }
    ]
  },

  'question-bank-faang/microsoft-questions': {
    insights: [
      {
        heading: 'Microsoft rewards clear, methodical explanations',
        body: 'Microsoft-reported questions tend toward dependable medium difficulty with occasional puzzle-like twists. Interviewers appreciate candidates who check assumptions, walk through an example before coding, and validate edge cases systematically. If you are torn between a clever approach and a straightforward one, bias toward the approach you can explain line by line.'
      },
      {
        heading: 'Prepare for constraint changes mid-problem',
        body: 'Follow-ups in Microsoft loops sometimes alter input size, memory limits, or require thread-safe variants at senior levels. When practicing this bank, after each solution ask how the answer changes if input does not fit in RAM or must be processed as a stream. Showing adaptability without rewriting from scratch signals senior readiness.'
      }
    ],
    references: [
      {
        title: 'Microsoft · LeetCode company tag',
        url: 'https://leetcode.com/company/microsoft/',
        source: 'LeetCode',
        note: 'Reported Microsoft interview questions overlapping this dataset.'
      },
      {
        title: 'Microsoft interview process',
        url: 'https://careers.microsoft.com/us/en/interviewtips',
        source: 'Microsoft Careers',
        note: 'Official interview tips including coding round expectations.'
      },
      {
        title: 'Life at Microsoft · interviewing',
        url: 'https://careers.microsoft.com/v2/global/en/interviewing.html',
        source: 'Microsoft Careers',
        note: 'Overview of what to expect across Microsoft technical interview stages.'
      }
    ]
  },

  'question-bank-more-companies/adobe-questions': {
    insights: [
      {
        heading: 'Secondary company banks reinforce transferable patterns',
        body: 'Adobe-reported questions overlap heavily with FAANG medium sets—arrays, strings, dynamic programming at approachable difficulty. Use this bucket to confirm your pattern recognition is company-agnostic, not tuned to one interviewer style. If a problem feels new, map it to a pattern you already know from the top-interview medium set.'
      },
      {
        heading: 'Balance company-specific grinding with fundamentals',
        body: 'Spending a full week only on Adobe questions has diminishing returns once you have seen the dominant topics. A better split: two-thirds time on core pattern banks, one-third on company tags to calibrate difficulty and wording. Track which Adobe sections still feel slow and promote those patterns to your daily review list.'
      }
    ],
    references: [
      {
        title: 'Adobe · LeetCode company tag',
        url: 'https://leetcode.com/company/adobe/',
        source: 'LeetCode',
        note: 'Community Adobe question list aligned with this lesson bank.'
      },
      {
        title: 'Adobe careers',
        url: 'https://careers.adobe.com/',
        source: 'Adobe',
        note: 'Official careers site for role-specific interview expectations.'
      },
      {
        title: 'NeetCode 150',
        url: 'https://neetcode.io/practice',
        source: 'NeetCode',
        note: 'Pattern-organized list that complements company-specific grinding.'
      }
    ]
  },

  'question-bank-more-companies/bloomberg-questions': {
    insights: [
      {
        heading: 'Bloomberg prompts often stress careful data handling',
        body: 'Reported Bloomberg questions frequently involve parsing, intervals, heaps, and simulation with finicky edge cases. When running examples in the browser, pay extra attention to empty input, duplicates, and boundary indices. Interviewers at data-heavy firms notice whether you validate format before diving into the core algorithm.'
      },
      {
        heading: 'Separate parsing scaffolding from algorithmic core',
        body: 'A common mistake is burying the main idea inside messy I/O logic. Practice stating the algorithm on abstract data first, then mention how you would parse real input. That structure keeps you coherent when a Bloomberg-style prompt wraps a standard pattern in verbose problem text.'
      }
    ],
    references: [
      {
        title: 'Bloomberg · LeetCode company tag',
        url: 'https://leetcode.com/company/bloomberg/',
        source: 'LeetCode',
        note: 'Reported Bloomberg interview questions for this bucket.'
      },
      {
        title: 'Bloomberg careers',
        url: 'https://www.bloomberg.com/company/what-we-do/engineering/',
        source: 'Bloomberg',
        note: 'Engineering culture context for technical interview style.'
      },
      {
        title: 'Bloomberg software engineer interview questions',
        url: 'https://www.glassdoor.com/Interview/Bloomberg-Software-Engineer-Interview-Questions-EI_IE3096.0,9_KO10,27.htm',
        source: 'Glassdoor',
        note: 'Crowdsourced reports useful for spotting recurring topic themes.'
      }
    ]
  },

  'question-bank-more-companies/linkedin-questions': {
    insights: [
      {
        heading: 'LinkedIn sets reward consistent solving rhythm',
        body: 'Reported LinkedIn loops resemble other Bay Area medium interviews: structured communication plus solid implementation. Build a repeatable script—clarify, examples, approach, code, test—and use this bank to drill that rhythm until it feels automatic. Consistency across unrelated prompts signals readiness more than one brilliant solve.'
      },
      {
        heading: 'Look for graph and design-adjacent coding hybrids',
        body: 'LinkedIn’s product surface area shows up in questions about relationships, feeds, and ranking-style structures, often still solvable with standard graphs or heaps. When a prompt mentions social or recommendation context, translate it to nodes and edges early. Interviewers care that you model the problem, not that you know LinkedIn’s internal architecture.'
      }
    ],
    references: [
      {
        title: 'LinkedIn · LeetCode company tag',
        url: 'https://leetcode.com/company/linkedin/',
        source: 'LeetCode',
        note: 'Community-reported LinkedIn questions matching this lesson bank.'
      },
      {
        title: 'LinkedIn careers · Engineering',
        url: 'https://careers.linkedin.com/',
        source: 'LinkedIn',
        note: 'Official hiring portal for engineering role descriptions.'
      },
      {
        title: 'LinkedIn interview preparation',
        url: 'https://www.linkedin.com/help/linkedin/answer/a507542',
        source: 'LinkedIn Help',
        note: 'General guidance on preparing for LinkedIn’s interview process.'
      }
    ]
  },

  'question-bank-more-companies/uber-questions': {
    insights: [
      {
        heading: 'Uber questions often mirror real-time systems thinking',
        body: 'Reported Uber prompts sometimes frame classic algorithms as matching, routing, or scheduling scenarios. Strip the story down to the underlying structure—usually graphs, heaps, or greedy choices—before coding. Interviewers want to see that you do not get lost in domain language.'
      },
      {
        heading: 'Practice committing when follow-ups shift constraints',
        body: 'Uber loops may add latency requirements, streaming data, or geographic partitions as follow-ups. After each question in this bank, rehearse one sentence on how your solution degrades when input arrives continuously. Demonstrating that you have thought about scale—even on a whiteboard problem—aligns with Uber’s engineering culture.'
      }
    ],
    references: [
      {
        title: 'Uber · LeetCode company tag',
        url: 'https://leetcode.com/company/uber/',
        source: 'LeetCode',
        note: 'Reported Uber interview questions overlapping this dataset.'
      },
      {
        title: 'Uber engineering careers',
        url: 'https://www.uber.com/us/en/careers/teams/engineering/',
        source: 'Uber',
        note: 'Overview of engineering teams and hiring focus areas.'
      },
      {
        title: 'Uber technical interview guide',
        url: 'https://www.uber.com/blog/engineering/',
        source: 'Uber Engineering Blog',
        note: 'Engineering blog context for system-aware coding expectations.'
      }
    ]
  },

  'question-bank-more-companies/yelp-questions': {
    insights: [
      {
        heading: 'Smaller-company banks are confidence checks on fundamentals',
        body: 'Yelp-reported questions tend toward straightforward medium difficulty—good for verifying that core patterns are solid before a high-stakes loop. If you struggle here, return to the top-interview easy and medium sets rather than adding more company tags. Fluency on fundamentals beats breadth of company lists.'
      },
      {
        heading: 'Use Yelp practice to simulate lower-variance rounds',
        body: 'Not every interview is a Google hard problem; many companies ask one or two clean mediums. Treat this bucket as a dress rehearsal for those loops: finish with working code, explain trade-offs, and note one improvement you would make given more time. That complete package is what smaller-company panels usually score.'
      }
    ],
    references: [
      {
        title: 'Yelp · LeetCode company tag',
        url: 'https://leetcode.com/company/yelp/',
        source: 'LeetCode',
        note: 'Community-reported Yelp questions in this lesson bucket.'
      },
      {
        title: 'Yelp careers',
        url: 'https://www.yelp.careers/',
        source: 'Yelp',
        note: 'Official careers site for engineering hiring information.'
      },
      {
        title: 'Grind 75',
        url: 'https://www.techinterviewhandbook.org/grind75',
        source: 'Tech Interview Handbook',
        note: 'Time-boxed study plan useful alongside smaller company banks.'
      }
    ]
  },

  'question-bank-strategy/coding-interview-strategy': {
    insights: [
      {
        heading: 'Strategy turns grinding into deliberate practice',
        body: 'Reading interview strategy without a checklist rarely changes behavior in live rounds. Convert each section in this bucket into a personal script: how you open, how you test, how you recover from a wrong path. Re-read those notes before mock interviews so habits stay active instead of buried under more problem volume.'
      },
      {
        heading: 'Time budgeting matters as much as pattern knowledge',
        body: 'Strong candidates allocate roughly five minutes to clarify, five to plan, twenty to code, and five to test—adjusting when the prompt is easy or hard. Strategy content here emphasizes that split explicitly. Practice saying “I am going to sanity-check this example before optimizing” to signal maturity when you are ahead of schedule.'
      }
    ],
    references: [
      {
        title: 'Coding Interview Playbook',
        url: 'https://leetcode.com/explore/interview/card/coding-interview/',
        source: 'LeetCode',
        note: 'LeetCode’s structured interview strategy collection mirrored in this lesson.'
      },
      {
        title: 'Tech Interview Handbook',
        url: 'https://www.techinterviewhandbook.org/',
        source: 'Tech Interview Handbook',
        note: 'Free end-to-end guide covering process, coding, and behavioral prep.'
      },
      {
        title: 'Interview Cake · coding interview guide',
        url: 'https://www.interviewcake.com/coding-interview-questions',
        source: 'Interview Cake',
        note: 'Practical framing for how technical interviews differ from day-to-day work.'
      }
    ]
  },

  'question-bank-strategy/leap-ai-questions': {
    insights: [
      {
        heading: 'Specialized sets fill gaps mainstream banks miss',
        body: 'Collections like Leap AI often surface AI-adjacent, product-sense, or newer prompt styles that standard company tags underrepresent. Use this bucket after core patterns feel solid— not as a substitute for fundamentals. For each item, note whether it teaches a new technique or repackages an existing one; only the former needs a permanent slot on your review list.'
      },
      {
        heading: 'Integrate niche material without losing focus',
        body: 'The risk of specialized prep is scattered attention. Cap time here to one or two sessions per week and always connect readings back to your main pattern checklist. If a specialized question introduces a useful framing—eval metrics, embedding trade-offs, guardrails—summarize it in one bullet you can mention in system or ML-flavored interviews.'
      }
    ],
    references: [
      {
        title: 'LeetCode Discuss · AI interview preparation',
        url: 'https://leetcode.com/discuss/interview-question/4627286/ai-ml-interview-preparation',
        source: 'LeetCode Discuss',
        note: 'Community thread on preparing for AI-focused technical interviews.'
      },
      {
        title: 'Chip Huyen · designing machine learning systems',
        url: 'https://huyenchip.com/books/',
        source: 'Chip Huyen',
        note: 'Reference for ML system design context that complements specialized coding sets.'
      },
      {
        title: 'Google ML engineering interview prep',
        url: 'https://developers.google.com/machine-learning/crash-course',
        source: 'Google Developers',
        note: 'Foundational ML concepts useful when specialized questions touch model basics.'
      }
    ]
  }
}
