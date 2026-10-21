import { useLayoutEffect, useRef, useState } from 'react';
import { DISTRICTS, SCHOOLS, YEARS, GROUP_CATEGORIES } from '../data/stages.js';

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

// Returns a percent, or null when the value is suppressed (fewer than 10 students).
export function sampleValue(ind, yearIdx, { level, district, school, group }) {
  let v = ind.trend[yearIdx];
  if (level !== 'State') {
    if (hash(district + ind.id) % 7 === 0) return null;
    v += offset(district + ind.id, 8) + drift(district + ind.id, 1, yearIdx);
  }
  if (level === 'School') {
    if (school === '[Alternative school]') return null;
    v += offset(school + district + ind.id, 6) + drift(school + district + ind.id, 1, yearIdx);
  }
  if (level === 'State' && group !== 'All students') {
    if (SMALL_GROUPS.includes(group) && hash(group + ind.id + yearIdx) % 6 === 0) return null;
    v += offset(group + ind.id, 10) + drift(group + ind.id, 2, yearIdx);
  }
  return Math.max(0, Math.min(100, Math.round(v)));
}

const fmt = (v) => (v == null ? 'Suppressed' : `${v}%`);
const STATE = { level: 'State', group: 'All students' };
const seriesValues = (ind, f) => YEARS_ASC.map((_, i) => sampleValue(ind, i, f));

export default function SampleReport({ stage, page, indicators, filters, subtitle }) {
  const yearIdx = Math.max(0, YEARS_ASC.indexOf(filters.year));
  const props = { stage, indicators, filters, yearIdx };
  const sub = page.kind === 'groups' ? `South Dakota · ${filters.year} · All student groups` : subtitle;

  return (
    <div className="rpt">
      <div className="rpt__head">
        <span className="h3">{page.kind === 'indicator' ? page.indicator.question : `${stage.short}: ${page.label}`}</span>
        <span className="caption">{sub} · Sample data</span>
      </div>
      {page.kind === 'overview' && <Overview {...props} />}
      {page.kind === 'indicator' && <IndicatorPage {...props} ind={page.indicator} />}
      {page.kind === 'places' && <PlacesPage {...props} />}
      {page.kind === 'groups' && <GroupsPage {...props} />}
    </div>
  );
}

function Overview({ stage, indicators, filters, yearIdx }) {
  return (
    <div className="rpt__tiles">
      {indicators.map((ind) => {
        const v = sampleValue(ind, yearIdx, filters);
        const prev = yearIdx > 0 ? sampleValue(ind, yearIdx - 1, filters) : null;
        let change = 'First year shown';
        if (ind.breakAt === yearIdx) change = 'Not comparable with the year before';
        else if (v != null && prev != null) {
          const d = v - prev;
          change = `${d > 0 ? '+' : d < 0 ? '−' : '±'}${Math.abs(d)} ${Math.abs(d) === 1 ? 'pt' : 'pts'} from ${YEARS_ASC[yearIdx - 1]}`;
        }
        return (
          <div key={ind.id} className="rpt__panel">
            <span className="rpt__label">{ind.name}</span>
            <span className="rpt__hero">{fmt(v)}</span>
            <span className="caption">{change}</span>
            <TrendBars ind={ind} filters={filters} yearIdx={yearIdx} color={stage.color} />
          </div>
        );
      })}
    </div>
  );
}

// The lines a trend chart compares: the selected place or group, plus its reference lines.
function trendSeries(ind, filters, color) {
  if (filters.level === 'State') {
    if (filters.group === 'All students') return [{ label: 'South Dakota', values: seriesValues(ind, STATE), color }];
    return [
      { label: filters.group, values: seriesValues(ind, filters), color },
      { label: 'All students', values: seriesValues(ind, STATE), color: REF },
    ];
  }
  const series = [];
  if (filters.level === 'School') series.push({ label: filters.school, values: seriesValues(ind, filters), color });
  series.push({
    label: filters.district,
    values: seriesValues(ind, { level: 'District', district: filters.district }),
    color,
    dashed: filters.level === 'School',
  });
  series.push({ label: 'South Dakota', values: seriesValues(ind, STATE), color: REF });
  return series;
}

function IndicatorPage({ stage, ind, filters, yearIdx }) {
  const v = sampleValue(ind, yearIdx, filters);
  const rows = DISTRICTS.map((d) => ({ name: d, value: sampleValue(ind, yearIdx, { level: 'District', district: d }) }));

  return (
    <div className="rpt__body">
      <div className="rpt__panel">
        <span className="rpt__label">{ind.name} · {filters.year}</span>
        <span className="rpt__hero rpt__hero--lg">{fmt(v)}</span>
        {filters.level !== 'State' && (
          <span className="body-sm muted">South Dakota: {fmt(sampleValue(ind, yearIdx, STATE))}</span>
        )}
        <span className="rpt__label" style={{ marginTop: 8 }}>Trend over time</span>
        <TrendLines series={trendSeries(ind, filters, stage.color)} breakAt={ind.breakAt} yearIdx={yearIdx} name={ind.name} />
        {ind.breakAt != null && <span className="caption">Gap and dashed line: the data source changed in {YEARS_ASC[ind.breakAt]}. Compare years on either side with care.</span>}
      </div>
      <div className="rpt__panel">
        <span className="rpt__label">Districts compared, {filters.year}</span>
        <CompareBars rows={rows} color={stage.color} picked={filters.level !== 'State' ? filters.district : null} state={sampleValue(ind, yearIdx, STATE)} />
        <span className="caption">* Suppressed: fewer than 10 students.</span>
      </div>
    </div>
  );
}

// Districts and schools: one small chart per indicator, or the same values as a table.
function PlacesPage({ stage, indicators, filters, yearIdx }) {
  const [asTable, setAsTable] = useState(false);
  const schools = filters.level === 'School';
  const what = schools ? `Schools in ${filters.district}` : 'Districts';

  return (
    <>
      <div className="rpt__toolbar">
        <span className="body-sm muted">{what}, {filters.year}. Bars run from 0 to 100%.</span>
        <button type="button" className="rpt__switch" aria-pressed={asTable} onClick={() => setAsTable((t) => !t)}>
          {asTable ? 'Show as charts' : 'Show as table'}
        </button>
      </div>
      {asTable ? (
        <PlacesTable stage={stage} indicators={indicators} filters={filters} yearIdx={yearIdx} />
      ) : (
        <div className="rpt__multiples">
          {indicators.map((ind) => {
            const rows = schools
              ? [
                  ...SCHOOLS.map((s) => ({ name: s, value: sampleValue(ind, yearIdx, { level: 'School', district: filters.district, school: s }) })),
                  { name: filters.district, value: sampleValue(ind, yearIdx, { level: 'District', district: filters.district }), parent: true },
                ]
              : DISTRICTS.map((d) => ({ name: d, value: sampleValue(ind, yearIdx, { level: 'District', district: d }) }));
            return (
              <div key={ind.id} className="rpt__panel">
                <span className="rpt__label">{ind.name}</span>
                <CompareBars
                  rows={rows}
                  color={stage.color}
                  picked={schools ? filters.school : filters.level === 'District' ? filters.district : null}
                  state={sampleValue(ind, yearIdx, STATE)}
                  sort={!schools}
                />
              </div>
            );
          })}
        </div>
      )}
      <span className="caption">* Suppressed: fewer than 10 students.{schools ? ` The gray bar is ${filters.district}.` : ' Bars are sorted from highest to lowest within each indicator.'}</span>
    </>
  );
}

function PlacesTable({ stage, indicators, filters, yearIdx }) {
  const schools = filters.level === 'School';
  const names = schools ? SCHOOLS : DISTRICTS;
  const at = (ind, name) =>
    sampleValue(ind, yearIdx, schools ? { level: 'School', district: filters.district, school: name } : { level: 'District', district: name });
  const cols = indicators.map((ind) => {
    const values = names.map((n) => at(ind, n));
    const shown = values.filter((v) => v != null);
    return { ind, values, lo: Math.min(...shown), hi: Math.max(...shown) };
  });
  const picked = schools ? filters.school : filters.level === 'District' ? filters.district : null;

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
            {names.map((n, r) => (
              <tr key={n}>
                <th scope="row" style={n === picked ? { textDecoration: 'underline' } : undefined}>{n}</th>
                {cols.map(({ ind, values, lo, hi }) => (
                  values[r] == null
                    ? <td key={ind.id} className="hatch" title={`${n}, ${ind.name}: suppressed`}>*</td>
                    : <td key={ind.id} style={cellStyle(values[r], lo, hi)} title={`${n}, ${ind.name}: ${values[r]}%`}>{values[r]}%</td>
                ))}
              </tr>
            ))}
            {schools && (
              <tr className="rpt-heat__state">
                <th scope="row">{filters.district}</th>
                {indicators.map((ind) => <td key={ind.id}>{fmt(sampleValue(ind, yearIdx, { level: 'District', district: filters.district }))}</td>)}
              </tr>
            )}
            <tr className={schools ? undefined : 'rpt-heat__state'}>
              <th scope="row">South Dakota</th>
              {indicators.map((ind) => <td key={ind.id}>{fmt(sampleValue(ind, yearIdx, STATE))}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
      <span className="caption">Darker cells are higher within each indicator.</span>
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
        <label className="rpt__slicer">
          <span className="rpt__label">Indicator</span>
          <select className="select" value={ind.id} onChange={(e) => setIndId(e.target.value)}>
            {indicators.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </label>
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
              const picked = filters.level === 'State' && filters.group === g;
              return (
                <div key={g} className="rpt-groups__row" title={`${g}, ${filters.year}: ${fmt(v)} (all students ${fmt(all)})`}>
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
        * Suppressed: fewer than 10 students.{ind.breakAt != null && ` The trend has a gap at ${YEARS_ASC[ind.breakAt]}, when the data source changed.`}
      </span>
    </>
  );
}

// Horizontal bars, 0 to 100%, with a gray tick for the state value on every row.
function CompareBars({ rows, color, picked, state, sort = true }) {
  const list = sort ? [...rows].sort((a, b) => (b.value ?? -1) - (a.value ?? -1)) : rows;
  return (
    <div className="rpt-compare">
      {list.map((r) => {
        const on = picked == null || r.name === picked;
        return (
          <div key={r.name} className="rpt-compare__row" title={`${r.name}: ${fmt(r.value)}${state != null ? ` (South Dakota ${state}%)` : ''}`}>
            <span className={`rpt-compare__name${r.name === picked ? ' strong' : ''}`}>{r.name}</span>
            <div className="rpt-compare__track rpt-compare__track--ref">
              {r.value == null
                ? <div className="rpt-compare__bar hatch" style={{ width: '100%' }} />
                : <div className="rpt-compare__bar" style={{ width: `${r.value}%`, background: r.parent ? REF : color, opacity: on || r.parent ? 1 : 0.45 }} />}
              {state != null && <span className="rpt-compare__tick" style={{ left: `${state}%` }} />}
            </div>
            <span className="rpt-compare__value">{r.value == null ? '*' : `${r.value}%`}</span>
          </div>
        );
      })}
      {state != null && <span className="caption"><i className="rpt-key rpt-key--tick" />South Dakota: {state}%</span>}
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
function TrendLines({ series, breakAt, yearIdx, name }) {
  const [ref, width] = useWidth();
  const H = 220, T = 12, B = 28, L = 36, R = 44;
  const W = Math.max(width, 240);
  const x = (i) => L + (i * (W - L - R)) / (YEARS_ASC.length - 1);
  const [lo, hi] = domain(series.map((s) => s.values));
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
      {series.length > 1 && (
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
          <text key={yr} x={x(i)} y={H - 8} textAnchor="middle" className={`rpt-trend__tick${i === yearIdx ? ' rpt-trend__tick--on' : ''}`}>{yr}</text>
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
