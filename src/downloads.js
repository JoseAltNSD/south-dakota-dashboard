import { STAGES, STAGE_ORDER, YEARS, DISTRICTS, SCHOOLS, GROUPS } from './data/stages.js';
import { DICTIONARY } from './data/help.js';
import { sampleValue, measures } from './components/SampleReport.jsx';

// The "Download data" files, built in the browser from the same sample values the report draws, so the numbers in
// a file match the charts. Long format: one row per indicator, year, place and student group.

const NOTE = 'Sample data for illustration only. These are not official South Dakota results.';
const YEARS_ASC = [...YEARS].reverse();
const DATA_HEADER = ['Stage', 'Indicator', 'School year', 'Level', 'Place', 'Student group', 'Value (%)', 'Suppressed'];

// Every place and group the dashboard can show publicly. Student groups are state-level only (suppression rules).
const VIEWS = [
  { level: 'State', place: 'South Dakota' },
  ...DISTRICTS.map((district) => ({ level: 'District', district, place: district })),
  ...DISTRICTS.flatMap((district) => SCHOOLS.map((school) => ({ level: 'School', district, school, place: `${school}, ${district}` }))),
].map((v) => ({ ...v, group: 'All students' }))
  .concat(GROUPS.slice(1).map((group) => ({ level: 'State', place: 'South Dakota', group })));

function stageRows(key) {
  const stage = STAGES[key];
  return stage.indicators.filter((i) => !i.later).flatMap(measures).flatMap((m) =>
    VIEWS.flatMap((v) =>
      YEARS_ASC.map((year, i) => {
        const value = sampleValue(m, i, v);
        return [stage.short, m.name, year, v.level, v.place, v.group, value, value == null ? 'Yes' : 'No'];
      })
    )
  );
}

const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-');

const FILES = {
  ...Object.fromEntries(STAGE_ORDER.map((key) => [key, () => [slug(STAGES[key].short), [DATA_HEADER, ...stageRows(key)]]])),
  all: () => ['all-stages', [DATA_HEADER, ...STAGE_ORDER.flatMap(stageRows)]],
  dictionary: () => ['data-dictionary', [['Indicator', 'Stage', 'Definition', 'Who is counted', 'Source'], ...DICTIONARY.map((d) => [d.name, d.stage, d.def, d.pop, d.src])]],
};

const cell = (v) => {
  const text = v == null ? '' : String(v);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

/** Saves one file: a stage key, 'all' or 'dictionary'. Suppressed values are left blank and marked in "Suppressed". */
export function downloadData(file) {
  const [name, rows] = FILES[file]();
  const csv = [[NOTE], ...rows].map((r) => r.map(cell).join(',')).join('\r\n');
  // The byte-order mark makes Excel read the file as UTF-8, so en dashes in school years survive.
  const url = URL.createObjectURL(new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' }));
  const link = Object.assign(document.createElement('a'), { href: url, download: `sd-slds-${name}-SAMPLE.csv` });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
