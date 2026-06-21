import { useState } from 'react'
import './FormPage.css'
import PrintReport from '../components/PrintReport'

const initialState = {
  responderName: '',
  responderRole: '',
  hospital: '',
  caseType: '',
  vesselTreated: '',
  ffrValue: '',
  clinicalDecision: '',
  timeToResult: '',
  accuracyRating: '',
  easeOfUseRating: '',
  workflowImpact: '',
  wouldRecommend: '',
  positives: '',
  improvements: '',
  technicalIssues: '',
  overallRating: '',
}

const stars = [1, 2, 3, 4, 5]

function StarRating({ value, onChange }) {
  return (
    <div className="star-row">
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          className={`star-btn${Number(value) >= s ? ' active' : ''}`}
          onClick={() => onChange(String(s))}
        >
          ★
        </button>
      ))}
      {value && <span className="star-label">{value} / 5</span>}
    </div>
  )
}

export default function FFRFeedback() {
  const [form, setForm] = useState(initialState)
  const [submitted, setSubmitted] = useState(false)
  const [showPrint, setShowPrint] = useState(false)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  const setVal = (field) => (val) => setForm((f) => ({ ...f, [field]: val }))

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('FFR Feedback submission:', form)
    setSubmitted(true)
  }

  const handleReset = () => {
    setForm(initialState)
    setSubmitted(false)
  }

  const printSections = [
    {
      title: '👤 Contact Person',
      fields: [
        { label: 'Name',     type: 'text',  value: form.responderName },
        { label: 'Role',     type: 'select', value: form.responderRole, options: ['Interventional Cardiologist','Cardiologist','Cath Lab Nurse','Technician','Other'] },
        { label: 'Email',    type: 'text',  value: form.responderEmail },
        { label: 'Hospital / Institution', type: 'text', value: form.hospital },
      ],
    },
    {
      title: '⭐ Performance Ratings',
      fields: [
        { label: 'Overall Rating', type: 'stars', value: form.overallRating, full: true },
      ],
    },
    {
      title: '💬 Qualitative Feedback',
      fields: [
        { label: 'What worked well?',          type: 'textarea', value: form.positives },
        { label: 'Areas for improvement',      type: 'textarea', value: form.improvements },
        { label: 'Technical Issues Encountered', type: 'textarea', value: form.technicalIssues },
      ],
    },
  ]

  if (showPrint) return <PrintReport title="AutocathFFR Feedback" sections={printSections} onClose={() => setShowPrint(false)} />

  if (submitted) {
    return (
      <div className="page">
        <div className="success-card">
          <div className="success-icon">✅</div>
          <h2>Feedback Submitted</h2>
          <p>Thank you! AutocathFFR feedback has been recorded.</p>
          {form.overallRating && (
            <div className="success-summary">Overall rating: {'★'.repeat(Number(form.overallRating))}{'☆'.repeat(5 - Number(form.overallRating))}</div>
          )}
          <button className="btn btn-primary" onClick={handleReset}>Submit Another</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
<h1 className="page-title">AutocathFFR Feedback</h1>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <section className="form-section">
          <h3 className="section-title">👤 Contact Person</h3>
          <div className="field-grid">
            <div className="field">
              <label>Name</label>
              <input placeholder="Dr. / Team member name" value={form.responderName} onChange={set('responderName')} />
            </div>
            <div className="field">
              <label>Role</label>
              <select value={form.responderRole} onChange={set('responderRole')}>
                <option value="">Select...</option>
                <option>Interventional Cardiologist</option>
                <option>Cardiologist</option>
                <option>Cath Lab Nurse</option>
                <option>Technician</option>
                <option>Other</option>
              </select>
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" placeholder="doctor@hospital.jp" value={form.responderEmail || ''} onChange={set('responderEmail')} />
            </div>
            <div className="field">
              <label>Hospital / Institution</label>
              <input placeholder="Hospital name" value={form.hospital} onChange={set('hospital')} />
            </div>
          </div>
        </section>


        <section className="form-section">
          <h3 className="section-title">⭐ Performance Ratings</h3>
          <div className="rating-list">
            <div className="rating-row">
              <span className="rating-label">Overall Rating</span>
              <StarRating value={form.overallRating} onChange={setVal('overallRating')} />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h3 className="section-title">💬 Qualitative Feedback</h3>
          <div className="field-grid">
            <div className="field full">
              <label>What worked well?</label>
              <textarea rows={3} placeholder="Positive aspects of AutocathFFR..." value={form.positives} onChange={set('positives')} />
            </div>
            <div className="field full">
              <label>Areas for improvement</label>
              <textarea rows={3} placeholder="Suggestions or pain points..." value={form.improvements} onChange={set('improvements')} />
            </div>
            <div className="field full">
              <label>Technical Issues Encountered</label>
              <textarea rows={2} placeholder="Any bugs, errors, or technical problems..." value={form.technicalIssues} onChange={set('technicalIssues')} />
            </div>
          </div>
        </section>

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={handleReset}>Clear Form</button>
          <button type="button" className="btn btn-ghost" onClick={() => setShowPrint(true)}>📄 PDF Report</button>
          <button type="submit" className="btn btn-primary btn-ffr">Submit FFR Feedback →</button>
        </div>
      </form>
    </div>
  )
}
