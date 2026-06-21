import { useState, useEffect } from 'react'
import './FormPage.css'
import PrintReport from '../components/PrintReport'

const initialState = {
  hospitalName: '',
  city: '',
  prefecture: '',
  contactName: '',
  contactTitle: '',
  contactEmail: '',
  contactPhone: '',
  bedCount: '',
  cathLabCount: '',
  annualPCIVolume: '',
  currentFFRUsage: '',
  currentLLMUsage: '',
  interestLevel: '',
  notes: '',
}

export default function HospitalForm() {
  const [form, setForm] = useState(initialState)
  const [toast, setToast] = useState(false)
  const [showPrint, setShowPrint] = useState(false)

  const printSections = [
    {
      title: '🏥 Hospital Information',
      fields: [
        { label: 'Hospital Name',          type: 'text',   value: form.hospitalName },
        { label: 'City',                   type: 'text',   value: form.city },
        { label: 'Prefecture',             type: 'text',   value: form.prefecture },
        { label: 'Total Cath Labs',        type: 'text',   value: form.cathLabCount },
        { label: 'Annual PCI Volume',      type: 'text',   value: form.annualPCIVolume },
      ],
    },
    {
      title: '👤 Contact Person',
      fields: [
        { label: 'Full Name', type: 'text', value: form.contactName },
        { label: 'Role', type: 'select', value: form.contactTitle, options: ['Interventional Cardiologist','Cardiologist','Cath Lab Nurse','Technician','Other'] },
        { label: 'Email', type: 'text', value: form.contactEmail },
        { label: 'Phone', type: 'text', value: form.contactPhone },
      ],
    },
    {
      title: '💡 Technology Interest',
      fields: [
        { label: 'Current FFR Usage', type: 'select', value: form.currentFFRUsage, options: ['None','Rarely (<10%)','Sometimes (10–30%)','Frequently (>30%)','Routinely (>50%)'] },
        { label: 'FCA currently in use', type: 'select', value: form.currentLLMUsage, options: ['FFRAngio','QFR','Other'] },
        { label: 'Interest Level in AutocathFFR / AutocathLLM', type: 'select', full: true, value: form.interestLevel, options: ['Low','Medium','High','Ready to pilot'] },
      ],
    },
    {
      title: '📝 Notes',
      fields: [
        { label: 'Additional Notes / Next Steps', type: 'textarea', value: form.notes },
      ],
    },
  ]

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Hospital form submission:', form)
    setForm(initialState)
    setToast(true)
  }

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(false), 3000)
    return () => clearTimeout(t)
  }, [toast])

  if (showPrint) return <PrintReport title="Potential Hospital" sections={printSections} onClose={() => setShowPrint(false)} />

  return (
    <div className="page">
      {toast && (
        <div className="toast toast-success">
          ✅ Hospital entry saved successfully
        </div>
      )}
      <div className="page-header">
        <h1 className="page-title">Potential Hospital</h1>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <section className="form-section">
          <h3 className="section-title">🏥 Hospital Information</h3>
          <div className="field-grid">
            <div className="field full">
              <label>Hospital Name *</label>
              <input required placeholder="e.g. Tokyo University Hospital" value={form.hospitalName} onChange={set('hospitalName')} />
            </div>
            <div className="field">
              <label>City</label>
              <input placeholder="e.g. Tokyo" value={form.city} onChange={set('city')} />
            </div>
            <div className="field">
              <label>Prefecture</label>
              <input placeholder="e.g. Tokyo-to" value={form.prefecture} onChange={set('prefecture')} />
            </div>
            <div className="field">
              <label>Total Cath Labs</label>
              <input type="number" placeholder="e.g. 3" value={form.cathLabCount} onChange={set('cathLabCount')} />
            </div>
            <div className="field">
              <label>Annual PCI Volume (approx.)</label>
              <input type="number" placeholder="e.g. 500" value={form.annualPCIVolume} onChange={set('annualPCIVolume')} />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h3 className="section-title">👤 Contact Person</h3>
          <div className="field-grid">
            <div className="field">
              <label>Full Name</label>
              <input placeholder="Dr. Yamamoto Kenji" value={form.contactName} onChange={set('contactName')} />
            </div>
            <div className="field">
              <label>Role</label>
              <select value={form.contactTitle} onChange={set('contactTitle')}>
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
              <input type="email" placeholder="doctor@hospital.jp" value={form.contactEmail} onChange={set('contactEmail')} />
            </div>
            <div className="field">
              <label>Phone</label>
              <input placeholder="+81-" value={form.contactPhone} onChange={set('contactPhone')} />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h3 className="section-title">💡 Technology Interest</h3>
          <div className="field-grid">
            <div className="field">
              <label>Current FFR Usage</label>
              <select value={form.currentFFRUsage} onChange={set('currentFFRUsage')}>
                <option value="">Select...</option>
                <option>None</option>
                <option>Rarely (&lt;10%)</option>
                <option>Sometimes (10–30%)</option>
                <option>Frequently (&gt;30%)</option>
                <option>Routinely (&gt;50%)</option>
              </select>
            </div>
            <div className="field">
              <label>FCA currently in use</label>
              <select value={form.currentLLMUsage} onChange={set('currentLLMUsage')}>
                <option value="">Select...</option>
                <option>FFRAngio</option>
                <option>QFR</option>
                <option>Other</option>
              </select>
            </div>
            <div className="field full">
              <label>Interest Level in AutocathFFR / AutocathLLM</label>
              <select value={form.interestLevel} onChange={set('interestLevel')}>
                <option value="">Select...</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Ready to pilot</option>
              </select>
            </div>
          </div>
        </section>

        <section className="form-section">
          <h3 className="section-title">📝 Notes</h3>
          <div className="field">
            <label>Additional Notes / Next Steps</label>
            <textarea
              rows={4}
              placeholder="Any relevant context, follow-up actions, specific requirements..."
              value={form.notes}
              onChange={set('notes')}
            />
          </div>
        </section>

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => setForm(initialState)}>Clear Form</button>
          <button type="button" className="btn btn-ghost" onClick={() => setShowPrint(true)}>📄 PDF Report</button>
          <button type="submit" className="btn btn-primary">Save</button>
        </div>
      </form>
    </div>
  )
}
