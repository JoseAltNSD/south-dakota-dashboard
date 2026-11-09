import { Fragment, useId, useLayoutEffect, useRef, useState } from 'react';
import { DISTRICTS, SCHOOL_PLACES, INSTITUTIONS, YEARS, GROUP_CATEGORIES } from '../data/stages.js';
import { DISTRICT_SHAPES, SD_OUTLINE } from '../data/districtMap.js';
import Select from './Select.jsx';

/**
 * Stand-in report pages drawn from the sample `trend` values in stages.js, so the mock-up
 * shows real-looking charts until the Power BI report is connected. Place and group values
 * are derived with a fixed offset per name, so the same filters always show the same numbers.
 */
const YEARS_ASC = [...YEARS].reverse();
const REF = 'var(--data-ref)';

// State-level groups small enough that some indicator-years fall under 10 students.
const SMALL_GROUPS = ['Asian', 'Black or African American', 'Two or more races'];

function hash(text) {
  let h = 0;
  for (const c of text) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

const offset = (key, spread) => (hash(key) % (2 * spread + 1)) - spread;
// A fixed drift per name, in points per year from the middle year, so places and groups trend apart from the state.
const drift = (key, spread, yearIdx) => offset(`${key}/slope`, spread) * (yearIdx - 2);

// Returns a percent, or null when the value is suppressed (fewer than 10 students). Measures with the same
// `suppressId` (the parts of one indicator) count the same students, so they are suppressed together.
export function sampleValue(ind, yearIdx, { level, district, school, institution, group }) {
  const key = ind.suppressId ?? ind.id;
  let v = ind.trend[yearIdx];
  // Institutions count hundreds of first-year students, so they are never suppressed.
  if (level === 'Institution') {
    v += offset(institution + ind.id, 8) + drift(institution + ind.id, 1, yearIdx);
  }
  if (level === 'District' || level === 'School') {
    if (hash(district + key) % 7 === 0) return null;
    v += offset(district + ind.id, 8) + drift(district + ind.id, 1, yearIdx);
  }
  if (level === 'School') {
    if (school === '[Alternative school]') return null;
    v += offset(school + district + ind.id, 6) + drift(school + district + ind.id, 1, yearIdx);
  }
  if (level === 'State' && group !== 'All students') {
    if (SMALL_GROUPS.includes(group) && hash(group + key + yearIdx) % 6 === 0) return null;
    v += offset(group + ind.id, 10) + drift(group + ind.id, 2, yearIdx);
  }
  return Math.max(0, Math.min(100, Math.round(v)));
}

// Splits an indicator's value into its breakdown parts, as percents of all graduates that add up to the value exactly
// (largest remainder). Each part starts from its `share` of enrollees, shifted by a fixed offset per place or group.
// Returns null when the breakdown is suppressed: schools and small groups have few students in each part, so the
// whole breakdown is hidden if any part is under 4%, and hiding one part alone would reveal it by subtraction.
export function sampleBreakdown(ind, bd, yearIdx, filters) {
  const total = sampleValue(ind, yearIdx, filters);
  if (total == null) return null;
  const { level, district, school, group } = filters;
  const place = level === 'District' ? district : level === 'School' ? school + district : group === 'All students' ? '' : group;
  const raw = bd.parts.map((p) => Math.max(0.01, p.share[yearIdx] + (place ? offset(place + bd.id + p.name, 4) / 100 : 0)));
  const sum = raw.reduce((a, b) => a + b, 0);
  const exact = raw.map((r) => (r / sum) * total);
  const values = exact.map(Math.floor);
  const left = total - values.reduce((a, b) => a + b, 0);
  exact.map((e, i) => [e - values[i], i]).sort((a, b) => b[0] - a[0]).slice(0, left).forEach(([, i]) => { values[i] += 1; });
  const small = level === 'School' || (level === 'State' && SMALL_GROUPS.includes(group));
  return small && Math.min(...values) < 4 ? null : values;
}

// Average ACT composite (1 to 36) for the example two-axis chart. Place and group offsets are derived as for a
// percent and scaled to the 35-point range, so the state value is the sample `score` itself. It is suppressed
// wherever participation is, since both count the same students.
function sampleScore(ind, yearIdx, filters) {
  const base = Math.round(((ind.score[yearIdx] - 1) / 35) * 100);
  const pct = sampleValue({ id: `${ind.id}-score`, suppressId: ind.id, trend: ind.score.map(() => base) }, yearIdx, filters);
  if (pct == null) return null;
  const shift = pct - base;
  return Math.round((ind.score[yearIdx] + (shift * 35) / 100) * 10) / 10;
}

// An indicator with `parts` (reading and math) is drawn as one measure per part, which keeps the indicator's break
// and notes. Each part gets its own id, so its derived place and group values differ, but shares the indicator's
// suppression.
export const measures = (ind) => (ind.parts ? ind.parts.map((p) => ({ ...ind, ...p, id: `${ind.id}-${p.id}`, suppressId: ind.id })) : [ind]);
const breakNote = (ind) => ind.breakNote ?? 'the data source changed';
const fmt = (v) => (v == null ? 'Suppressed' : `${v}%`);
const STATE = { level: 'State', group: 'All students' };
const seriesValues = (ind, f) => YEARS_ASC.map((_, i) => sampleValue(ind, i, f));

const ALL = 'All students';
const PICK_COLORS = ['var(--pick-1)', 'var(--pick-2)', 'var(--pick-3)', 'var(--pick-4)'];
// Above this many picks, trend charts become one small chart per pick instead of one color per pick.
const MAX_LINES = 4;

// The places or student groups picked in the filters, in pick order, each with the values `sampleValue` takes. An
// empty list means the state as a whole (State level with only "All students").
export function picksOf(filters) {
  if (filters.level === 'District') return filters.districts.map((d) => ({ label: d, f: { level: 'District', district: d, group: ALL } }));
  if (filters.level === 'School') {
    return filters.schools.map((value) => {
      const { district, school } = SCHOOL_PLACES.find((p) => p.value === value);
      return { label: value, district, f: { level: 'School', district, school, group: ALL } };
    });
  }
  if (filters.level === 'Institution') return filters.institutions.map((n) => ({ label: n, f: { level: 'Institution', institution: n, group: ALL } }));
  return filters.groups.filter((g) => g !== ALL).map((g) => ({ label: g, f: { level: 'State', group: g } }));
}

export default function SampleReport({ stage, page, indicators, filters: chosen, subtitle }) {
  const yearIdx = Math.max(0, YEARS_ASC.indexOf(chosen.year));
  // Only indicators marked `byInstitution` have institution results; every other page falls back to the state.
  const fallback = chosen.level === 'Institution' && !(page.kind === 'indicator' && page.indicator.byInstitution);
  const filters = fallback ? { ...chosen, level: 'State', groups: [ALL] } : chosen;
  const found = picksOf(filters);
  // One pick keeps the stage color; 2 to 4 take the pick colors in pick order; more are drawn apart in the stage color.
  const picks = found.map((p, i) => ({ ...p, color: found.length > 1 && found.length <= MAX_LINES ? PICK_COLORS[i] : stage.color }));
  // The gray comparison: all students when comparing groups, otherwise the state.
  const refLabel = filters.level === 'State' && picks.length ? ALL : 'South Dakota';
  const props = { stage, indicators: indicators.flatMap(measures), filters, picks, refLabel, yearIdx };
  const sub = page.kind === 'groups' ? `South Dakota · ${filters.year} · All student groups`
    : fallback ? `South Dakota · ${filters.year} · All students` : subtitle;

  return (
    <div className="rpt">
      <div className="rpt__head">
        <span className="h3">{page.kind === 'indicator' ? page.indicator.question : `${stage.short}: ${page.label}`}</span>
        <span className="caption">{sub} · Sample data</span>
      </div>
      {fallback && <p className="rpt__notice body-sm">Not available by institution. Showing South Dakota.</p>}
      {page.kind === 'overview' && <Overview {...props} />}
      {page.kind === 'indicator' && <IndicatorPage {...props} ind={page.indicator} />}
      {page.kind === 'places' && <PlacesPage {...props} />}
      {page.kind === 'groups' && <GroupsPage {...props} />}
    </div>
  );
}

// The change from the year before, e.g. "+3 pts from 2024–25" (`long`) or "+3 pts".
function changeText(ind, f, yearIdx, long) {
  if (yearIdx === 0) return long ? 'First year shown' : '';
  if (ind.breakAt === yearIdx) return long ? 'Not comparable with the year before' : 'Not comparable';
  const v = sampleValue(ind, yearIdx, f);
  const prev = sampleValue(ind, yearIdx - 1, f);
  if (v == null || prev == null) return long ? 'First year shown' : '';
  const d = v - prev;
  return `${d > 0 ? '+' : d < 0 ? '−' : '±'}${Math.abs(d)} ${Math.abs(d) === 1 ? 'pt' : 'pts'}${long ? ` from ${YEARS_ASC[yearIdx - 1]}` : ''}`;
}

// One row per pick (color key, name, value, change), then the gray comparison row.
function PickRows({ ind, picks, refLabel, yearIdx, large = false, changes = false }) {
  const rows = [
    ...picks.map((p) => ({ ...p, value: sampleValue(ind, yearIdx, p.f) })),
    { label: refLabel, f: STATE, color: REF, value: sampleValue(ind, yearIdx, STATE), ref: true },
  ];
  return (
    <div className={`rpt-picks${large ? ' rpt-picks--lg' : ''}`}>
      {rows.map((r) => {
        const ref = r.ref ? ' rpt-picks__ref' : '';
        return (
          <Fragment key={r.label}>
            <span className={`rpt-picks__name${ref}`} title={r.label}><i className="rpt-key rpt-key--line" style={{ '--key': r.color }} />{r.label}</span>
            <span className={`rpt-picks__value${ref}`}>{r.value == null ? <span title="Suppressed: fewer than 10 students">*</span> : `${r.value}%`}</span>
            <span className={`rpt-picks__change${ref}`}>{changes ? changeText(ind, r.f, yearIdx, false) : ''}</span>
          </Fragment>
        );
      })}
    </div>
  );
}

function Overview({ stage, indicators, picks, refLabel, yearIdx }) {
  // Two or more picks list one row per pick in each tile; the five small bars only fit one place or group.
  if (picks.length > 1) {
    return (
      <div className="rpt__tiles rpt__tiles--picks">
        {indicators.map((ind) => (
          <div key={ind.id} className="rpt__panel">
            <span className="rpt__label">{ind.name}</span>
            <PickRows ind={ind} picks={picks} refLabel={refLabel} yearIdx={yearIdx} changes />
          </div>
        ))}
        <span className="caption" style={{ gridColumn: '1 / -1' }}>Change is from the school year before. * Suppressed: fewer than 10 students.</span>
      </div>
    );
  }
  const f = picks[0]?.f ?? STATE;
  return (
    <div className="rpt__tiles">
      {indicators.map((ind) => (
        <div key={ind.id} className="rpt__panel">
          <span className="rpt__label">{ind.name}</span>
          <span className="rpt__hero">{fmt(sampleValue(ind, yearIdx, f))}</span>
          <span className="caption">{changeText(ind, f, yearIdx, true)}</span>
          <TrendBars ind={ind} filters={f} yearIdx={yearIdx} color={stage.color} />
        </div>
      ))}
    </div>
  );
}

// A trend chart of the picks against the gray comparison line. Up to MAX_LINES picks share one chart, one color each
// (a single school adds its district as a dashed line); more get one small chart each, all on the same scale.
function PickTrends({ m, picks, refLabel, yearIdx, color }) {
  const ref = { label: refLabel, values: seriesValues(m, STATE), color: REF };
  if (!picks.length) return <TrendLines series={[{ ...ref, color }]} breakAt={m.breakAt} yearIdx={yearIdx} name={m.name} />;
  const lines = picks.map((p) => ({ label: p.label, values: seriesValues(m, p.f), color: p.color }));
  if (picks.length <= MAX_LINES) {
    const district = picks.length === 1 && picks[0].district;
    const parent = district ? [{ label: district, values: seriesValues(m, { level: 'District', district }), color: picks[0].color, dashed: true }] : [];
    return <TrendLines series={[...lines, ...parent, ref]} breakAt={m.breakAt} yearIdx={yearIdx} name={m.name} />;
  }
  const range = domain([ref.values, ...lines.map((l) => l.values)]);
  return (
    <>
      <div className="rpt__smalls">
        {lines.map((l) => (
          <div key={l.label} className="stack gap-4">
            <span className="body-sm strong rpt-picks__name" title={l.label}>{l.label}</span>
            <TrendLines series={[l, ref]} breakAt={m.breakAt} yearIdx={yearIdx} name={`${m.name}, ${l.label}`} range={range} small />
          </div>
        ))}
      </div>
      <span className="caption"><i className="rpt-key rpt-key--line" />Gray line: {refLabel}. Every chart uses the same scale.</span>
    </>
  );
}

function IndicatorPage({ stage, ind, filters, picks, refLabel, yearIdx }) {
  const parts = measures(ind);
  const districtRows = (m) => DISTRICTS.map((d) => ({ name: d, value: sampleValue(m, yearIdx, { level: 'District', district: d }) }));
  const institutionRows = (m) => INSTITUTIONS.map((n) => ({ name: n, value: sampleValue(m, yearIdx, { level: 'Institution', institution: n }) }));
  const byInstitution = filters.level === 'Institution';
  // Highlighted bars: the picked districts or institutions, or the districts of the picked schools.
  const picked = filters.level === 'State' ? [] : [...new Set(picks.map((p) => p.district ?? p.label))];
  // Bars of picked places wear their line color, so a place has one color across the page.
  const colors = filters.level !== 'School' && picks.length > 1 ? Object.fromEntries(picks.map((p) => [p.label, p.color])) : {};
  const views = picks.length ? picks : [{ label: 'South Dakota', f: STATE }];
  const [chosen, setView] = useState('bars');
  // Institutions aren't districts, so they compare as bars only.
  const view = byInstitution ? 'bars' : chosen;
  const compare = (m) => (view === 'map'
    ? <DistrictMap rows={districtRows(m)} color={stage.color} picked={picked} state={sampleValue(m, yearIdx, STATE)} name={`${m.name}, ${filters.year}`} />
    : <CompareBars rows={byInstitution ? institutionRows(m) : districtRows(m)} color={stage.color} colors={colors} picked={picked} state={sampleValue(m, yearIdx, STATE)} wide={byInstitution} />);
  const compareHead = (
    <div className="rpt__toolbar" style={{ alignItems: 'center' }}>
      <span className="rpt__label">{byInstitution ? 'Institutions' : 'Districts'} compared, {filters.year}</span>
      {!byInstitution && <ViewSwitch label="Show districts as" value={view} onChange={setView} views={[['bars', 'Bars'], ['map', 'Map']]} />}
    </div>
  );
  const compareNote = !byInstitution && <span className="caption">{view === 'map' ? MAP_NOTE : '* Suppressed: fewer than 10 students.'}</span>;

  const trendPanels = parts.map((m) => (
    <div key={m.id} className="rpt__panel">
      <span className="rpt__label">{m.name} · {filters.year}</span>
      {m.detail && <span className="body-sm muted">{m.detail}</span>}
      {picks.length > 1 ? <PickRows ind={m} picks={picks} refLabel={refLabel} yearIdx={yearIdx} large /> : (
        <>
          <span className="rpt__hero rpt__hero--lg">{fmt(sampleValue(m, yearIdx, views[0].f))}</span>
          {picks.length === 1 && <span className="body-sm muted">{refLabel}: {fmt(sampleValue(m, yearIdx, STATE))}</span>}
        </>
      )}
      <span className="rpt__label" style={{ marginTop: 8 }}>{m.short ? `${m.short}: trend over time` : 'Trend over time'}</span>
      <PickTrends m={m} picks={picks} refLabel={refLabel} yearIdx={yearIdx} color={stage.color} />
      {m.breakAt != null && <span className="caption">Gap and dashed line: {breakNote(m)} in {YEARS_ASC[m.breakAt]}. Compare years on either side with care.</span>}
    </div>
  ));

  if (parts.length === 1) {
    const body = (
      <div className="rpt__body">
        {trendPanels}
        <div className="rpt__panel">
          {compareHead}
          {compare(ind)}
          {compareNote}
        </div>
      </div>
    );
    if (!ind.breakdowns) return body;
    return (
      <div className="stack gap-16">
        {body}
        <BreakdownPanel ind={ind} views={views} yearIdx={yearIdx} />
      </div>
    );
  }

  // Several parts: a trend tile per part side by side, then the district comparison for each part below.
  return (
    <div className="stack gap-16">
      <div className="rpt__body">{trendPanels}</div>
      {ind.score && <ComboPanel stage={stage} ind={ind} views={views} yearIdx={yearIdx} />}
      <div className="rpt__panel">
        {compareHead}
        <div className="rpt__body">
          {parts.map((m) => (
            <div key={m.id} className="stack gap-8">
              <span className="body-sm strong">{m.short ?? m.name}</span>
              {compare(m)}
            </div>
          ))}
        </div>
        {compareNote}
      </div>
    </div>
  );
}

// An example for discussion, as suggested on the Oct 22 call: participation and average score on one chart with two
// axes. Hidden until asked for, so the default view stays one measure per chart.
function ComboPanel({ stage, ind, views, yearIdx }) {
  const [open, setOpen] = useState(false);
  const [showing, setShowing] = useState(0);
  const { f: filters } = views[Math.min(showing, views.length - 1)];
  const [part] = measures(ind);
  const bars = seriesValues(part, filters);
  const line = YEARS_ASC.map((_, i) => sampleScore(ind, i, filters));

  return (
    <div className="rpt__panel">
      <div className="rpt__toolbar" style={{ alignItems: 'center' }}>
        <span className="rpt__label">Example: participation and average score on one chart</span>
        <button type="button" className="rpt__switch" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? 'Hide combined chart' : 'Show combined chart'}
        </button>
      </div>
      {open && (
        <>
          {views.length > 1 && <ShowingPicker views={views} value={showing} onChange={setShowing} />}
          <ComboChart bars={bars} line={line} breakAt={ind.breakAt} yearIdx={yearIdx} color={stage.color} />
          <span className="caption">
            For discussion. Bars use the left axis (percent who took the ACT); the line uses the right axis (average
            composite score, 1 to 36). Average scores appear only in this example. Striped bars are suppressed.
          </span>
        </>
      )}
    </div>
  );
}

// Bars for a percent on the left axis (0 to 100) and a line for the ACT composite on the right axis (0 to 36).
// Both axes start at zero so neither measure looks bigger than it is.
function ComboChart({ bars, line, breakAt, yearIdx, color }) {
  const [ref, width] = useWidth();
  const hatch = useId();
  const H = 240, T = 12, B = 28, L = 40, R = 40;
  const W = Math.max(width, 280);
  const slot = (W - L - R) / YEARS_ASC.length;
  const x = (i) => L + slot * (i + 0.5);
  const yPct = (v) => T + (1 - v / 100) * (H - T - B);
  const yScore = (v) => T + (1 - v / 36) * (H - T - B);
  const barW = Math.min(36, slot * 0.5);
  const label = `ACT participation (bars, left axis) and average composite score (line, right axis) by school year. ${YEARS_ASC.map((yr, i) => `${yr}: ${fmt(bars[i])}, ${line[i] ?? 'Suppressed'}`).join('; ')}`;

  return (
    <div className="rpt-trend" ref={ref}>
      <div className="rpt-trend__legend caption">
        <span><i className="rpt-key" style={{ '--key': color }} />Took the ACT (%, left axis)</span>
        <span><i className="rpt-key rpt-key--line" style={{ '--key': 'var(--ink)' }} />Average composite score (right axis)</span>
      </div>
      <svg width={W} height={H} role="img" aria-label={label}>
        <HatchPattern id={hatch} />
        {[0, 25, 50, 75, 100].map((t, k) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={yPct(t)} y2={yPct(t)} className="rpt-trend__grid" />
            <text x={L - 8} y={yPct(t) + 4} textAnchor="end" className="rpt-trend__tick">{t}%</text>
            <text x={W - R + 8} y={yPct(t) + 4} className="rpt-trend__tick">{k * 9}</text>
          </g>
        ))}
        {YEARS_ASC.map((yr, i) => (
          <text key={yr} x={x(i)} y={H - 8} textAnchor="middle" className={`rpt-trend__tick${i === yearIdx ? ' rpt-trend__tick--on' : ''}`}>{yr}</text>
        ))}
        {bars.map((v, i) => (v == null
          ? <rect key={i} x={x(i) - barW / 2} y={T} width={barW} height={H - T - B} fill={`url(#${hatch})`} />
          : (
            <rect key={i} x={x(i) - barW / 2} y={yPct(v)} width={barW} height={yPct(0) - yPct(v)} rx={3} fill={color} opacity={i === yearIdx ? 1 : 0.45}>
              <title>{`Took the ACT, ${YEARS_ASC[i]}: ${v}%`}</title>
            </rect>
          )))}
        {breakAt != null && <line x1={L + slot * breakAt} x2={L + slot * breakAt} y1={T} y2={H - B} className="rpt-trend__break" />}
        {runs(line, breakAt).map((run) => (
          <polyline key={run[0]} points={run.map((i) => `${x(i)},${yScore(line[i])}`).join(' ')} fill="none" stroke="var(--ink)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {line.map((v, i) => v != null && (
          <g key={i}>
            <circle cx={x(i)} cy={yScore(v)} r={4} fill="var(--ink)" className="rpt-trend__dot">
              <title>{`Average composite, ${YEARS_ASC[i]}: ${v}`}</title>
            </circle>
            <text x={x(i)} y={yScore(v) - 10} textAnchor="middle" className="rpt-trend__end rpt-combo__label">{v.toFixed(1)}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// These panels draw one place or group at a time; with several picked, this picks which one (the first by default).
function ShowingPicker({ views, value, onChange }) {
  const id = useId();
  return (
    <div className="rpt__slicer">
      <label htmlFor={id} className="rpt__label">Showing</label>
      <Select id={id} value={String(Math.min(value, views.length - 1))} onChange={(v) => onChange(Number(v))} options={views.map((p, i) => ({ value: String(i), label: p.label }))} />
    </div>
  );
}

// The same stripes as the .hatch class, for suppressed marks inside an SVG chart. Fill with `url(#id)`.
function HatchPattern({ id }) {
  return (
    <defs>
      <pattern id={id} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="12" height="12" fill="#e8e2d7" />
        <rect width="6" height="12" fill="var(--suppressed)" />
      </pattern>
    </defs>
  );
}

// "What graduates enroll in": the indicator split into parts, by credential or by type of college. Stacked columns
// show the total as column height; "Show as lines" draws each part as its own line beside the total.
function BreakdownPanel({ ind, views, yearIdx }) {
  const [bdId, setBdId] = useState(ind.breakdowns[0].id);
  const [showing, setShowing] = useState(0);
  const { f: filters } = views[Math.min(showing, views.length - 1)];
  const [asLines, setAsLines] = useState(false);
  const bd = ind.breakdowns.find((b) => b.id === bdId);
  const columns = YEARS_ASC.map((_, i) => ({ total: sampleValue(ind, i, filters), parts: sampleBreakdown(ind, bd, i, filters) }));
  const suppressed = columns.some((c) => c.parts == null);

  const lines = [
    { label: 'All enrolled', values: columns.map((c) => (c.parts ? c.total : null)), color: 'var(--ink)' },
    ...bd.parts.map((p, k) => ({ label: p.name, values: columns.map((c) => c.parts?.[k] ?? null), color: p.color })),
  ];

  return (
    <div className="rpt__panel">
      <div className="rpt__toolbar">
        <div className="stack gap-4">
          <span className="rpt__label">What graduates enroll in, as a percent of all graduates</span>
          <div className="rpt__segments" role="group" aria-label="Break down by">
            {ind.breakdowns.map((b) => (
              <button key={b.id} type="button" className="rpt__switch" aria-pressed={b.id === bdId} onClick={() => setBdId(b.id)}>{b.label}</button>
            ))}
          </div>
        </div>
        {views.length > 1 && <ShowingPicker views={views} value={showing} onChange={setShowing} />}
        <button type="button" className="rpt__switch" onClick={() => setAsLines(!asLines)}>
          {asLines ? 'Show as stacked columns' : 'Show as lines'}
        </button>
      </div>
      {asLines
        ? <TrendLines series={lines} breakAt={ind.breakAt} yearIdx={yearIdx} name={`${ind.name}, ${bd.label.toLowerCase()}`} />
        : <StackedColumns parts={bd.parts} columns={columns} yearIdx={yearIdx} name={`${ind.name}, ${bd.label.toLowerCase()}`} />}
      <span className="caption">
        The parts add up to the college enrollment rate.
        {suppressed && ' Striped columns: the breakdown is suppressed because a part has too few students. The total is on the trend tile.'}
        {' '}Sample data; categories to confirm.
      </span>
    </div>
  );
}

// Columns stacked from the bottom in part order, on a 0-based axis so heights compare. Each segment is labeled when
// it is tall enough, and each column carries its total on top.
function StackedColumns({ parts, columns, yearIdx, name }) {
  const [ref, width] = useWidth();
  const hatch = useId();
  const H = 260, T = 20, B = 28, L = 40, R = 16;
  const W = Math.max(width, 280);
  const slot = (W - L - R) / YEARS_ASC.length;
  const x = (i) => L + slot * (i + 0.5);
  const top = Math.max(20, Math.ceil((Math.max(...columns.map((c) => c.total ?? 0)) + 5) / 10) * 10);
  const y = (v) => T + (1 - v / top) * (H - T - B);
  const barW = Math.min(64, slot * 0.6);
  const step = top > 60 ? 20 : 10;
  const ticks = Array.from({ length: top / step + 1 }, (_, k) => k * step);
  const label = `${name} by school year. ${YEARS_ASC.map((yr, i) => `${yr}: ${columns[i].parts ? parts.map((p, k) => `${p.name} ${columns[i].parts[k]}%`).join(', ') : 'suppressed'}`).join('; ')}`;

  return (
    <div className="rpt-trend" ref={ref}>
      <div className="rpt-trend__legend caption">
        {parts.map((p) => <span key={p.name}><i className="rpt-key" style={{ '--key': p.color }} />{p.name}</span>)}
      </div>
      <svg width={W} height={H} role="img" aria-label={label}>
        <HatchPattern id={hatch} />
        <rect x={x(yearIdx) - slot / 2 + 4} y={T} width={slot - 8} height={H - T - B} className="rpt-trend__now" />
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} className="rpt-trend__grid" />
            <text x={L - 8} y={y(t) + 4} textAnchor="end" className="rpt-trend__tick">{t}%</text>
          </g>
        ))}
        {YEARS_ASC.map((yr, i) => (
          <text key={yr} x={x(i)} y={H - 8} textAnchor="middle" className={`rpt-trend__tick${i === yearIdx ? ' rpt-trend__tick--on' : ''}`}>{yr}</text>
        ))}
        {columns.map(({ total, parts: values }, i) => {
          const left = x(i) - barW / 2;
          if (!values) {
            const h = total == null ? H - T - B : y(0) - y(total);
            return <rect key={i} x={left} y={y(0) - h} width={barW} height={h} fill={`url(#${hatch})`}><title>{`${YEARS_ASC[i]}: breakdown suppressed`}</title></rect>;
          }
          let base = 0;
          return (
            <g key={i}>
              {values.map((v, k) => {
                const y0 = y(base + v);
                const h = y(base) - y0;
                base += v;
                return (
                  <g key={k}>
                    <rect x={left} y={y0} width={barW} height={Math.max(0, h - 1)} fill={parts[k].color}>
                      <title>{`${parts[k].name}, ${YEARS_ASC[i]}: ${v}% of graduates`}</title>
                    </rect>
                    {/* Parts are ordered darkest first; the first two shades take white labels. */}
                    {h >= 16 && <text x={x(i)} y={y0 + h / 2 + 4} textAnchor="middle" className="rpt-stack__value" fill={k < 2 ? '#fff' : 'var(--ink)'}>{v}%</text>}
                  </g>
                );
              })}
              <text x={x(i)} y={y(total) - 6} textAnchor="middle" className="rpt-trend__end">{total}%</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// The places the Districts and schools table lists: every district, or at School level the schools of the picked
// districts, named "School, District" when there are several, with each district's own row below them.
function placeRows(filters) {
  if (filters.level !== 'School') {
    return { parents: [], rows: DISTRICTS.map((d) => ({ name: d, f: { level: 'District', district: d } })) };
  }
  const one = filters.districts.length === 1;
  return {
    parents: filters.districts.map((d) => ({ name: d, f: { level: 'District', district: d } })),
    rows: SCHOOL_PLACES.filter((p) => filters.districts.includes(p.district))
      .map((p) => ({ id: p.value, name: one ? p.school : p.value, f: { level: 'School', district: p.district, school: p.school } })),
  };
}

// Districts and schools: one small chart or map per indicator, or the same values as a table. Schools have no map,
// so at School level a map choice falls back to the charts.
function PlacesPage({ stage, indicators, filters, yearIdx }) {
  const [chosen, setView] = useState('charts');
  const schools = filters.level === 'School';
  const view = schools && chosen === 'map' ? 'charts' : chosen;
  const one = filters.districts.length === 1;
  const what = !schools ? 'Districts' : one ? `Schools in ${filters.districts[0]}` : `Schools in ${filters.districts.length} districts`;
  const views = [['charts', 'Charts'], ...(schools ? [] : [['map', 'Map']]), ['table', 'Table']];
  const picked = schools ? filters.schools : filters.level === 'District' ? filters.districts : [];

  return (
    <>
      <div className="rpt__toolbar">
        <span className="body-sm muted">{what}, {filters.year}.{view === 'charts' && ' Bars run from 0 to 100%.'}</span>
        <ViewSwitch label="Show as" value={view} onChange={setView} views={views} />
      </div>
      {view === 'table' && <PlacesTable stage={stage} indicators={indicators} filters={filters} yearIdx={yearIdx} />}
      {view === 'map' && (
        <div className="rpt__multiples">
          {indicators.map((ind) => (
            <div key={ind.id} className="rpt__panel">
              <span className="rpt__label">{ind.name}</span>
              <DistrictMap
                rows={DISTRICTS.map((d) => ({ name: d, value: sampleValue(ind, yearIdx, { level: 'District', district: d }) }))}
                color={stage.color}
                picked={picked}
                state={sampleValue(ind, yearIdx, STATE)}
                name={`${ind.name}, ${filters.year}`}
              />
            </div>
          ))}
        </div>
      )}
      {view === 'charts' && (
        <div className="rpt__multiples">
          {indicators.map((ind) => {
            const state = sampleValue(ind, yearIdx, STATE);
            return (
              <div key={ind.id} className="rpt__panel">
                <span className="rpt__label">{ind.name}</span>
                {!schools && (
                  <CompareBars
                    rows={DISTRICTS.map((d) => ({ name: d, value: sampleValue(ind, yearIdx, { level: 'District', district: d }) }))}
                    color={stage.color}
                    picked={picked}
                    state={state}
                  />
                )}
                {/* Schools are grouped by district, each group ending with its district's bar in gray. */}
                {schools && filters.districts.map((d) => (
                  <div key={d} className="stack gap-4">
                    {!one && <span className="body-sm strong">{d}</span>}
                    <CompareBars
                      rows={[
                        ...SCHOOL_PLACES.filter((p) => p.district === d)
                          .map((p) => ({ id: p.value, name: p.school, value: sampleValue(ind, yearIdx, { level: 'School', district: d, school: p.school }) })),
                        { name: d, value: sampleValue(ind, yearIdx, { level: 'District', district: d }), parent: true },
                      ]}
                      color={stage.color}
                      picked={picked}
                      state={state}
                      sort={false}
                      stateKey={d === filters.districts[filters.districts.length - 1]}
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
      {view === 'map'
        ? <span className="caption">{MAP_NOTE}</span>
        : <span className="caption">* Suppressed: fewer than 10 students.{!schools ? ' Bars are sorted from highest to lowest within each indicator.' : one ? ` The gray bar is ${filters.districts[0]}.` : ' The gray bar under each district’s schools is the district.'}</span>}
    </>
  );
}

function PlacesTable({ stage, indicators, filters, yearIdx }) {
  const schools = filters.level === 'School';
  const { parents, rows } = placeRows(filters);
  const cols = indicators.map((ind) => {
    const values = rows.map((r) => sampleValue(ind, yearIdx, r.f));
    const shown = values.filter((v) => v != null);
    return { ind, values, lo: Math.min(...shown), hi: Math.max(...shown) };
  });
  const picked = schools ? filters.schools : filters.level === 'District' ? filters.districts : [];

  // Five shades of the stage color, lightest = lowest within each indicator.
  function cellStyle(v, lo, hi) {
    const step = hi === lo ? 2 : Math.round(((v - lo) / (hi - lo)) * 4);
    // Capped at 60% so dark ink text stays readable on every stage color.
    return { background: `color-mix(in srgb, ${stage.color} ${12 + step * 12}%, white)` };
  }

  return (
    <div className="rpt__panel">
      <div className="rpt-heat__wrap">
        <table className="rpt-heat">
          <thead>
            <tr><th scope="col">{schools ? 'School' : 'District'}, {YEARS_ASC[yearIdx]}</th>{indicators.map((i) => <th key={i.id} scope="col">{i.name}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={row.name}>
                <th scope="row" style={picked.includes(row.id ?? row.name) ? { textDecoration: 'underline' } : undefined}>{row.name}</th>
                {cols.map(({ ind, values, lo, hi }) => (
                  values[r] == null
                    ? <td key={ind.id} className="hatch" title={`${row.name}, ${ind.name}: suppressed`}>*</td>
                    : <td key={ind.id} style={cellStyle(values[r], lo, hi)} title={`${row.name}, ${ind.name}: ${values[r]}%`}>{values[r]}%</td>
                ))}
              </tr>
            ))}
            {parents.map((row, k) => (
              <tr key={row.name} className={k === 0 ? 'rpt-heat__state' : undefined}>
                <th scope="row">{row.name}</th>
                {indicators.map((ind) => <td key={ind.id}>{fmt(sampleValue(ind, yearIdx, row.f))}</td>)}
              </tr>
            ))}
            <tr className={schools ? undefined : 'rpt-heat__state'}>
              <th scope="row">South Dakota</th>
              {indicators.map((ind) => <td key={ind.id}>{fmt(sampleValue(ind, yearIdx, STATE))}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
      <span className="caption">{picked.length ? 'Underlined: picked in the filters. ' : ''}Darker cells are higher within each indicator.</span>
    </div>
  );
}

// Student groups: state level only, one row per group with this year's bar and a five-year trend.
function GroupsPage({ stage, indicators, filters, yearIdx }) {
  const [indId, setIndId] = useState(indicators[0].id);
  const ind = indicators.find((i) => i.id === indId) ?? indicators[0];
  const all = sampleValue(ind, yearIdx, STATE);
  const allTrend = seriesValues(ind, STATE);
  const groups = GROUP_CATEGORIES.flatMap((c) => c.groups);
  const range = domain([allTrend, ...groups.map((g) => seriesValues(ind, { level: 'State', group: g }))]);

  return (
    <>
      <div className="rpt__toolbar">
        <div className="rpt__slicer">
          <label htmlFor="rpt-ind" className="rpt__label">Indicator</label>
          <Select id="rpt-ind" value={ind.id} onChange={setIndId} options={indicators.map((i) => ({ value: i.id, label: i.name }))} />
        </div>
        <span className="body-sm muted">Student group results are shown for the state only, so small groups can’t be identified.</span>
      </div>
      <div className="rpt__panel">
        <div className="rpt-groups__legend caption">
          <span><i className="rpt-key" style={{ '--key': stage.color }} />{filters.year}</span>
          <span><i className="rpt-key rpt-key--tick" />All students: {fmt(all)}</span>
          <span><i className="rpt-key rpt-key--line" style={{ '--key': stage.color }} />{YEARS_ASC[0]} to {YEARS_ASC[YEARS_ASC.length - 1]}, with all students in gray</span>
        </div>
        {GROUP_CATEGORIES.map((cat) => (
          <div key={cat.label} className="rpt-groups">
            <span className="rpt__label">{cat.label}</span>
            {cat.groups.map((g) => {
              const f = { level: 'State', group: g };
              const v = sampleValue(ind, yearIdx, f);
              const picked = filters.level === 'State' && filters.groups.includes(g);
              return (
                <div
                  key={g}
                  className={`rpt-groups__row${picked ? ' rpt-groups__row--picked' : ''}`}
                  style={picked ? { '--stage': stage.color, '--stage-tint': stage.tint } : undefined}
                  aria-current={picked || undefined}
                  title={`${g}, ${filters.year}: ${fmt(v)} (all students ${fmt(all)})`}
                >
                  <span className={`rpt-compare__name${picked ? ' strong' : ''}`}>{g}</span>
                  <div className="rpt-compare__track rpt-compare__track--ref">
                    {v == null
                      ? <div className="rpt-compare__bar hatch" style={{ width: '100%' }} />
                      : <div className="rpt-compare__bar" style={{ width: `${v}%`, background: stage.color }} />}
                    {all != null && <span className="rpt-compare__tick" style={{ left: `${all}%` }} />}
                  </div>
                  <span className="rpt-compare__value">{v == null ? '*' : `${v}%`}</span>
                  <Sparkline values={seriesValues(ind, f)} reference={allTrend} range={range} breakAt={ind.breakAt} yearIdx={yearIdx} color={stage.color} label={`${g}, ${ind.name} by school year`} />
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <span className="caption">
        * Suppressed: fewer than 10 students.{ind.breakAt != null && ` The trend has a gap at ${YEARS_ASC[ind.breakAt]}, when ${breakNote(ind)}.`}
      </span>
    </>
  );
}

// Horizontal bars, 0 to 100%, with a gray tick for the state value on every row.
// `wide` gives the names more room, for long names such as universities.
// `picked` lists the names (or row ids) to highlight; the rest are lighter. `colors` gives a picked row its own color.
// `stateKey={false}` leaves out the South Dakota key, for stacked groups that share one.
function CompareBars({ rows, color, colors = {}, picked = [], state, sort = true, wide = false, stateKey = true }) {
  const list = sort ? [...rows].sort((a, b) => (b.value ?? -1) - (a.value ?? -1)) : rows;
  return (
    <div className={`rpt-compare${wide ? ' rpt-compare--wide' : ''}`}>
      {list.map((r) => {
        const mine = picked.includes(r.id ?? r.name);
        const on = !picked.length || mine;
        return (
          <div key={r.name} className="rpt-compare__row" title={`${r.name}: ${fmt(r.value)}${state != null ? ` (South Dakota ${state}%)` : ''}`}>
            <span className={`rpt-compare__name${mine ? ' strong' : ''}`}>{r.name}</span>
            <div className="rpt-compare__track rpt-compare__track--ref">
              {r.value == null
                ? <div className="rpt-compare__bar hatch" style={{ width: '100%' }} />
                : <div className="rpt-compare__bar" style={{ width: `${r.value}%`, background: r.parent ? REF : colors[r.name] ?? color, opacity: on || r.parent ? 1 : 0.45 }} />}
              {state != null && <span className="rpt-compare__tick" style={{ left: `${state}%` }} />}
            </div>
            <span className="rpt-compare__value">{r.value == null ? '*' : `${r.value}%`}</span>
          </div>
        );
      })}
      {state != null && stateKey && <span className="caption"><i className="rpt-key rpt-key--tick" />South Dakota: {state}%</span>}
    </div>
  );
}

// Buttons that pick one of a few views of the same values, like the breakdown switch on College enrollment.
function ViewSwitch({ label, value, onChange, views }) {
  return (
    <div className="rpt__segments" role="group" aria-label={label}>
      {views.map(([v, text]) => (
        <button key={v} type="button" className="rpt__switch" aria-pressed={v === value} onClick={() => onChange(v)}>{text}</button>
      ))}
    </div>
  );
}

const MAP_NOTE = 'Darker districts are higher. Each map splits its range of district values into equal steps. Striped: suppressed, fewer than 10 students. District shapes are schematic, not official boundaries.';
const MAP_SHADES = [15, 35, 55, 75, 100];

// Up to five equal steps of whole percents from the lowest to the highest value shown, each with a shade index into
// MAP_SHADES spread from lightest to darkest. Fewer steps when the values span fewer than five points.
function mapSteps(values) {
  const shown = values.filter((v) => v != null);
  if (!shown.length) return [];
  const lo = Math.min(...shown);
  const n = Math.max(...shown) - lo + 1;
  const count = Math.min(5, n);
  return Array.from({ length: count }, (_, k) => ({
    from: lo + Math.ceil((k * n) / count),
    to: lo + Math.ceil(((k + 1) * n) / count) - 1,
    shade: count === 1 ? 2 : Math.round((k * 4) / (count - 1)),
  }));
}

// Districts on a schematic South Dakota map, shaded in the stage color by which step of the range their value falls
// in. The rest of the state is gray, since the sample has only five districts. Lon/lat are projected flat, with
// longitude scaled by the cosine of the state's middle latitude.
function DistrictMap({ rows, color, picked = [], state, name }) {
  const [ref, width] = useWidth();
  const hatch = useId();
  const P = 8, LON0 = -104.05, LAT1 = 45.94, K = Math.cos((44.2 * Math.PI) / 180);
  const W = Math.max(width, 280);
  const scale = (W - 2 * P) / (7.6 * K);
  const H = Math.round(3.45 * scale + 2 * P);
  const pt = ([lon, lat]) => [P + (lon - LON0) * K * scale, P + (LAT1 - lat) * scale];
  const path = (pts) => `M${pts.map((p) => pt(p).map((c) => c.toFixed(1)).join(',')).join('L')}Z`;
  const steps = mapSteps(rows.map((r) => r.value));
  const fill = (v) => {
    if (v == null) return `url(#${hatch})`;
    const { shade } = steps.find((s) => v >= s.from && v <= s.to);
    return `color-mix(in srgb, ${color} ${MAP_SHADES[shade]}%, white)`;
  };
  const range = (s) => (s.from === s.to ? `${s.from}%` : `${s.from}–${s.to}%`);
  const label = `Map of ${name} by district. ${rows.map((r) => `${r.name}: ${fmt(r.value)}`).join('; ')}${state != null ? `. South Dakota: ${state}%` : ''}`;

  return (
    <div className="rpt-trend" ref={ref}>
      <div className="rpt-trend__legend caption">
        {steps.map((s) => (
          <span key={s.from}><i className="rpt-key rpt-key--map" style={{ '--key': `color-mix(in srgb, ${color} ${MAP_SHADES[s.shade]}%, white)` }} />{range(s)}</span>
        ))}
        {rows.some((r) => r.value == null) && <span><i className="rpt-key rpt-key--map hatch" />Suppressed</span>}
        {state != null && <span>South Dakota: {state}%</span>}
      </div>
      <svg width={W} height={H} role="img" aria-label={label}>
        <HatchPattern id={hatch} />
        <path d={path(SD_OUTLINE)} className="rpt-map__state" />
        {rows.map((r) => DISTRICT_SHAPES[r.name] && (
          <path key={r.name} d={path(DISTRICT_SHAPES[r.name].shape)} fill={fill(r.value)} className={`rpt-map__district${picked.includes(r.name) ? ' rpt-map__district--picked' : ''}`}>
            <title>{`${r.name}: ${fmt(r.value)}${state != null ? ` (South Dakota ${state}%)` : ''}`}</title>
          </path>
        ))}
        {rows.map((r) => {
          const geo = DISTRICT_SHAPES[r.name];
          if (!geo) return null;
          const [x, y] = pt(geo.label);
          return (
            <text key={r.name} x={x} y={y - 2} textAnchor={geo.anchor} className="rpt-map__label" aria-hidden="true">
              <tspan className={picked.includes(r.name) ? 'rpt-map__name--picked' : undefined}>{r.name}</tspan>
              <tspan x={x} dy={15} className="rpt-map__value">{r.value == null ? '*' : `${r.value}%`}</tspan>
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function useWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    const ro = new ResizeObserver(([e]) => setWidth(Math.floor(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

// Line charts zoom to the data (bars always run from 0 to 100%), rounded out to tens.
function domain(lists) {
  const all = lists.flat().filter((v) => v != null);
  if (!all.length) return [0, 100];
  const lo = Math.max(0, Math.floor((Math.min(...all) - 4) / 10) * 10);
  const hi = Math.min(100, Math.ceil((Math.max(...all) + 4) / 10) * 10);
  return hi - lo < 20 ? [Math.max(0, hi - 20), Math.max(20, hi)] : [lo, hi];
}

// Splits a series into drawable runs, breaking at suppressed years and at a series break.
function runs(values, breakAt) {
  const out = [];
  let cur = [];
  values.forEach((v, i) => {
    if (v == null || i === breakAt) { if (cur.length) out.push(cur); cur = []; }
    if (v != null) cur.push(i);
  });
  if (cur.length) out.push(cur);
  return out;
}

// Five-year line chart on a zoomed axis. Lines end in a value label; a legend names each line.
// `small` draws a shorter chart with year ticks shortened ("24–25") and no legend, for small multiples that share
// one `range`.
function TrendLines({ series, breakAt, yearIdx, name, range, small = false }) {
  const [ref, width] = useWidth();
  const H = small ? 150 : 220, T = 12, B = 28, L = 36, R = 44;
  const W = Math.max(width, small ? 180 : 240);
  const x = (i) => L + (i * (W - L - R)) / (YEARS_ASC.length - 1);
  const [lo, hi] = range ?? domain(series.map((s) => s.values));
  const step = hi - lo > 40 ? 20 : 10;
  const ticks = Array.from({ length: (hi - lo) / step + 1 }, (_, i) => lo + i * step);
  const y = (v) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
  const label = `${name} by school year. ${series.map((s) => `${s.label}: ${YEARS_ASC.map((yr, i) => `${yr} ${fmt(s.values[i])}`).join(', ')}`).join('. ')}`;

  // End labels only where they won't collide; the legend and tooltips carry the rest.
  const last = YEARS_ASC.length - 1;
  const ends = [];
  series.forEach((s, k) => {
    const v = s.values[last];
    if (v != null && ends.every((e) => Math.abs(y(e.v) - y(v)) >= 14)) ends.push({ k, v });
  });

  return (
    <div className="rpt-trend" ref={ref}>
      {series.length > 1 && !small && (
        <div className="rpt-trend__legend caption">
          {series.map((s) => (
            <span key={s.label}><i className={`rpt-key rpt-key--line${s.dashed ? ' rpt-key--dashed' : ''}`} style={{ '--key': s.color }} />{s.label}</span>
          ))}
        </div>
      )}
      <svg width={W} height={H} role="img" aria-label={label}>
        <rect x={x(yearIdx) - 18} y={T} width={36} height={H - T - B} className="rpt-trend__now" />
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} className="rpt-trend__grid" />
            <text x={L - 8} y={y(t) + 4} textAnchor="end" className="rpt-trend__tick">{t}%</text>
          </g>
        ))}
        {YEARS_ASC.map((yr, i) => (
          <text key={yr} x={x(i)} y={H - 8} textAnchor="middle" className={`rpt-trend__tick${i === yearIdx ? ' rpt-trend__tick--on' : ''}`}>{small ? yr.slice(2) : yr}</text>
        ))}
        {breakAt != null && <line x1={(x(breakAt - 1) + x(breakAt)) / 2} x2={(x(breakAt - 1) + x(breakAt)) / 2} y1={T} y2={H - B} className="rpt-trend__break" />}
        {[...series].reverse().map((s) => (
          <g key={s.label}>
            {runs(s.values, breakAt).map((run) => (
              <polyline
                key={run[0]}
                points={run.map((i) => `${x(i)},${y(s.values[i])}`).join(' ')}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeDasharray={s.dashed ? '6 4' : undefined}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}
            {s.values.map((v, i) => v != null && (
              <circle key={i} cx={x(i)} cy={y(v)} r={4} fill={s.color} className="rpt-trend__dot">
                <title>{`${s.label}, ${YEARS_ASC[i]}: ${v}%`}</title>
              </circle>
            ))}
          </g>
        ))}
        {ends.map(({ k, v }) => (
          <text key={k} x={x(last) + 10} y={y(v) + 4} className="rpt-trend__end">{v}%</text>
        ))}
      </svg>
    </div>
  );
}

// A row-sized trend: the group's line in the stage color over the all-students line in gray.
// Every row on a page shares one `range`, so slopes compare across rows.
function Sparkline({ values, reference, range, breakAt, yearIdx, color, label }) {
  const W = 96, H = 28, P = 4;
  const [lo, hi] = range;
  const x = (i) => P + (i * (W - 2 * P)) / (YEARS_ASC.length - 1);
  const y = (v) => P + (1 - (v - lo) / (hi - lo)) * (H - 2 * P);
  const line = (vals, stroke) =>
    runs(vals, breakAt).map((run) => (
      <polyline key={run[0]} points={run.map((i) => `${x(i)},${y(vals[i])}`).join(' ')} fill="none" stroke={stroke} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    ));

  return (
    <svg className="rpt-spark" width={W} height={H} role="img" aria-label={`${label}: ${YEARS_ASC.map((yr, i) => `${yr} ${fmt(values[i])}`).join(', ')}`}>
      {line(reference, REF)}
      {line(values, color)}
      {values[yearIdx] != null && <circle cx={x(yearIdx)} cy={y(values[yearIdx])} r={3.5} fill={color} className="rpt-trend__dot" />}
    </svg>
  );
}

function TrendBars({ ind, filters, yearIdx, color }) {
  const values = seriesValues(ind, filters);
  const label = `${ind.name} by school year: ${YEARS_ASC.map((y, i) => `${y} ${fmt(values[i])}`).join(', ')}`;

  return (
    <div className="rpt-bars rpt-bars--compact" role="img" aria-label={label}>
      {YEARS_ASC.map((y, i) => (
        <div key={y} className={`rpt-bars__col${ind.breakAt === i ? ' rpt-bars__col--break' : ''}`} title={`${y}: ${fmt(values[i])}`}>
          <div className="rpt-bars__track">
            {values[i] == null
              ? <div className="rpt-bars__bar hatch" style={{ height: '100%' }} />
              : <div className="rpt-bars__bar" style={{ height: `${values[i]}%`, background: color, opacity: i === yearIdx ? 1 : 0.45 }} />}
          </div>
        </div>
      ))}
    </div>
  );
}
