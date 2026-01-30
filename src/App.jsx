import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import PatternPredictor from './pages/PatternPredictor'
import FixTheModel from './pages/FixTheModel'
import GroupTheData from './pages/GroupTheData'
import ContextSwitch from './pages/ContextSwitch'
import AttentionHighlighter from './pages/AttentionHighlighter'
import DenoiseImage from './pages/DenoiseImage'
import TheReflection from './pages/TheReflection'
import TrainMiniAI from './pages/TrainMiniAI'

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/experiment/1" element={<PatternPredictor />} />
                <Route path="/experiment/2" element={<FixTheModel />} />
                <Route path="/experiment/3" element={<GroupTheData />} />
                <Route path="/experiment/4" element={<ContextSwitch />} />
                <Route path="/experiment/5" element={<AttentionHighlighter />} />
                <Route path="/experiment/6" element={<DenoiseImage />} />
                <Route path="/reflection" element={<TheReflection />} />
                <Route path="/bonus" element={<TrainMiniAI />} />
            </Routes>
        </Router>
    )
}

export default App
