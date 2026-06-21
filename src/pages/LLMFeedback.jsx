import { useState } from 'react'
import './FormPage.css'
import PrintReport from '../components/PrintReport'

const initialState = {
  responderName: '',
  responderRole: '',
  responderEmail: '',
  hospital: '',
  useCase: '',
  queryType: '',
  responseQuality: '',
  clinicalRelevance: '',
  hallucinations: '',
  hallucinationDetails: '',
  speedRating: '',
  easeOfUseRating: '',
  overallRating: '',
  helpfulExample: '',
  unhelpfulExample: '',
  safetyConerns: '',
  integrateInWorkflow: '',
  notes: '',
}

const stars = [1, 2, 3, 4, 5]

function StarRating({ value, onChange }) {
  return (
    <div className="star-row">
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          className={`star-btn${Number(value) >= s ? ' active llm' : ''}`}
          onClick={() => onChange(String(s))}
        >
          ★
        </button>
      ))}
      {value && <span className="star-label">{value} / 5</span>}
    </div>
  )
}

export default function LLMFeedback() {
  const [form, setForm] = useState(initialState)
  const [submitted, setSubmitted] = useState(false)
  const [showPrint, setShowPrint] = useState(false)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  const setVal = (field) => (val) => setForm((f) => ({ ...f, [field]: val }))

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('LLM Feedback submission:', form)
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
        { label: 'Name',     type: 'text',   value: form.responderName },
        { label: 'Role',     type: 'select', value: form.responderRole, options: ['Interventional Cardiologist','Cardiologist','Cath Lab Nurse','Technician','Other'] },
        { label: 'Email',    type: 'text',   value: form.responderEmail },
        { label: 'Hospital / Institution', type: 'text', value: form.hospital },
      ],
    },
    {
      title: '🤖 Usage Context',
      fields: [
        { label: 'Primary Use Case',               type: 'select', value: form.useCase,            options: ['Report generation','Clinical decision support','Patient communication','Literature lookup','Protocol guidance','Training / Education','Other'] },
        { label: 'Type of Queries Used',           type: 'select', value: form.queryType,          options: ['Diagnostic questions','Treatment recommendations','Drug / device information','Procedural guidance','Documentation / notes','Mixed'] },
        { label: 'Would integrate into daily workflow?', type: 'select', full: true, value: form.integrateInWorkflow, options: ['Definitely yes','Probably yes','Not sure','Probably not','Definitely not'] },
      ],
    },
    {
      title: '⭐ Performance Ratings',
      fields: [
        { label: 'Response Quality',   type: 'stars', value: form.responseQuality },
        { label: 'Clinical Relevance', type: 'stars', value: form.clinicalRelevance },
        { label: 'Speed / Latency',    type: 'stars', value: form.speedRating },
        { label: 'Ease of Use',        type: 'stars', value: form.easeOfUseRating },
        { label: 'Overall Rating',     type: 'stars', value: form.overallRating },
      ],
    },
    {
      title: '🔬 AI Quality Assessment',
      fields: [
        { label: 'Hallucinations / Incorrect Information', type: 'select', full: true, value: form.hallucinations, options: ['No issues observed','Minor inaccuracies','Noticeable errors','Significant hallucinations'] },
        { label: 'Hallucination Details', type: 'textarea', value: form.hallucinationDetails },
        { label: 'Safety / Ethical Concerns', type: 'textarea', value: form.safetyConerns },
      ],
    },
    {
      title: '💬 Examples & Suggestions',
      fields: [
        { label: 'Most helpful response / use case',   type: 'textarea', value: form.helpfulExample },
        { label: 'Least helpful response / use case',  type: 'textarea', value: form.unhelpfulExample },
        { label: 'Additional Notes / Feature Requests', type: 'textarea', value: form.notes },
      ],
    },
  ]

  if (showPrint) return <PrintReport title="AutocathLLM Feedback" sections={printSections} onClose={() => setShowPrint(false)} />

  if (submitted) {
    return (
      <div className="page">
        <div className="success-card">
          <div className="success-icon">✅</div>
          <h2>Feedback Submitted</h2>
          <p>Thank you! AutocathLLM feedback has been recorded.</p>
          {form.overallRating && (
            <div className="success-summary">Overall rating: {'★'.repeat(Number(form.overallRating))}{'☆'.repeat(5 - Number(form.overallRating))}</div>
          )}
          <button className="btn btn-primary btn-llm" onClick={handleReset}>Submit Another</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
<h1 className="page-title">AutocathLLM Feedback</h1>
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
          <h3 className="section-title">🤖 Usage Context</h3>
          <div className="field-grid">
            <div className="field">
              <label>Primary Use Case</label>
              <select value={form.useCase} onChange={set('useCase')}>
                <option value="">Select...</option>
                <option>Report generation</option>
                <option>Clinical decision support</option>
                <option>Patient communication</option>
                <option>Literature lookup</option>
                <option>Protocol guidance</option>
                <option>Training / Education</option>
                <option>Other</option>
              </select>
            </div>
            <div className="field">
              <label>Type of Queries Used</label>
              <select value={form.queryType} onChange={set('queryType')}>
                <option value="">Select...</option>
                <option>Diagnostic questions</option>
                <option>Treatment recommendations</option>
                <option>Drug / device information</option>
                <option>Procedural guidance</option>
                <option>Documentation / notes</option>
                <option>Mixed</option>
              </select>
            </div>
            <div className="field">
              <label>Would integrate into daily workflow?</label>
              <select value={form.integrateInWorkflow} onChange={set('integrateInWorkflow')}>
                <option value="">Select...</option>
                <option>Definitely yes</option>
                <option>Probably yes</option>
                <option>Not sure</option>
                <option>Probably not</option>
                <option>Definitely not</option>
              </select>
            </div>
          </div>
        </section>

        <section className="form-section">
          <h3 className="section-title">⭐ Performance Ratings</h3>
          <div className="rating-list">
            <div className="rating-row">
              <span className="rating-label">Response Quality</span>
              <StarRating value={form.responseQuality} onChange={setVal('responseQuality')} />
            </div>
            <div className="rating-row">
              <span className="rating-label">Clinical Relevance</span>
              <StarRating value={form.clinicalRelevance} onChange={setVal('clinicalRelevance')} />
            </div>
            <div className="rating-row">
              <span className="rating-label">Speed / Latency</span>
              <StarRating value={form.speedRating} onChange={setVal('speedRating')} />
            </div>
            <div className="rating-row">
              <span className="rating-label">Ease of Use</span>
              <StarRating value={form.easeOfUseRating} onChange={setVal('easeOfUseRating')} />
            </div>
            <div className="rating-row">
              <span className="rating-label">Overall Rating</span>
              <StarRating value={form.overallRating} onChange={setVal('overallRating')} />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h3 className="section-title">🔬 AI Quality Assessment</h3>
          <div className="field-grid">
            <div className="field full">
              <label>Did the model hallucinate / produce incorrect information?</label>
              <select value={form.hallucinations} onChange={set('hallucinations')}>
                <option value="">Select...</option>
                <option>No issues observed</option>
                <option>Minor inaccuracies</option>
                <option>Noticeable errors</option>
                <option>Significant hallucinations</option>
              </select>
            </div>
            {form.hallucinations && form.hallucinations !== 'No issues observed' && (
              <div className="field full">
                <label>Describe the hallucination / error</label>
                <textarea rows={3} placeholder="What was incorrect? In what context?" value={form.hallucinationDetails} onChange={set('hallucinationDetails')} />
              </div>
            )}
            <div className="field full">
              <label>Safety / Ethical Concerns</label>
              <textarea rows={2} placeholder="Any responses that felt unsafe, biased, or inappropriate for clinical use..." value={form.safetyConerns} onChange={set('safetyConerns')} />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h3 className="section-title">💬 Examples & Suggestions</h3>
          <div className="field-grid">
            <div className="field full">
              <label>Most helpful response / use case</label>
              <textarea rows={3} placeholder="Share a specific example where AutocathLLM was particularly useful..." value={form.helpfulExample} onChange={set('helpfulExample')} />
            </div>
            <div className="field full">
              <label>Least helpful response / use case</label>
              <textarea rows={3} placeholder="Share a specific example where it fell short or was not useful..." value={form.unhelpfulExample} onChange={set('unhelpfulExample')} />
            </div>
            <div className="field full">
              <label>Additional Notes / Feature Requests</label>
              <textarea rows={3} placeholder="Any other comments, feature ideas, or requests..." value={form.notes} onChange={set('notes')} />
            </div>
          </div>
        </section>

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={handleReset}>Clear Form</button>
          <button type="button" className="btn btn-ghost" onClick={() => setShowPrint(true)}>📄 PDF Report</button>
          <button type="submit" className="btn btn-primary btn-llm">Submit LLM Feedback →</button>
        </div>
      </form>
    </div>
  )
}
