import { useState } from 'react'
import GovernanceTab from './components/GovernanceTab'
import PoliticalCompass from './components/PoliticalCompass'

const DEFAULT_STATE = {
  hosType:              'president',
  selectionMethod:      'popular',
  termLength:           4,
  termLimits:           'hard',
  legislatureStructure: 'bicameral',
  lowerHouseSelection:  'direct_election',
  upperHouseSelection:  'appointed_exec',
  firstHouseSelection:  'direct_election',
  secondHouseSelection: 'regional',
  thirdHouseSelection:  'hereditary',
  hogType:              'prime_minister',
  hogAppointment:       'legislature',
  powerHoS:             20,
  powerHoG:             40,
  powerLeg:             40,
  stateName:            '',
}

const TABS = ['Identity', 'Governance', 'Economy', 'Society', 'Foreign Policy']

function NameInput({ onSubmit }) {
  const [draft, setDraft] = useState('')
  const submit = () => { if (draft.trim()) onSubmit(draft.trim()) }
  return (
    <div className="flex gap-2 items-center">
      <input
        type="text"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && submit()}
        placeholder="Enter state name..."
        className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono text-gray-200 focus:outline-none focus:border-gray-500 placeholder-gray-700"
      />
      <button
        onClick={submit}
        disabled={!draft.trim()}
        className="px-3 py-2 border border-gray-700 rounded-lg text-gray-400 hover:text-gray-200 hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm"
      >→</button>
    </div>
  )
}

export default function App() {
  const [govState, setGovState] = useState(DEFAULT_STATE)
  const [activeTab, setActiveTab] = useState('Identity')

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col" style={{ fontFamily: "'JetBrains Mono', monospace" }}>

      {/* Header */}
      <header className="border-b border-gray-800 px-4 md:px-8 py-4 flex items-baseline gap-4">
        <h1 style={{ fontFamily: 'Georgia, serif' }} className="text-lg md:text-xl font-semibold tracking-wide text-gray-100">
          Nation Builder
        </h1>
        <span className="text-[10px] uppercase tracking-[0.15em] text-gray-600 hidden sm:block">
          {activeTab}
        </span>
      </header>

      {/* Tabs */}
      <div className="border-b border-gray-800 px-4 md:px-8 flex overflow-x-auto">
        {TABS.map(tab => {
          const isActive = tab === activeTab
          const isLocked = tab !== 'Governance' && tab !== 'Identity'
          return (
            <button
              key={tab}
              onClick={() => !isLocked && setActiveTab(tab)}
              className={`text-[10px] md:text-xs uppercase tracking-wider px-3 md:px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-violet-500 text-gray-100'
                  : isLocked
                    ? 'border-transparent text-gray-700 cursor-not-allowed'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          )
        })}
      </div>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">

        {/* Left panel — switches content based on active tab */}
        <div className="lg:w-80 lg:shrink-0 lg:border-r border-b lg:border-b-0 border-gray-800 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 md:p-6">

            {activeTab === 'Identity' && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-gray-600 mb-6">State Identity</p>
                <label className="text-[10px] uppercase tracking-[0.15em] text-gray-500 block mb-1.5">State Name</label>
                {govState.stateName ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm uppercase tracking-widest text-gray-300 font-mono">{govState.stateName}</span>
                    <button
                      onClick={() => setGovState(s => ({ ...s, stateName: '' }))}
                      className="text-gray-600 hover:text-red-800 transition-colors text-xs font-mono uppercase tracking-wider"
                    >✕ Remove</button>
                  </div>
                ) : (
                  <NameInput onSubmit={name => setGovState(s => ({ ...s, stateName: name }))} />
                )}
              </div>
            )}

            {activeTab === 'Governance' && (
              <GovernanceTab state={govState} setState={setGovState} />
            )}

          </div>

          {/* Summary — only shown on Governance tab */}
          {activeTab === 'Governance' && (
            <div className="border-t border-gray-800 px-4 md:px-6 py-4">
              <p className="text-[10px] uppercase tracking-[0.15em] text-gray-600 mb-2">Summary</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                {[
                  ['Head of State',  govState.hosType.replace(/_/g, ' ')],
                  ['Selection',      govState.selectionMethod.replace(/_/g, ' ')],
                  ['Term Length',    govState.termLength >= 40 ? 'Lifetime' : `${govState.termLength} yrs`],
                  ['Term Limits',    govState.termLimits],
                  ['HoS Power',      `${govState.powerHoS}%`],
                  ...(govState.hogType !== 'none' ? [['HoG Power', `${govState.powerHoG}%`]] : []),
                  ...(govState.legislatureStructure !== 'none' ? [['Legislature', `${govState.powerLeg}%`]] : []),
                ].map(([k, v]) => (
                  <div key={k} className="contents">
                    <span className="text-gray-600 truncate">{k}</span>
                    <span className="text-gray-300 capitalize truncate text-right">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right panel — compass always visible */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center justify-start">
          <p className="text-[10px] uppercase tracking-[0.15em] text-gray-600 mb-4 self-start">Political Profile</p>
          <div className="w-full max-w-lg">
            <PoliticalCompass govState={govState} />
          </div>
        </div>

      </div>
    </div>
  )
}