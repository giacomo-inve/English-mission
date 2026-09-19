import { HashRouter, Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Home from './pages/Home'
import Lesson from './pages/Lesson'
import Review from './pages/Review'
import Vocabulary from './pages/Vocabulary'
import Verbs from './pages/Verbs'
import Grammar from './pages/Grammar'
import Percorso from './pages/Percorso'
import Progressi from './pages/Progressi'
import Listening from './pages/Listening'
import Speaking from './pages/Speaking'
import Writing from './pages/Writing'
import Manual from './pages/Manual'
import Settings from './pages/Settings'

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-bg-primary">
        <Nav />
        <main className="pt-14">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/percorso" element={<Percorso />} />
            <Route path="/progressi" element={<Progressi />} />
            <Route path="/grammatica" element={<Grammar />} />
            <Route path="/vocaboli" element={<Vocabulary />} />
            <Route path="/verbi" element={<Verbs />} />
            <Route path="/lezione" element={<Lesson />} />
            <Route path="/ripasso" element={<Review />} />
            <Route path="/ascolto" element={<Listening />} />
            <Route path="/parlato" element={<Speaking />} />
            <Route path="/scrittura" element={<Writing />} />
            <Route path="/manuale" element={<Manual />} />
            <Route path="/impostazioni" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  )
}
