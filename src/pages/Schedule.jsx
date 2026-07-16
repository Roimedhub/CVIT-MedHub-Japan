import { useState, useEffect, useRef, useCallback } from 'react'
import './Schedule.css'
import { supabase } from '../lib/supabase'

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

const QUICK_TASKS = ['Booth', 'Meeting', 'Team Meeting', 'Reception + Hands-on', 'Lunch', 'Break', 'Reception+Game', 'Roll-up']

const SLOT_H = 36

function makeSlots() {
  const slots = []
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

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || [] }
  catch { return [] }
}

function rowToAssignment(r) {
  return {
    id: r.id,
    dayId: r.day_id,
    startIdx: r.start_idx,
    endIdx: r.end_idx,
    startTime: r.start_time || null,
    endTime: r.end_time || null,
    memberIds: r.member_ids || [],
    task: r.task,
    session: r.session || undefined,
    location: r.location || undefined,
  }
}

function assignmentToRow(a) {
  return {
    id: a.id,
    day_id: a.dayId,
    start_idx: a.startIdx,
    end_idx: a.endIdx,
    start_time: a.startTime || null,
    end_time: a.endTime || null,
    member_ids: a.memberIds || [],
    task: a.task,
    session: a.session || null,
    location: a.location || null,
  }
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

const START_MINS = 8 * 60 + 30

function timeStrToMins(t) {
  if (!t) return START_MINS
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function nearestSlotIdx(timeStr) {
  const mins = timeStrToMins(timeStr)
  let nearest = 0, minDiff = Infinity
  SLOTS.forEach((s, i) => {
    const diff = Math.abs(timeStrToMins(s) - mins)
    if (diff < minDiff) { minDiff = diff; nearest = i }
  })
  return nearest
}

function endTimeToSlotIdx(endStr) {
  const mins = timeStrToMins(endStr)
  let nearest = 0, minDiff = Infinity
  SLOTS.forEach((s, i) => {
    const diff = Math.abs(timeStrToMins(s) + 30 - mins)
    if (diff < minDiff) { minDiff = diff; nearest = i }
  })
  return nearest
}

function layoutDayAssignments(dayAssignments) {
  if (!dayAssignments.length) return new Map()
  const sorted = [...dayAssignments].sort((a, b) => a.startIdx - b.startIdx)
  const colEnds = []
  const colAssign = new Map()
  for (const a of sorted) {
    let col = colEnds.findIndex((end) => end < a.startIdx)
    if (col === -1) col = colEnds.length
    colEnds[col] = a.endIdx
    colAssign.set(a.id, col)
  }
  const result = new Map()
  for (const a of dayAssignments) {
    const myCol = colAssign.get(a.id)
    const activeCols = new Set([myCol])
    for (const b of dayAssignments) {
      if (b.id !== a.id && b.startIdx <= a.endIdx && b.endIdx >= a.startIdx) {
        activeCols.add(colAssign.get(b.id))
      }
    }
    result.set(a.id, { colIndex: myCol, totalCols: activeCols.size })
  }
  return result
}

// ── Schedule ─────────────────────────────────────────────────────────────────
export default function Schedule() {
  const [assignments, setAssignments] = useState(loadLocal)
  const [loading, setLoading] = useState(true)
  const [migrating, setMigrating] = useState(false)
  const [migrated, setMigrated] = useState(false)
  const localData = loadLocal()
  const hasMigratable = localData.length > 0
  const [drag, setDrag]               = useState(null)
  const [modal, setModal]             = useState(null)
  const [editMembers, setEditMembers] = useState([])
  const [editTask, setEditTask]       = useState('Booth')
  const [editSession, setEditSession] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [filterMember, setFilterMember] = useState(null)
  const [filterTask, setFilterTask]     = useState(null)
  const [filterDay, setFilterDay]       = useState(null)

  const TASK_FILTERS = ['Reception + Hands-on', 'Reception+Game', 'Roll-up']
  const [moving, setMoving]           = useState(null) // block drag-to-move state

  const dragRef   = useRef(null)
  const movingRef = useRef(null)
  const dayColRefs = useRef({})

  useEffect(() => { dragRef.current = drag }, [drag])
  useEffect(() => { movingRef.current = moving }, [moving])
  useEffect(() => { localStorage.setItem(LS_KEY, JSON.stringify(assignments)) }, [assignments])

  // ── Load from Supabase on mount ──
  useEffect(() => {
    supabase.from('schedule_assignments').select('*').then(({ data, error }) => {
      if (!error && data) {
        const mapped = data.map(rowToAssignment)
        setAssignments(mapped)
        localStorage.setItem(LS_KEY, JSON.stringify(mapped))
      }
      setLoading(false)
    })
  }, [])

  // ── slot-selection drag (create new) ──
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
    setEditSession('')
    setEditLocation('')
    setModal({ dayId, startIdx: lo, endIdx: hi, startTime: SLOTS[lo], endTime: endTimeLabel(hi), anchorY: rect.top + lo * SLOT_H + window.scrollY })
  }, [])

  useEffect(() => {
    const up = () => setDrag(null)
    window.addEventListener('mouseup', up)
    return () => window.removeEventListener('mouseup', up)
  }, [])

  // ── block drag-to-move ──
  const onBlockMouseDown = useCallback((a, e) => {
    e.stopPropagation()
    e.preventDefault()
    const blockRect = e.currentTarget.getBoundingClientRect()
    const offsetIdx = Math.max(0, Math.floor((e.clientY - blockRect.top) / SLOT_H))
    setMoving({
      assignment: a,
      offsetIdx,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      targetDayId: a.dayId,
      targetSlotIdx: a.startIdx,
    })
  }, [])

  useEffect(() => {
    if (!moving) return

    const findTarget = (mouseX, mouseY) => {
      for (const [dayId, el] of Object.entries(dayColRefs.current)) {
        if (!el) continue
        const rect = el.getBoundingClientRect()
        if (mouseX >= rect.left && mouseX <= rect.right) {
          const relY = mouseY - rect.top
          const span = moving.assignment.endIdx - moving.assignment.startIdx
          const rawSlot = Math.floor(relY / SLOT_H) - moving.offsetIdx
          const targetSlotIdx = Math.max(0, Math.min(SLOTS.length - 1 - span, rawSlot))
          return { targetDayId: dayId, targetSlotIdx }
        }
      }
      return { targetDayId: moving.targetDayId, targetSlotIdx: moving.targetSlotIdx }
    }

    const onMove = (e) => {
      const m = movingRef.current
      if (!m) return
      const dx = e.clientX - m.startX
      const dy = e.clientY - m.startY
      const moved = m.moved || (Math.abs(dx) + Math.abs(dy) > 6)
      const target = findTarget(e.clientX, e.clientY)
      setMoving((prev) => ({ ...prev, moved, ...target }))
    }

    const onUp = (e) => {
      const m = movingRef.current
      if (!m) return
      if (!m.moved) {
        // treat as click → open edit modal
        const el = dayColRefs.current[m.assignment.dayId]
        const rect = el ? el.getBoundingClientRect() : { top: 0 }
        setEditMembers(m.assignment.memberIds || (m.assignment.memberId ? [m.assignment.memberId] : []))
        setEditTask(m.assignment.task)
        setEditSession(m.assignment.session || '')
        setEditLocation(m.assignment.location || '')
        setModal({
          dayId: m.assignment.dayId,
          startIdx: m.assignment.startIdx,
          endIdx: m.assignment.endIdx,
          startTime: m.assignment.startTime || null,
          endTime: m.assignment.endTime || null,
          editId: m.assignment.id,
          anchorY: rect.top + m.assignment.startIdx * SLOT_H + window.scrollY,
        })
      } else {
        // commit move
        const span = m.assignment.endIdx - m.assignment.startIdx
        const moved = { ...m.assignment, dayId: m.targetDayId, startIdx: m.targetSlotIdx, endIdx: m.targetSlotIdx + span }
        setAssignments((prev) => prev.map((a) => a.id === m.assignment.id ? moved : a))
        supabase.from('schedule_assignments').upsert(assignmentToRow(moved))
      }
      setMoving(null)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [moving])

  // ── edit existing block ──
  const openEdit = (a, anchorY) => {
    setEditMembers(a.memberIds || (a.memberId ? [a.memberId] : []))
    setEditTask(a.task)
    setEditSession(a.session || '')
    setEditLocation(a.location || '')
    setModal({ dayId: a.dayId, startIdx: a.startIdx, endIdx: a.endIdx, startTime: a.startTime || null, endTime: a.endTime || null, editId: a.id, anchorY })
  }

  // ── save / delete ──
  const saveAssignment = async () => {
    if (!editMembers.length || !modal) return
    const entry = {
      id: modal.editId || uid(),
      dayId: modal.dayId,
      startIdx: modal.startIdx,
      endIdx: modal.endIdx,
      startTime: modal.startTime || null,
      endTime: modal.endTime || null,
      memberIds: editMembers,
      task: editTask || 'Booth',
      session: editTask === 'Roll-up' ? editSession : undefined,
      location: editTask === 'Roll-up' ? editLocation : undefined,
    }
    setAssignments((prev) =>
      modal.editId ? prev.map((a) => a.id === modal.editId ? entry : a) : [...prev, entry]
    )
    setModal(null)
    await supabase.from('schedule_assignments').upsert(assignmentToRow(entry))
  }

  const deleteAssignment = async () => {
    const id = modal.editId
    setAssignments((prev) => prev.filter((a) => a.id !== id))
    setModal(null)
    await supabase.from('schedule_assignments').delete().eq('id', id)
  }

  const openParallelTask = () => {
    setEditMembers([])
    setEditTask('Booth')
    setEditSession('')
    setEditLocation('')
    setModal((m) => ({
      ...m,
      editId: undefined,
      startTime: m.startTime || SLOTS[m.startIdx],
      endTime: m.endTime || endTimeLabel(m.endIdx),
    }))
  }

  const migrateToCloud = async () => {
    const local = loadLocal()
    if (!local.length) return
    setMigrating(true)
    const rows = local.map(assignmentToRow)
    const { error } = await supabase.from('schedule_assignments').upsert(rows)
    setMigrating(false)
    if (!error) {
      setMigrated(true)
      setAssignments(local)
    } else {
      alert('Migration failed: ' + error.message)
    }
  }

  const toggleMember = (id) => {
    setEditMembers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const dragLo = drag ? Math.min(drag.startIdx, drag.currentIdx) : -1
  const dragHi = drag ? Math.max(drag.startIdx, drag.currentIdx) : -1

  return (
    <div className="sched-page" onMouseLeave={() => { setDrag(null) }} style={{ cursor: moving?.moved ? 'grabbing' : undefined }}>
      <div className="page-header">
        <h1 className="page-title">Conference Schedule</h1>
        <p className="page-desc">CVIT 2026 · MedHub Japan Team{loading ? ' · Loading…' : ''}</p>
      </div>

      {!loading && hasMigratable && !migrated && (
        <div className="migrate-banner">
          <span>You have local schedule data on this device that others can't see.</span>
          <button className="migrate-btn" onClick={migrateToCloud} disabled={migrating}>
            {migrating ? 'Uploading…' : '☁ Upload to cloud'}
          </button>
        </div>
      )}
      {migrated && (
        <div className="migrate-banner migrate-success">
          ✅ Schedule uploaded — everyone can now see it.
        </div>
      )}

      <div className="team-legend">
        {TEAM.map((m) => {
          const active = filterMember === m.id
          return (
            <div
              key={m.id}
              className={`team-chip${active ? ' team-chip-active' : ''}`}
              style={active
                ? { background: m.color, borderColor: m.color, color: '#fff', cursor: 'pointer' }
                : { background: m.color + '18', borderColor: m.color + '55', cursor: 'pointer' }}
              onClick={() => setFilterMember(active ? null : m.id)}
            >
              <span className="team-dot" style={{ background: active ? '#fff' : m.color }} />
              {m.name}
            </div>
          )
        })}
        {filterMember && (
          <div className="team-chip filter-clear" onClick={() => setFilterMember(null)}>
            ✕ Clear filter
          </div>
        )}

        <div className="legend-divider" />

        {TASK_FILTERS.map((task) => {
          const active = filterTask === task
          return (
            <div
              key={task}
              className={`team-chip task-filter-chip${active ? ' task-filter-active' : ''}`}
              onClick={() => setFilterTask(active ? null : task)}
            >
              {task}
            </div>
          )
        })}
        {filterTask && (
          <div className="team-chip filter-clear" onClick={() => setFilterTask(null)}>
            ✕ Clear filter
          </div>
        )}
      </div>

      <div className="day-filter-bar">
        <div
          className={`day-filter-chip${!filterDay ? ' day-filter-active' : ''}`}
          onClick={() => setFilterDay(null)}
        >
          All Days
        </div>
        {DAYS.map((d) => (
          <div
            key={d.id}
            className={`day-filter-chip${filterDay === d.id ? ' day-filter-active' : ''}`}
            onClick={() => setFilterDay(filterDay === d.id ? null : d.id)}
          >
            {d.label} <span className="day-filter-date">{d.date}</span>
          </div>
        ))}
      </div>

      <div className="sched-wrapper">
        {(() => {
          const visibleDays = filterDay ? DAYS.filter((d) => d.id === filterDay) : DAYS
          return (
        <div className="sched-grid-main" style={{ gridTemplateColumns: `var(--time-col-w) repeat(${visibleDays.length}, 1fr)` }}>

          {/* ── Header row ── */}
          <div className="sched-corner" />
          {visibleDays.map((d) => (
            <div key={d.id} className="sched-day-header">
              <span className="sched-day-label">{d.label}</span>
              <span className="sched-day-date">{d.date}</span>
            </div>
          ))}

          {/* ── Time column ── */}
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
          {visibleDays.map((day) => {
            const dayAssignments = assignments.filter((a) => {
              if (a.dayId !== day.id) return false
              if (filterMember) {
                const ids = a.memberIds || (a.memberId ? [a.memberId] : [])
                if (!ids.includes(filterMember)) return false
              }
              if (filterTask && a.task !== filterTask) return false
              return true
            })
            const layout = layoutDayAssignments(dayAssignments)
            const showPreview = moving?.moved && moving.targetDayId === day.id
            const previewSpan = moving ? moving.assignment.endIdx - moving.assignment.startIdx : 0

            return (
              <div
                key={day.id}
                className={`day-col${drag?.dayId === day.id ? ' dragging' : ''}`}
                ref={(el) => { dayColRefs.current[day.id] = el }}
                onMouseUp={(e) => onMouseUp(day.id, e)}
              >
                {SLOTS.map((slot, idx) => {
                  const inDrag = drag?.dayId === day.id && idx >= dragLo && idx <= dragHi
                  return (
                    <div
                      key={slot}
                      className={`slot-cell${idx % 2 === 1 ? ' half' : ''}${inDrag ? ' in-drag' : ''}`}
                      onMouseDown={(e) => onCellDown(day.id, idx, e)}
                      onMouseEnter={() => onCellEnter(day.id, idx)}
                    >
                      {!inDrag && <span className="cell-plus">+</span>}
                    </div>
                  )
                })}

                {/* Ghost preview while moving */}
                {showPreview && (
                  <div className="assignment-block move-ghost" style={{
                    top: `${moving.targetSlotIdx * SLOT_H}px`,
                    height: `${(previewSpan + 1) * SLOT_H - 2}px`,
                    left: 0,
                    width: '100%',
                  }} />
                )}

                {dayAssignments.map((a) => {
                  const memberIds = a.memberIds || (a.memberId ? [a.memberId] : [])
                  const members   = memberIds.map((id) => MEMBER_MAP[id]).filter(Boolean)
                  const spanCount = a.endIdx - a.startIdx + 1
                  const { colIndex, totalCols } = layout.get(a.id) || { colIndex: 0, totalCols: 1 }
                  const widthPct = 100 / totalCols
                  const leftPct  = colIndex * widthPct
                  const isMoving = moving?.assignment.id === a.id && moving.moved
                  const blockTop = a.startTime
                    ? (timeStrToMins(a.startTime) - START_MINS) / 30 * SLOT_H
                    : a.startIdx * SLOT_H
                  const blockH = (a.startTime && a.endTime)
                    ? (timeStrToMins(a.endTime) - timeStrToMins(a.startTime)) / 30 * SLOT_H - 2
                    : spanCount * SLOT_H - 2
                  return (
                    <div
                      key={a.id}
                      className={`assignment-block${isMoving ? ' is-moving' : ''}`}
                      style={{
                        top: `${blockTop}px`,
                        height: `${blockH}px`,
                        left: `${leftPct}%`,
                        width: `${widthPct}%`,
                        background: '#0a875418',
                        borderLeft: '4px solid #0a8754',
                        borderTop: '1px solid #0a875440',
                        borderBottom: '1px solid #0a875440',
                        borderRight: '1px solid #0a875420',
                        cursor: 'grab',
                      }}
                      onMouseDown={(e) => onBlockMouseDown(a, e)}
                    >
                      <div className={`block-inner${spanCount === 1 ? ' compact' : ''}`}>
                        <div className="block-title-row">
                          <div className="block-task">{a.task}</div>
                          <div className="block-time-label">
                            {(a.startTime || SLOTS[a.startIdx])} – {(a.endTime || endTimeLabel(a.endIdx))}
                          </div>
                        </div>
                        {a.task === 'Roll-up' && (a.session || a.location) && (
                          <div className="block-rollup-meta">
                            {a.session && <span className="block-rollup-line">{a.session}</span>}
                            {a.location && <span className="block-rollup-line">{a.location}</span>}
                          </div>
                        )}
                        <div className="block-members">
                          {members.map((m) => (
                            <span key={m.id} className="block-member-chip" style={{ color: m.color, background: m.color + '18', borderColor: m.color + '44' }}>
                              {m.name}
                            </span>
                          ))}
                        </div>
                        {spanCount >= 3 && <div className="block-duration">{durationLabel(spanCount)}</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}

        </div>
          )
        })()}
      </div>

      {modal && (
        <AssignModal
          modal={modal}
          editMembers={editMembers}
          toggleMember={toggleMember}
          editTask={editTask}
          setEditTask={setEditTask}
          editSession={editSession}
          setEditSession={setEditSession}
          editLocation={editLocation}
          setEditLocation={setEditLocation}
          onSave={saveAssignment}
          onDelete={modal.editId ? deleteAssignment : null}
          onParallel={modal.editId ? openParallelTask : null}
          onTimeChange={(startTime, endTime) => setModal((m) => ({
            ...m,
            startTime,
            endTime,
            startIdx: nearestSlotIdx(startTime),
            endIdx: endTimeToSlotIdx(endTime),
          }))}
          onClose={() => setModal(null)}
          team={TEAM}
          quickTasks={QUICK_TASKS}
        />
      )}
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function AssignModal({ modal, editMembers, toggleMember, editTask, setEditTask, editSession, setEditSession, editLocation, setEditLocation, onSave, onDelete, onParallel, onTimeChange, onClose, team, quickTasks }) {
  const ref = useRef(null)
  const dayLabel   = DAYS.find((d) => d.id === modal.dayId)?.label
  const startLabel = modal.startTime || SLOTS[modal.startIdx]
  const endLabel   = modal.endTime   || endTimeLabel(modal.endIdx)
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
          <div style={{ flex: 1 }}>
            <div className="modal-slot">{dayLabel}</div>
            <div className="modal-time-pickers">
              <input
                type="time"
                className="modal-time-input"
                value={modal.startTime || startLabel}
                onChange={(e) => onTimeChange(e.target.value, modal.endTime || endLabel)}
              />
              <span className="modal-time-sep">–</span>
              <input
                type="time"
                className="modal-time-input"
                value={modal.endTime || endLabel}
                onChange={(e) => onTimeChange(modal.startTime || startLabel, e.target.value)}
              />
            </div>
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

        {editTask === 'Roll-up' && (
          <div className="modal-section">
            <div className="modal-label">Roll-up Details</div>
            <input
              className="task-input"
              placeholder="Session (e.g. Morning Session A)"
              value={editSession}
              onChange={(e) => setEditSession(e.target.value)}
              style={{ marginBottom: 8 }}
            />
            <input
              className="task-input"
              placeholder="Location (e.g. Hall 3, Booth #12)"
              value={editLocation}
              onChange={(e) => setEditLocation(e.target.value)}
            />
          </div>
        )}

        <div className="modal-actions">
          {onDelete && <button className="modal-btn delete" onClick={onDelete}>Remove</button>}
          {onDelete && <button className="modal-btn parallel" onClick={onParallel}>+ Parallel task</button>}
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
