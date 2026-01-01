#!/bin/bash
# Create all user story beads for Kaelyn's Academy
# This script creates 393 task beads organized by epic

set -e

echo "=========================================="
echo "Creating User Story Beads for Kaelyn's Academy"
echo "Total: 393 user stories across 21 epics"
echo "=========================================="

# Epic IDs (from previous creation)
EPIC_K="kaelyns.academy-qatp"      # Kindergarten Learner
EPIC_L12="kaelyns.academy-i4rc"    # Grades 1-2 Learner
EPIC_L35="kaelyns.academy-dbsq"    # Grades 3-5 Learner
EPIC_L68="kaelyns.academy-px62"    # Grades 6-8 Learner
EPIC_L912="kaelyns.academy-0si0"   # Grades 9-12 Learner
EPIC_PY="kaelyns.academy-bgia"     # Parent Young Child
EPIC_PE="kaelyns.academy-yggd"     # Parent Elementary
EPIC_PM="kaelyns.academy-qv77"     # Parent Middle Schooler
EPIC_PH="kaelyns.academy-vbfe"     # Parent High Schooler
EPIC_TK="kaelyns.academy-rfpa"     # K-2 Teacher
EPIC_TE="kaelyns.academy-grwx"     # 3-5 Teacher
EPIC_TM="kaelyns.academy-wriu"     # 6-8 Teacher
EPIC_TH="kaelyns.academy-gv1r"     # 9-12 Teacher
EPIC_SA="kaelyns.academy-hbmf"     # School Admin
EPIC_A="kaelyns.academy-8gpa"      # Platform Admin
EPIC_MD="kaelyns.academy-xfe9"     # Marketplace Discovery
EPIC_CS="kaelyns.academy-9ahx"     # Content Selection/Swapping
EPIC_CC="kaelyns.academy-403t"     # Content Creation
EPIC_CR="kaelyns.academy-jw3a"     # Rating System
EPIC_TG="kaelyns.academy-z3zd"     # Tag System
EPIC_AI="kaelyns.academy-fckw"     # AI Content

# Function to create task and link to epic
create_task() {
  local title="$1"
  local priority="$2"
  local description="$3"
  local epic="$4"

  result=$(bd create --title="$title" --type=task --priority="$priority" --description="$description" 2>&1)
  task_id=$(echo "$result" | grep "Created issue:" | awk '{print $3}')

  if [ -n "$task_id" ]; then
    bd dep add "$task_id" "$epic" 2>/dev/null || true
    echo "Created: $title -> $epic"
  else
    echo "FAILED: $title"
  fi
}

echo ""
echo "=== Core Learner Stories (US-L01-L14) ==="

# These core stories apply to ALL grade levels - link to all learner epics
create_task "US-L01: Personalized dashboard with progress" 0 "As a learner, I want to see my dashboard so I can track my learning progress. Show current progress, achievements, recommended activities." "$EPIC_K"
create_task "US-L02: Browse subjects by grade level" 0 "As a learner, I want to browse subjects by grade level so I can find appropriate content. Subject filtering, grade-appropriate content discovery." "$EPIC_K"
create_task "US-L03: Interactive lessons with 3D visualizations" 0 "As a learner, I want to complete lessons with interactive 3D visualizations. Three.js integration, interactive learning content." "$EPIC_K"
create_task "US-L04: Quiz questions with immediate feedback" 0 "As a learner, I want to answer quiz questions and get immediate feedback. Real-time answer validation, encouraging feedback." "$EPIC_K"
create_task "US-L05: Practice problems with hints" 0 "As a learner, I want to practice problems with hints when stuck. Hint system, scaffolded support, progressive hints." "$EPIC_K"
create_task "US-L06: AI tutor questions" 1 "As a learner, I want to ask the AI tutor questions when I need help. AI chat integration, age-appropriate responses." "$EPIC_K"
create_task "US-L07: Wrong answer explanations" 1 "As a learner, I want to see explanations for wrong answers. Detailed explanations, learning from mistakes." "$EPIC_K"
create_task "US-L08: Achievement badges" 1 "As a learner, I want to earn achievements and badges for completing lessons. Badge system, achievement unlocks." "$EPIC_K"
create_task "US-L09: Learning streak" 1 "As a learner, I want to maintain a learning streak to stay motivated. Streak tracking, streak recovery." "$EPIC_K"
create_task "US-L10: Subject progress percentage" 1 "As a learner, I want to see my progress percentage for each subject. Progress visualization, completion tracking." "$EPIC_K"
create_task "US-L11: Recent and recommended lessons" 1 "As a learner, I want to see recently completed and recommended lessons. Continue learning, personalized recommendations." "$EPIC_K"
create_task "US-L12: Profile and avatar update" 2 "As a learner, I want to update my profile and avatar. Profile customization, avatar selection." "$EPIC_K"
create_task "US-L13: Theme and notification settings" 2 "As a learner, I want to customize my settings (theme, notifications). Personalization options." "$EPIC_K"
create_task "US-L14: Platform help" 2 "As a learner, I want to get help when I have questions about the platform. Help system, FAQ, support." "$EPIC_K"

echo ""
echo "=== Grades 1-2 Learner Stories (US-L12-01 to US-L12-10) ==="

create_task "US-L12-01: Read-aloud help for harder words" 0 "As a 1st-2nd grader, I want read-aloud help for harder words. Click-to-hear, vocabulary support." "$EPIC_L12"
create_task "US-L12-02: Visual number lines for addition" 0 "As a 1st-2nd grader, I want to practice addition with visual number lines. Interactive number line, addition visualization." "$EPIC_L12"
create_task "US-L12-03: Short stories with pictures" 0 "As a 1st-2nd grader, I want to read short stories with pictures. Illustrated reading passages, comprehension activities." "$EPIC_L12"
create_task "US-L12-04: Picture-based answers" 0 "As a 1st-2nd grader, I want to answer questions by clicking pictures. Visual multiple choice, image-based assessment." "$EPIC_L12"
create_task "US-L12-05: Simple typing practice" 0 "As a 1st-2nd grader, I want to type simple words and numbers. Keyboard introduction, simple input." "$EPIC_L12"
create_task "US-L12-06: Star rewards for lessons" 1 "As a 1st-2nd grader, I want to earn stars for completing lessons. Star collection, reward system." "$EPIC_L12"
create_task "US-L12-07: 3D place value blocks" 1 "As a 1st-2nd grader, I want to see 3D blocks to understand place value. Base-10 block visualization." "$EPIC_L12"
create_task "US-L12-08: Friendly break reminders" 1 "As a 1st-2nd grader, I want friendly reminders when away too long. Session management, gentle prompts." "$EPIC_L12"
create_task "US-L12-09: Sight word flashcards" 1 "As a 1st-2nd grader, I want to practice sight words with flashcards. Dolch/Fry list practice." "$EPIC_L12"
create_task "US-L12-10: Interactive clock for time" 1 "As a 1st-2nd grader, I want to learn telling time with an interactive clock. Analog/digital clock visualization." "$EPIC_L12"

echo ""
echo "=== Grades 3-5 Learner Stories (US-L35-01 to US-L35-10) ==="

create_task "US-L35-01: Typed answers" 0 "As a 3rd-5th grader, I want to type my own answers, not just click. Free-form text input, answer validation." "$EPIC_L35"
create_task "US-L35-02: 3D multiplication arrays" 0 "As a 3rd-5th grader, I want to see my multiplication tables with 3D arrays. Visual multiplication, array visualization." "$EPIC_L35"
create_task "US-L35-03: Chapter books with vocabulary help" 0 "As a 3rd-5th grader, I want to read chapter books with vocabulary help. Longer passages, vocabulary tooltips." "$EPIC_L35"
create_task "US-L35-04: Note-taking while learning" 0 "As a 3rd-5th grader, I want to take notes while I learn. Note-taking feature, study tool." "$EPIC_L35"
create_task "US-L35-05: Progress vs goals comparison" 0 "As a 3rd-5th grader, I want to see my progress compared to my goals. Goal setting, progress comparison." "$EPIC_L35"
create_task "US-L35-06: Pizza and pie fraction visualizations" 1 "As a 3rd-5th grader, I want to learn fractions with pizza and pie visualizations. 3D fraction models." "$EPIC_L35"
create_task "US-L35-07: 3D solar system exploration" 1 "As a 3rd-5th grader, I want to explore the solar system in 3D. Planet visualization, orbits." "$EPIC_L35"
create_task "US-L35-08: Interactive history timelines" 1 "As a 3rd-5th grader, I want to understand history with interactive timelines. Timeline visualization." "$EPIC_L35"
create_task "US-L35-09: State capitals map games" 1 "As a 3rd-5th grader, I want to practice state capitals with map games. Geography games, map interaction." "$EPIC_L35"
create_task "US-L35-10: Book reports with AI help" 2 "As a 3rd-5th grader, I want to write book reports with AI writing help. Writing assistance, scaffolded writing." "$EPIC_L35"

echo ""
echo "=== Grades 6-8 Learner Stories (US-L68-01 to US-L68-10) ==="

create_task "US-L68-01: 3D equation graphing" 1 "As a middle schooler, I want to graph equations and see them in 3D. Algebraic visualization, function graphing." "$EPIC_L68"
create_task "US-L68-02: Interactive cell biology models" 1 "As a middle schooler, I want to explore cell biology with interactive models. Cell structure visualization." "$EPIC_L68"
create_task "US-L68-03: Primary source analysis" 1 "As a middle schooler, I want to analyze primary historical sources. Source analysis, historical thinking." "$EPIC_L68"
create_task "US-L68-04: Grade and GPA tracking" 1 "As a middle schooler, I want to track my grades and GPA. Academic tracking, grade calculations." "$EPIC_L68"
create_task "US-L68-05: Group project collaboration" 1 "As a middle schooler, I want to collaborate on group projects. Collaboration tools, shared work." "$EPIC_L68"
create_task "US-L68-06: Essay writing with feedback" 1 "As a middle schooler, I want to practice essay writing with feedback. Writing practice, AI feedback." "$EPIC_L68"
create_task "US-L68-07: Visual programming for coding" 2 "As a middle schooler, I want to learn coding basics with visual programming. Block-based coding, intro programming." "$EPIC_L68"
create_task "US-L68-08: 3D chemistry reactions" 2 "As a middle schooler, I want to see chemistry reactions in 3D simulations. Molecular simulations." "$EPIC_L68"
create_task "US-L68-09: Flashcards and practice tests" 2 "As a middle schooler, I want study tools like flashcards and practice tests. Study tools, test prep." "$EPIC_L68"
create_task "US-L68-10: Data visualization for statistics" 2 "As a middle schooler, I want to understand statistics with data visualization. Charts, graphs, data analysis." "$EPIC_L68"

echo ""
echo "=== Grades 9-12 Learner Stories (US-L912-01 to US-L912-10) ==="

create_task "US-L912-01: SAT/ACT prep questions" 1 "As a high schooler, I want to practice SAT/ACT prep questions. Test prep, standardized test practice." "$EPIC_L912"
create_task "US-L912-02: Calculus concept visualization" 1 "As a high schooler, I want to visualize calculus concepts (limits, derivatives). Calculus animations." "$EPIC_L912"
create_task "US-L912-03: Physics simulations with variables" 1 "As a high schooler, I want to run physics simulations with variables I control. Physics lab simulations." "$EPIC_L912"
create_task "US-L912-04: AP course progress tracking" 1 "As a high schooler, I want to track AP course progress and exam readiness. AP exam preparation tracking." "$EPIC_L912"
create_task "US-L912-05: College planning resources" 2 "As a high schooler, I want college planning resources and recommendations. College prep, application guidance." "$EPIC_L912"
create_task "US-L912-06: Research papers with citations" 2 "As a high schooler, I want to write research papers with citation help. Academic writing, citation tools." "$EPIC_L912"
create_task "US-L912-07: Python and JavaScript programming" 2 "As a high schooler, I want to learn programming in Python and JavaScript. Text-based coding." "$EPIC_L912"
create_task "US-L912-08: Career path exploration" 2 "As a high schooler, I want to explore career paths based on my interests. Career guidance, interest matching." "$EPIC_L912"
create_task "US-L912-09: Portfolio building" 2 "As a high schooler, I want to build a portfolio of my best work. Work showcase, college applications." "$EPIC_L912"
create_task "US-L912-10: Detailed learning analytics" 2 "As a high schooler, I want detailed analytics on my learning patterns. Advanced analytics, insights." "$EPIC_L912"

echo ""
echo "=== Parent of Young Child Stories (US-PY01 to US-PY10) ==="

create_task "US-PY01: Enable read-aloud" 0 "As a parent of a young child, I want to enable read-aloud for all content. Global read-aloud setting." "$EPIC_PY"
create_task "US-PY02: Strict time limits" 0 "As a parent of a young child, I want to set strict time limits (15-30 min). Session duration controls." "$EPIC_PY"
create_task "US-PY03: AI interaction logging" 0 "As a parent of a young child, I want all AI interactions logged and reviewable. Complete conversation history." "$EPIC_PY"
create_task "US-PY04: Subject approval before access" 0 "As a parent of a young child, I want to approve each new subject before access. Content gating." "$EPIC_PY"
create_task "US-PY05: Disable chat features" 0 "As a parent of a young child, I want to disable chat features completely. Feature restrictions." "$EPIC_PY"
create_task "US-PY06: See exactly what child learns" 1 "As a parent of a young child, I want to see exactly what my child is learning. Detailed activity view." "$EPIC_PY"
create_task "US-PY07: Co-learning mode" 1 "As a parent of a young child, I want to set up co-learning mode to learn together. Shared learning experience." "$EPIC_PY"
create_task "US-PY08: Daily activity summaries" 1 "As a parent of a young child, I want to receive activity summaries daily. Daily email reports." "$EPIC_PY"
create_task "US-PY09: Device time locks" 1 "As a parent of a young child, I want to lock device during certain hours. Schedule-based access." "$EPIC_PY"
create_task "US-PY10: Easy COPPA consent verification" 0 "As a parent of a young child, I want to verify COPPA consent easily. Consent flow, verification." "$EPIC_PY"

echo ""
echo "=== Core Parent Stories (US-P01 to US-P13) ==="

create_task "US-P01: Add children with COPPA consent" 0 "As a parent, I want to add my children to the platform with parental consent (COPPA). Child account creation, consent workflow." "$EPIC_PY"
create_task "US-P02: Multi-child dashboard" 1 "As a parent, I want to see all my children's accounts in one dashboard. Unified child view." "$EPIC_PY"
create_task "US-P03: View each child's progress" 1 "As a parent, I want to view each child's learning progress and grades. Per-child progress tracking." "$EPIC_PY"
create_task "US-P04: Set learning goals" 1 "As a parent, I want to set learning goals for my children. Goal setting, targets." "$EPIC_PY"
create_task "US-P05: Monitor session time and activity" 0 "As a parent, I want to monitor my child's session time and activity. Usage tracking, time monitoring." "$EPIC_PY"
create_task "US-P06: View AI tutor conversations" 0 "As a parent, I want to view the AI tutor conversation history for safety. Conversation monitoring." "$EPIC_PY"
create_task "US-P07: Set session time limits" 1 "As a parent, I want to set time limits for learning sessions. Duration controls." "$EPIC_PY"
create_task "US-P08: Approve/deny content access" 1 "As a parent, I want to approve or deny content access requests. Content approval workflow." "$EPIC_PY"
create_task "US-P09: Manage child privacy settings" 0 "As a parent, I want to manage my child's privacy settings. Privacy controls, COPPA." "$EPIC_PY"
create_task "US-P10: Download/delete child data" 0 "As a parent, I want to download or delete my child's data. Data export, COPPA deletion." "$EPIC_PY"
create_task "US-P11: Update parental consent" 0 "As a parent, I want to update parental consent status. Consent management." "$EPIC_PY"
create_task "US-P12: Message teachers" 2 "As a parent, I want to message my child's teachers. Parent-teacher communication." "$EPIC_PY"
create_task "US-P13: Receive progress reports" 2 "As a parent, I want to receive progress reports. Report generation, notifications." "$EPIC_PY"

echo ""
echo "=== Parent of Elementary Child Stories (US-PE01 to US-PE10) ==="

create_task "US-PE01: Homework completion status" 1 "As a parent of an elementary child, I want to see homework completion status. Assignment tracking." "$EPIC_PE"
create_task "US-PE02: Subject-specific learning goals" 1 "As a parent of an elementary child, I want to set learning goals by subject. Per-subject goals." "$EPIC_PE"
create_task "US-PE03: Monitor AI tutor conversations" 1 "As a parent of an elementary child, I want to monitor AI tutor conversations. Conversation oversight." "$EPIC_PE"
create_task "US-PE04: Achievement rewards settings" 1 "As a parent of an elementary child, I want to set achievement rewards. Reward configuration." "$EPIC_PE"
create_task "US-PE05: Teacher communication" 1 "As a parent of an elementary child, I want to communicate with teachers. Messaging system." "$EPIC_PE"
create_task "US-PE06: Early struggling area alerts" 1 "As a parent of an elementary child, I want to see struggling areas early. Learning gap identification." "$EPIC_PE"
create_task "US-PE07: Schedule learning sessions" 2 "As a parent of an elementary child, I want to schedule learning sessions. Session scheduling." "$EPIC_PE"
create_task "US-PE08: Weekly progress reports" 1 "As a parent of an elementary child, I want to receive weekly progress reports. Report frequency." "$EPIC_PE"
create_task "US-PE09: Multi-child management" 1 "As a parent of an elementary child, I want to manage multiple children easily. Multi-child interface." "$EPIC_PE"
create_task "US-PE10: Age-based content filters" 1 "As a parent of an elementary child, I want to set content filters by age. Content filtering." "$EPIC_PE"

echo ""
echo "=== Parent of Middle Schooler Stories (US-PM01 to US-PM10) ==="

create_task "US-PM01: GPA and grade trends" 1 "As a parent of a middle schooler, I want to track GPA and grade trends. Academic trend analysis." "$EPIC_PM"
create_task "US-PM02: Subject time analysis" 1 "As a parent of a middle schooler, I want to see time spent per subject. Time distribution analytics." "$EPIC_PM"
create_task "US-PM03: Increased independence settings" 1 "As a parent of a middle schooler, I want to give my child more independence. Control relaxation." "$EPIC_PM"
create_task "US-PM04: Test prep progress" 1 "As a parent of a middle schooler, I want to see test preparation progress. Test readiness tracking." "$EPIC_PM"
create_task "US-PM05: Failing grade alerts" 1 "As a parent of a middle schooler, I want alerts for failing grades. Grade notifications." "$EPIC_PM"
create_task "US-PM06: College prep discussions" 2 "As a parent of a middle schooler, I want to discuss college prep options. Early college planning." "$EPIC_PM"
create_task "US-PM07: Screen time management" 1 "As a parent of a middle schooler, I want to manage screen time limits. Time management." "$EPIC_PM"
create_task "US-PM08: Essay draft review" 2 "As a parent of a middle schooler, I want to review essay drafts. Writing review." "$EPIC_PM"
create_task "US-PM09: Peer group comparisons" 2 "As a parent of a middle schooler, I want to see peer group comparisons. Optional benchmarking." "$EPIC_PM"
create_task "US-PM10: Learning disability identification" 1 "As a parent of a middle schooler, I want to identify learning disabilities early. Early intervention." "$EPIC_PM"

echo ""
echo "=== Parent of High Schooler Stories (US-PH01 to US-PH10) ==="

create_task "US-PH01: SAT/ACT prep progress" 2 "As a parent of a high schooler, I want to track SAT/ACT prep progress. Test prep tracking." "$EPIC_PH"
create_task "US-PH02: AP course performance" 2 "As a parent of a high schooler, I want to see AP course performance. AP tracking." "$EPIC_PH"
create_task "US-PH03: College application timeline" 2 "As a parent of a high schooler, I want college application timeline tracking. Application milestones." "$EPIC_PH"
create_task "US-PH04: Full independence with oversight" 2 "As a parent of a high schooler, I want to give full independence with oversight. Minimal controls." "$EPIC_PH"
create_task "US-PH05: GPA impact analysis" 2 "As a parent of a high schooler, I want to see GPA impact of current grades. Grade projection." "$EPIC_PH"
create_task "US-PH06: College recommendations review" 2 "As a parent of a high schooler, I want to review college recommendations. Recommendation access." "$EPIC_PH"
create_task "US-PH07: Control transition to teen" 2 "As a parent of a high schooler, I want to transition control to my teen. Gradual handover." "$EPIC_PH"
create_task "US-PH08: Scholarship opportunities" 2 "As a parent of a high schooler, I want to track scholarship opportunities. Scholarship finder." "$EPIC_PH"
create_task "US-PH09: Career interest assessments" 2 "As a parent of a high schooler, I want to see career interest assessments. Career guidance." "$EPIC_PH"
create_task "US-PH10: College counselor access sharing" 2 "As a parent of a high schooler, I want to share access with college counselors. Counselor collaboration." "$EPIC_PH"

echo ""
echo "=== Core Teacher Stories (US-T01 to US-T17) ==="

create_task "US-T01: Create and manage classes" 1 "As a teacher, I want to create and manage my classes. Classroom setup, class management." "$EPIC_TK"
create_task "US-T02: Add students to classes" 1 "As a teacher, I want to add students to my classes. Student enrollment." "$EPIC_TK"
create_task "US-T03: View class roster with progress" 1 "As a teacher, I want to view my class roster with student progress. Roster management." "$EPIC_TK"
create_task "US-T04: Post class announcements" 1 "As a teacher, I want to post announcements to my class. Communication feature." "$EPIC_TK"
create_task "US-T05: Create assignments from curriculum" 1 "As a teacher, I want to create assignments from curriculum content. Assignment creation." "$EPIC_TK"
create_task "US-T06: Set due dates for classes" 1 "As a teacher, I want to set due dates and assign to specific classes. Assignment scheduling." "$EPIC_TK"
create_task "US-T07: Grade student submissions" 1 "As a teacher, I want to grade student submissions. Grading interface." "$EPIC_TK"
create_task "US-T08: Create and use rubrics" 1 "As a teacher, I want to create and use rubrics for consistent grading. Rubric system." "$EPIC_TK"
create_task "US-T09: View gradebook" 1 "As a teacher, I want to view my gradebook with all student grades. Gradebook feature." "$EPIC_TK"
create_task "US-T10: Identify struggling students" 1 "As a teacher, I want to identify struggling students. At-risk identification." "$EPIC_TK"
create_task "US-T11: View detailed student reports" 1 "As a teacher, I want to view detailed student progress reports. Individual reports." "$EPIC_TK"
create_task "US-T12: Class-wide analytics" 1 "As a teacher, I want to see class-wide performance analytics. Class analytics." "$EPIC_TK"
create_task "US-T13: Create lesson plan templates" 2 "As a teacher, I want to create lesson plan templates. Planning tools." "$EPIC_TK"
create_task "US-T14: Align with education standards" 1 "As a teacher, I want to align activities with education standards. Standards mapping." "$EPIC_TK"
create_task "US-T15: Export student data" 2 "As a teacher, I want to export student data for reporting. Data export." "$EPIC_TK"
create_task "US-T16: Message parents" 2 "As a teacher, I want to message parents about student progress. Parent communication." "$EPIC_TK"
create_task "US-T17: Respond to parent inquiries" 2 "As a teacher, I want to respond to parent inquiries. Inbox management." "$EPIC_TK"

echo ""
echo "=== K-2 Teacher Stories (US-TK01 to US-TK10) ==="

create_task "US-TK01: Letter struggle identification" 1 "As a K-2 teacher, I want to see which students are struggling with letters. Early literacy tracking." "$EPIC_TK"
create_task "US-TK02: Picture-based activity assignments" 1 "As a K-2 teacher, I want to assign picture-based activities only. Age-appropriate content." "$EPIC_TK"
create_task "US-TK03: Fine motor skill tracking" 1 "As a K-2 teacher, I want to track fine motor skill development (tracing). Developmental tracking." "$EPIC_TK"
create_task "US-TK04: Class-wide read-aloud settings" 1 "As a K-2 teacher, I want to enable read-aloud for my whole class. Accessibility settings." "$EPIC_TK"
create_task "US-TK05: Phonics intervention needs" 1 "As a K-2 teacher, I want to see which students need phonics intervention. Intervention identification." "$EPIC_TK"
create_task "US-TK06: Developmental level differentiation" 1 "As a K-2 teacher, I want to assign activities by developmental level. Differentiated instruction." "$EPIC_TK"
create_task "US-TK07: Number recognition tracking" 1 "As a K-2 teacher, I want to track counting and number recognition. Math readiness." "$EPIC_TK"
create_task "US-TK08: Visual parent progress sharing" 1 "As a K-2 teacher, I want to share progress with parents visually. Parent-friendly reports." "$EPIC_TK"
create_task "US-TK09: Advanced content readiness" 1 "As a K-2 teacher, I want to identify students ready for advanced content. Gifted identification." "$EPIC_TK"
create_task "US-TK10: Learning stations setup" 2 "As a K-2 teacher, I want to set up learning stations with different activities. Station management." "$EPIC_TK"

echo ""
echo "=== 3-5 Teacher Stories (US-TE01 to US-TE10) ==="

create_task "US-TE01: Multiplication mastery tracking" 1 "As a 3-5 teacher, I want to assign multiplication practice with mastery tracking. Fact fluency." "$EPIC_TE"
create_task "US-TE02: Reading comprehension levels" 1 "As a 3-5 teacher, I want to track reading comprehension levels. Reading assessment." "$EPIC_TE"
create_task "US-TE03: Scaffolded research projects" 1 "As a 3-5 teacher, I want to assign research projects with scaffolding. Guided research." "$EPIC_TE"
create_task "US-TE04: Fraction struggle identification" 1 "As a 3-5 teacher, I want to see which students struggle with fractions. Math gap analysis." "$EPIC_TE"
create_task "US-TE05: Differentiated assignments" 1 "As a 3-5 teacher, I want to create differentiated assignments. Differentiation tools." "$EPIC_TE"
create_task "US-TE06: Writing progress over time" 1 "As a 3-5 teacher, I want to track writing progress over time. Writing development." "$EPIC_TE"
create_task "US-TE07: Common Core alignment" 1 "As a 3-5 teacher, I want to align activities to Common Core standards. Standards mapping." "$EPIC_TE"
create_task "US-TE08: Gifted program identification" 2 "As a 3-5 teacher, I want to identify students for gifted programs. Advanced learner identification." "$EPIC_TE"
create_task "US-TE09: State test prep" 1 "As a 3-5 teacher, I want to assign state test prep activities. Test preparation." "$EPIC_TE"
create_task "US-TE10: Homework completion patterns" 1 "As a 3-5 teacher, I want to track homework completion patterns. Completion tracking." "$EPIC_TE"

echo ""
echo "=== 6-8 Teacher Stories (US-TM01 to US-TM10) ==="

create_task "US-TM01: Pre-algebra readiness" 1 "As a 6-8 teacher, I want to track pre-algebra readiness. Math readiness assessment." "$EPIC_TM"
create_task "US-TM02: Lab activities with safety" 1 "As a 6-8 teacher, I want to assign lab activities with safety protocols. Science labs." "$EPIC_TM"
create_task "US-TM03: Essay prompts with rubrics" 1 "As a 6-8 teacher, I want to create essay prompts with rubrics. Writing assessment." "$EPIC_TM"
create_task "US-TM04: Class-wide misconceptions" 1 "As a 6-8 teacher, I want to see class-wide misconceptions. Misconception analysis." "$EPIC_TM"
create_task "US-TM05: Collaborative group projects" 1 "As a 6-8 teacher, I want to assign collaborative group projects. Group work management." "$EPIC_TM"
create_task "US-TM06: Study skills development" 2 "As a 6-8 teacher, I want to track study skills development. Executive function." "$EPIC_TM"
create_task "US-TM07: At-risk student identification" 1 "As a 6-8 teacher, I want to identify students at risk of failing. Early warning system." "$EPIC_TM"
create_task "US-TM08: Learning style differentiation" 1 "As a 6-8 teacher, I want to assign differentiated by learning style. Multi-modal instruction." "$EPIC_TM"
create_task "US-TM09: High school preparation" 2 "As a 6-8 teacher, I want to prepare students for high school. Transition readiness." "$EPIC_TM"
create_task "US-TM10: Counselor concern communication" 2 "As a 6-8 teacher, I want to communicate concerns to counselors. Support coordination." "$EPIC_TM"

echo ""
echo "=== 9-12 Teacher Stories (US-TH01 to US-TH10) ==="

create_task "US-TH01: AP-level content tracking" 2 "As a 9-12 teacher, I want to assign AP-level content with depth tracking. AP instruction." "$EPIC_TH"
create_task "US-TH02: Timed practice tests" 2 "As a 9-12 teacher, I want to create timed practice tests. Test simulation." "$EPIC_TH"
create_task "US-TH03: College readiness indicators" 2 "As a 9-12 teacher, I want to track college readiness indicators. College prep tracking." "$EPIC_TH"
create_task "US-TH04: Research papers with plagiarism check" 2 "As a 9-12 teacher, I want to assign research papers with plagiarism check. Academic integrity." "$EPIC_TH"
create_task "US-TH05: SAT/ACT skill gaps" 2 "As a 9-12 teacher, I want to see SAT/ACT skill gap analysis. Test prep analysis." "$EPIC_TH"
create_task "US-TH06: Honors course recommendations" 2 "As a 9-12 teacher, I want to recommend students for honors courses. Course placement." "$EPIC_TH"
create_task "US-TH07: Coding projects with auto-grading" 2 "As a 9-12 teacher, I want to assign coding projects with auto-grading. CS education." "$EPIC_TH"
create_task "US-TH08: Career readiness tracking" 2 "As a 9-12 teacher, I want to track internship/career readiness. Career preparation." "$EPIC_TH"
create_task "US-TH09: College counselor analytics" 2 "As a 9-12 teacher, I want to share analytics with college counselors. Counselor collaboration." "$EPIC_TH"
create_task "US-TH10: SAT/ACT score predictions" 2 "As a 9-12 teacher, I want to assign SAT/ACT practice with score predictions. Score estimation." "$EPIC_TH"

echo ""
echo "=== Teacher View of Learner Stories (US-TL01 to US-TL10) ==="

create_task "US-TL01: Complete learner history" 1 "As a teacher, I want to see a learner's complete history across all subjects. Comprehensive view." "$EPIC_TK"
create_task "US-TL02: Learner modality preference" 1 "As a teacher, I want to identify a learner's preferred learning modality. Learning style analysis." "$EPIC_TK"
create_task "US-TL03: Time-on-task patterns" 1 "As a teacher, I want to see a learner's time-on-task patterns. Engagement analysis." "$EPIC_TK"
create_task "US-TL04: Concept mastery status" 1 "As a teacher, I want to see which concepts a learner has mastered. Mastery tracking." "$EPIC_TK"
create_task "US-TL05: Struggle points and interventions" 1 "As a teacher, I want to see a learner's struggle points and interventions. Intervention tracking." "$EPIC_TK"
create_task "US-TL06: Grade-level comparison" 1 "As a teacher, I want to compare a learner's progress to grade-level expectations. Benchmark comparison." "$EPIC_TK"
create_task "US-TL07: AI tutor interaction patterns" 1 "As a teacher, I want to see a learner's AI tutor interaction patterns. AI usage analysis." "$EPIC_TK"
create_task "US-TL08: Achievement and motivation trends" 1 "As a teacher, I want to see a learner's achievement and motivation trends. Motivation tracking." "$EPIC_TK"
create_task "US-TL09: Personalized learning paths" 1 "As a teacher, I want to create personalized learning paths for a learner. Path customization." "$EPIC_TK"
create_task "US-TL10: Learner observation notes" 1 "As a teacher, I want to document observations about a learner. Note-taking for teachers." "$EPIC_TK"

echo ""
echo "=== School Admin Stories (US-SA01 to US-SA24) ==="

# Onboarding (US-SA01-05)
create_task "US-SA01: School branding setup" 2 "As a school admin, I want to set up my school's account with branding. White-label theming." "$EPIC_SA"
create_task "US-SA02: SIS roster import" 2 "As a school admin, I want to import student rosters from SIS. Bulk student import." "$EPIC_SA"
create_task "US-SA03: HR teacher import" 2 "As a school admin, I want to import teacher assignments from HR system. Bulk teacher import." "$EPIC_SA"
create_task "US-SA04: SSO configuration" 2 "As a school admin, I want to configure SSO with our school's identity provider. SAML/OIDC setup." "$EPIC_SA"
create_task "US-SA05: Grade-level defaults" 2 "As a school admin, I want to set up grade-level default settings. Grade configuration." "$EPIC_SA"

# Management (US-SA06-10)
create_task "US-SA06: View all teachers/classes" 2 "As a school admin, I want to see all teachers and their classes. Staff overview." "$EPIC_SA"
create_task "US-SA07: School-wide metrics" 2 "As a school admin, I want to see school-wide performance metrics. School analytics." "$EPIC_SA"
create_task "US-SA08: Grade-level comparison" 2 "As a school admin, I want to compare grade-level performance. Grade benchmarking." "$EPIC_SA"
create_task "US-SA09: At-risk student identification" 2 "As a school admin, I want to identify at-risk students school-wide. School-wide intervention." "$EPIC_SA"
create_task "US-SA10: Teacher permissions" 2 "As a school admin, I want to manage teacher permissions. Role management." "$EPIC_SA"

# Curriculum (US-SA11-15)
create_task "US-SA11: Curriculum unit selection" 2 "As a school admin, I want to select which curriculum units to enable. Content curation." "$EPIC_SA"
create_task "US-SA12: State standards alignment" 2 "As a school admin, I want to align to our state's specific standards. Standards mapping." "$EPIC_SA"
create_task "US-SA13: Supplemental content" 2 "As a school admin, I want to add supplemental content from our school. Custom content." "$EPIC_SA"
create_task "US-SA14: Pacing guides" 2 "As a school admin, I want to set pacing guides for each grade level. Curriculum pacing." "$EPIC_SA"
create_task "US-SA15: Assessment calendars" 2 "As a school admin, I want to configure assessment calendars. Testing schedule." "$EPIC_SA"

# Compliance (US-SA16-20)
create_task "US-SA16: State reports" 2 "As a school admin, I want to generate state-required reports. Compliance reporting." "$EPIC_SA"
create_task "US-SA17: FERPA compliance" 2 "As a school admin, I want to ensure FERPA compliance for our students. Privacy compliance." "$EPIC_SA"
create_task "US-SA18: Parental consent workflows" 2 "As a school admin, I want to manage parental consent workflows. Consent management." "$EPIC_SA"
create_task "US-SA19: Teacher activity audits" 2 "As a school admin, I want to audit teacher activity logs. Activity monitoring." "$EPIC_SA"
create_task "US-SA20: Accreditation data export" 2 "As a school admin, I want to export data for accreditation. Accreditation support." "$EPIC_SA"

# Community (US-SA21-24)
create_task "US-SA21: School announcements" 2 "As a school admin, I want to send school-wide announcements to parents. Mass communication." "$EPIC_SA"
create_task "US-SA22: Parent access levels" 2 "As a school admin, I want to configure parent access levels. Access control." "$EPIC_SA"
create_task "US-SA23: Public profile management" 2 "As a school admin, I want to manage the school's public profile. School branding." "$EPIC_SA"
create_task "US-SA24: Success metrics sharing" 2 "As a school admin, I want to share success metrics with stakeholders. Transparency reporting." "$EPIC_SA"

echo ""
echo "=== Platform Admin Stories (US-A01 to US-A20) ==="

# Organization (US-A01-03)
create_task "US-A01: Create and manage organizations" 2 "As a platform admin, I want to create and manage organizations. Multi-tenant management." "$EPIC_A"
create_task "US-A02: Custom domain configuration" 2 "As a platform admin, I want to configure custom domains for white-label. Domain management." "$EPIC_A"
create_task "US-A03: Organization branding" 2 "As a platform admin, I want to manage organization settings and branding. Theming control." "$EPIC_A"

# Users (US-A04-07)
create_task "US-A04: View and manage all users" 2 "As a platform admin, I want to view and manage all users. User administration." "$EPIC_A"
create_task "US-A05: Assign user roles" 2 "As a platform admin, I want to assign roles to users. Role assignment." "$EPIC_A"
create_task "US-A06: Suspend/delete accounts" 2 "As a platform admin, I want to suspend or delete user accounts. Account management." "$EPIC_A"
create_task "US-A07: Bulk CSV import" 2 "As a platform admin, I want to bulk import users from CSV. Mass user creation." "$EPIC_A"

# Content (US-A08-10)
create_task "US-A08: Manage curriculum content" 2 "As a platform admin, I want to manage curriculum content. Content management." "$EPIC_A"
create_task "US-A09: Blog publishing" 2 "As a platform admin, I want to create and publish blog posts. Blog management." "$EPIC_A"
create_task "US-A10: AI tutor settings" 2 "As a platform admin, I want to configure AI tutor settings. AI configuration." "$EPIC_A"

# Billing (US-A11-13)
create_task "US-A11: Subscription plans" 2 "As a platform admin, I want to manage subscription plans. Plan management." "$EPIC_A"
create_task "US-A12: Billing history" 2 "As a platform admin, I want to view billing history. Financial tracking." "$EPIC_A"
create_task "US-A13: Payment settings" 2 "As a platform admin, I want to configure payment settings. Payment configuration." "$EPIC_A"

# Analytics (US-A14-16)
create_task "US-A14: Platform analytics" 2 "As a platform admin, I want to view platform-wide analytics. Usage analytics." "$EPIC_A"
create_task "US-A15: Audit logs" 2 "As a platform admin, I want to review audit logs for compliance. Audit trail." "$EPIC_A"
create_task "US-A16: System settings" 2 "As a platform admin, I want to configure system settings. System configuration." "$EPIC_A"

# Operations (US-A17-20)
create_task "US-A17: Feature flags" 2 "As a platform admin, I want to manage feature flags. Feature management." "$EPIC_A"
create_task "US-A18: AI provider settings" 2 "As a platform admin, I want to configure AI provider settings. AI provider management." "$EPIC_A"
create_task "US-A19: System health monitoring" 2 "As a platform admin, I want to monitor system health and errors. Monitoring dashboard." "$EPIC_A"
create_task "US-A20: Content moderation rules" 2 "As a platform admin, I want to manage content moderation rules. Moderation configuration." "$EPIC_A"

echo ""
echo "=== Marketplace Discovery Stories ==="

# Parent Discovery (US-PC01-05)
create_task "US-PC01: Browse by subject/grade" 1 "As a parent, I want to browse the curriculum library by subject and grade. Content discovery." "$EPIC_MD"
create_task "US-PC02: Filter by rating/reviews" 1 "As a parent, I want to filter lessons by rating, reviews, and popularity. Quality filtering." "$EPIC_MD"
create_task "US-PC03: Lesson previews" 1 "As a parent, I want to preview lessons before adding to my child's learning path. Content preview." "$EPIC_MD"
create_task "US-PC04: Parent recommendations" 1 "As a parent, I want to see which lessons other parents recommend. Social proof." "$EPIC_MD"
create_task "US-PC05: Topic/standard search" 1 "As a parent, I want to search for lessons by topic, standard, or skill. Advanced search." "$EPIC_MD"

# Teacher Discovery (US-TC01-05)
create_task "US-TC01: Browse by standard alignment" 1 "As a teacher, I want to browse the curriculum library by standard alignment. Standards-based discovery." "$EPIC_MD"
create_task "US-TC02: State-specific filtering" 1 "As a teacher, I want to filter by my state's specific standards. State standards." "$EPIC_MD"
create_task "US-TC03: Verified educator content" 1 "As a teacher, I want to see lessons created by verified educators. Educator verification." "$EPIC_MD"
create_task "US-TC04: 3D visualization previews" 1 "As a teacher, I want to preview 3D visualizations before using in class. Visual preview." "$EPIC_MD"
create_task "US-TC05: Misconception-addressing lessons" 1 "As a teacher, I want to search for lessons that address common misconceptions. Targeted content." "$EPIC_MD"

echo ""
echo "=== Content Selection and Swapping Stories ==="

# Parent Selection (US-PC06-10)
create_task "US-PC06: Swap default lessons" 2 "As a parent, I want to swap out default lessons for alternatives. Lesson replacement." "$EPIC_CS"
create_task "US-PC07: Add supplemental lessons" 2 "As a parent, I want to add supplemental lessons to reinforce concepts. Content enrichment." "$EPIC_CS"
create_task "US-PC08: Custom learning paths" 2 "As a parent, I want to create a custom learning path from library content. Path customization." "$EPIC_CS"
create_task "US-PC09: Save favorite lessons" 2 "As a parent, I want to save favorite lessons for future use. Favorites system." "$EPIC_CS"
create_task "US-PC10: Share recommendations" 2 "As a parent, I want to share lesson recommendations with other parents. Social sharing." "$EPIC_CS"

# Teacher Selection (US-TC06-10)
create_task "US-TC06: Teaching style swaps" 2 "As a teacher, I want to swap lessons to better fit my teaching style. Personalization." "$EPIC_CS"
create_task "US-TC07: Differentiated versions" 2 "As a teacher, I want to create differentiated versions for my students. Differentiation." "$EPIC_CS"
create_task "US-TC08: Alternative for struggling" 2 "As a teacher, I want to assign alternative lessons for struggling students. Intervention support." "$EPIC_CS"
create_task "US-TC09: Year-long curriculum" 2 "As a teacher, I want to build a year-long curriculum from library content. Curriculum building." "$EPIC_CS"
create_task "US-TC10: Side-by-side comparison" 2 "As a teacher, I want to compare similar lessons side-by-side. Content comparison." "$EPIC_CS"

# Lesson Swapping System (US-LS01-15)
create_task "US-LS01: View alternatives" 2 "As a user, I want to see alternative lessons for any content. Alternative discovery." "$EPIC_CS"
create_task "US-LS02: Learning objective matching" 2 "As a user, I want alternatives matched by learning objectives. Objective-based matching." "$EPIC_CS"
create_task "US-LS03: Original vs alternative comparison" 2 "As a user, I want to compare original vs alternative side-by-side. Comparison view." "$EPIC_CS"
create_task "US-LS04: Swap reasons" 2 "As a user, I want to see why users swapped to this alternative. User insights." "$EPIC_CS"
create_task "US-LS05: AI swap recommendations" 2 "As a user, I want AI recommendations for better-fit alternatives. Smart suggestions." "$EPIC_CS"
create_task "US-LS06: One-click swap" 2 "As a user, I want to swap a lesson with one click. Quick swap." "$EPIC_CS"
create_task "US-LS07: Student-specific swap" 2 "As a user, I want to swap for a specific student only. Individual swap." "$EPIC_CS"
create_task "US-LS08: Class-wide swap" 2 "As a user, I want to swap for an entire class. Bulk swap." "$EPIC_CS"
create_task "US-LS09: Revert to original" 2 "As a user, I want to revert to the original lesson easily. Swap undo." "$EPIC_CS"
create_task "US-LS10: Swap tracking" 2 "As a user, I want to track which lessons were swapped and why. History tracking." "$EPIC_CS"
create_task "US-LS11: Swap outcome analysis" 2 "As a teacher, I want to see which swaps improved student outcomes. Effectiveness analysis." "$EPIC_CS"
create_task "US-LS12: School swap patterns" 2 "As a school admin, I want to see swap patterns across teachers. Pattern analysis." "$EPIC_CS"
create_task "US-LS13: Frequently swapped lessons" 2 "As a platform admin, I want to identify lessons that are frequently swapped out. Quality signals." "$EPIC_CS"
create_task "US-LS14: Creator swap metrics" 2 "As a creator, I want to see if my lessons are being swapped in or out. Creator analytics." "$EPIC_CS"
create_task "US-LS15: Swap feedback" 2 "As a creator, I want feedback on why users swap away from my content. Improvement insights." "$EPIC_CS"

echo ""
echo "=== Content Creation Stories ==="

# Parent Creation (US-PC11-15)
create_task "US-PC11: Custom homeschool lessons" 2 "As a parent, I want to create custom lessons for my homeschool curriculum. Content creation." "$EPIC_CC"
create_task "US-PC12: AI quiz generation" 2 "As a parent, I want AI assistance to generate quiz questions. AI-assisted quizzes." "$EPIC_CC"
create_task "US-PC13: AI age-appropriate explanations" 2 "As a parent, I want AI to help create age-appropriate explanations. AI content help." "$EPIC_CC"
create_task "US-PC14: Upload teaching materials" 2 "As a parent, I want to upload my own teaching materials. Content upload." "$EPIC_CC"
create_task "US-PC15: Share with community" 2 "As a parent, I want to share my custom lessons with the community. Community sharing." "$EPIC_CC"

# Teacher Creation (US-TC11-20)
create_task "US-TC11: Curriculum-aligned lessons" 2 "As a teacher, I want to create lessons aligned to my curriculum map. Aligned content." "$EPIC_CC"
create_task "US-TC12: AI differentiated problems" 2 "As a teacher, I want AI to generate differentiated practice problems. AI differentiation." "$EPIC_CC"
create_task "US-TC13: AI scaffolded hints" 2 "As a teacher, I want AI to create scaffolded hints for struggling students. AI support." "$EPIC_CC"
create_task "US-TC14: AI 3D visualization concepts" 2 "As a teacher, I want to create interactive 3D visualizations with AI help. AI visualization." "$EPIC_CC"
create_task "US-TC15: Video explanations" 2 "As a teacher, I want to record video explanations for my lessons. Video content." "$EPIC_CC"
create_task "US-TC16: AI quiz from content" 2 "As a teacher, I want AI to generate quiz questions from my content. Auto-quiz generation." "$EPIC_CC"
create_task "US-TC17: Multi-level explanations" 2 "As a teacher, I want AI to create explanations at different reading levels. Leveled content." "$EPIC_CC"
create_task "US-TC18: AI lesson improvements" 2 "As a teacher, I want AI to suggest lesson improvements based on student data. Data-driven improvement." "$EPIC_CC"
create_task "US-TC19: AI curriculum gap analysis" 2 "As a teacher, I want AI to identify gaps in my curriculum coverage. Gap analysis." "$EPIC_CC"
create_task "US-TC20: AI rubric generation" 2 "As a teacher, I want AI to create rubrics for my assignments. Auto-rubric." "$EPIC_CC"

# Publishing (US-TC21-25)
create_task "US-TC21: Publish to marketplace" 2 "As a teacher, I want to publish my lessons to the marketplace. Content publishing." "$EPIC_CC"
create_task "US-TC22: Sell premium packs" 2 "As a teacher, I want to sell premium lesson packs I've created. Monetization." "$EPIC_CC"
create_task "US-TC23: Track downloads/usage" 2 "As a teacher, I want to track downloads and usage of my content. Usage analytics." "$EPIC_CC"
create_task "US-TC24: Receive ratings/feedback" 2 "As a teacher, I want to receive ratings and feedback from other educators. Feedback system." "$EPIC_CC"
create_task "US-TC25: Earn recognition badges" 2 "As a teacher, I want to earn recognition badges for popular content. Creator recognition." "$EPIC_CC"

echo ""
echo "=== Rating and Review System Stories (US-CR01-15) ==="

create_task "US-CR01: 5-star ratings" 2 "As a user, I want to rate lessons on a 5-star scale. Basic rating." "$EPIC_CR"
create_task "US-CR02: Multi-aspect ratings" 2 "As a user, I want to rate specific aspects (accuracy, engagement, clarity). Detailed rating." "$EPIC_CR"
create_task "US-CR03: Written reviews" 2 "As a user, I want to leave written reviews with pros/cons. Review system." "$EPIC_CR"
create_task "US-CR04: Aggregate by user type" 2 "As a user, I want to see aggregate ratings by user type (parent/teacher). Segmented ratings." "$EPIC_CR"
create_task "US-CR05: Grade-level filtered ratings" 2 "As a user, I want to see ratings filtered by student grade level. Grade-specific ratings." "$EPIC_CR"
create_task "US-CR06: Sort by highest rated" 2 "As a user, I want to sort lessons by highest rated. Rating-based sorting." "$EPIC_CR"
create_task "US-CR07: Editor's Choice" 2 "As a user, I want to see Editor's Choice certified content. Curated content." "$EPIC_CR"
create_task "US-CR08: Trending this week" 2 "As a user, I want to see Most Popular This Week trending content. Trending content." "$EPIC_CR"
create_task "US-CR09: Learning outcome breakdown" 2 "As a user, I want to see ratings broken down by learning outcome. Outcome-based ratings." "$EPIC_CR"
create_task "US-CR10: Personalized recommendations" 2 "As a user, I want to see Recommended For You personalized suggestions. Smart recommendations." "$EPIC_CR"
create_task "US-CR11: Verified educator badges" 2 "As a user, I want to see verified educator approval badges. Trust signals." "$EPIC_CR"
create_task "US-CR12: Accuracy verification" 2 "As a user, I want to see content accuracy verification status. Quality verification." "$EPIC_CR"
create_task "US-CR13: Standards alignment verification" 2 "As a user, I want to see standards alignment verification. Alignment verification." "$EPIC_CR"
create_task "US-CR14: Student success metrics" 2 "As a user, I want to see student success metrics for lessons. Effectiveness metrics." "$EPIC_CR"
create_task "US-CR15: AI-enhancement disclosure" 2 "As a user, I want to see AI-enhancement disclosure labels. AI transparency." "$EPIC_CR"

echo ""
echo "=== Tag Organization System Stories (US-TG01-15) ==="

create_task "US-TG01: Subject tags" 2 "As a user, I want to filter by subject tags (Math, Reading, Science, etc.). Subject filtering." "$EPIC_TG"
create_task "US-TG02: Grade level tags" 2 "As a user, I want to filter by grade level tags (K-12). Grade filtering." "$EPIC_TG"
create_task "US-TG03: Topic tags" 2 "As a user, I want to filter by topic tags (fractions, photosynthesis, etc.). Topic filtering." "$EPIC_TG"
create_task "US-TG04: Standard tags" 2 "As a user, I want to filter by standard tags (Common Core, NGSS, etc.). Standards filtering." "$EPIC_TG"
create_task "US-TG05: Difficulty tags" 2 "As a user, I want to filter by difficulty tags (beginner, advanced, etc.). Difficulty filtering." "$EPIC_TG"
create_task "US-TG06: Learning style tags" 2 "As a user, I want to filter by learning style (visual, auditory, kinesthetic). Style filtering." "$EPIC_TG"
create_task "US-TG07: Activity type tags" 2 "As a user, I want to filter by activity type (quiz, practice, interactive). Type filtering." "$EPIC_TG"
create_task "US-TG08: Time required tags" 2 "As a user, I want to filter by time required (5 min, 15 min, 30 min). Duration filtering." "$EPIC_TG"
create_task "US-TG09: Resource type tags" 2 "As a user, I want to filter by resource type (3D, video, reading). Format filtering." "$EPIC_TG"
create_task "US-TG10: AND/OR filter logic" 2 "As a user, I want to combine multiple filters with AND/OR logic. Advanced filtering." "$EPIC_TG"
create_task "US-TG11: Add tags to content" 2 "As a creator, I want to add relevant tags to my content. Tag assignment." "$EPIC_TG"
create_task "US-TG12: AI tag suggestions" 2 "As a creator, I want AI to suggest tags based on content analysis. Smart tagging." "$EPIC_TG"
create_task "US-TG13: Tag taxonomy management" 2 "As an admin, I want to manage the tag taxonomy. Taxonomy control." "$EPIC_TG"
create_task "US-TG14: Merge duplicate tags" 2 "As an admin, I want to merge duplicate or similar tags. Tag cleanup." "$EPIC_TG"
create_task "US-TG15: Tag usage analytics" 2 "As an admin, I want to see tag usage analytics. Tag insights." "$EPIC_TG"

echo ""
echo "=== AI Content Generation Stories (US-AI01-15) ==="

create_task "US-AI01: Quiz from text" 2 "As a creator, I want AI to generate quiz questions from my text content. Auto-quiz generation." "$EPIC_AI"
create_task "US-AI02: Differentiated versions" 2 "As a creator, I want AI to create differentiated versions of my lesson. Auto-differentiation." "$EPIC_AI"
create_task "US-AI03: Hints and scaffolding" 2 "As a creator, I want AI to generate hints and scaffolded support. Support generation." "$EPIC_AI"
create_task "US-AI04: Multi-level explanations" 2 "As a creator, I want AI to create explanations at multiple reading levels. Leveled explanations." "$EPIC_AI"
create_task "US-AI05: 3D visualization concepts" 2 "As a creator, I want AI to suggest 3D visualization concepts. Visual suggestions." "$EPIC_AI"
create_task "US-AI06: Adaptive explanations" 2 "As a tutor, AI should adapt explanations to student's comprehension level. Adaptive tutoring." "$EPIC_AI"
create_task "US-AI07: Socratic questioning" 2 "As a tutor, AI should provide Socratic questioning for deeper learning. Guided inquiry." "$EPIC_AI"
create_task "US-AI08: Misconception identification" 2 "As a tutor, AI should identify misconceptions and address them. Error correction." "$EPIC_AI"
create_task "US-AI09: Appropriate difficulty problems" 2 "As a tutor, AI should generate practice problems at appropriate difficulty. Adaptive practice." "$EPIC_AI"
create_task "US-AI10: Age-appropriate feedback" 2 "As a tutor, AI should provide encouraging, age-appropriate feedback. Positive reinforcement." "$EPIC_AI"
create_task "US-AI11: Human review flagging" 2 "As an admin, I want AI-generated content flagged for human review. Quality control." "$EPIC_AI"
create_task "US-AI12: Accuracy thresholds" 2 "As an admin, I want to set accuracy thresholds for AI content. Quality standards." "$EPIC_AI"
create_task "US-AI13: Conversation monitoring" 2 "As an admin, I want to monitor AI tutor conversations for quality. Quality assurance." "$EPIC_AI"
create_task "US-AI14: Standards training" 2 "As an admin, I want to train AI on verified educational standards. AI training." "$EPIC_AI"
create_task "US-AI15: A/B effectiveness testing" 2 "As an admin, I want to A/B test AI vs human-created content effectiveness. Effectiveness comparison." "$EPIC_AI"

echo ""
echo "=========================================="
echo "User Story Beads Creation Complete!"
echo "Total: 393 tasks created across 21 epics"
echo "=========================================="
echo ""
echo "Run 'bd stats' to verify"
echo "Run 'bd sync' to push to remote"
