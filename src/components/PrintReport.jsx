import './PrintReport.css'

export default function PrintReport({ title, sections, onClose }) {
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="pr-overlay">
      {/* Toolbar — hidden when printing */}
      <div className="pr-toolbar no-print">
        <span className="pr-toolbar-label">{title}</span>
        <div className="pr-toolbar-actions">
          <button className="pr-btn-print" onClick={() => window.print()}>
            🖨️ Print / Save as PDF
          </button>
          <button className="pr-btn-close" onClick={onClose}>✕ Close</button>
        </div>
      </div>

      {/* Printable document */}
      <div className="pr-doc">
        <div className="pr-doc-header">
          <div className="pr-doc-logo">MH</div>
          <div className="pr-doc-title-block">
            <div className="pr-doc-title">{title}</div>
            <div className="pr-doc-meta">MedHub Japan · CVIT 2026</div>
          </div>
          <div className="pr-doc-date">{today}</div>
        </div>

        {sections.map((sec, i) => (
          <div key={i} className="pr-section">
            <div className="pr-section-title">{sec.title}</div>
            <div className="pr-fields-grid">
              {sec.fields.map((field, j) => (
                <PrintField key={j} field={field} />
              ))}
            </div>
          </div>
        ))}

        <div className="pr-doc-footer">
          MedHub Japan · CVIT 2026 Conference Portal · {today}
        </div>
      </div>
    </div>
  )
}

function PrintField({ field }) {
  if (field.type === 'select') {
    return (
      <div className={`pr-field${field.full ? ' pr-field-full' : ''}`}>
        <div className="pr-label">{field.label}</div>
        <div className="pr-checkboxes">
          {(field.options || []).map((opt, i) => {
            const checked = field.value === opt
            return (
              <div key={i} className={`pr-cb-row${checked ? ' pr-cb-checked' : ''}`}>
                <span className="pr-cb-box">{checked ? '✓' : ''}</span>
                <span className="pr-cb-text">{opt}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (field.type === 'stars') {
    const val = Number(field.value) || 0
    return (
      <div className={`pr-field${field.full ? ' pr-field-full' : ''}`}>
        <div className="pr-label">{field.label}</div>
        <div className="pr-stars">
          {[1,2,3,4,5].map((s) => (
            <span key={s} className={`pr-star${val >= s ? ' pr-star-on' : ''}`}>★</span>
          ))}
          {val > 0 && <span className="pr-stars-val">{val} / 5</span>}
        </div>
      </div>
    )
  }

  if (field.type === 'textarea') {
    return (
      <div className="pr-field pr-field-full">
        <div className="pr-label">{field.label}</div>
        <div className="pr-textarea-val">{field.value || <span className="pr-empty">—</span>}</div>
      </div>
    )
  }

  // text / number / email / tel
  return (
    <div className={`pr-field${field.full ? ' pr-field-full' : ''}`}>
      <div className="pr-label">{field.label}</div>
      <div className="pr-text-val">{field.value || <span className="pr-empty">—</span>}</div>
    </div>
  )
}
