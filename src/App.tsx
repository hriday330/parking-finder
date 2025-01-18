import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from '@/pages/Home'
import Navbar from '@/components/custom/Navbar'
import PlanTrip from './pages/PlanTrip'

function App() {
  return (
    <main className="w-screen h-screen overflow-hidden">
      <Router>
        <Navbar>
          <Link to="/">Home</Link>
          <Link to="/plan-trip"> Plan your trip </Link>
        </Navbar>
        <div className="flex my-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/plan-trip" element={<PlanTrip/>}/>
          </Routes>
        </div>
      </Router>
    </main>
  )
}

export default App
