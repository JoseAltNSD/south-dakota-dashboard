// Content for the three stages shown on Explore the data.
// All findings are written from SAMPLE data and must be replaced with real results.
// Bracketed text marks facts still to be confirmed with the client.
// `trend` holds sample percents for each school year, oldest first (the reverse of YEARS).
// `breakAt` is the index of the first year after a change in how the data were collected, and `breakNote`
// says what changed ("the data source changed" when it is missing).
// `framework` is the indicator's page under EW_FRAMEWORK_URL, the Education-to-Workforce Indicator Framework.
// `parts` splits one indicator into measures that are never combined (reading and math). Each part has its own
// `trend`; the indicator's report page shows one trend tile per part, and the other report pages list parts separately.
// Set `embedUrl` on a stage to a Power BI "Publish to web" link to show that report instead of the sample.

export const EW_FRAMEWORK_URL = 'https://educationtoworkforce.org/indicators';

export const STAGE_ORDER = ['readiness', 'transition', 'postsecondary'];

export const STAGES = {
  readiness: {
    key: 'readiness',
    short: 'High school',
    full: 'High school progress and college readiness',
    eyebrow: 'Stage 1 of 3 · High school',
    color: 'var(--readiness)',
    tint: 'var(--readiness-tint)',
    ink: 'var(--readiness)',
    blurb: 'Are students building the habits and coursework they need for college?',
    why: 'Students who attend regularly, earn strong grades and take college-level courses in high school are more likely to enroll in college and stay. These indicators show whether students are building that foundation.',
    who: 'Students enrolled in grades 9–12 in South Dakota public high schools. Coursework results count each year’s graduates. Each indicator names the exact group in its definition.',
    finding: 'Attendance has risen each year since 2022–23 but is still below 2021–22. Dual credit completion has grown every year shown. (Sample data.)',
    faq: [
      { q: 'Why did proficiency drop in the latest year?', a: 'South Dakota changed its 11th-grade test from Smarter Balanced to the ACT. Results before and after the change should not be compared directly.' },
      { q: 'Is GPA comparable across districts?', a: 'Not fully. Each school sets its own grading practices, so use GPA alongside test results.' },
      { q: 'What counts as dual credit?', a: 'A college course taken in high school that earns both high school and college credit.' },
    ],
    indicators: [
      { id: 'att', name: 'Consistent attendance', trend: [78, 69, 72, 74, 76], framework: 'consistent-attendance', question: 'Are students attending school consistently?', definition: 'The percent of students in grades 9–12 who attended at least 90% of the school days they were enrolled.', howto: 'Each bar is one school year. A taller bar means more students attended at least 90% of school days. The drop in 2022–23 matches a rise in absences seen nationally.' },
      { id: 'gpa', name: 'GPA', trend: [52, 50, 51, 53, 54], framework: 'grade-point-average', question: 'Are students earning strong grades?', definition: 'The percent of 12th graders whose cumulative high school GPA is 3.0 or higher on a 4.0 scale.', howto: 'GPA is set by each school, so grading practices can differ between districts. Read it alongside proficiency results.' },
      { id: 'prof', name: '11th grade reading and math proficiency', parts: [{ id: 'read', name: '11th grade reading proficiency', short: 'Reading', trend: [52, 51, 50, 45, 46] }, { id: 'math', name: '11th grade math proficiency', short: 'Math', trend: [44, 43, 42, 37, 38] }], breakAt: 3, breakNote: 'South Dakota changed its standardized state assessment', framework: 'math-and-reading-proficiency-high-school', question: 'Are 11th graders meeting state standards in reading and math?', definition: 'The percent of 11th graders who met the state standard on the state test, shown separately for reading and for math.', howto: 'Proficient means a student met the state standard for their grade. Reading and math each have their own trend. The dashed line marks the change in tests.', noteLabel: 'Series break.', note: 'South Dakota moved from the Smarter Balanced assessment to the ACT as the official state assessment in 2024–25. Results before and after the change are not directly comparable.' },
      { id: 'dual', name: 'Early college coursework', trend: [31, 33, 36, 39, 42], framework: 'early-college-coursework-completion', question: 'Are students taking college courses in high school?', definition: 'The percent of high school graduates who completed at least one dual credit course before graduating.', howto: 'South Dakota has a large dual credit program, so this shows how many students start earning college credit early.' },
    ],
  },
  transition: {
    key: 'transition',
    short: 'Transition',
    full: 'High school completion and transition',
    eyebrow: 'Stage 2 of 3 · Leaving high school',
    color: 'var(--transition)',
    tint: 'var(--transition-tint)',
    ink: 'var(--transition-ink)',
    blurb: 'Are seniors taking the steps that lead to college?',
    why: 'Taking the ACT, applying to college and completing the FAFSA are concrete steps that predict whether a student enrolls in college. Tracking them shows where students may need more support before graduation.',
    who: 'Students in grades 11 and 12 in South Dakota public high schools, and the four-year graduation cohort for graduation rates.',
    finding: 'ACT participation rose sharply when the ACT became the state test. FAFSA completion recovered in 2025–26 after a dip tied to the national form change. (Sample data.)',
    faq: [
      { q: 'Where does FAFSA data come from?', a: 'From the Board of Regents under a data-sharing agreement [pending]. It is not part of the K-12 record.' },
      { q: 'Why is graduation marked optional?', a: 'Graduation rates are already published in the state Report Card. They are shown here for context.' },
      { q: 'Do applications include out-of-state colleges?', a: 'Not yet. Applications cover colleges that report to the SLDS.' },
    ],
    indicators: [
      { id: 'act', name: 'ACT participation and performance', trend: [71, 72, 96, 97, 97], breakAt: 2, breakNote: 'the ACT became the state 11th-grade test', framework: 'sat-and-act-participation-and-performance', question: 'Are students taking the ACT, and how do they score?', definition: 'The percent of 11th graders who took the ACT, and their average composite score (1 to 36).', howto: 'The large number shows how many students took the test. Average scores appear in the table view.', noteLabel: 'Series break.', note: 'Participation rose when the ACT became the state 11th-grade test.' },
      { id: 'app', name: 'College applications', trend: [55, 54, 56, 57, 58], framework: 'college-applications', question: 'Are seniors applying to college?', definition: 'The percent of 12th graders who submitted at least one application to a college that reports to the SLDS.', howto: 'Applications to colleges outside the SLDS may be missing, so this may undercount.' },
      { id: 'fafsa', name: 'FAFSA completion', trend: [52, 53, 51, 44, 50], framework: 'fafsa-completion', question: 'Are seniors applying for financial aid?', definition: 'The percent of 12th graders who completed the Free Application for Federal Student Aid (FAFSA) by June 30.', howto: 'Completing the FAFSA is one of the strongest signs that a student plans to enroll in college.', noteLabel: 'Data source.', note: 'FAFSA records come from the Board of Regents [agreement pending].' },
      { id: 'grad', name: 'High school graduation', trend: [84, 85, 85, 86, 86], framework: 'high-school-graduation', question: 'Are students graduating on time?', definition: 'The four-year adjusted cohort graduation rate (ACGR). Optional indicator, also published in the state Report Card.', howto: 'Follows students who started 9th grade together and adjusts for students who moved in or out.' },
    ],
  },
  postsecondary: {
    key: 'postsecondary',
    short: 'Postsecondary',
    full: 'Postsecondary enrollment and early progress',
    eyebrow: 'Stage 3 of 3 · College',
    color: 'var(--postsecondary)',
    tint: 'var(--postsecondary-tint)',
    ink: 'var(--postsecondary)',
    blurb: 'Do graduates enroll in college, earn credits and come back?',
    why: 'Enrolling is only the first step. Earning enough credits and returning for a second year are early signs that a student is on track to finish a degree or certificate.',
    who: 'South Dakota public high school graduates who enrolled in college, in or out of state. Each indicator follows one graduating class.',
    finding: 'About four in five first-year students return for a second year. Fewer than half earn 24 or more credits in their first year. (Sample data.)',
    faq: [
      { q: 'Are out-of-state colleges included?', a: 'Yes. Out-of-state enrollment comes from the National Student Clearinghouse.' },
      { q: 'Why is degree completion not shown?', a: 'College data start in [2019–20 or 2020–21]. Completion will be added once enough classes have had time to finish.' },
      { q: 'Are tribal colleges included?', a: 'Records from tribal colleges may be incomplete.' },
    ],
    indicators: [
      { id: 'enr', name: 'College enrollment', trend: [61, 59, 58, 59, 60], framework: 'postsecondary-enrollment-directly-after-high-school', question: 'Do graduates enroll in college?', definition: 'The percent of high school graduates enrolled at any two- or four-year college in the fall after graduation.', howto: 'Counts enrollment in or out of state, at public or private colleges.' },
      { id: 'cred', name: 'First-year credits', trend: [44, 45, 46, 47, 47], framework: 'first-year-credit-accumulation', question: 'Are first-year students earning enough credits?', definition: 'The percent of first-year students who earned 24 or more college credits, and who passed gateway math and English.', howto: 'Earning 24 credits in year one keeps a student on pace for a degree. Gateway course results appear in the table view.' },
      { id: 'pers', name: 'Persistence', trend: [79, 80, 81, 80, 81], framework: 'postsecondary-persistence', question: 'Do students come back for a second year?', definition: 'The percent of first-year students who enrolled at any college the following fall.', howto: 'A student counts as persisting even if they move to a different college.' },
      { id: 'deg', name: 'Degree completion', framework: 'postsecondary-certificate-or-degree-completion', question: 'Do students earn a degree or certificate?', later: true, definition: 'Completion rates will be added once enough graduating classes have had time to finish a degree or certificate.' },
    ],
  },
};

export const YEARS = ['2025–26', '2024–25', '2023–24', '2022–23', '2021–22'];
export const LEVELS = ['State', 'District', 'School'];
export const DISTRICTS = ['Aberdeen 06-1', 'Brookings 05-1', 'Pierre 32-2', 'Rapid City Area 51-4', 'Sioux Falls 49-5'];
export const SCHOOLS = ['[High school A]', '[High school B]', '[Alternative school]'];
// Student groups, in the order the Student groups report page shows them.
export const GROUP_CATEGORIES = [
  { label: 'Sex', groups: ['Female', 'Male'] },
  {
    label: 'Race and ethnicity',
    groups: ['American Indian or Alaska Native', 'Asian', 'Black or African American', 'Hispanic or Latino', 'Two or more races', 'White'],
  },
  { label: 'Economic status', groups: ['Economically disadvantaged', 'Not economically disadvantaged'] },
];
export const GROUPS = ['All students', ...GROUP_CATEGORIES.flatMap((c) => c.groups)];
