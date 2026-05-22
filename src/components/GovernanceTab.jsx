function Field({ label, value, children }) {
  return (
    <div className="mb-5">
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
      <p className="text-[10px] uppercase tracking-[0.15em] text-gray-600 mb-5">Head of State</p>

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

      <div className="border-t border-gray-800 my-5" />

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

    </div>
  )
}