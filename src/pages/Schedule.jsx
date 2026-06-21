import { useState, useEffect, useRef, useCallback } from 'react'
import './Schedule.css'

// ── Config ───────────────────────────────────────────────────────────────────
const DAYS = [
  { id: 'prep',  label: 'Preparation', date: '15/7' },
  { id: 'day1',  label: 'Day 1',       date: '16/7' },
  { id: 'day2',  label: 'Day 2',       date: '17/7' },
  { id: 'day3',  label: 'Day 3',       date: '18/7' },
]

const TEAM = [
  { id: 'junichi', name: 'Junichi', color: '#003087' },
  { id: 'mamo',    name: 'Mamo',    color: '#c8102e' },
  { id: 'mitsu',   name: 'Mitsu',   color: '#0a8754' },
  { id: 'hajime',  name: 'Hajime',  color: '#7c3aed' },
  { id: 'or',      name: 'Or',      color: '#b45309' },
  { id: 'roi',     name: 'Roi',     color: '#0e7490' },
]

const QUICK_TASKS = ['Booth', 'Meeting', 'Demo', 'Lunch', 'Break', 'Session', 'Follow-up']

const SLOT_H = 36

function makeSlots() {
  const slots = []
  // Start at 8:30, end at 18:00
  slots.push('08:30')
  for (let h = 9; h < 18; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`)
    slots.push(`${String(h).padStart(2, '0')}:30`)
  }
  return slots
}
const SLOTS = makeSlots()

const MEMBER_MAP = Object.fromEntries(TEAM.map((m) => [m.id, m]))
const LS_KEY = 'cvit-schedule-v3'

function uid() { return Math.random().toString(36).slice(2, 10) }

function load() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || [] }
  catch { return [] }
}

function durationLabel(spanCount) {
  if (spanCount === 1) return '30 min'
  return spanCount % 2 === 0 ? `${spanCount / 2}h` : `${Math.floor(spanCount / 2)}h 30m`
}

function endTimeLabel(slotIdx) {
  const [h, m] = SLOTS[slotIdx].split(':').map(Number)
  const total = h * 60 + m + 30
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

// ── Schedule ─────────────────────────────────────────────────────────────────
export default function Schedule() {
  const [assignments, setAssignments] = useState(load)
  const [drag, setDrag]             = useState(null)
  const [modal, setModal]           = useState(null)
  const [editMembers, setEditMembers] = useState([])   // array of member ids
  const [editTask, setEditTask]     = useState('Booth')

  const dragRef = useRef(null)
  useEffect(() => { dragRef.current = drag }, [drag])

  useEffect(() => { localStorage.setItem(LS_KEY, JSON.stringify(assignments)) }, [assignments])

  // ── drag ──
  const onCellDown = useCallback((dayId, idx, e) => {
    e.preventDefault()
    setDrag({ dayId, startIdx: idx, currentIdx: idx })
  }, [])

  const onCellEnter = useCallback((dayId, idx) => {
    setDrag((d) => d && d.dayId === dayId ? { ...d, currentIdx: idx } : d)
  }, [])

  const onMouseUp = useCallback((dayId, e) => {
    const d = dragRef.current
    setDrag(null)
    if (!d || d.dayId !== dayId) return
    const lo = Math.min(d.startIdx, d.currentIdx)
    const hi = Math.max(d.startIdx, d.currentIdx)
    const rect = e.currentTarget.getBoundingClientRect()
    setEditMembers([])
    setEditTask('Booth')
    setModal({ dayId, startIdx: lo, endIdx: hi, anchorY: rect.top + lo * SLOT_H + window.scrollY })
  }, [])

  useEffect(() => {
    const up = () => setDrag(null)
    window.addEventListener('mouseup', up)
    return () => window.removeEventListener('mouseup', up)
  }, [])

  // ── edit existing block ──
  const openEdit = (a, anchorY) => {
    setEditMembers(a.memberIds || (a.memberId ? [a.memberId] : []))
    setEditTask(a.task)
    setModal({ dayId: a.dayId, startIdx: a.startIdx, endIdx: a.endIdx, editId: a.id, anchorY })
  }

  // ── save / delete ──
  const saveAssignment = () => {
    if (!editMembers.length || !modal) return
    const entry = {
      id: modal.editId || uid(),
      dayId: modal.dayId,
      startIdx: modal.startIdx,
      endIdx: modal.endIdx,
      memberIds: editMembers,
      task: editTask || 'Booth',
    }
    setAssignments((prev) =>
      modal.editId ? prev.map((a) => a.id === modal.editId ? entry : a) : [...prev, entry]
    )
    setModal(null)
  }

  const deleteAssignment = () => {
    setAssignments((prev) => prev.filter((a) => a.id !== modal.editId))
    setModal(null)
  }

  const toggleMember = (id) => {
    setEditMembers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const dragLo = drag ? Math.min(drag.startIdx, drag.currentIdx) : -1
  const dragHi = drag ? Math.max(drag.startIdx, drag.currentIdx) : -1

  return (
    <div className="sched-page" onMouseLeave={() => setDrag(null)}>
      <div className="page-header">
        <h1 className="page-title">Conference Schedule</h1>
        <p className="page-desc">CVIT 2026 · MedHub Japan Team</p>
      </div>

      <div className="team-legend">
        {TEAM.map((m) => (
          <div key={m.id} className="team-chip" style={{ background: m.color + '18', borderColor: m.color + '55' }}>
            <span className="team-dot" style={{ background: m.color }} />
            {m.name}
          </div>
        ))}
      </div>

      {/* Single unified grid — header row + body rows share the same column tracks */}
      <div className="sched-wrapper">
        <div className="sched-grid-main" style={{ gridTemplateColumns: `var(--time-col-w) repeat(${DAYS.length}, 1fr)` }}>

          {/* ── Header row ── */}
          <div className="sched-corner" />
          {DAYS.map((d) => (
            <div key={d.id} className="sched-day-header">
              <span className="sched-day-label">{d.label}</span>
              <span className="sched-day-date">{d.date}</span>
            </div>
          ))}

          {/* ── Time column (spans all body rows via CSS) ── */}
          <div className="time-col">
            {SLOTS.map((slot, idx) => {
              const [h, m] = slot.split(':').map(Number)
              const endTotal = h * 60 + m + 30
              const endStr = `${String(Math.floor(endTotal / 60)).padStart(2, '0')}:${String(endTotal % 60).padStart(2, '0')}`
              return (
                <div key={slot} className={`time-cell${idx % 2 === 1 ? ' half' : ''}`}>
                  <span>{slot}–{endStr}</span>
                </div>
              )
            })}
          </div>

          {/* ── Day columns ── */}
          {DAYS.map((day) => {
            const dayAssignments = assignments.filter((a) => a.dayId === day.id)
            const coveredSet = new Set(
              dayAssignments.flatMap((a) =>
                Array.from({ length: a.endIdx - a.startIdx + 1 }, (_, i) => a.startIdx + i)
              )
            )
            return (
              <div
                key={day.id}
                className={`day-col${drag?.dayId === day.id ? ' dragging' : ''}`}
                onMouseUp={(e) => onMouseUp(day.id, e)}
              >
                {SLOTS.map((slot, idx) => {
                  const inDrag = drag?.dayId === day.id && idx >= dragLo && idx <= dragHi
                  const covered = coveredSet.has(idx)
                  return (
                    <div
                      key={slot}
                      className={`slot-cell${idx % 2 === 1 ? ' half' : ''}${inDrag ? ' in-drag' : ''}${covered ? ' covered' : ''}`}
                      onMouseDown={(e) => !covered && onCellDown(day.id, idx, e)}
                      onMouseEnter={() => onCellEnter(day.id, idx)}
                    >
                      {!covered && !inDrag && <span className="cell-plus">+</span>}
                    </div>
                  )
                })}

                {dayAssignments.map((a) => {
                  const memberIds = a.memberIds || (a.memberId ? [a.memberId] : [])
                  const members   = memberIds.map((id) => MEMBER_MAP[id]).filter(Boolean)
                  const spanCount = a.endIdx - a.startIdx + 1
                  const primary   = members[0]
                  return (
                    <div
                      key={a.id}
                      className="assignment-block"
                      style={{
                        top: a.startIdx * SLOT_H,
                        height: spanCount * SLOT_H - 2,
                        background: primary ? primary.color + '18' : '#f0f4f9',
                        borderLeft: `4px solid ${primary ? primary.color : '#8a9ab5'}`,
                        borderTop: `1px solid ${primary ? primary.color + '40' : '#dde3ed'}`,
                        borderBottom: `1px solid ${primary ? primary.color + '40' : '#dde3ed'}`,
                        borderRight: `1px solid ${primary ? primary.color + '20' : '#dde3ed'}`,
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        const rect = e.currentTarget.closest('.day-col').getBoundingClientRect()
                        openEdit(a, rect.top + a.startIdx * SLOT_H + window.scrollY)
                      }}
                    >
                      <div className="block-inner">
                        <div className="block-members">
                          {members.map((m) => (
                            <span key={m.id} className="block-member-chip" style={{ color: m.color, background: m.color + '18', borderColor: m.color + '44' }}>
                              {m.name}
                            </span>
                          ))}
                        </div>
                        <div className="block-task">{a.task}</div>
                        {spanCount >= 3 && <div className="block-duration">{durationLabel(spanCount)}</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}

        </div>
      </div>

      {modal && (
        <AssignModal
          modal={modal}
          editMembers={editMembers}
          toggleMember={toggleMember}
          editTask={editTask}
          setEditTask={setEditTask}
          onSave={saveAssignment}
          onDelete={modal.editId ? deleteAssignment : null}
          onClose={() => setModal(null)}
          team={TEAM}
          quickTasks={QUICK_TASKS}
        />
      )}
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function AssignModal({ modal, editMembers, toggleMember, editTask, setEditTask, onSave, onDelete, onClose, team, quickTasks }) {
  const ref = useRef(null)
  const dayLabel  = DAYS.find((d) => d.id === modal.dayId)?.label
  const startLabel = SLOTS[modal.startIdx]
  const endLabel   = endTimeLabel(modal.endIdx)
  const spanCount  = modal.endIdx - modal.startIdx + 1

  useEffect(() => {
    if (!ref.current) return
    const el  = ref.current
    const mh  = el.offsetHeight || 420
    const mw  = 320
    let top  = modal.anchorY + 8 - window.scrollY
    let left = window.innerWidth / 2 - mw / 2
    if (top + mh > window.innerHeight - 16) top = Math.max(8, window.innerHeight - mh - 16)
    if (top < 8) top = 8
    el.style.top  = `${top}px`
    el.style.left = `${left}px`
  })

  useEffect(() => {
    const down = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    const key  = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', down)
    document.addEventListener('keydown', key)
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key) }
  }, [onClose])

  const primaryColor = editMembers.length ? MEMBER_MAP[editMembers[0]]?.color : null

  return (
    <div className="modal-layer">
      <div className="assign-modal" ref={ref}>
        <div className="modal-header">
          <div>
            <div className="modal-slot">{dayLabel} · {startLabel} – {endLabel}</div>
            <div className="modal-duration">{durationLabel(spanCount)}</div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-section">
          <div className="modal-label">Team Members <span className="modal-hint">— select one or more</span></div>
          <div className="member-grid">
            {team.map((m) => {
              const active = editMembers.includes(m.id)
              return (
                <button
                  key={m.id}
                  type="button"
                  className={`member-btn${active ? ' selected' : ''}`}
                  style={active
                    ? { background: m.color, borderColor: m.color, color: '#fff' }
                    : { borderColor: m.color + '66', color: m.color }}
                  onClick={() => toggleMember(m.id)}
                >
                  {active && <span className="member-check">✓ </span>}
                  {m.name}
                </button>
              )
            })}
          </div>
          {editMembers.length > 0 && (
            <div className="selected-members-preview">
              {editMembers.map((id) => {
                const m = MEMBER_MAP[id]
                return <span key={id} className="preview-chip" style={{ background: m.color + '18', borderColor: m.color + '55', color: m.color }}>{m.name}</span>
              })}
            </div>
          )}
        </div>

        <div className="modal-section">
          <div className="modal-label">Task</div>
          <div className="quick-tasks">
            {quickTasks.map((t) => (
              <button
                key={t}
                type="button"
                className={`quick-btn${editTask === t ? ' selected' : ''}`}
                onClick={() => setEditTask(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <input
            className="task-input"
            placeholder="Or type a custom task…"
            value={editTask}
            onChange={(e) => setEditTask(e.target.value)}
          />
        </div>

        <div className="modal-actions">
          {onDelete && <button className="modal-btn delete" onClick={onDelete}>Remove</button>}
          <button
            className="modal-btn save"
            onClick={onSave}
            disabled={!editMembers.length}
            style={primaryColor ? { background: primaryColor } : {}}
          >
            {modal.editId ? 'Update' : 'Assign'} →
          </button>
        </div>
      </div>
    </div>
  )
}
