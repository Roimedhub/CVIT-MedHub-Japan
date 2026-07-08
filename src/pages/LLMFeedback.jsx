import { useState } from 'react'
import './FormPage.css'
import PrintReport from '../components/PrintReport'
import { supabase } from '../lib/supabase'

const initialState = {
  responderName: '',
  responderRole: '',
  responderEmail: '',
  hospital: '',
  usefulTool: '',
  procedureStage: '',
  howUsed: [],
  ideaForUse: '',
}

export default function LLMFeedback() {
  const [form, setForm] = useState(initialState)
  const [submitted, setSubmitted] = useState(false)
  const [showPrint, setShowPrint] = useState(false)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const toggleHowUsed = (option) => {
    setForm((f) => ({
      ...f,
      howUsed: f.howUsed.includes(option)
        ? f.howUsed.filter((o) => o !== option)
        : [...f.howUsed, option],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('llm_feedback').insert({
      contact_name:    form.responderName,
      contact_role:    form.responderRole,
      contact_email:   form.responderEmail,
      hospital:        form.hospital,
      useful_tool:     form.usefulTool,
      procedure_stage: form.procedureStage,
      how_used:        form.howUsed.join(', '),
      idea_for_use:    form.ideaForUse,
    })
    if (error) {
      console.error('Supabase insert error:', error)
      alert('Failed to save. Please try again.')
      return
    }
    setSubmitted(true)
  }

  const handleReset = () => {
    setForm(initialState)
    setSubmitted(false)
  }

  const HOW_USED_OPTIONS = [
    'Assistance in decision making',
    'Plan after procedure',
    'Help in creating report for procedure',
  ]

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
      title: '💬 Feedback',
      fields: [
        { label: 'Would you see AutocathLLM as a useful tool for you?', type: 'select', full: true, value: form.usefulTool, options: ['Definitely yes','Probably yes','Not sure','Probably not','Definitely not'] },
        { label: 'At what stage would you use this tool?', type: 'select', full: true, value: form.procedureStage, options: ['Before the procedure to plan','After the procedure','Both'] },
        { label: 'How would you use this tool?', type: 'select', full: true, value: form.howUsed.join(', '), options: HOW_USED_OPTIONS },
        { label: 'Do you have an idea for using this technology?', type: 'textarea', value: form.ideaForUse },
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
              <input type="email" placeholder="doctor@hospital.jp" value={form.responderEmail} onChange={set('responderEmail')} />
            </div>
            <div className="field">
              <label>Hospital / Institution</label>
              <input placeholder="Hospital name" value={form.hospital} onChange={set('hospital')} />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h3 className="section-title">💬 Feedback</h3>
          <div className="field-grid">
            <div className="field full">
              <label>Would you see AutocathLLM as a useful tool for you?</label>
              <select value={form.usefulTool} onChange={set('usefulTool')}>
                <option value="">Select...</option>
                <option>Definitely yes</option>
                <option>Probably yes</option>
                <option>Not sure</option>
                <option>Probably not</option>
                <option>Definitely not</option>
              </select>
            </div>
            <div className="field full">
              <label>At what stage would you use this tool?</label>
              <select value={form.procedureStage} onChange={set('procedureStage')}>
                <option value="">Select...</option>
                <option>Before the procedure to plan</option>
                <option>After the procedure</option>
                <option>Both</option>
              </select>
            </div>
            <div className="field full">
              <label>How would you use this tool? <span style={{fontWeight:400,fontSize:'0.85em'}}>(select all that apply)</span></label>
              <div className="checkbox-group">
                {HOW_USED_OPTIONS.map((opt) => (
                  <label key={opt} className="checkbox-option">
                    <input
                      type="checkbox"
                      checked={form.howUsed.includes(opt)}
                      onChange={() => toggleHowUsed(opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
            <div className="field full">
              <label>Do you have an idea for using this technology?</label>
              <textarea rows={3} placeholder="Share your idea..." value={form.ideaForUse} onChange={set('ideaForUse')} />
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
