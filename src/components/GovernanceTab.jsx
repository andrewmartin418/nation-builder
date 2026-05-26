import { useState } from 'react'

// ─── Power redistribution ─────────────────────────────────────────────────────
function redistributePower(changed, newVal, powers, activeKeys) {
  const others = activeKeys.filter(k => k !== changed)
  const remainder = 100 - newVal
  const otherTotal = others.reduce((sum, k) => sum + powers[k], 0)
  const next = { ...powers, [changed]: newVal }
  if (others.length === 0) return next
  if (otherTotal === 0) {
    const share = Math.floor(remainder / others.length)
    others.forEach(k => { next[k] = share })
    next[others[0]] += remainder - share * others.length
  } else {
    others.forEach(k => { next[k] = Math.round((powers[k] / otherTotal) * remainder) })
    const total = activeKeys.reduce((s, k) => s + next[k], 0)
    if (total !== 100) next[others[0]] += 100 - total
  }
  others.forEach(k => { next[k] = Math.max(1, next[k]) })
  const total2 = activeKeys.reduce((s, k) => s + next[k], 0)
  if (total2 !== 100) next[changed] = Math.max(1, next[changed] + (100 - total2))
  return next
}

function getActiveKeys(state) {
  const keys = ['powerHoS']
  if (state.hogType !== 'none') keys.push('powerHoG')
  if (state.legislatureStructure !== 'none') keys.push('powerLeg')
  return keys
}

function absorbPower(removedKey, powers, remainingKeys) {
  const absorbed = powers[removedKey]
  const total = remainingKeys.reduce((s, k) => s + powers[k], 0)
  const next = { ...powers, [removedKey]: 0 }
  if (total === 0) {
    const share = Math.floor(absorbed / remainingKeys.length)
    remainingKeys.forEach(k => { next[k] = share })
    next[remainingKeys[0]] += absorbed - share * remainingKeys.length
  } else {
    remainingKeys.forEach(k => { next[k] = Math.round(powers[k] + (powers[k] / total) * absorbed) })
    const newTotal = remainingKeys.reduce((s, k) => s + next[k], 0)
    if (newTotal !== 100) next[remainingKeys[0]] += 100 - newTotal
  }
  return next
}

function introducePower(newKey, initialShare, powers, existingKeys) {
  const next = { ...powers, [newKey]: initialShare }
  const allKeys = [...existingKeys, newKey]
  const total = existingKeys.reduce((s, k) => s + powers[k], 0)
  existingKeys.forEach(k => { next[k] = Math.round(powers[k] - (powers[k] / total) * initialShare) })
  next[existingKeys[0]] = Math.max(1, next[existingKeys[0]])
  const newTotal = allKeys.reduce((s, k) => s + next[k], 0)
  if (newTotal !== 100) next[existingKeys[0]] += 100 - newTotal
  return next
}

// ─── UI components ────────────────────────────────────────────────────────────
function Section({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-800 last:border-b-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-3 text-left group"
      >
        <span className="text-[10px] uppercase tracking-[0.15em] text-gray-500 group-hover:text-gray-400 transition-colors">
          {title}
        </span>
        <span
          className={`text-gray-500 text-lg leading-none transition-all duration-300 ease-in-out ${open ? 'rotate-180' : 'rotate-0'}`}
          style={{ display: 'inline-block' }}
        >▾</span>
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? '2000px' : '0px', opacity: open ? 1 : 0 }}
      >
        <div className="pb-4">{children}</div>
      </div>
    </div>
  )
}

function Reveal({ show, children }) {
  return (
    <div
      className="overflow-hidden transition-all duration-300 ease-in-out"
      style={{ maxHeight: show ? '600px' : '0px', opacity: show ? 1 : 0, pointerEvents: show ? 'auto' : 'none' }}
    >
      {children}
    </div>
  )
}

function Field({ label, value, children }) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="flex justify-between items-center mb-1.5">
        <label className="text-xs text-gray-400 uppercase tracking-wider">{label}</label>
        {value !== undefined && <span className="text-xs font-mono font-medium text-gray-200">{value}</span>}
      </div>
      {children}
    </div>
  )
}

function SelectInput({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-200 focus:outline-none focus:border-gray-500"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

function RangeInput({ value, onChange, min, max, step = 1 }) {
  return (
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-full accent-violet-500"
    />
  )
}

function ToggleGroup({ value, onChange, options }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`text-xs font-mono px-3 py-1.5 rounded-full border transition-all duration-200 ${
            value === o.value
              ? 'border-gray-400 bg-gray-700 text-gray-100'
              : 'border-gray-700 bg-transparent text-gray-500 hover:border-gray-600 hover:text-gray-400'
          }`}
        >{o.label}</button>
      ))}
    </div>
  )
}

function PowerSlider({ label, value, onChange, color }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
        <span className="text-xs font-mono font-semibold" style={{ color }}>{value}%</span>
      </div>
      <input
        type="range" min={1} max={98} step={1} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: color }}
      />
    </div>
  )
}

// ─── Option constants ─────────────────────────────────────────────────────────
const HOS_TYPES = [
  { value: 'president',      label: 'President' },
  { value: 'monarch',        label: 'Monarch' },
  { value: 'supreme_leader', label: 'Supreme Leader' },
  { value: 'council',        label: 'Council' },
  { value: 'none',           label: 'None (Stateless)' },
]

const SELECTION_METHODS_ALL = [
  { value: 'popular',      label: 'Elected — popular vote' },
  { value: 'legislature',  label: 'Elected — legislature' },
  { value: 'hereditary',   label: 'Hereditary' },
  { value: 'party',        label: 'Appointed — party' },
  { value: 'military',     label: 'Appointed — military' },
  { value: 'lottery',      label: 'Lottery / sortition' },
]

const HOG_TYPES = [
  { value: 'none',            label: 'None (HoS governs directly)' },
  { value: 'prime_minister',  label: 'Prime Minister' },
  { value: 'chancellor',      label: 'Chancellor' },
  { value: 'premier',         label: 'Premier' },
  { value: 'chief_minister',  label: 'Chief Minister' },
]

const HOG_APPOINTMENT = [
  { value: 'hos_appoints',    label: 'Appointed by Head of State' },
  { value: 'legislature',     label: 'Appointed by legislature' },
  { value: 'direct_election', label: 'Directly elected' },
]

const LEGISLATURE_STRUCTURE = [
  { value: 'none',       label: 'None' },
  { value: 'unicameral', label: 'Unicameral' },
  { value: 'bicameral',  label: 'Bicameral' },
  { value: 'tricameral', label: 'Tricameral' },
]

const HOUSE_SELECTION = [
  { value: 'direct_election', label: 'Direct election' },
  { value: 'proportional',    label: 'Proportional representation' },
  { value: 'fptp',            label: 'First-past-the-post' },
  { value: 'appointed_exec',  label: 'Appointed by executive' },
  { value: 'hereditary',      label: 'Hereditary / aristocratic' },
  { value: 'regional',        label: 'Regional delegates' },
  { value: 'mixed',           label: 'Mixed' },
]

const TERM_LIMITS = [
  { value: 'none', label: 'None' },
  { value: 'soft', label: 'Soft' },
  { value: 'hard', label: 'Hard' },
]

export const ELIGIBLE_CLASSES = [
  { value: 'unrestricted',   label: 'Unrestricted — any citizen' },
  { value: 'military',       label: 'Military officers' },
  { value: 'party_cadre',    label: 'Party cadres' },
  { value: 'aristocracy',    label: 'Landed aristocracy' },
  { value: 'clergy',         label: 'Clergy / religious scholars' },
  { value: 'technocrat',     label: 'Technocrats / academics' },
  { value: 'merchant',       label: 'Merchant / financial elite' },
  { value: 'legal',          label: 'Legal / judicial class' },
  { value: 'vanguard',       label: 'Revolutionary vanguard' },
  { value: 'tribal',         label: 'Tribal / clan elders' },
  { value: 'exam',           label: 'Any citizen — meritocratic exam' },
]

function termLabel(length, isHereditary) {
  if (isHereditary) return 'Lifetime'
  if (length >= 40)  return 'Lifetime'
  return `${length} yr${length === 1 ? '' : 's'}`
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function GovernanceTab({ state, setState }) {
  const isStateless  = state.hosType === 'none'
  const isHereditary = state.selectionMethod === 'hereditary'
  const hasHoG       = state.hogType !== 'none'
  const hasLeg       = state.legislatureStructure !== 'none'
  const activeKeys   = getActiveKeys(state)

  const handlePowerChange = (key, newVal) => {
    const next = redistributePower(key, newVal, {
      powerHoS: state.powerHoS,
      powerHoG: state.powerHoG,
      powerLeg: state.powerLeg,
    }, activeKeys)
    setState(s => ({ ...s, ...next }))
  }

  const handleHoGTypeChange = (v) => {
    const wasNone = state.hogType === 'none'
    const isNone  = v === 'none'
    const powers  = { powerHoS: state.powerHoS, powerHoG: state.powerHoG, powerLeg: state.powerLeg }
    if (isNone && !wasNone) {
      const remaining = ['powerHoS', ...(hasLeg ? ['powerLeg'] : [])]
      setState(s => ({ ...s, hogType: v, ...absorbPower('powerHoG', powers, remaining) }))
    } else if (!isNone && wasNone) {
      const existing = ['powerHoS', ...(hasLeg ? ['powerLeg'] : [])]
      setState(s => ({ ...s, hogType: v, ...introducePower('powerHoG', 30, powers, existing) }))
    } else {
      setState(s => ({ ...s, hogType: v }))
    }
  }

  const handleLegStructureChange = (v) => {
    const wasNone = state.legislatureStructure === 'none'
    const isNone  = v === 'none'
    const powers  = { powerHoS: state.powerHoS, powerHoG: state.powerHoG, powerLeg: state.powerLeg }
    if (isNone && !wasNone) {
      const remaining = ['powerHoS', ...(hasHoG ? ['powerHoG'] : [])]
      setState(s => ({ ...s, legislatureStructure: v, ...absorbPower('powerLeg', powers, remaining) }))
    } else if (!isNone && wasNone) {
      const existing = ['powerHoS', ...(hasHoG ? ['powerHoG'] : [])]
      setState(s => ({ ...s, legislatureStructure: v, ...introducePower('powerLeg', 30, powers, existing) }))
    } else {
      setState(s => ({ ...s, legislatureStructure: v }))
    }
  }

  return (
    <div>

      {/* Head of State */}
      <Section title="Head of State">
        <Field label="Type">
          <SelectInput
            value={state.hosType}
            onChange={v => setState(s => ({ ...s, hosType: v }))}
            options={HOS_TYPES}
          />
        </Field>

        <Field label="Selection Method">
          <SelectInput
            value={state.selectionMethod}
            onChange={v => setState(s => ({ ...s, selectionMethod: v }))}
            options={SELECTION_METHODS_ALL}
          />
        </Field>

        <Field label="Eligible Class">
          <SelectInput
            value={state.hosEligibleClass}
            onChange={v => setState(s => ({ ...s, hosEligibleClass: v }))}
            options={ELIGIBLE_CLASSES}
          />
        </Field>

        <div
          className="transition-all duration-300"
          style={{ opacity: isStateless || isHereditary ? 0.3 : 1, pointerEvents: isStateless || isHereditary ? 'none' : 'auto' }}
        >
          <Field label="Term Length" value={termLabel(state.termLength, isHereditary)}>
            <RangeInput
              value={state.termLength}
              onChange={v => setState(s => ({ ...s, termLength: v }))}
              min={1} max={40}
            />
            <div className="flex justify-between text-[10px] text-gray-600 mt-1">
              <span>1 year</span><span>Lifetime</span>
            </div>
          </Field>

          <Field label="Term Limits">
            <ToggleGroup
              value={state.termLimits}
              onChange={v => setState(s => ({ ...s, termLimits: v }))}
              options={TERM_LIMITS}
            />
          </Field>
        </div>

        <div className="border-t border-gray-800 my-4" />

        <Field label="Head of Government">
          <SelectInput
            value={state.hogType}
            onChange={handleHoGTypeChange}
            options={HOG_TYPES}
          />
        </Field>

        <Reveal show={hasHoG}>
          <Field label="HoG Appointment">
            <SelectInput
              value={state.hogAppointment}
              onChange={v => setState(s => ({ ...s, hogAppointment: v }))}
              options={HOG_APPOINTMENT}
            />
          </Field>
        </Reveal>
      </Section>

      {/* Legislature */}
      <Section title="Legislature">
        <Field label="Structure">
          <SelectInput
            value={state.legislatureStructure}
            onChange={handleLegStructureChange}
            options={LEGISLATURE_STRUCTURE}
          />
        </Field>

        <Reveal show={state.legislatureStructure === 'unicameral'}>
          <Field label="Selection Method">
            <SelectInput
              value={state.lowerHouseSelection}
              onChange={v => setState(s => ({ ...s, lowerHouseSelection: v }))}
              options={HOUSE_SELECTION}
            />
          </Field>
        </Reveal>

        <Reveal show={state.legislatureStructure === 'bicameral'}>
          <Field label="Lower House">
            <SelectInput
              value={state.lowerHouseSelection}
              onChange={v => setState(s => ({ ...s, lowerHouseSelection: v }))}
              options={HOUSE_SELECTION}
            />
          </Field>
          <Field label="Upper House">
            <SelectInput
              value={state.upperHouseSelection}
              onChange={v => setState(s => ({ ...s, upperHouseSelection: v }))}
              options={HOUSE_SELECTION}
            />
          </Field>
        </Reveal>

        <Reveal show={state.legislatureStructure === 'tricameral'}>
          <Field label="First House">
            <SelectInput
              value={state.firstHouseSelection}
              onChange={v => setState(s => ({ ...s, firstHouseSelection: v }))}
              options={HOUSE_SELECTION}
            />
          </Field>
          <Field label="Second House">
            <SelectInput
              value={state.secondHouseSelection}
              onChange={v => setState(s => ({ ...s, secondHouseSelection: v }))}
              options={HOUSE_SELECTION}
            />
          </Field>
          <Field label="Third House">
            <SelectInput
              value={state.thirdHouseSelection}
              onChange={v => setState(s => ({ ...s, thirdHouseSelection: v }))}
              options={HOUSE_SELECTION}
            />
          </Field>
        </Reveal>
      </Section>

      {/* Power Distribution — always visible */}
      <div className="pt-4">
        <p className="text-[10px] uppercase tracking-[0.15em] text-gray-600 mb-3">Power Distribution</p>

        <PowerSlider
          label={state.hosType === 'none' ? 'Head of State' : state.hosType.replace(/_/g, ' ')}
          value={state.powerHoS}
          onChange={v => handlePowerChange('powerHoS', v)}
          color="#7F77DD"
        />

        <Reveal show={hasHoG}>
          <PowerSlider
            label={state.hogType === 'none' ? 'Head of Gov.' : state.hogType.replace(/_/g, ' ')}
            value={state.powerHoG}
            onChange={v => handlePowerChange('powerHoG', v)}
            color="#1D9E75"
          />
        </Reveal>

        <Reveal show={hasLeg}>
          <PowerSlider
            label="Legislature"
            value={state.powerLeg}
            onChange={v => handlePowerChange('powerLeg', v)}
            color="#EF9F27"
          />
        </Reveal>

        <div className="flex rounded-full overflow-hidden h-1.5 mt-3">
          <div style={{ width: `${state.powerHoS}%`, background: '#7F77DD' }} className="transition-all duration-500" />
          <div style={{ width: `${hasHoG ? state.powerHoG : 0}%`, background: '#1D9E75' }} className="transition-all duration-500" />
          <div style={{ width: `${hasLeg ? state.powerLeg : 0}%`, background: '#EF9F27' }} className="transition-all duration-500" />
        </div>

        <div className="flex justify-between mt-2">
          {[
            { label: state.hosType === 'none' ? 'HoS' : state.hosType.replace(/_/g, ' '), val: state.powerHoS, color: '#7F77DD', show: true },
            { label: state.hogType.replace(/_/g, ' '), val: state.powerHoG, color: '#1D9E75', show: hasHoG },
            { label: 'Legislature', val: state.powerLeg, color: '#EF9F27', show: hasLeg },
          ].filter(i => i.show).map(({ label, val, color }) => (
            <div key={label} className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
              <span className="text-[10px] text-gray-500 capitalize">{label} <span style={{ color }}>{val}%</span></span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}