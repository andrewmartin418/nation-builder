import { useState } from 'react'
import GovernanceTab from './components/GovernanceTab'
import PoliticalCompass from './components/PoliticalCompass'

const DEFAULT_STATE = {
  hosType:         'president',
  selectionMethod: 'popular',
  termLength:      4,
  termLimits:      'hard',
  execPower:       50,
  legislatureStructure: 'bicameral'
}

const TABS = ['Governance', 'Economy', 'Society', 'Foreign Policy']

export default function App() {
  const [govState, setGovState] = useState(DEFAULT_STATE)
  const [activeTab, setActiveTab] = useState('Governance')

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col" style={{ fontFamily: "'JetBrains Mono', monospace" }}>

      {/* Header */}
      <header className="border-b border-gray-800 px-4 md:px-8 py-4 flex items-baseline gap-4">
        <h1 style={{ fontFamily: 'Georgia, serif' }} className="text-lg md:text-xl font-semibold tracking-wide text-gray-100">
          Nation Builder
        </h1>
        <span className="text-[10px] uppercase tracking-[0.15em] text-gray-600 hidden sm:block">
          Governance Configuration
        </span>
      </header>

      {/* Tabs */}
      <div className="border-b border-gray-800 px-4 md:px-8 flex overflow-x-auto">
        {TABS.map(tab => {
          const isActive = tab === activeTab
          const isLocked = tab !== 'Governance'
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

      {/* Main layout — stacks vertically on mobile, side-by-side on desktop */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">

        {/* Left panel — controls + profile info */}
        <div className="lg:w-80 lg:shrink-0 lg:border-r border-b lg:border-b-0 border-gray-800 flex flex-col">

          {/* Scrollable controls */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <GovernanceTab state={govState} setState={setGovState} />
          </div>

          {/* Config summary — pinned at bottom on desktop, inline on mobile */}
          <div className="border-t border-gray-800 px-4 md:px-6 py-4">
            <p className="text-[10px] uppercase tracking-[0.15em] text-gray-600 mb-2">Summary</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
              {[
                ['Head of State',   govState.hosType.replace(/_/g, ' ')],
                ['Selection',       govState.selectionMethod.replace(/_/g, ' ')],
                ['Term Length',     govState.termLength >= 40 ? 'Lifetime' : `${govState.termLength} yrs`],
                ['Term Limits',     govState.termLimits],
                ['Exec. Power',     `${govState.execPower} / 100`],
              ].map(([k, v]) => (
                <div key={k} className="contents">
                  <span className="text-gray-600 truncate">{k}</span>
                  <span className="text-gray-300 capitalize truncate text-right">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel — compass fills remaining space */}
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