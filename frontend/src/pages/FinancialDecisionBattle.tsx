import React, { useState } from 'react';
import { Swords, Trophy, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface BattleScenario {
  id: string;
  title: string;
  context: string;
  choices: {
    id: string;
    text: string;
    impact: string;
    points: number;
    explanation: string;
    isOptimal: boolean;
  }[];
}

const BATTLE_SCENARIOS: BattleScenario[] = [
  {
    id: 's1',
    title: 'The Weekend Party Dilemma',
    context: 'You have ₹1,500 uncommitted funds left for 12 days. College friends invite you to a ₹600 rooftop diner.',
    choices: [
      {
        id: 'c1',
        text: 'Spend ₹600 without thinking — YOLO weekend',
        impact: 'Burns 40% of remaining buffer, slices allowance to ₹75/day',
        points: 10,
        explanation: 'Leaves dangerously thin cushion if travel emergencies appear.',
        isOptimal: false
      },
      {
        id: 'c2',
        text: 'Join for drinks/snacks only, set strict ₹250 cap',
        impact: 'Preserves ₹1,250 buffer, daily allowance remains solid ₹104/day',
        points: 50,
        explanation: 'Perfect balance of social connection and financial preservation.',
        isOptimal: true
      },
      {
        id: 'c3',
        text: 'Decline completely and stay home',
        impact: 'Saves full ₹600 but creates social isolation fatigue',
        points: 30,
        explanation: 'Financially safe, but sustainable budgeting embraces conscious compromise.',
        isOptimal: false
      }
    ]
  },
  {
    id: 's2',
    title: 'Surprise Freelance Bonus (₹2,000)',
    context: 'A client tips you ₹2,000 extra for fast UI delivery. How do you deploy this capital windfall?',
    choices: [
      {
        id: 'c1',
        text: 'Immediately buy trending luxury sneakers on sale',
        impact: 'Entire bonus is gone instantly; 0% safety gain',
        points: 5,
        explanation: 'Lifestyle inflation consumes the upside before compounding can occur.',
        isOptimal: false
      },
      {
        id: 'c2',
        text: '50/50 Rule: Allocate ₹1,000 to Emergency Fund & ₹1,000 to Spendable Buffer',
        impact: 'Reinforces health score by +15 pts and expands daily allowance',
        points: 50,
        explanation: 'Masterclass allocation — builds security while rewarding yourself.',
        isOptimal: true
      },
      {
        id: 'c3',
        text: 'Put 100% into high-risk memecoin trading',
        impact: 'Exposes student funds to complete volatility',
        points: 0,
        explanation: 'Uncontrolled speculative gambling on core living reserves is critical risk.',
        isOptimal: false
      }
    ]
  }
];

export const FinancialDecisionBattle: React.FC = () => {
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [totalScore, setTotalScore] = useState(120);

  const scenario = BATTLE_SCENARIOS[currentScenarioIndex];
  const selectedChoice = scenario.choices.find(c => c.id === selectedChoiceId);

  const handleSelectChoice = (choice: any) => {
    setSelectedChoiceId(choice.id);
    setTotalScore(prev => prev + choice.points);
  };

  const handleNext = () => {
    setSelectedChoiceId(null);
    setCurrentScenarioIndex((currentScenarioIndex + 1) % BATTLE_SCENARIOS.length);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff' }}>Financial Decision Battle</h1>
            <span className="badge badge-purple">Interactive Game</span>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
            Test your Gen Z money reflexes through gamified trade-off duels and earn fintech mastery points.
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(163,230,53,0.15) 0%, rgba(168,85,247,0.15) 100%)',
          border: '1px solid rgba(163,230,53,0.3)',
          padding: '10px 20px',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Trophy size={20} color="#a3e635" />
          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Battle Mastery</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>{totalScore} PTS</div>
          </div>
        </div>
      </div>

      {/* Scenario Card */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Swords size={18} color="#c084fc" />
          <span style={{ fontSize: '12px', color: '#c084fc', fontWeight: 700, textTransform: 'uppercase' }}>
            Duel #{currentScenarioIndex + 1}: {scenario.title}
          </span>
        </div>

        <p style={{ fontSize: '18px', fontWeight: 600, color: '#fff', lineHeight: 1.5, marginBottom: '24px' }}>
          "{scenario.context}"
        </p>

        {/* Choices */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {scenario.choices.map((c) => {
            const isSelected = selectedChoiceId === c.id;
            return (
              <div
                key={c.id}
                onClick={() => !selectedChoiceId && handleSelectChoice(c)}
                className="glass-card-interactive"
                style={{
                  padding: '18px 22px',
                  cursor: selectedChoiceId ? 'default' : 'pointer',
                  border: isSelected
                    ? (c.isOptimal ? '1px solid #a3e635' : '1px solid #fb7185')
                    : '1px solid rgba(255,255,255,0.08)',
                  background: isSelected
                    ? (c.isOptimal ? 'rgba(163,230,53,0.1)' : 'rgba(244,63,94,0.1)')
                    : 'rgba(255,255,255,0.03)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>{c.text}</div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#c084fc' }}>+{c.points} XP</span>
                </div>
                <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px' }}>{c.impact}</div>

                {isSelected && (
                  <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '13px', color: c.isOptimal ? '#a3e635' : '#fb7185', fontWeight: 600 }}>
                    {c.isOptimal ? '✅ Outstanding financial intellect! ' : '⚠️ Sub-optimal move! '}
                    {c.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {selectedChoiceId && (
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleNext}
              style={{
                background: 'linear-gradient(135deg, #a3e635 0%, #84cc16 100%)',
                color: '#090d16',
                fontWeight: 700,
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              Next Scenario <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
