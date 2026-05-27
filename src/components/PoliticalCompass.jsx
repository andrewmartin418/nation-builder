import { useEffect, useRef, useState, useCallback } from 'react'

const LABEL_MAP = (v) => {
  if (v < 20) return 'Very Low'
  if (v < 40) return 'Low'
  if (v < 60) return 'Moderate'
  if (v < 80) return 'High'
  return 'Very High'
}

const PHILOSOPHIES = {
  // Core governance
  liberal_democracy:       { name: 'Liberal Democracy',        desc: 'Popular sovereignty, rule of law, protected civil rights.',                color: '#7F77DD' },
  republicanism:           { name: 'Republicanism',             desc: 'Civic virtue, elected representatives, constitutional order.',              color: '#1D9E75' },
  monarchism:              { name: 'Monarchism',                desc: 'Hereditary legitimacy, dynastic continuity, national tradition.',           color: '#BA7517' },
  authoritarianism:        { name: 'Authoritarianism',          desc: 'Concentrated power, order prioritised over individual liberty.',             color: '#D85A30' },
  totalitarianism:         { name: 'Totalitarianism',           desc: 'Total ideological control, no independent institutions.',                   color: '#E24B4A' },
  technocracy:             { name: 'Technocracy',               desc: 'Rule by qualified experts, merit over popular mandate.',                    color: '#378ADD' },
  anarchism:               { name: 'Anarchism',                 desc: 'Voluntary cooperation, no coercive state authority.',                       color: '#639922' },
  oligarchy:               { name: 'Oligarchy',                 desc: 'Power held by a small privileged group or party elite.',                    color: '#888780' },
  militarism:              { name: 'Militarism',                desc: 'Military values and hierarchy extended to civil governance.',                color: '#A32D2D' },
  sortition:               { name: 'Sortition / Demarchy',      desc: 'Random selection as the basis for democratic legitimacy.',                  color: '#D4537E' },
  constitutional_monarchy: { name: 'Constitutional Monarchy',   desc: 'Monarchy constrained by law and parliamentary tradition.',                  color: '#EF9F27' },
  theocracy:               { name: 'Theocracy',                 desc: 'Religious authority as the basis of political legitimacy and law.', color: '#C4A35A' },
  // Social axis
  conservatism:            { name: 'Social Conservatism',       desc: 'Traditional values, cultural continuity, moral order.',                     color: '#C8861A' },
  progressivism:           { name: 'Social Progressivism',      desc: 'Reform-oriented, expansive civil liberties, cultural change.',              color: '#5DCAA5' },
  libertarianism:          { name: 'Libertarianism',            desc: 'Maximum individual freedom, minimal state interference.',                   color: '#97C459' },
  // Economic axis
  statism:                 { name: 'Statism',                   desc: 'Strong centralised state as the engine of social order.',                   color: '#F0997B' },
  laissez_faire:           { name: 'Laissez-faire',             desc: 'Free markets, minimal regulation, private enterprise.',                     color: '#FAC775' },
  // Legislature-driven
  parliamentarism:         { name: 'Parliamentarism',           desc: 'Executive power derived from and accountable to the legislature.',          color: '#4A90D9' },
  bicameralism:            { name: 'Bicameralism',              desc: 'Two-chamber legislature as a structural check on hasty lawmaking.',          color: '#6B7FD4' },
  consociationalism:       { name: 'Consociationalism',         desc: 'Power-sharing across chambers or factions to ensure broad stability.',      color: '#9B7FD4' },
  caesarism:               { name: 'Caesarism',                 desc: 'Personal rule legitimised by popular support, bypassing institutions.',     color: '#C0392B' },
  bonapartism:             { name: 'Bonapartism',               desc: 'Strong executive authority combined with nominal popular sovereignty.',      color: '#E67E22' },
  council_democracy:       { name: 'Council Democracy',         desc: 'Governance through representative worker or citizen councils.',             color: '#27AE60' },
  // Power-sharing derived
  presidentialism:         { name: 'Presidentialism',           desc: 'Directly elected executive with a fixed term, independent of legislature.', color: '#8E44AD' },
  semi_presidentialism:    { name: 'Semi-Presidentialism',      desc: 'Dual executive — elected president shares power with a parliamentary PM.',  color: '#9B59B6' },
  westminster:             { name: 'Westminster System',        desc: 'Cabinet government drawn from and responsible to parliament.',               color: '#2980B9' },
  // Selection-method derived
  aristocracy:             { name: 'Aristocracy',               desc: 'Political authority resting with a hereditary landed or noble class.',      color: '#8B7355' },
  meritocracy:             { name: 'Meritocracy',               desc: 'Leadership positions awarded on the basis of ability and achievement.',     color: '#48C9B0' },
  kleptocracy:             { name: 'Kleptocracy',               desc: 'Ruling class uses political power primarily for personal enrichment.',      color: '#7F8C8D' },
  // Regime extremes
  failed_state:            { name: 'Failed State',              desc: 'Central authority has collapsed; no institution holds a monopoly on force.', color: '#E74C3C' },
  dominant_party:          { name: 'Dominant-Party System',     desc: 'Nominal multiparty elections in which one party consistently wins.',       color: '#E59866' },
  absolute_monarchy_phil:  { name: 'Absolute Monarchy',         desc: 'Monarch holds supreme authority unchecked by law or legislature.',         color: '#F0B27A' },
  constitutional_republic: { name: 'Constitutional Republic',   desc: 'Rule of law, separation of powers, elected government under a constitution.', color: '#5DADE2' },
}

export function score(state) {
  let social = 50, authority = 50, economic = 50

  switch (state.legislatureStructure) {
    case 'none':        authority -= 20; economic += 5;  break
    case 'unicameral':  authority += 5;                  break
    case 'bicameral':   authority += 10; social -= 5;    break
    case 'tricameral':  authority += 15; social -= 10;   break
  }

  switch (state.hosType) {
    case 'monarch':        social -= 20; authority -= 20; break
    case 'president':      authority += 5;                break
    case 'supreme_leader': social -= 15; authority -= 35; economic -= 15; break
    case 'council':        authority += 10;               break
    case 'khan':        social -= 10; authority -= 15; economic += 5; break
    case 'none':           social += 20; authority += 40; economic += 20; break
  }

  switch (state.selectionMethod) {
    case 'popular':     authority += 25; social += 10; break
    case 'legislature': authority += 12;               break
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

  switch (state.hosEligibleClass) {
    case 'military':     authority -= 10; social -= 5;               break
    case 'party_cadre':  authority -= 15; economic -= 10;            break
    case 'aristocracy':  authority -= 10; social -= 15; economic += 5; break
    case 'clergy':       social -= 20; authority -= 5;               break
    case 'technocrat':   authority += 10; economic += 5;             break
    case 'merchant':     economic += 15; social += 5;                break
    case 'legal':        authority += 8;                             break
    case 'vanguard':     authority -= 20; social += 5; economic -= 15; break
    case 'tribal':       social -= 15; authority -= 10; economic += 5; break
    case 'exam':         authority += 12; social += 5;               break
  }

  switch (state.hogType) {
    case 'none':           authority -= 10; break
    case 'prime_minister': authority += 15; break
    case 'chancellor':     authority += 12; break
    case 'premier':        authority += 10; break
    case 'chief_minister': authority += 8;  break
  }

  const hosPf = (state.powerHoS - 33) / 67
  const legPf = ((state.powerLeg ?? 0) - 33) / 67
  const hogPf = ((state.powerHoG ?? 0) - 33) / 67

  authority -= hosPf * 25
  authority += legPf * 20
  economic  -= hosPf * 8

  if (state.hogType !== 'none') {
    switch (state.hogAppointment) {
      case 'hos_appoints':    authority -= 12; break
      case 'legislature':     authority += 18; break
      case 'direct_election': authority += 10; break
    }
    authority += hogPf * 10
  }

  return {
    social:    Math.max(0, Math.min(100, Math.round(social))),
    authority: Math.max(0, Math.min(100, Math.round(authority))),
    economic:  Math.max(0, Math.min(100, Math.round(economic))),
  }
}

export function getGovType(state, s) {
  let base = 'Constitutional Republic'

  if (state.hosType === 'none')                                                                                             base = 'Stateless / Anarchic'
  else if (state.selectionMethod === 'military' && state.hosType === 'monarch')                                            base = 'Monarchic Military Junta'
  else if (state.selectionMethod === 'military' && state.hosType === 'supreme_leader')                                     base = 'Military Dictatorship'
  else if (state.selectionMethod === 'military')                                                                            base = 'Military Junta'
  else if (state.hosType === 'supreme_leader' && s.authority < 15)                                                         base = 'Totalitarian State'
  else if (state.hosType === 'supreme_leader' && s.authority < 35)                                                         base = 'Authoritarian State'
  else if (state.hosType === 'supreme_leader')                                                                              base = 'One-Party State'
  else if (state.hosType === 'khan' && state.selectionMethod === 'military')           base = 'Military Khanate'
  else if (state.hosType === 'khan' && state.selectionMethod === 'hereditary' && s.authority < 25) base = 'Great Khanate'
  else if (state.hosType === 'khan' && state.selectionMethod === 'hereditary')         base = 'Khanate'
  else if (state.hosType === 'khan' && state.selectionMethod === 'popular')            base = 'Elected Khanate'
  else if (state.hosType === 'khan' && state.selectionMethod === 'lottery')            base = 'Sortive Khanate'
  else if (state.hosType === 'khan')                                                   base = 'Khanate'
  else if (state.hosType === 'monarch' && state.selectionMethod === 'hereditary' && s.authority > 60 && state.hogType !== 'none') base = 'Parliamentary Monarchy'
  else if (state.hosType === 'monarch' && state.selectionMethod === 'hereditary' && s.authority > 40)                     base = 'Constitutional Monarchy'
  else if (state.hosType === 'monarch' && state.selectionMethod === 'hereditary' && s.authority < 20)                     base = 'Absolute Monarchy'
  else if (state.hosType === 'monarch' && state.selectionMethod === 'hereditary')                                          base = 'Monarchy'
  else if (state.hosType === 'monarch' && state.selectionMethod === 'lottery')                                             base = 'Sortive Monarchy'
  else if (state.hosType === 'monarch')                                                                                     base = 'Elective Monarchy'
  else if (state.selectionMethod === 'lottery' && state.legislatureStructure !== 'none')                                   base = 'Demarchic Republic'
  else if (state.selectionMethod === 'lottery')                                                                             base = 'Demarchy'
  else if (state.hosType === 'council' && state.legislatureStructure === 'tricameral')                                     base = 'Federal Council Republic'
  else if (state.hosType === 'council' && state.selectionMethod === 'popular' && s.authority > 55)                        base = 'Direct Democracy'
  else if (state.hosType === 'council' && s.economic > 65)                                                                base = 'Liberal Council'
  else if (state.hosType === 'council' && s.authority < 30)                                                               base = 'Authoritarian Council'
  else if (state.hosType === 'council')                                                                                     base = 'Council Republic'
  else if (state.hosType === 'president' && state.hogType !== 'none' && state.hogAppointment === 'legislature' && s.authority > 60) base = 'Parliamentary Republic'
  else if (state.hosType === 'president' && state.legislatureStructure === 'bicameral' && s.authority > 65 && s.social > 55) base = 'Liberal Democracy'
  else if (state.hosType === 'president' && state.legislatureStructure === 'unicameral' && s.authority > 60)              base = 'Unicameral Republic'
  else if (state.hosType === 'president' && state.legislatureStructure === 'tricameral')                                   base = 'Tricameral Republic'
  else if (state.hosType === 'president' && state.legislatureStructure === 'none' && s.authority < 25)                    base = 'Presidential Dictatorship'
  else if (state.hosType === 'president' && s.authority > 65 && s.social > 55)                                            base = 'Liberal Democracy'
  else if (state.hosType === 'president' && s.authority < 25)                                                             base = 'Autocratic Republic'
  else if (state.hosType === 'president' && s.authority < 40)                                                             base = 'Illiberal Democracy'
  else if (state.hosType === 'president' && state.selectionMethod === 'party')                                            base = 'Single-Party Republic'
  else if (state.hosType === 'president' && state.selectionMethod === 'hereditary')                                       base = 'Dynastic Republic'

  const prefixes = []
  const noLeg = state.legislatureStructure === 'none'
  const suppress = ['Absolute Monarchy', 'Totalitarian State', 'Authoritarian State', 'Military Dictatorship',
    'Stateless / Anarchic', 'Military Junta', 'Monarchic Military Junta', 'Presidential Dictatorship',
    'One-Party State', 'Direct Democracy', 'Elective Monarchy', 'Sortive Monarchy',
    'Military Khanate', 'Great Khanate', 'Khanate', 'Elected Khanate', 'Sortive Khanate']

  if (noLeg && !suppress.includes(base))
    prefixes.push('Autocratic')

  if (state.legislatureStructure === 'tricameral' && s.authority > 55 && !noLeg)
    prefixes.push('Federated')

  if (state.legislatureStructure === 'unicameral' && state.powerHoS > 65 && s.authority > 40)
    prefixes.push('Guided')

  if (state.selectionMethod === 'party' && !noLeg && !suppress.includes(base))
    prefixes.push('Party-State')

  if (state.hogType !== 'none' && state.hogAppointment === 'legislature' && !suppress.includes(base) && base !== 'Parliamentary Republic' && base !== 'Parliamentary Monarchy')
    prefixes.push('Parliamentary')

  if (state.hogType !== 'none' && state.hogAppointment === 'hos_appoints' && state.powerHoS > 35 && !suppress.includes(base))
    prefixes.push('Semi-Presidential')

  if (state.hosType === 'council' && state.selectionMethod === 'hereditary')
    prefixes.push('Dynastic')

  if (state.selectionMethod === 'hereditary' && state.powerHoS > 70 && !suppress.includes(base))
    prefixes.push('Patrimonial')

  if (s.authority > 80 && !base.includes('Liberal') && !suppress.includes(base))
    prefixes.push('Liberal')

  if (state.hosEligibleClass === 'tribal')
    prefixes.push('Tribal')

  if (state.hosEligibleClass === 'clergy' && !suppress.includes(base))
    prefixes.push('Theocratic')

  if (state.hosEligibleClass === 'technocrat' && !suppress.includes(base))
    prefixes.push('Technocratic')

  if (state.hosEligibleClass === 'military' && state.selectionMethod !== 'military' && !suppress.includes(base))
    prefixes.push('Stratocratic')

  if (state.hosEligibleClass === 'merchant' && !suppress.includes(base))
    prefixes.push('Mercantile')

  if (state.hosEligibleClass === 'exam' && !suppress.includes(base))
    prefixes.push('Meritocratic')

  if (state.hosEligibleClass === 'vanguard' && !suppress.includes(base))
    prefixes.push('Vanguard')

  return prefixes.length > 0 ? `${prefixes.join(' ')} ${base}` : base
}

export function getPhilosophies(state, s) {
  const p = []

  if (state.hosType === 'none')                                                                    p.push('anarchism')
  if (state.hosType === 'supreme_leader' && s.authority < 20)                                     p.push('totalitarianism')
  if (state.hosType === 'supreme_leader' && s.authority < 40)                                     p.push('authoritarianism')
  if (state.selectionMethod === 'military')                                                        p.push('militarism')
  if (state.selectionMethod === 'lottery')                                                         p.push('sortition')

  if (state.hosType === 'khan')  p.push('militarism')
  if (state.hosType === 'khan' && state.selectionMethod === 'hereditary')  p.push('monarchism')
  if (state.hosType === 'khan' && s.authority < 30)  p.push('authoritarianism')

  if (state.hosType === 'monarch' && state.selectionMethod === 'hereditary' && s.authority > 50)  p.push('constitutional_monarchy')
  else if (state.hosType === 'monarch' && state.selectionMethod === 'hereditary' && s.authority < 25) p.push('absolute_monarchy_phil')
  else if (state.hosType === 'monarch')                                                            p.push('monarchism')

  if (s.authority > 65 && s.social > 55 && state.hosType !== 'none')                             p.push('liberal_democracy')
  if (state.hosType === 'president' && s.authority > 50)                                          p.push('republicanism')
  if (state.hosType === 'president' && state.hogType === 'none' && state.legislatureStructure !== 'none') p.push('presidentialism')
  if (s.authority < 30 && !p.includes('totalitarianism') && !p.includes('militarism'))           p.push('authoritarianism')

  if (state.selectionMethod === 'party')                                                           p.push('oligarchy')
  if (state.selectionMethod === 'party' && s.authority < 35)                                      p.push('dominant_party')
  if (state.hosType === 'council' && state.selectionMethod !== 'popular')                         p.push('technocracy')
  if (state.hosType === 'council' && state.legislatureStructure !== 'none')                       p.push('council_democracy')

  if (state.selectionMethod === 'hereditary' && state.hosType !== 'monarch')                      p.push('aristocracy')
  if (state.selectionMethod === 'legislature' && state.hogType === 'none')                        p.push('meritocracy')

  if (state.hosEligibleClass === 'clergy')                                      p.push('theocracy')
  if (state.hosEligibleClass === 'technocrat')                                  p.push('technocracy')
  if (state.hosEligibleClass === 'military')                                    p.push('militarism')
  if (state.hosEligibleClass === 'aristocracy')                                 p.push('aristocracy')
  if (state.hosEligibleClass === 'exam')                                        p.push('meritocracy')
  if (state.hosEligibleClass === 'merchant' && s.economic > 60)                p.push('laissez_faire')
  if (state.hosEligibleClass === 'party_cadre' || state.hosEligibleClass === 'vanguard') p.push('oligarchy')

  if (state.legislatureStructure === 'bicameral' && s.authority > 50)                            p.push('bicameralism')
  if (state.legislatureStructure === 'tricameral')                                                p.push('consociationalism')
  if (state.legislatureStructure !== 'none' && state.selectionMethod === 'legislature')           p.push('parliamentarism')
  if (state.legislatureStructure === 'none' && s.authority < 35 && state.hosType === 'president') p.push('caesarism')
  if (state.legislatureStructure === 'none' && state.selectionMethod === 'popular' && s.authority < 40) p.push('bonapartism')

  if (state.hogType !== 'none' && state.hogAppointment === 'legislature' && state.powerLeg > 35)  p.push('westminster')
  else if (state.hogType !== 'none' && state.hogAppointment === 'legislature')                    p.push('parliamentarism')
  if (state.hogType !== 'none' && state.hogAppointment === 'hos_appoints' && state.powerHoS > 35) p.push('semi_presidentialism')

  if (s.social < 25)         p.push('conservatism')
  else if (s.social > 72)    p.push('progressivism')
  if (s.authority > 78)      p.push('libertarianism')
  if (s.economic < 22)       p.push('statism')
  else if (s.economic > 78)  p.push('laissez_faire')

  if (state.hosType === 'none' && state.legislatureStructure === 'none')                          p.push('failed_state')
  if (s.authority < 15)                                                                            p.push('kleptocracy')
  if (state.legislatureStructure !== 'none' && s.authority > 55 && state.selectionMethod !== 'party' && state.selectionMethod !== 'military') p.push('constitutional_republic')

  const seen = new Set()
  return p.filter(k => { if (seen.has(k)) return false; seen.add(k); return true }).slice(0, 8)
}

function rotatePoint(x, y, z, rx, ry) {
  const cosX = Math.cos(rx), sinX = Math.sin(rx)
  const y1 = y * cosX - z * sinX
  const z1 = y * sinX + z * cosX
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

function drawCompass(canvas, s, rotX, rotY) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const W = canvas.width, H = canvas.height
  const cx = W / 2, cy = H / 2
  const SCALE = 160

  ctx.clearRect(0, 0, W, H)

  const gridC = 'rgba(255,255,255,0.13)'
  const dimC  = 'rgba(255,255,255,0.18)'

  const edgeDepth = (x1,y1,z1,x2,y2,z2) => {
    const [,,az] = pr(x1,y1,z1)
    const [,,bz] = pr(x2,y2,z2)
    return (az + bz) / 2
  }

  const depthLine = (x1,y1,z1,x2,y2,z2) => {
    const d = edgeDepth(x1,y1,z1,x2,y2,z2)
    const t = Math.max(0, Math.min(1, (d + 1.5) / 3))
    const alpha = 0.08 + (1 - t) * 0.45
    line(x1,y1,z1,x2,y2,z2, `rgba(255,255,255,${alpha.toFixed(2)})`, 0.5 + (1 - t) * 1.2)
  }

  const pr = (x, y, z) => {
    const [rx, ry, rz] = rotatePoint(x, y, z, rotX, rotY)
    return project(rx, ry, rz, cx, cy, SCALE)
  }

  const line = (x1, y1, z1, x2, y2, z2, color, width, dash = []) => {
    const [ax, ay] = pr(x1, y1, z1)
    const [bx, by] = pr(x2, y2, z2)
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by)
    ctx.strokeStyle = color; ctx.lineWidth = width
    ctx.setLineDash(dash); ctx.stroke(); ctx.setLineDash([])
  }

  depthLine(-1,-1, 1,  1,-1, 1); depthLine(-1, 1, 1,  1, 1, 1)
  depthLine(-1,-1, 1, -1, 1, 1); depthLine( 1,-1, 1,  1, 1, 1)
  depthLine(-1,-1,-1, -1,-1, 1); depthLine( 1,-1,-1,  1,-1, 1)
  depthLine(-1, 1,-1, -1, 1, 1); depthLine( 1, 1,-1,  1, 1, 1)
  depthLine(-1,-1,-1,  1,-1,-1); depthLine(-1, 1,-1,  1, 1,-1)
  depthLine(-1,-1,-1, -1, 1,-1); depthLine( 1,-1,-1,  1, 1,-1)

  for (let i = -1; i <= 1; i += 0.5) {
    line(-1,-1,i, 1,-1,i, gridC, 0.4)
    line(i,-1,-1, i,-1,1, gridC, 0.4)
  }

  const sPos = s.social    >= 50
  const aPos = s.authority >= 50
  const ePos = s.economic  >= 50

  line(0,0,0,  1,0,0,  sPos ? '#EF9F27' : dimC, sPos ? 2.5 : 1,  sPos ? [] : [4,4])
  line(0,0,0, -1,0,0, !sPos ? '#EF9F27' : dimC, !sPos ? 2.5 : 1, !sPos ? [] : [4,4])
  line(0,0,0,  0,1,0,  aPos ? '#7F77DD' : dimC, aPos ? 2.5 : 1,  aPos ? [] : [4,4])
  line(0,0,0,  0,-1,0, !aPos ? '#7F77DD' : dimC, !aPos ? 2.5 : 1, !aPos ? [] : [4,4])
  line(0,0,0,  0,0,1,  ePos ? '#1D9E75' : dimC, ePos ? 2.5 : 1,  ePos ? [] : [4,4])
  line(0,0,0,  0,0,-1, !ePos ? '#1D9E75' : dimC, !ePos ? 2.5 : 1, !ePos ? [] : [4,4])

  const dot = (x, y, z, color, r = 4) => {
    const [px, py] = pr(x, y, z)
    ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2)
    ctx.fillStyle = color; ctx.fill()
  }
  dot(sPos ? 1 : -1, 0, 0, '#EF9F27', 4)
  dot(0, aPos ? 1 : -1, 0, '#7F77DD', 4)
  dot(0, 0, ePos ? 1 : -1, '#1D9E75', 4)

  ctx.font = '600 12px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const lbl = (x, y, z, text, color) => {
    const [px, py] = pr(x, y, z)
    ctx.fillStyle = color
    ctx.fillText(text, px, py)
  }

  lbl( 1.35, 0, 0, 'Progressive',   sPos ? '#EF9F27' : dimC)
  lbl(-1.35, 0, 0, 'Traditional',  !sPos ? '#EF9F27' : dimC)
  lbl(0,  1.35, 0, 'Libertarian',   aPos ? '#7F77DD' : dimC)
  lbl(0, -1.35, 0, 'Authoritarian', !aPos ? '#7F77DD' : dimC)
  lbl(0, 0,  1.35, 'Laissez-faire', ePos ? '#1D9E75' : dimC)
  lbl(0, 0, -1.35, 'Statist',       !ePos ? '#1D9E75' : dimC)

  const px3 = (s.social    / 50) - 1
  const py3 = (s.authority / 50) - 1
  const pz3 = (s.economic  / 50) - 1

  line(px3,py3,pz3, px3,-1,pz3, 'rgba(255,255,255,0.15)', 1, [3,3])
  line(px3,-1,pz3,  px3,-1,-1,  'rgba(255,255,255,0.08)', 1, [2,4])
  line(px3,-1,pz3,  -1,-1,pz3,  'rgba(255,255,255,0.08)', 1, [2,4])

  const [dotX, dotY] = pr(px3, py3, pz3)
  ctx.beginPath(); ctx.arc(dotX, dotY, 14, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(127,119,221,0.2)'; ctx.fill()

  ctx.beginPath(); ctx.arc(dotX, dotY, 8, 0, Math.PI * 2)
  ctx.fillStyle = '#7F77DD'; ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2; ctx.stroke()
}

export default function PoliticalCompass({ govState }) {
  const canvasRef = useRef(null)
  const [rot, setRot] = useState({ x: 0.4, y: 0.6 })
  const dragRef = useRef(null)

  const s = score(govState)
  const govType = getGovType(govState, s)
  const phils = getPhilosophies(govState, s)

  useEffect(() => { drawCompass(canvasRef.current, s, rot.x, rot.y) })

  const onMouseDown = useCallback((e) => {
    dragRef.current = { x: e.clientX, y: e.clientY, rot: { ...rot } }
  }, [rot])

  const onMouseMove = useCallback((e) => {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.x
    const dy = e.clientY - dragRef.current.y
    setRot({ x: dragRef.current.rot.x + dy * 0.008, y: dragRef.current.rot.y - dx * 0.008 })
  }, [])

  const onMouseUp = useCallback(() => { dragRef.current = null }, [])

  const onTouchStart = useCallback((e) => {
    const t = e.touches[0]
    dragRef.current = { x: t.clientX, y: t.clientY, rot: { ...rot } }
  }, [rot])

  const onTouchMove = useCallback((e) => {
    if (!dragRef.current) return
    const t = e.touches[0]
    const dx = t.clientX - dragRef.current.x
    const dy = t.clientY - dragRef.current.y
    setRot({ x: dragRef.current.rot.x + dy * 0.008, y: dragRef.current.rot.y - dx * 0.008 })
  }, [])

  const axes = [
    { label: 'Social',    val: s.social,    lo: 'Traditional',   hi: 'Progressive',   color: '#EF9F27' },
    { label: 'Authority', val: s.authority, lo: 'Authoritarian', hi: 'Libertarian',   color: '#7F77DD' },
    { label: 'Economic',  val: s.economic,  lo: 'Statist',       hi: 'Laissez-faire', color: '#1D9E75' },
  ]

  return (
    <div className="flex flex-col items-center gap-4 w-full">

      {govState.stateName && (
        <p className="text-xl uppercase tracking-widest text-gray-400">
          {govState.stateName}
        </p>
      )}

      <span className="text-xs uppercase tracking-widest text-gray-400 border border-gray-700 rounded-full px-3 py-1">
        {govType}
      </span>

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
              <span>{a.lo}</span><span>{a.hi}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="relative w-full">
        <canvas
          ref={canvasRef}
          width={480} height={480}
          className="cursor-grab active:cursor-grabbing rounded-lg w-full"
          style={{ touchAction: 'none' }}
          onMouseDown={onMouseDown} onMouseMove={onMouseMove}
          onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onMouseUp}
        />
        <p className="text-center text-[10px] text-gray-700 mt-1">drag to rotate</p>
      </div>

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