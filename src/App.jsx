import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import PatternPredictor from './pages/PatternPredictor'
import FixTheModel from './pages/FixTheModel'
import TheSeparator from './pages/TheSeparator'

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/experiment/1" element={<PatternPredictor />} />
                <Route path="/experiment/2" element={<FixTheModel />} />
                <Route path="/experiment/3" element={<TheSeparator />} />
            </Routes>
        </Router>
    )
}

export default App
