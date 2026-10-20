import Icon from './Icon.jsx';

/**
 * Frame for the embedded Power BI report.
 *
 * With `embedUrl` (a "Publish to web" link, set per stage in stages.js) it shows the real
 * report in an <iframe>. Otherwise it renders `children`, the sample pages from SampleReport.
 * For Power BI Embedded, swap the iframe for `PowerBIEmbed` from `powerbi-client-react` and map:
 *   - reportId / embedUrl / accessToken  -> embedConfig
 *   - pages[activePage].name             -> report.setPage(pageName)
 *   - filters                             -> report.setFilters([...]) (basic filters on
 *                                            Level, District, School, Year, Student group)
 * The page buttons in the bottom bar mirror Power BI's page navigation; hide them
 * if the report's own navigation pane is shown instead.
 */
export default function PowerBIEmbed({ title, pages, activePage, onPageChange, embedUrl, children }) {
  return (
    <div className="pbi">
      {embedUrl ? (
        <iframe className="pbi__frame" title={`Power BI report: ${title}`} src={embedUrl} allowFullScreen />
      ) : (
        <div className="pbi__canvas" aria-label={`Sample report: ${title}, page ${pages[activePage]?.label}`} role="region">
          {children}
        </div>
      )}
      {/* A "Publish to web" report has its own page navigation, so the bar is for the sample only. */}
      {!embedUrl && <div className="pbi__bar">
        <span className="strong">Microsoft Power BI</span>
        <div className="pbi__pages" role="tablist" aria-label="Report pages">
          {pages.map((p, i) => (
            <button
              key={p.label}
              type="button"
              role="tab"
              className="pbi__page"
              aria-selected={i === activePage}
              onClick={() => onPageChange(i)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <button type="button" className="pbi__fullscreen" title="Full screen (available in the live embed)">
          <Icon name="expand" size={12} strokeWidth={2} />
          Full screen
        </button>
      </div>}
    </div>
  );
}
