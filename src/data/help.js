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
  ['ACT', 'A college entrance exam taken by most South Dakota 11th graders. Composite scores range from 1 to 36.'],
  ['Cohort', 'A group of students who share a starting point, such as entering 9th grade or graduating in the same year. Following a cohort shows how the same students do over time.'],
  ['Common Education Data Standards (CEDS)', 'A shared national vocabulary for education data. The SLDS uses it so records from schools and colleges line up.'],
  ['Consistent attendance', 'Attending at least 90% of the school days a student was enrolled. [Confirm threshold.]'],
  ['District', 'A public school district, also called a local education agency (LEA). Most South Dakota districts have one high school.'],
  ['Dual credit', 'A college course taken in high school that earns both high school and college credit. Also called early college coursework.'],
  ['FAFSA', 'The Free Application for Federal Student Aid. Completing it is required for most grants, loans and work-study.'],
  ['Gateway course', 'A student’s first credit-bearing college course in math or English. Passing it early is a strong sign of college success.'],
  ['Indicator', 'A single measure, such as FAFSA completion, shown as a percentage of students.'],
  ['National Student Clearinghouse', 'A national organization that reports college enrollment and degrees. It lets us see students who attend college outside South Dakota.'],
  ['Persistence', 'Enrolling in college again in the fall after the first year, at the same or a different college.'],
  ['Proficiency', 'Meeting the state standard on a test for a student’s grade level.'],
  ['Statewide Longitudinal Data System (SLDS)', 'A secure system that links education records over time, from K-12 into college, so we can follow groups of students. Individual students are never shown.'],
  ['Student group', 'Students who share a characteristic, such as gender, race and ethnicity, or economic status. Sometimes called a subgroup.'],
  ['Suppression', 'Hiding a value when too few students are counted, usually fewer than 10, so no one can be identified.'],
].map(([term, def]) => ({ term, def }));

const S = {
  R: { stage: 'Readiness', ink: 'var(--readiness)', tint: '#e3f0f1' },
  T: { stage: 'Transition', ink: 'var(--transition-ink)', tint: '#f3ebd6' },
  P: { stage: 'Postsecondary', ink: 'var(--postsecondary)', tint: '#efe6ec' },
};
const row = (name, s, def, pop, src) => ({ name, ...S[s], def, pop, src });

export const DICTIONARY = [
  row('Consistent attendance', 'R', 'Percent of students attending at least 90% of enrolled days.', 'Grades 9–12', 'SD SLDS (K-12)'),
  row('GPA', 'R', 'Percent of students with a cumulative GPA of 3.0 or higher.', 'Grade 12', 'SD SLDS (K-12)'),
  row('Reading and math proficiency', 'R', 'Percent of students scoring proficient on the state test.', 'Grade 11', 'SD state assessment'),
  row('Early college coursework', 'R', 'Percent of graduates completing at least one dual credit course.', 'High school graduates', 'SD SLDS, Board of Regents'),
  row('ACT participation and performance', 'T', 'Percent of students taking the ACT, and average composite score.', 'Grade 11', 'ACT'),
  row('College applications', 'T', 'Percent of seniors submitting at least one college application.', 'Grade 12', 'Board of Regents [confirm]'),
  row('FAFSA completion', 'T', 'Percent of seniors completing the FAFSA by June 30.', 'Grade 12', 'Board of Regents, NCAN [pending]'),
  row('High school graduation (optional)', 'T', 'Four-year adjusted cohort graduation rate.', '9th-grade cohort', 'SD SLDS (K-12)'),
  row('College enrollment', 'P', 'Percent of graduates enrolled in college the fall after graduation.', 'High school graduates', 'Board of Regents, National Student Clearinghouse'),
  row('First-year credits and gateway courses', 'P', 'Percent earning 24+ credits, and passing gateway math and English, in year one.', 'First-year students', 'Board of Regents'),
  row('Persistence', 'P', 'Percent enrolled again the following fall.', 'First-year students', 'Board of Regents, National Student Clearinghouse'),
  row('Degree or certificate completion', 'P', 'Coming later.', 'College entrants', 'Board of Regents, National Student Clearinghouse'),
];

export const DOWNLOADS = [
  { title: 'Readiness data', text: 'Attendance, GPA, proficiency and dual credit.', meta: 'CSV · 2021–22 to 2025–26 · [SIZE]', btn: 'Download CSV', color: 'var(--readiness)' },
  { title: 'Transition data', text: 'ACT, college applications, FAFSA and graduation.', meta: 'CSV · 2021–22 to 2025–26 · [SIZE]', btn: 'Download CSV', color: 'var(--transition)' },
  { title: 'Postsecondary data', text: 'Enrollment, first-year credits and persistence.', meta: 'CSV · graduating classes [YEARS] · [SIZE]', btn: 'Download CSV', color: 'var(--postsecondary)' },
  { title: 'Data dictionary', text: 'Definitions, sources and suppression rules.', meta: 'PDF · [SIZE]', btn: 'Download PDF', color: 'var(--control-border)' },
];

export const ABOUT = [
  { title: 'Where the data come from', text: 'K-12 records from the Department of Education and college records from the Board of Regents, linked in the SLDS. Out-of-state college enrollment comes from the National Student Clearinghouse.' },
  { title: 'Years covered', text: 'K-12 data go back to 2010–11. College data start in [2019–20 or 2020–21], so college trends are shorter.' },
  { title: 'Protecting privacy', text: 'No individual student is shown. Values are suppressed when fewer than 10 students are counted, and student group results are shown at the state level only.' },
  { title: 'Known limits', text: 'The state test changed from Smarter Balanced to the ACT, so proficiency trends have a break. Some tribal college records may be missing. Workforce data are not yet included.' },
];

export const FAQ = [
  { q: 'Why are some numbers missing or striped?', a: 'When fewer than 10 students are counted, the value is suppressed so no student can be identified. Small districts are affected most.' },
  { q: 'Why did proficiency change so much in one year?', a: 'South Dakota switched its 11th-grade test from Smarter Balanced to the ACT. The two tests measure different things, so results before and after the switch should not be compared directly.' },
  { q: 'Can I see results for my child?', a: 'No. This site only shows results for groups of students. Contact your school for information about an individual student.' },
  { q: 'Does this site show whether graduates stay in South Dakota for work?', a: 'Not yet. Workforce data from the Department of Labor are planned for a later phase.' },
  { q: 'How is this different from the state Report Card?', a: 'The Report Card shows school accountability results. This site follows students over time, from high school into college.' },
];
