import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { App } from './App'
import './styles/tokens.css'
import './styles/base.css'
import './styles/app.css'
import './styles/figure.css'
import './styles/pages.css'

const container = document.getElementById('root')
if (!container) throw new Error('Root container missing')

createRoot(container).render(
  <React.StrictMode>
    {/* Hash routing so the site works unchanged on GitHub Pages, on a
        sub-path, or from a file server, with no rewrite rules. */}
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)
