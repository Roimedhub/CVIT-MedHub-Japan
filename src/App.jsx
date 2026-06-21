import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Schedule from './pages/Schedule'
import HospitalForm from './pages/HospitalForm'
import FFRFeedback from './pages/FFRFeedback'
import LLMFeedback from './pages/LLMFeedback'
import Materials from './pages/Materials'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Schedule />} />
          <Route path="/hospital-form" element={<HospitalForm />} />
          <Route path="/ffr-feedback" element={<FFRFeedback />} />
          <Route path="/llm-feedback" element={<LLMFeedback />} />
          <Route path="/materials" element={<Materials />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
