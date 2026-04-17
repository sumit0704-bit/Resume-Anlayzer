import React, { useState } from 'react'
import '../style/interview.scss'
import { useInterview } from '../hooks/useInterview.js'
import { useNavigate, useParams } from 'react-router'
import { useAuth } from '../../auth/hooks/useAuth'

const NAV_ITEMS = [
  { id: 'technical', label: 'Technical Questions' },
  { id: 'behavioral', label: 'Behavioral Questions' },
  { id: 'roadmap', label: 'Road Map' },
]

const QuestionCard = ({ item, index }) => {
  const [open, setOpen] = useState(false)

  return (
    <div className='q-card'>
      <div className='q-card__header' onClick={() => setOpen(!open)}>
        <span className='q-card__index'>Q{index + 1}</span>
        <p className='q-card__question'>{item.question}</p>
        <span className={`q-card__chevron ${open ? 'q-card__chevron--open' : ''}`}>▼</span>
      </div>

      {open && (
        <div className='q-card__body'>
          <div className='q-card__section'>
            <span className='q-card__tag q-card__tag--intention'>INTENTION</span>
            <p>{item.intention}</p>
          </div>
          <div className='q-card__section'>
            <span className='q-card__tag q-card__tag--answer'>ANSWER</span>
            <p>{item.answer}</p>
          </div>
        </div>
      )}
    </div>
  )
}

const RoadMapDay = ({ day }) => (
  <div className='roadmap-day'>
    <div className='roadmap-day__header'>
      <span className='roadmap-day__badge'>Day {day.day}</span>
      <h3 className='roadmap-day__focus'>{day.focus}</h3>
    </div>
    <ul className='roadmap-day__tasks'>
      {day.tasks?.map((task, i) => (
        <li key={i}>
          <span className='roadmap-day__bullet' />
          {task}
        </li>
      ))}
    </ul>
  </div>
)

const Interview = () => {
  const [activeNav, setActiveNav] = useState('technical')

  const { report, loading, getResumePdf } = useInterview()
  const { interviewId } = useParams()
  const { handleLogout } = useAuth()
  const navigate = useNavigate()

  const onLogout = async () => {
    await handleLogout()
    navigate('/login')
  }

  if (loading) return <h1 style={{ textAlign: 'center' }}>Loading...</h1>
  if (!report)  return <h1 style={{ textAlign: 'center' }}>No report found</h1>

  const technical = report.technicalQuestions || []
  const behavioral = report.behavioralQuestions || []
  const roadmap    = report.preparationPlan    || []
  const skillGaps  = report.skillGaps          || []

  return (
    <div className='interview-page'>
      <div className='interview-layout'>

        {/* LEFT NAV */}
        <nav className='interview-nav'>

          {/* TOP GROUP — section links */}
          <div className='interview-nav__top'>
            <p className='interview-nav__label'>SECTIONS</p>

            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                className={`interview-nav__item ${
                  activeNav === item.id ? 'interview-nav__item--active' : ''
                }`}
                onClick={() => setActiveNav(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* BOTTOM GROUP — utility actions */}
          <div className='interview-nav__bottom'>
            <button
              className='interview-nav__item'
              onClick={() => getResumePdf(interviewId)}
            >
              Download Resume
            </button>

            <button
              className='interview-nav__item interview-nav__item--danger'
              onClick={onLogout}
            >
              Logout
            </button>
          </div>

        </nav>

        <div className='interview-divider' />

        {/* MAIN CONTENT */}
        <main className='interview-content'>

          {activeNav === 'technical' && (
            <section>
              <div className='content-header'>
                <h2>Technical Questions</h2>
                <span className='content-header__count'>{technical.length} questions</span>
              </div>
              <div className='q-list'>
                {technical.length === 0
                  ? <p>No questions</p>
                  : technical.map((q, i) => <QuestionCard key={i} item={q} index={i} />)
                }
              </div>
            </section>
          )}

          {activeNav === 'behavioral' && (
            <section>
              <div className='content-header'>
                <h2>Behavioral Questions</h2>
                <span className='content-header__count'>{behavioral.length} questions</span>
              </div>
              <div className='q-list'>
                {behavioral.length === 0
                  ? <p>No questions</p>
                  : behavioral.map((q, i) => <QuestionCard key={i} item={q} index={i} />)
                }
              </div>
            </section>
          )}

          {activeNav === 'roadmap' && (
            <section>
              <div className='content-header'>
                <h2>Preparation Plan</h2>
              </div>
              <div className='roadmap-list'>
                {roadmap.length === 0
                  ? <p>No roadmap</p>
                  : roadmap.map(day => <RoadMapDay key={day.day} day={day} />)
                }
              </div>
            </section>
          )}

        </main>

        <div className='interview-divider' />

        {/* RIGHT SIDEBAR */}
        <aside className='interview-sidebar'>

          <div className='match-score'>
            <p className='match-score__label'>MATCH SCORE</p>
            <div
              className={`match-score__ring ${
                report.matchScore >= 80 ? 'score--high'
                : report.matchScore >= 60 ? 'score--mid'
                : 'score--low'
              }`}
            >
              <span className='match-score__value'>{report.matchScore}</span>
              <span className='match-score__pct'>%</span>
            </div>
            <p className='match-score__sub'>Strong match for this role</p>
          </div>

          <div className='sidebar-divider' />

          <div className='skill-gaps'>
            <p className='skill-gaps__label'>SKILL GAPS</p>
            <div className='skill-gaps__list'>
              {skillGaps.length === 0
                ? <p>No gaps 🎉</p>
                : skillGaps.map((gap, i) => (
                    <span
                      key={i}
                      className={`skill-tag skill-tag--${gap.severity?.toLowerCase()}`}
                    >
                      {gap.skill}
                    </span>
                  ))
              }
            </div>
          </div>

        </aside>

      </div>
    </div>
  )
}

export default Interview