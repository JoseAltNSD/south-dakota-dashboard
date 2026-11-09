// Content for the Glossary and help page. Bracketed text is a placeholder to confirm.

export const SECTIONS = [
  { key: 'glossary', label: 'Glossary' },
  { key: 'dictionary', label: 'Data dictionary' },
  { key: 'read', label: 'How to read the charts' },
  { key: 'download', label: 'Download data' },
  { key: 'about', label: 'About the data' },
  { key: 'faq', label: 'Questions and answers' },
];

export const TERMS = [
  ['Adjusted cohort graduation rate (ACGR)', 'The share of students who start 9th grade together and earn a regular diploma within four years. It adjusts for students who move in or out.'],
  ['ACT', 'A college entrance exam and, since 2024–25, the state 11th-grade test. Composite scores range from 1 to 36.'],
  ['ACT College Readiness Benchmarks', 'Minimum ACT scores in English, math, reading and science. A student who meets a benchmark has about a 50% chance of earning a B or higher, or about a 75% chance of a C or higher, in the matching first-year college course.'],
  ['Cohort', 'A group of students who share a starting point, such as entering 9th grade or graduating in the same year. Following a cohort shows how the same students do over time.'],
  ['Common Education Data Standards (CEDS)', 'A shared national vocabulary for education data. The state uses it so records from schools and colleges line up.'],
  ['Consistent attendance', 'Attending at least 90% of the school days a student was enrolled. [Confirm threshold.]'],
  ['Credential', 'A certificate, associate degree or bachelor’s degree earned in college. The enrollment breakdown groups students by the credential they are working toward.'],
  ['District', 'A public school district, also called a local education agency (LEA). Most South Dakota districts have one high school.'],
  ['Dual credit', 'A college course taken in high school that earns both high school and college credit. Also called early college coursework.'],
  ['Education-to-Workforce (E-W) Indicator Framework', 'A national set of indicators, with recommended metrics, for tracking progress from early learning into the workforce. Each indicator on this site links to its framework page.'],
  ['FAFSA', 'The Free Application for Federal Student Aid. Completing it is required for most grants, loans and work-study.'],
  ['Gateway course', 'A student’s first credit-bearing college course in math or English. Passing it early is a strong sign of college success.'],
  ['Indicator', 'A single measure, such as FAFSA completion, shown as a percentage of students.'],
  ['Linked education records', 'Records from schools and colleges connected securely over time, from K-12 into college, so groups of students can be followed. Individual students are never shown.'],
  ['National Student Clearinghouse', 'A national organization that reports college enrollment and degrees. It lets us see students who attend college outside South Dakota.'],
  ['Persistence', 'Enrolling in college again in the fall after the first year, at the same or a different college.'],
  ['Postsecondary institution', 'A college or university. On the Postsecondary tab you can pick one of three [to confirm] South Dakota public universities as the level, to see first-year credits and persistence for the graduates who enrolled there.'],
  ['Proficiency', 'Meeting the state standard on a test for a student’s grade level.'],
  ['Series break', 'A change in how data were collected, such as a new state test. Charts show it as a gap and a dashed line, and results on either side should not be compared directly.'],
  ['Student group', 'Students who share a characteristic, such as gender, race and ethnicity, or economic status. Sometimes called a subgroup.'],
  ['Suppression', 'Hiding a value when too few students are counted, usually fewer than 10, so no one can be identified.'],
].map(([term, def]) => ({ term, def }));

const S = {
  R: { stage: 'High school', ink: 'var(--readiness)', tint: 'var(--readiness-tint)' },
  T: { stage: 'Transition', ink: 'var(--transition-ink)', tint: 'var(--transition-tint)' },
  P: { stage: 'Postsecondary', ink: 'var(--postsecondary)', tint: 'var(--postsecondary-tint)' },
};
const row = (name, s, def, pop, src) => ({ name, ...S[s], def, pop, src });

export const DICTIONARY = [
  row('Consistent attendance', 'R', 'Percent of students attending at least 90% of enrolled days.', 'Grades 9–12', 'SD DOE (K-12)'),
  row('GPA', 'R', 'Percent of students with a cumulative GPA of 3.0 or higher.', 'Grade 12', 'SD DOE (K-12)'),
  row('11th grade reading proficiency', 'R', 'Percent of students scoring proficient in reading on the state test.', 'Grade 11', 'SD state assessment'),
  row('11th grade math proficiency', 'R', 'Percent of students scoring proficient in math on the state test.', 'Grade 11', 'SD state assessment'),
  row('Early college coursework', 'R', 'Percent of graduates completing at least one dual credit course.', 'High school graduates', 'SD DOE, Board of Regents'),
  row('ACT participation', 'T', 'Percent of 11th graders who took the ACT.', 'Grade 11', 'ACT'),
  row('ACT performance', 'T', 'Percent of ACT test takers who met all four ACT College Readiness Benchmarks (English, math, reading and science).', 'Grade 11 ACT test takers', 'ACT'),
  row('College applications', 'T', 'Percent of seniors submitting at least one college application.', 'Grade 12', 'Board of Regents [confirm]'),
  row('FAFSA completion', 'T', 'Percent of seniors completing the FAFSA by June 30.', 'Grade 12', 'Board of Regents, NCAN [pending]'),
  row('High school graduation', 'T', 'Four-year adjusted cohort graduation rate. Optional indicator, also published in the state Report Card.', '9th-grade cohort', 'SD DOE (K-12)'),
  row('College enrollment', 'P', 'Percent of graduates enrolled in college the fall after graduation.', 'High school graduates', 'Board of Regents, National Student Clearinghouse'),
  row('College enrollment by credential', 'P', 'College enrollment split by the credential students work toward: bachelor’s degree, associate degree, certificate, or other or undeclared. Each part is a percent of all graduates, so the parts add up to college enrollment.', 'High school graduates', 'Board of Regents, National Student Clearinghouse [confirm]'),
  row('College enrollment by type of college', 'P', 'College enrollment split by where students enroll: in-state public university, in-state technical college, in-state private or tribal college, or out of state. Each part is a percent of all graduates.', 'High school graduates', 'Board of Regents, National Student Clearinghouse [confirm]'),
  row('First-year credits', 'P', 'Percent of first-year students earning 24 or more credits, and passing gateway math and English, in year one.', 'First-year students', 'Board of Regents'),
  row('Persistence', 'P', 'Percent enrolled again the following fall.', 'First-year students', 'Board of Regents, National Student Clearinghouse'),
  row('Degree completion', 'P', 'Coming later.', 'College entrants', 'Board of Regents, National Student Clearinghouse'),
];

// "How to read the charts": the numbered parts of an indicator page (they match the demo drawn in Learn.jsx), what
// each chart symbol means, and the other report pages.
export const READ_STEPS = [
  ['The question', 'What the indicator helps you answer.'],
  ['The value', 'The result for the place, school year and student group picked in the filters. A few indicators have two measures, such as reading and math, each with its own value and trend; they are never added together.'],
  ['The comparison', 'When you pick a district or school, the South Dakota value is shown under it.'],
  ['Trend over time', 'Five school years as lines: your place in color, its district as a dashed line when you pick a school, and South Dakota in gray.'],
  ['Districts compared', 'Each district as a bar from 0 to 100%, with a gray mark at the South Dakota value. The district you picked is darker. “Map” shows the same values on a map of South Dakota, with darker districts higher. When you pick a postsecondary institution, the bars compare institutions instead.'],
  ['Source and notes', 'Where the data come from, and any change in how they were collected.'],
];

export const READ_SYMBOLS = [
  { key: 'ref', label: 'Gray line or mark', text: 'South Dakota, or all students on the Student groups page, for comparison.' },
  { key: 'dashed', label: 'Dashed line', text: 'The district, when you pick a school.' },
  { key: 'break', label: 'Gap and dashed rule', text: 'A series break: the way the data were collected changed. Compare years on either side with care.' },
  { key: 'hatch', label: 'Stripes or *', text: 'Suppressed: fewer than 10 students are counted, so the value is hidden to protect privacy.' },
  { key: 'now', label: 'Shaded column', text: 'The school year picked in the filters.' },
];

export const READ_PAGES = [
  ['Overview', 'One tile per measure: the value for the year you picked, the change from the year before, and five years as small bars. The darker bar is the year you picked.'],
  ['Districts and schools', 'A small bar chart per measure comparing districts, or the schools in your district when you pick a school (the gray bar is the district). “Map” shades each district on a map of the state, and “Table” lists the same values, shaded from lowest to highest.'],
  ['Student groups', 'State results for each student group on the indicator you pick: a bar with a gray mark at all students, and a five-year line. The group picked in the filters is highlighted.'],
  ['College enrollment parts', 'The College enrollment page also shows what graduates enroll in, by credential or by type of college. The parts of each column add up to the enrollment rate; “Show as lines” draws each part over time. A striped column means a part had too few students to show.'],
];

export const DOWNLOADS = [
  { file: 'readiness', title: 'High school data', text: 'Attendance, GPA, proficiency and dual credit.', meta: 'CSV · 2021–22 to 2025–26 · [SIZE]', btn: 'Download CSV', color: 'var(--readiness)' },
  { file: 'transition', title: 'Transition data', text: 'ACT participation and performance, college applications, FAFSA and graduation.', meta: 'CSV · 2021–22 to 2025–26 · [SIZE]', btn: 'Download CSV', color: 'var(--transition)' },
  { file: 'postsecondary', title: 'Postsecondary data', text: 'Enrollment and its parts, first-year credits and persistence.', meta: 'CSV · graduating classes [YEARS] · [SIZE]', btn: 'Download CSV', color: 'var(--postsecondary)' },
  { file: 'dictionary', title: 'Data dictionary', text: 'Definitions, who is counted and sources.', meta: 'CSV · [SIZE]', btn: 'Download CSV', color: 'var(--control-border)' },
];

export const ABOUT = [
  { title: 'Where the data come from', text: 'K-12 records from the Department of Education and college records from the Board of Regents, linked across agencies. Out-of-state college enrollment comes from the National Student Clearinghouse.' },
  { title: 'Years covered', text: 'K-12 data go back to 2010–11. College data start in [2019–20 or 2020–21], so college trends are shorter.' },
  { title: 'Protecting privacy', text: 'No individual student is shown. Values are suppressed when fewer than 10 students are counted, and student group results are shown at the state level only.' },
  { title: 'Known limits', text: 'The state test changed from Smarter Balanced to the ACT in 2024–25, so proficiency and ACT trends have a break. Some tribal college records may be missing. Workforce data are not yet included.' },
];

export const FAQ = [
  { q: 'Why are some numbers missing or striped?', a: 'When fewer than 10 students are counted, the value is suppressed so no student can be identified. Small districts are affected most.' },
  { q: 'Why did proficiency change so much in one year?', a: 'South Dakota switched its 11th-grade test from Smarter Balanced to the ACT. The two tests measure different things, so results before and after the switch should not be compared directly.' },
  { q: 'Can I see results for my child?', a: 'No. This site only shows results for groups of students. Contact your school for information about an individual student.' },
  { q: 'Does this site show whether graduates stay in South Dakota for work?', a: 'Not yet. Workforce data from the Department of Labor are planned for a later phase.' },
  { q: 'How is this different from the state Report Card?', a: 'The Report Card shows school accountability results. This site follows students over time, from high school into college.' },
];
