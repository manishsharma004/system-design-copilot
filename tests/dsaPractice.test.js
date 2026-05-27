import test from 'node:test'
import assert from 'node:assert/strict'

import { buildCppPracticeSource, buildJavaPracticeFiles, buildPythonPracticeSource } from '../src/lib/dsa/practice.js'

test('buildPythonPracticeSource emits top-level Python without stray indentation', () => {
  const source = buildPythonPracticeSource({
    practiceMeta: {
      name: 'removeDuplicates',
      params: [{ name: 'nums', type: 'integer[]' }],
      return: { type: 'integer' }
    },
    userCode: [
      'class Solution:',
      '    def removeDuplicates(self, nums):',
      '        return len(nums)'
    ].join('\n'),
    inputValues: [[1, 1, 2]]
  })

  assert.match(source, /\nsolver = Solution\(\)\nnums = \[1, 1, 2\]\nresult = solver\.removeDuplicates\(nums\)\nprint\(json\.dumps\(result\)\)$/)
  assert.doesNotMatch(source, /\n\s{4}nums = \[1, 1, 2\]/)
  assert.doesNotMatch(source, /\n\s{4}result = solver\.removeDuplicates\(nums\)/)
})

test('buildCppPracticeSource embeds input literals and serializes the return value', () => {
  const source = buildCppPracticeSource({
    practiceMeta: {
      name: 'twoSum',
      params: [
        { name: 'nums', type: 'integer[]' },
        { name: 'target', type: 'integer' }
      ],
      return: { type: 'integer[]' }
    },
    userCode: [
      'class Solution {',
      'public:',
      '    vector<int> twoSum(vector<int>& nums, int target) {',
      '        return {0, 1};',
      '    }',
      '};'
    ].join('\n'),
    inputValues: [[2, 7, 11, 15], 9]
  })

  assert.match(source, /vector<int> nums = \{2, 7, 11, 15\};/)
  assert.match(source, /int target = 9;/)
  assert.match(source, /auto result = solver\.twoSum\(nums, target\);/)
  assert.match(source, /cout << to_json_value\(result\);/)
})

test('buildJavaPracticeFiles emits a harness that writes the comparable result to the virtual filesystem', () => {
  const files = buildJavaPracticeFiles({
    practiceMeta: {
      name: 'containsDuplicate',
      params: [{ name: 'nums', type: 'integer[]' }],
      return: { type: 'boolean' }
    },
    userCode: [
      'class Solution {',
      '    public boolean containsDuplicate(int[] nums) {',
      '        return true;',
      '    }',
      '}'
    ].join('\n'),
    inputValues: [[1, 2, 3]]
  })

  assert.match(files.solutionSource, /class Solution/)
  assert.match(files.harnessSource, /else if \(ch == '\"'\) escaped\.append\("\\\\\\\""\);/)
  assert.match(files.harnessSource, /if \(value instanceof String\) return "\\\"" \+ escapeJsonString\(\(String\) value\) \+ "\\\"";/)
  assert.match(files.harnessSource, /int\[] nums = new int\[]\{1, 2, 3\};/)
  assert.match(files.harnessSource, /Object result = solver\.containsDuplicate\(nums\);/)
  assert.match(files.harnessSource, /Files\.write\(Paths\.get\("\/files\/result\.json"\), toJsonValue\(result\)\.getBytes\(StandardCharsets\.UTF_8\)\);/)
})
