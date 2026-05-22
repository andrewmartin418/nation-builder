import { useState } from 'react'
import GovernanceTab from './components/GovernanceTab'
import PoliticalCompass from './components/PoliticalCompass'

const DEFAULT_STATE = {
  hosType:         'president',
  selectionMethod: 'popular',
  termLength:      4,
  termLimits:      'hard',
  execPower:       50,
}

const TABS = ['Governance', 'Economy', 'Society', 'Foreign Policy']

export default function App() {
  const [govState, setGovState] = useState(DEFAULT_STATE)
  const [activeTab, setActiveTab] = useState('Governance')

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col" style={{ fontFamily: "'JetBrains Mono', monospace" }}>

      {/* Header */}
      <header className="border-b border-gray-800 px-8 py-5 flex items-baseline gap-4">
        <h1 style={{ fontFamily: 'Georgia, serif' }} className="text-xl font-semibold tracking-wide text-gray-100">
          Nation Builder
        </h1>
        <span className="text-[10px] uppercase tracking-[0.15em] text-gray-600">
          Governance Configuration
        </span>
      </header>

      {/* Tabs */}
      <div className="border-b border-gray-800 px-8 flex gap-0">
        {TABS.map(tab => {
          const isActive  = tab === activeTab
          const isLocked  = tab !== 'Governance'
          return (
            <button
              key={tab}
              onClick={() => !isLocked && setActiveTab(tab)}
              className={`text-xs uppercase tracking-wider px-4 py-3 border-b-2 transition-colors ${
                isActive
                  ? 'border-violet-500 text-gray-100'
                  : isLocked
                    ? 'border-transparent text-gray-700 cursor-not-allowed'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab}
              {isLocked && <span className="ml-1.5 text-[9px] text-gray-700">—</span>}
            </button>
          )
        })}
      </div>

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left — controls */}
        <div className="w-72 shrink-0 border-r border-gray-800 p-6 overflow-y-auto">
          <GovernanceTab state={govState} setState={setGovState} />
        </div>

        {/* Right — compass output */}
        <div className="flex-1 p-8 overflow-y-auto flex flex-col gap-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-gray-600 mb-4">Political Profile</p>
            <div className="max-w-lg">
              <PoliticalCompass govState={govState} />
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 max-w-lg">
            <p className="text-[10px] uppercase tracking-[0.15em] text-gray-600 mb-3">Configuration Summary</p>
            <div className="space-y-1.5 text-xs font-mono">
              {[
                ['Head of State',    govState.hosType.replace('_', ' ')],
                ['Selection',        govState.selectionMethod.replace('_', ' ')],
                ['Term Length',      govState.termLength >= 40 ? 'Lifetime' : `${govState.termLength} years`],
                ['Term Limits',      govState.termLimits],
                ['Executive Power',  `${govState.execPower} / 100`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-gray-600">{k}</span>
                  <span className="text-gray-300 capitalize">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}