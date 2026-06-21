import { useState } from 'react'
import './FormPage.css'

const initialState = {
  responderName: '',
  responderRole: '',
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
          <button type="submit" className="btn btn-primary btn-llm">Submit LLM Feedback →</button>
        </div>
      </form>
    </div>
  )
}
