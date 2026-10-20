import Icon from './Icon.jsx';

/**
 * Placeholder for an embedded Power BI report.
 *
 * In production, replace the `.pbi__canvas` block with the real embed, e.g. the
 * `PowerBIEmbed` component from `powerbi-client-react` (Power BI Embedded) or an
 * <iframe> from "Publish to web". Map the props below to the embed config:
 *   - reportId / embedUrl / accessToken  -> embedConfig
 *   - pages[activePage].name             -> report.setPage(pageName)
 *   - filters                             -> report.setFilters([...]) (basic filters on
 *                                            Level, District, School, Year, Student group)
 * The page buttons in the bottom bar mirror Power BI's page navigation; hide them
 * if the report's own navigation pane is shown instead.
 */
export default function PowerBIEmbed({ title, pages, activePage, onPageChange }) {
  const page = pages[activePage] ?? pages[0];

  return (
    <div className="pbi">
      <div className="pbi__canvas" role="img" aria-label={`Embedded Power BI report: ${title}, page ${page.label}`}>
        <div className="pbi__skeleton" aria-hidden="true">
          <div className="pbi__skeleton-title" />
          <div className="pbi__skeleton-cards"><div /><div /><div /><div /></div>
          <div className="pbi__skeleton-body">
            <div className="pbi__skeleton-panel pbi__skeleton-bars">
              <div style={{ height: '60%' }} /><div style={{ height: '48%' }} /><div style={{ height: '55%' }} />
              <div style={{ height: '66%' }} /><div style={{ height: '74%', background: '#e2e2e2' }} />
            </div>
            <div className="pbi__skeleton-panel pbi__skeleton-rows"><div /><div /><div /><div /><div /></div>
          </div>
        </div>
        <div className="pbi__label">
          <Icon name="chart" size={32} color="var(--readiness)" />
          <span style={{ fontWeight: 600 }}>Power BI embedded report</span>
          <span className="body-sm">Page: {page.label}</span>
          <span className="caption">{page.description}</span>
        </div>
      </div>
      <div className="pbi__bar">
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
      </div>
    </div>
  );
}
