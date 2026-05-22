import { useEffect, useRef, useState, useCallback } from 'react'

// ─── Axes ────────────────────────────────────────────────────────────────────
// X: Social   — Traditional (0) ←→ Progressive (100)
// Y: Authority — Authoritarian (0) ←→ Libertarian (100)
// Z: Economic  — Statist (0) ←→ Laissez-faire (100)

const LABEL_MAP = (v) => {
  if (v < 20) return 'Very Low'
  if (v < 40) return 'Low'
  if (v < 60) return 'Moderate'
  if (v < 80) return 'High'
  return 'Very High'
}

const PHILOSOPHIES = {
  liberal_democracy:       { name: 'Liberal Democracy',       desc: 'Popular sovereignty, rule of law, protected civil rights.',        color: '#7F77DD' },
  republicanism:           { name: 'Republicanism',            desc: 'Civic virtue, elected representatives, constitutional order.',      color: '#1D9E75' },
  monarchism:              { name: 'Monarchism',               desc: 'Hereditary legitimacy, dynastic continuity, national tradition.',   color: '#BA7517' },
  authoritarianism:        { name: 'Authoritarianism',         desc: 'Concentrated power, order prioritised over individual liberty.',    color: '#D85A30' },
  totalitarianism:         { name: 'Totalitarianism',          desc: 'Total ideological control, no independent institutions.',          color: '#E24B4A' },
  technocracy:             { name: 'Technocracy',              desc: 'Rule by qualified experts, merit over popular mandate.',           color: '#378ADD' },
  anarchism:               { name: 'Anarchism',                desc: 'Voluntary cooperation, no coercive state authority.',              color: '#639922' },
  oligarchy:               { name: 'Oligarchy',                desc: 'Power held by a small privileged group or party elite.',          color: '#888780' },
  militarism:              { name: 'Militarism',               desc: 'Military values and hierarchy extended to civil governance.',      color: '#A32D2D' },
  sortition:               { name: 'Sortition / Demarchy',     desc: 'Random selection as the basis for democratic legitimacy.',        color: '#D4537E' },
  constitutional_monarchy: { name: 'Constitutional Monarchy',  desc: 'Monarchy constrained by law and parliamentary tradition.',        color: '#EF9F27' },
  conservatism:            { name: 'Social Conservatism',      desc: 'Traditional values, cultural continuity, moral order.',           color: '#BA7517' },
  progressivism:           { name: 'Social Progressivism',     desc: 'Reform-oriented, expansive civil liberties, cultural change.',    color: '#5DCAA5' },
  libertarianism:          { name: 'Libertarianism',           desc: 'Maximum individual freedom, minimal state interference.',         color: '#97C459' },
  statism:                 { name: 'Statism',                  desc: 'Strong centralised state as the engine of social order.',        color: '#F0997B' },
  laissez_faire:           { name: 'Laissez-faire',            desc: 'Free markets, minimal regulation, private enterprise.',          color: '#FAC775' },
}

// ─── Scoring ─────────────────────────────────────────────────────────────────
export function score(state) {
  // social: 0=Traditional, 100=Progressive
  // authority: 0=Authoritarian, 100=Libertarian
  // economic: 0=Statist, 100=Laissez-faire
  let social = 50, authority = 50, economic = 50

  switch (state.hosType) {
    case 'monarch':        social -= 20; authority -= 20; break
    case 'president':      authority += 5; break
    case 'supreme_leader': social -= 15; authority -= 35; economic -= 15; break
    case 'council':        authority += 10; break
    case 'none':           social += 20; authority += 40; economic += 20; break
  }

  switch (state.selectionMethod) {
    case 'popular':     authority += 25; social += 10; break
    case 'legislature': authority += 12; break
    case 'hereditary':  authority -= 20; social -= 15; break
    case 'party':       authority -= 20; economic -= 10; break
    case 'military':    authority -= 30; social -= 20; economic -= 5; break
    case 'lottery':     authority += 15; social += 15; break
  }

  const termFactor = (state.termLength - 1) / 39
  authority -= termFactor * 20
  social    -= termFactor * 5

  switch (state.termLimits) {
    case 'none': authority -= 15; break
    case 'soft': authority -= 5;  break
    case 'hard': authority += 12; break
  }

  const pf = (state.execPower - 50) / 50  // -1 to +1
  authority -= pf * 30
  economic  -= pf * 10

  return {
    social:    Math.max(0, Math.min(100, Math.round(social))),
    authority: Math.max(0, Math.min(100, Math.round(authority))),
    economic:  Math.max(0, Math.min(100, Math.round(economic))),
  }
}

// ─── Government type label ────────────────────────────────────────────────────
export function getGovType(state, s) {
  if (state.hosType === 'none')                                                          return 'Stateless / Anarchic'
  if (state.selectionMethod === 'military')                                              return 'Military Junta'
  if (state.hosType === 'supreme_leader' && s.authority < 25)                           return 'Totalitarian State'
  if (state.hosType === 'monarch' && state.selectionMethod === 'hereditary' && s.authority > 40) return 'Constitutional Monarchy'
  if (state.hosType === 'monarch' && s.authority < 30)                                  return 'Absolute Monarchy'
  if (state.hosType === 'monarch')                                                       return 'Monarchy'
  if (state.selectionMethod === 'lottery')                                               return 'Demarchic Republic'
  if (state.hosType === 'council' && s.economic > 60)                                   return 'Liberal Council'
  if (state.hosType === 'council')                                                       return 'Oligarchic Council'
  if (state.hosType === 'president' && s.authority > 65 && s.social > 55)               return 'Liberal Democracy'
  if (state.hosType === 'president' && s.authority < 30)                                return 'Autocratic Republic'
  if (state.hosType === 'president' && state.selectionMethod === 'party')               return 'Single-Party Republic'
  return 'Constitutional Republic'
}

// ─── Philosophies ─────────────────────────────────────────────────────────────
export function getPhilosophies(state, s) {
  const p = []

  if (state.hosType === 'none')                                             p.push('anarchism')
  else if (state.hosType === 'supreme_leader' && s.authority < 25)        p.push('totalitarianism')
  else if (state.selectionMethod === 'military')                            p.push('militarism')
  else if (state.selectionMethod === 'lottery')                             p.push('sortition')
  else if (state.hosType === 'monarch' && state.selectionMethod === 'hereditary' && s.authority > 35) p.push('constitutional_monarchy')
  else if (state.hosType === 'monarch')                                     p.push('monarchism')

  if (s.authority > 65 && s.social > 55 && state.hosType !== 'none')      p.push('liberal_democracy')
  if (state.hosType === 'president' && s.authority > 50)                   p.push('republicanism')
  if (s.authority < 30 && !p.includes('totalitarianism') && !p.includes('militarism')) p.push('authoritarianism')
  if (state.selectionMethod === 'party')                                    p.push('oligarchy')
  if (state.hosType === 'council' && state.selectionMethod !== 'popular')  p.push('technocracy')

  if (s.social < 30)       p.push('conservatism')
  else if (s.social > 70)  p.push('progressivism')
  if (s.authority > 75)    p.push('libertarianism')
  if (s.economic < 25)     p.push('statism')
  else if (s.economic > 75) p.push('laissez_faire')

  const seen = new Set()
  return p.filter(k => { if (seen.has(k)) return false; seen.add(k); return true }).slice(0, 5)
}

// ─── 3D projection helpers ────────────────────────────────────────────────────
function rotatePoint(x, y, z, rx, ry) {
  // rotate around X axis
  const cosX = Math.cos(rx), sinX = Math.sin(rx)
  const y1 = y * cosX - z * sinX
  const z1 = y * sinX + z * cosX
  // rotate around Y axis
  const cosY = Math.cos(ry), sinY = Math.sin(ry)
  const x2 = x * cosY + z1 * sinY
  const z2 = -x * sinY + z1 * cosY
  return [x2, y1, z2]
}

function project(x, y, z, cx, cy, scale) {
  const fov = 5
  const depth = fov / (fov + z * 0.5 + 2)
  return [cx + x * scale * depth, cy - y * scale * depth, z]
}

// ─── Canvas draw ──────────────────────────────────────────────────────────────
function drawCompass(canvas, s, rotX, rotY) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const W = canvas.width, H = canvas.height
  const cx = W / 2, cy = H / 2
  const SCALE = 100

  ctx.clearRect(0, 0, W, H)

  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const gridC  = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'
  const axisC  = isDark ? 'rgba(255,255,255,0.3)'  : 'rgba(0,0,0,0.35)'
  const labelC = isDark ? 'rgba(255,255,255,0.5)'  : 'rgba(0,0,0,0.6)'
  const dimC   = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.2)'

  const pr = (x, y, z) => {
    const [rx, ry, rz] = rotatePoint(x, y, z, rotX, rotY)
    return project(rx, ry, rz, cx, cy, SCALE)
  }

  const line = (x1,y1,z1, x2,y2,z2, color, width, dash=[]) => {
    const [ax, ay] = pr(x1,y1,z1)
    const [bx, by] = pr(x2,y2,z2)
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by)
    ctx.strokeStyle = color; ctx.lineWidth = width
    ctx.setLineDash(dash); ctx.stroke(); ctx.setLineDash([])
  }

  // cube wireframe — back faces first (dashed)
  line(-1,-1, 1,  1,-1, 1,  gridC, 0.5, [3,3])
  line(-1, 1, 1,  1, 1, 1,  gridC, 0.5, [3,3])
  line(-1,-1, 1, -1, 1, 1,  gridC, 0.5, [3,3])
  line( 1,-1, 1,  1, 1, 1,  gridC, 0.5, [3,3])
  line(-1,-1,-1, -1,-1, 1,  gridC, 0.5, [3,3])
  line( 1,-1,-1,  1,-1, 1,  gridC, 0.5, [3,3])
  line(-1, 1,-1, -1, 1, 1,  gridC, 0.5, [3,3])
  line( 1, 1,-1,  1, 1, 1,  gridC, 0.5, [3,3])
  // front face edges
  line(-1,-1,-1,  1,-1,-1,  gridC, 0.5)
  line(-1, 1,-1,  1, 1,-1,  gridC, 0.5)
  line(-1,-1,-1, -1, 1,-1,  gridC, 0.5)
  line( 1,-1,-1,  1, 1,-1,  gridC, 0.5)

  // grid lines on the floor (y=-1 plane)
  for (let i = -1; i <= 1; i += 0.5) {
    line(-1,-1,i, 1,-1,i, gridC, 0.3)
    line(i,-1,-1, i,-1,1, gridC, 0.3)
  }

  // main axes from origin (0,0,0) to +1
  // X = Social (Traditional → Progressive) — amber
  line(0,0,0, 1,0,0, '#EF9F27', 2)
  line(0,0,0,-1,0,0, dimC, 1, [4,4])
  // Y = Authority (Authoritarian → Libertarian) — violet
  line(0,0,0, 0,1,0, '#7F77DD', 2)
  line(0,0,0, 0,-1,0, dimC, 1, [4,4])
  // Z = Economic (Statist → Laissez-faire) — teal
  line(0,0,0, 0,0,1, '#1D9E75', 2)
  line(0,0,0, 0,0,-1, dimC, 1, [4,4])

  // axis tip arrowheads (small dots)
  const dot = (x,y,z, color, r=4) => {
    const [px,py] = pr(x,y,z)
    ctx.beginPath(); ctx.arc(px,py,r,0,Math.PI*2)
    ctx.fillStyle = color; ctx.fill()
  }
  dot( 1,0,0, '#EF9F27', 3)
  dot( 0,1,0, '#7F77DD', 3)
  dot( 0,0,1, '#1D9E75', 3)

  // axis labels
  ctx.font = '500 11px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const lbl = (x,y,z, text, color, offsetX=0, offsetY=0) => {
    const [px,py] = pr(x,y,z)
    ctx.fillStyle = color
    ctx.fillText(text, px+offsetX, py+offsetY)
  }

  lbl( 1.25,0,0,   'Progressive', '#EF9F27')
  lbl(-1.25,0,0,   'Traditional', dimC)
  lbl( 0, 1.25,0,  'Libertarian', '#7F77DD')
  lbl( 0,-1.25,0,  'Authoritarian', dimC)
  lbl( 0, 0, 1.25, 'Laissez-faire', '#1D9E75')
  lbl( 0, 0,-1.25, 'Statist', dimC)

  // ── Plot the country's position ──────────────────────────────────────────
  // convert 0–100 scores to -1…+1 cube coordinates
  const px3 = (s.social    / 50) - 1   // X: Traditional(-1) → Progressive(+1)
  const py3 = (s.authority / 50) - 1   // Y: Authoritarian(-1) → Libertarian(+1)
  const pz3 = (s.economic  / 50) - 1   // Z: Statist(-1) → Laissez-faire(+1)

  // draw faint projection lines to the floor so depth is readable
  line(px3,py3,pz3, px3,-1,pz3, isDark?'rgba(255,255,255,0.12)':'rgba(0,0,0,0.1)', 1, [3,3])
  line(px3,-1,pz3,  px3,-1,-1,  isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.07)', 1, [2,4])
  line(px3,-1,pz3, -1,-1,pz3,   isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.07)', 1, [2,4])

  // glow ring behind the dot
  const [dotX, dotY] = pr(px3, py3, pz3)
  ctx.beginPath(); ctx.arc(dotX, dotY, 9, 0, Math.PI*2)
  ctx.fillStyle = isDark ? 'rgba(127,119,221,0.25)' : 'rgba(127,119,221,0.2)'
  ctx.fill()

  // the main dot
  ctx.beginPath(); ctx.arc(dotX, dotY, 6, 0, Math.PI*2)
  ctx.fillStyle = '#7F77DD'
  ctx.fill()
  ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.9)'
  ctx.lineWidth = 1.5
  ctx.stroke()
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PoliticalCompass({ govState }) {
  const canvasRef = useRef(null)
  const [rot, setRot] = useState({ x: 0.4, y: 0.6 })
  const dragRef = useRef(null)

  const s = score(govState)
  const govType = getGovType(govState, s)
  const phils = getPhilosophies(govState, s)

  useEffect(() => {
    drawCompass(canvasRef.current, s, rot.x, rot.y)
  })

  // ── Mouse drag ──────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e) => {
    dragRef.current = { x: e.clientX, y: e.clientY, rot: { ...rot } }
  }, [rot])

  const onMouseMove = useCallback((e) => {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.x
    const dy = e.clientY - dragRef.current.y
    setRot({
      x: dragRef.current.rot.x - dy * 0.008,
      y: dragRef.current.rot.y + dx * 0.008,
    })
  }, [])

  const onMouseUp = useCallback(() => { dragRef.current = null }, [])

  // ── Touch drag ──────────────────────────────────────────────────────────
  const onTouchStart = useCallback((e) => {
    const t = e.touches[0]
    dragRef.current = { x: t.clientX, y: t.clientY, rot: { ...rot } }
  }, [rot])

  const onTouchMove = useCallback((e) => {
    if (!dragRef.current) return
    const t = e.touches[0]
    const dx = t.clientX - dragRef.current.x
    const dy = t.clientY - dragRef.current.y
    setRot({
      x: dragRef.current.rot.x - dy * 0.008,
      y: dragRef.current.rot.y + dx * 0.008,
    })
  }, [])

  const axes = [
    { label: 'Social',    val: s.social,    lo: 'Traditional', hi: 'Progressive', color: '#EF9F27' },
    { label: 'Authority', val: s.authority, lo: 'Authoritarian', hi: 'Libertarian', color: '#7F77DD' },
    { label: 'Economic',  val: s.economic,  lo: 'Statist',      hi: 'Laissez-faire', color: '#1D9E75' },
  ]

  return (
    <div className="flex flex-col items-center gap-4 w-full">

      {/* Government type badge */}
      <span className="text-xs uppercase tracking-widest text-gray-400 border border-gray-700 rounded-full px-3 py-1">
        {govType}
      </span>

      {/* Axis bars */}
      <div className="w-full space-y-2">
        {axes.map(a => (
          <div key={a.label}>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-gray-500 w-16 shrink-0">{a.label}</span>
              <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${a.val}%`, background: a.color }} />
              </div>
              <span className="text-[10px] text-gray-500 w-14 text-right">{LABEL_MAP(a.val)}</span>
            </div>
            <div className="flex justify-between text-[9px] text-gray-700 mt-0.5 pl-[4.5rem]">
              <span>{a.lo}</span>
              <span>{a.hi}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3D Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="cursor-grab active:cursor-grabbing rounded-lg"
          style={{ touchAction: 'none' }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onMouseUp}
        />
        <p className="text-center text-[10px] text-gray-700 mt-1">drag to rotate</p>
      </div>

      {/* Philosophies */}
      <div className="w-full space-y-3 pt-1 border-t border-gray-800">
        {phils.map(key => {
          const ph = PHILOSOPHIES[key]
          if (!ph) return null
          return (
            <div key={key} className="flex gap-2 items-start">
              <div className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ background: ph.color }} />
              <div>
                <p className="text-xs font-medium text-gray-200">{ph.name}</p>
                <p className="text-[11px] text-gray-500">{ph.desc}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}