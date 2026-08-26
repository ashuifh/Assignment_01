import {
  AssignmentsIcon,
  BellIcon,
  ClassroomIcon,
  ExamsIcon,
  HelpIcon,
  HomeIcon,
  LibraryIcon,
  SettingsIcon,
  Sparkle,
  LogoMark,
  ChevronDown,
  BackIcon,
} from '../components/Icons'

export default function AppShell({ processing, children }) {
  return (
    <div className={`app-shell ${processing ? 'is-extracting' : ''}`}>
      <aside className="sidebar" aria-label="Navigation">
        <a className="sidebar-brand" href="/" aria-label="VedaAI home" onClick={(e) => e.preventDefault()}>
          <LogoMark size={28} />
          <strong>VedaAI</strong>
          <span className="collapse-mark" aria-hidden="true">◧</span>
        </a>
        <button className="toolkit-button" type="button">
          <Sparkle size={12} /> AI Teacher&apos;s Toolkit
        </button>
        <nav className="side-nav" aria-label="Primary navigation">
          <a href="/" onClick={(e) => e.preventDefault()}>
            <HomeIcon /> Home
          </a>
          <a href="/" onClick={(e) => e.preventDefault()}>
            <ClassroomIcon /> My Classroom
          </a>
          <a href="/" onClick={(e) => e.preventDefault()}>
            <AssignmentsIcon /> Assignments
          </a>
          <a className="active" href="/" aria-current="page" onClick={(e) => e.preventDefault()}>
            <ExamsIcon /> Exams
          </a>
          <a href="/" onClick={(e) => e.preventDefault()}>
            <LibraryIcon /> My Library
          </a>
        </nav>
        <div className="sidebar-bottom">
          <a href="/" onClick={(e) => e.preventDefault()}>
            <SettingsIcon /> Settings
          </a>
          <div className="school-card">
            <span className="school-emblem" aria-hidden="true">
              ✥
            </span>
            <div>
              <strong>Delhi Public School</strong>
              <small>Bokaro Steel City</small>
            </div>
          </div>
        </div>
      </aside>

      <header className="topbar">
        <div className="mobile-brand">
          <LogoMark size={24} />
          <strong>VedaAI</strong>
        </div>
        <div className="breadcrumb">
          <BackIcon width={16} height={16} />
          <span className="crumb-doc" aria-hidden="true">
            ▭
          </span>
          <strong>Exams</strong>
        </div>
        <div className="top-actions">
          <button className="icon-button" aria-label="Help">
            <HelpIcon width={16} height={16} />
          </button>
          <button className="icon-button has-dot" aria-label="Notifications">
            <BellIcon width={16} height={16} />
          </button>
          <Sparkle size={16} className="sparkle" aria-hidden="true" />
          <div className="avatar">MR</div>
          <strong className="user-name">
            Madhur Rastogi <ChevronDown width={12} height={12} />
          </strong>
          <button className="menu-button" aria-label="Open menu">
            ☰
          </button>
        </div>
      </header>

      <main>{children}</main>
    </div>
  )
}
