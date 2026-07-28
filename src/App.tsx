import { Link, Route, Routes } from 'react-router-dom'
import { Masthead, ScrollToTop, SiteFooter } from './components/Chrome'
import { Home } from './pages/Home'
import { Sources } from './pages/Sources'
import { Methodology } from './pages/Methodology'
import { GlobalStage } from './chapters/GlobalStage'
import { LivingStandards } from './chapters/LivingStandards'
import { Defence } from './chapters/Defence'
import { EconomicReform } from './chapters/EconomicReform'
import { LawAndOrder } from './chapters/LawAndOrder'

function NotFound() {
  return (
    <div className="container notfound">
      <div className="kicker">404</div>
      <h1 style={{ marginTop: '0.75rem' }}>That page isn’t in the register</h1>
      <p className="lede" style={{ marginTop: '1rem' }}>
        Try the <Link to="/">introduction</Link> or the{' '}
        <Link to="/sources">source register</Link>.
      </p>
    </div>
  )
}

export function App() {
  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <ScrollToTop />
      <Masthead />
      <main className="app__main" id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/global-stage" element={<GlobalStage />} />
          <Route path="/living-standards" element={<LivingStandards />} />
          <Route path="/defence" element={<Defence />} />
          <Route path="/economic-reform" element={<EconomicReform />} />
          <Route path="/law-and-order" element={<LawAndOrder />} />
          <Route path="/sources" element={<Sources />} />
          <Route path="/methodology" element={<Methodology />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <SiteFooter />
    </div>
  )
}
