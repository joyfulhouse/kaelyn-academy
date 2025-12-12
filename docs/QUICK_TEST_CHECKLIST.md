# Quick Testing Checklist
## Kaelyn's Academy - Math Manual Testing Guide

**Site:** http://localhost:3030

---

## Critical Tests (15 minutes)

### ✅ Test 1: Carry Over Demo
1. Navigate to **Carry Over** section
2. Click **"Play Demo"**
3. Watch the animation and verify:
   - [ ] Ones column adds correctly (e.g., 7+5=12, shows 2)
   - [ ] Carry "1" appears above tens column
   - [ ] Tens column includes the carry (e.g., 4+8+1=13, shows 3)
   - [ ] Carry "1" appears above hundreds column if needed
   - [ ] Hundreds column includes the carry (e.g., 2+3+1=6)
   - [ ] Final answer is correct (verify with calculator)

**Example to verify:**
```
  247
+ 385
-----
  632  ← Must match!
```

### ✅ Test 2: Carry Over Practice
1. Click **"Practice"** button
2. Note the problem shown
3. Calculate manually on paper
4. Enter carry values (1 or leave blank)
5. Enter answer digits
6. Click **"Check Answer"**
7. Verify:
   - [ ] Correct answers are marked correct
   - [ ] Wrong carries are caught
   - [ ] Wrong answer digits are caught

### ✅ Test 3: Borrowing Demo
1. Navigate to **Borrowing** section
2. Keep clicking **"New Problem"** until you see one starting with 3, 4, or 5 (to test different scenarios)
3. Click **"Play Demo"**
4. Verify:
   - [ ] Borrowed digits are crossed out
   - [ ] Adjusted values are correct (e.g., 3 becomes 2, 2 becomes 12)
   - [ ] Final subtraction is correct

**Critical:** Look for a problem like **300 - 125**:
- [ ] Should show 3̶0̶0̶ becoming 2 9 10
- [ ] Final answer should be 175

### ✅ Test 4: Multiplication Visual
1. Navigate to **Multiplication** section
2. Set sliders to **4 × 5**
3. Count dots in grid:
   - [ ] Should be 4 rows
   - [ ] Should be 5 columns
   - [ ] Total should be 20 dots
   - [ ] Answer shows 20

### ✅ Test 5: Division Visual
1. Navigate to **Division** section
2. Set sliders to **12 ÷ 3**
3. Verify visual:
   - [ ] Shows 12 total items
   - [ ] Grouped into 3 groups
   - [ ] Each group has 4 items
   - [ ] Answer shows 4

---

## Full Test Suite (30 minutes)

### Home Section
- [ ] Welcome message appears
- [ ] Shows "0 Stars" and "0 Completed" initially
- [ ] All 7 section cards are visible
- [ ] Navigation buttons work

### Number Places
- [ ] Slider changes the number
- [ ] Visual blocks update (e.g., 247 shows 2 hundreds, 4 tens, 7 ones)
- [ ] Counts match the number

### Stacked Math
- [ ] Addition problems calculate correctly
- [ ] Subtraction problems calculate correctly
- [ ] Switching between modes works

### Carry Over
- [ ] Demo plays all steps correctly
- [ ] Timeline is clickable
- [ ] Practice mode validates carries
- [ ] Practice mode validates answer
- [ ] Score increments correctly
- [ ] "New Problem" generates different problem

### Borrowing
- [ ] Demo shows borrowing process
- [ ] Crossed-out numbers are visible
- [ ] Adjusted values are correct
- [ ] Practice mode validates answers
- [ ] Cascading borrows work (e.g., 300-125)

### Multiplication
- [ ] Visual grid shows correct array
- [ ] Sliders work smoothly
- [ ] Times table quiz works
- [ ] Answer updates in real-time
- [ ] Maximum is 12×12

### Division
- [ ] Visual grouping shows correctly
- [ ] Sliders work smoothly
- [ ] Division quiz works
- [ ] No remainder problems (all clean division)
- [ ] Maximum is 144÷12

### Practice
- [ ] Can select problem types
- [ ] Can select difficulty
- [ ] Mixed mode shows different problem types
- [ ] Score tracking works
- [ ] Timer works (if implemented)
- [ ] "Next Problem" button works

---

## Math Verification Quick Reference

### Carry Over Examples
| Problem | Ones | Carry | Tens | Carry | Hundreds | Answer |
|---------|------|-------|------|-------|----------|--------|
| 247+385 | 7+5=12 → 2 | 1 | 4+8+1=13 → 3 | 1 | 2+3+1=6 | 632 |
| 168+257 | 8+7=15 → 5 | 1 | 6+5+1=12 → 2 | 1 | 1+2+1=4 | 425 |
| 495+378 | 5+8=13 → 3 | 1 | 9+7+1=17 → 7 | 1 | 4+3+1=8 | 873 |

### Borrowing Examples
| Problem | Process | Answer |
|---------|---------|--------|
| 432-187 | Ones: 12-7=5, Tens: 12-8=4, Hundreds: 3-1=2 | 245 |
| 300-125 | Ones: 10-5=5, Tens: 9-2=7, Hundreds: 2-1=1 | 175 |
| 521-368 | Ones: 11-8=3, Tens: 11-6=5, Hundreds: 4-3=1 | 153 |

### Multiplication Examples
| Problem | Grid | Answer |
|---------|------|--------|
| 4 × 5 | 4 rows, 5 columns | 20 |
| 7 × 8 | 7 rows, 8 columns | 56 |
| 12 × 12 | 12 rows, 12 columns | 144 |

### Division Examples
| Problem | Visual | Answer |
|---------|--------|--------|
| 12 ÷ 3 | 12 items in 3 groups | 4 per group |
| 24 ÷ 6 | 24 items in 6 groups | 4 per group |
| 30 ÷ 5 | 30 items in 5 groups | 6 per group |

---

## Console Errors to Check

Open browser console (F12) and check for:

- [ ] **Expected:** Immer error about "returned a new value *and* modified its draft"
  - This is known and documented
  - Does not affect mathematical correctness
  - Should be fixed in code

- [ ] **Unexpected:** Any other errors
  - Report these for investigation

---

## Quick Pass/Fail Criteria

**PASS if:**
- ✅ All carry operations show correct carry positions
- ✅ All borrowing shows correct adjusted digits
- ✅ All final answers match calculator verification
- ✅ Practice mode correctly validates correct/incorrect answers

**FAIL if:**
- ❌ Any carry appears in wrong column
- ❌ Any borrow shows wrong adjusted digit
- ❌ Any final answer is mathematically incorrect
- ❌ Practice mode marks correct answer as wrong or vice versa

---

## Found an Issue?

Document:
1. **Section:** Which module (Carry Over, Borrowing, etc.)
2. **Problem:** The specific numbers shown
3. **Expected:** What should happen
4. **Actual:** What actually happened
5. **Screenshot:** If possible

---

**Testing Time Estimates:**
- Critical Tests Only: 15 minutes
- Full Test Suite: 30 minutes
- Thorough Multi-Problem Testing: 1 hour

**Recommended:** Run Critical Tests daily, Full Suite before deployments.
