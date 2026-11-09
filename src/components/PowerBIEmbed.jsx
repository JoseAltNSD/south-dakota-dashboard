import { useLayoutEffect, useRef, useState } from 'react';
import Select from './Select.jsx';

/**
 * Frame for the embedded Power BI report, with the report's pages as tabs along its top edge.
 *
 * With `embedUrl` (a "Publish to web" link, set per stage in stages.js) it shows the real
 * report in an <iframe>. Otherwise it renders `children`, the sample pages from SampleReport.
 * A "Publish to web" iframe can't be told which page to show, so with one the tabs only change what
 * Explore shows around the report (the "About this indicator" box), and the report's own page
 * navigation does the rest. For Power BI Embedded, swap the iframe for `PowerBIEmbed` from
 * `powerbi-client-react` and map:
 *   - reportId / embedUrl / accessToken  -> embedConfig
 *   - pages[activePage].name             -> report.setPage(pageName), from `onPageChange`;
 *                                            hide the report's own page navigation
 *   - filters                             -> report.setFilters([...]) (basic filters on
 *                                            Level, District, School or Institution, Year,
 *                                            Student group)
 *
 * When the tabs don't fit on one line, a "Report page" drop-down takes their place. The tab row stays
 * in the layout (hidden) so it can be measured again when the frame or the stage changes.
 * The tabs take their colors from `--stage` and `--stage-tint`, which the caller sets on a parent.
 */
export default function PowerBIEmbed({ title, pages, activePage, onPageChange, embedUrl, children }) {
  const tabsRef = useRef(null);
  const [compact, setCompact] = useState(false);
  const labels = pages.map((p) => p.label).join('|');

  useLayoutEffect(() => {
    const tabs = tabsRef.current;
    const measure = () => setCompact(tabs.scrollWidth > tabs.clientWidth + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(tabs);
    return () => observer.disconnect();
  }, [labels]);

  // Arrow keys, Home and End move between tabs and open the page they land on (ARIA tabs pattern).
  function onKeyDown(e) {
    const last = pages.length - 1;
    const next = { ArrowRight: activePage + 1, ArrowLeft: activePage - 1, Home: 0, End: last }[e.key];
    if (next == null) return;
    e.preventDefault();
    const i = (next + pages.length) % pages.length;
    onPageChange(i);
    tabsRef.current.children[i]?.focus();
  }

  return (
    <div className="pbi">
      <div className={`pbi__nav${compact ? ' pbi__nav--compact' : ''}`}>
        <div ref={tabsRef} className="stage-tabs pbi__tabs" role="tablist" aria-label="Report pages" aria-hidden={compact || undefined} onKeyDown={onKeyDown}>
          {pages.map((p, i) => (
            <button
              key={p.label}
              id={`pbi-tab-${i}`}
              type="button"
              role="tab"
              className="stage-tab pbi__tab"
              aria-selected={i === activePage}
              aria-controls="pbi-panel"
              tabIndex={i === activePage ? 0 : -1}
              onClick={() => onPageChange(i)}
            >
              <span className="stage-tab__title">{p.label}</span>
            </button>
          ))}
        </div>
        {compact && (
          <div className="field pbi__picker">
            <label htmlFor="pbi-page">Report page</label>
            <Select id="pbi-page" value={String(activePage)} options={pages.map((p, i) => ({ value: String(i), label: p.label }))} onChange={(v) => onPageChange(Number(v))} />
          </div>
        )}
      </div>
      {embedUrl ? (
        <iframe className="pbi__frame" title={`Power BI report: ${title}`} src={embedUrl} allowFullScreen />
      ) : (
        <div
          id="pbi-panel"
          className="pbi__canvas"
          role="tabpanel"
          aria-labelledby={compact ? undefined : `pbi-tab-${activePage}`}
          aria-label={compact ? `Sample report: ${title}, page ${pages[activePage]?.label}` : undefined}
        >
          {children}
        </div>
      )}
    </div>
  );
}
