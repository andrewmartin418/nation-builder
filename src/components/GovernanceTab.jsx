import { useState } from 'react'

function Section({ title, children, defaultOpen = true }) {
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
        <span className={`text-gray-500 text-lg leading-none transition-all duration-300 ease-in-out ${open ? 'rotate-180' : 'rotate-0'}`}
          style={{ display: 'inline-block' }}>
          ▾
        </span>
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? '2000px' : '0px', opacity: open ? 1 : 0 }}
      >
        <div className="pb-4">
          {children}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, children }) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="flex justify-between items-center mb-1.5">
        <label className="text-xs text-gray-400 uppercase tracking-wider">{label}</label>
        {value && <span className="text-xs font-mono font-medium text-gray-200">{value}</span>}
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
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

function RangeInput({ value, onChange, min, max, step = 1 }) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
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
          className={`text-xs font-mono px-3 py-1.5 rounded-full border transition-all ${
            value === o.value
              ? 'border-gray-400 bg-gray-700 text-gray-100'
              : 'border-gray-700 bg-transparent text-gray-500 hover:border-gray-600 hover:text-gray-400'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

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

const LEGISLATURE_STRUCTURE = [
  { value: 'none',         label: 'None' },
  { value: 'unicameral',         label: 'Unicameral' },
  { value: 'bicameral',         label: 'Bicameral' },
  { value: 'tricameral',         label: 'Tricameral' }
]

const TERM_LIMITS = [
  { value: 'none',  label: 'None' },
  { value: 'soft',  label: 'Soft' },
  { value: 'hard',  label: 'Hard' },
]

function termLabel(length, isHereditary) {
  if (isHereditary) return 'Lifetime'
  if (length >= 40)  return 'Lifetime'
  return `${length} yr${length === 1 ? '' : 's'}`
}

function powerLabel(val) {
  if (val < 20)  return 'Figurehead'
  if (val < 40)  return 'Limited'
  if (val < 60)  return 'Balanced'
  if (val < 80)  return 'Strong'
  return 'Absolute'
}

export default function GovernanceTab({ state, setState }) {
  const isStateless  = state.hosType === 'none'
  const isHereditary = state.selectionMethod === 'hereditary'
  const dimmed       = isStateless || isHereditary

  return (
    <div>
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

        <div className={`transition-opacity duration-200 ${dimmed ? 'opacity-30 pointer-events-none' : ''}`}>
          <Field label="Term Length" value={termLabel(state.termLength, isHereditary)}>
            <RangeInput
              value={state.termLength}
              onChange={v => setState(s => ({ ...s, termLength: v }))}
              min={1}
              max={40}
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

        <Field label="Executive Power" value={powerLabel(state.execPower)}>
          <RangeInput
            value={state.execPower}
            onChange={v => setState(s => ({ ...s, execPower: v }))}
            min={0}
            max={100}
          />
          <div className="flex justify-between text-[10px] text-gray-600 mt-1">
            <span>Figurehead</span><span>Absolute</span>
          </div>
        </Field>
      </Section>

      <Section title="Legislature" defaultOpen={false}>
          <Field label="Structure">
          <SelectInput
            value={state.legislatureStructure}
            onChange={v => setState(s => ({ ...s, legislatureStructure: v }))}
            options={LEGISLATURE_STRUCTURE}
          />
        </Field>
      </Section>

      {/* Future sections go here, e.g:
      <Section title="Legislature" defaultOpen={false}>
        ...fields...
      </Section>
      <Section title="Judiciary" defaultOpen={false}>
        ...fields...
      </Section>
      */}
    </div>
  )
}