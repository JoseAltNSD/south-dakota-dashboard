import { DISTRICTS, YEARS } from '../data/stages.js';

/**
 * Stand-in report pages drawn from the sample `trend` values in stages.js, so the mock-up
 * shows real-looking charts until the Power BI report is connected. Place and group values
 * are derived with a fixed offset per name, so the same filters always show the same numbers.
 */
const YEARS_ASC = [...YEARS].reverse();

function hash(text) {
  let h = 0;
  for (const c of text) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

const offset = (key, spread) => (hash(key) % (2 * spread + 1)) - spread;

// Returns a percent, or null when the value is suppressed (fewer than 10 students).
export function sampleValue(ind, yearIdx, { level, district, school, group }) {
  let v = ind.trend[yearIdx];
  if (level !== 'State') {
    if (hash(district + ind.id) % 7 === 0) return null;
    v += offset(district + ind.id, 8);
  }
  if (level === 'School') {
    if (school === '[Alternative school]') return null;
    v += offset(school + district + ind.id, 6);
  }
  if (level === 'State' && group !== 'All students') v += offset(group + ind.id, 10);
  return Math.max(0, Math.min(100, Math.round(v)));
}

const fmt = (v) => (v == null ? 'Suppressed' : `${v}%`);
const STATE = { level: 'State', group: 'All students' };

export default function SampleReport({ stage, page, indicators, filters, subtitle }) {
  const yearIdx = Math.max(0, YEARS_ASC.indexOf(filters.year));
  const props = { stage, indicators, filters, yearIdx };

  return (
    <div className="rpt">
      <div className="rpt__head">
        <span className="h3">{page.kind === 'indicator' ? page.indicator.question : `${stage.short}: ${page.label}`}</span>
        <span className="caption">{subtitle} · Sample data</span>
      </div>
      {page.kind === 'overview' && <Overview {...props} />}
      {page.kind === 'indicator' && <IndicatorPage {...props} ind={page.indicator} />}
      {page.kind === 'districts' && <DistrictTable {...props} />}
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
            <TrendBars ind={ind} filters={filters} yearIdx={yearIdx} color={stage.color} compact />
          </div>
        );
      })}
    </div>
  );
}

function IndicatorPage({ stage, ind, filters, yearIdx }) {
  const v = sampleValue(ind, yearIdx, filters);
  const rows = DISTRICTS.map((d) => ({ name: d, value: sampleValue(ind, yearIdx, { level: 'District', district: d }) }))
    .sort((a, b) => (b.value ?? -1) - (a.value ?? -1));
  rows.push({ name: 'South Dakota', value: sampleValue(ind, yearIdx, STATE), state: true });

  return (
    <div className="rpt__body">
      <div className="rpt__panel">
        <span className="rpt__label">{ind.name} · {filters.year}</span>
        <span className="rpt__hero rpt__hero--lg">{fmt(v)}</span>
        {filters.level !== 'State' && (
          <span className="body-sm muted">South Dakota: {fmt(sampleValue(ind, yearIdx, STATE))}</span>
        )}
        <TrendBars ind={ind} filters={filters} yearIdx={yearIdx} color={stage.color} />
        {ind.breakAt != null && <span className="caption">Dashed line: the data source changed. Compare years on either side with care.</span>}
      </div>
      <div className="rpt__panel">
        <span className="rpt__label">Districts compared, {filters.year}</span>
        <div className="rpt-compare">
          {rows.map((r) => {
            const picked = filters.level !== 'State' && r.name === filters.district;
            return (
              <div key={r.name} className="rpt-compare__row" title={`${r.name}: ${fmt(r.value)}`}>
                <span className={`rpt-compare__name${picked || r.state ? ' strong' : ''}`}>{r.name}</span>
                <div className="rpt-compare__track">
                  {r.value == null
                    ? <div className="rpt-compare__bar hatch" style={{ width: '100%' }} />
                    : <div className="rpt-compare__bar" style={{ width: `${r.value}%`, background: r.state ? 'var(--control-border)' : stage.color, opacity: filters.level === 'State' || picked || r.state ? 1 : 0.45 }} />}
                </div>
                <span className="rpt-compare__value">{r.value == null ? '*' : `${r.value}%`}</span>
              </div>
            );
          })}
        </div>
        <span className="caption">* Suppressed: fewer than 10 students.</span>
      </div>
    </div>
  );
}

function DistrictTable({ stage, indicators, filters, yearIdx }) {
  const cols = indicators.map((ind) => {
    const values = DISTRICTS.map((d) => sampleValue(ind, yearIdx, { level: 'District', district: d }));
    const shown = values.filter((v) => v != null);
    return { ind, values, lo: Math.min(...shown), hi: Math.max(...shown) };
  });

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
            <tr><th scope="col">District, {YEARS_ASC[yearIdx]}</th>{indicators.map((i) => <th key={i.id} scope="col">{i.name}</th>)}</tr>
          </thead>
          <tbody>
            {DISTRICTS.map((d, r) => (
              <tr key={d}>
                <th scope="row" style={filters.level !== 'State' && d === filters.district ? { textDecoration: 'underline' } : undefined}>{d}</th>
                {cols.map(({ ind, values, lo, hi }) => (
                  values[r] == null
                    ? <td key={ind.id} className="hatch" title={`${d}, ${ind.name}: suppressed`}>*</td>
                    : <td key={ind.id} style={cellStyle(values[r], lo, hi)} title={`${d}, ${ind.name}: ${values[r]}%`}>{values[r]}%</td>
                ))}
              </tr>
            ))}
            <tr className="rpt-heat__state">
              <th scope="row">South Dakota</th>
              {indicators.map((ind) => <td key={ind.id}>{fmt(sampleValue(ind, yearIdx, STATE))}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
      <span className="caption">Darker cells are higher within each indicator. * Suppressed: fewer than 10 students.</span>
    </div>
  );
}

function TrendBars({ ind, filters, yearIdx, color, compact = false }) {
  const values = YEARS_ASC.map((_, i) => sampleValue(ind, i, filters));
  const label = `${ind.name} by school year: ${YEARS_ASC.map((y, i) => `${y} ${fmt(values[i])}`).join(', ')}`;

  return (
    <div className={`rpt-bars${compact ? ' rpt-bars--compact' : ''}`} role="img" aria-label={label}>
      {YEARS_ASC.map((y, i) => (
        <div key={y} className={`rpt-bars__col${ind.breakAt === i ? ' rpt-bars__col--break' : ''}`} title={`${y}: ${fmt(values[i])}`}>
          <div className="rpt-bars__track">
            {!compact && i === yearIdx && values[i] != null && <span className="rpt-bars__value">{values[i]}%</span>}
            {values[i] == null
              ? <div className="rpt-bars__bar hatch" style={{ height: '100%' }} />
              : <div className="rpt-bars__bar" style={{ height: `${values[i]}%`, background: color, opacity: i === yearIdx ? 1 : 0.45 }} />}
          </div>
          {!compact && <span className="rpt-bars__year">{y}</span>}
        </div>
      ))}
    </div>
  );
}
