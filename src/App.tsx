import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from '@/pages/Home'
import Navbar from '@/components/custom/Navbar'

function App() {
  return (
    <main className="w-screen h-screen flex flex-col">
      <Router>
        <Navbar className="sticky">
          <Link to="/">Home</Link>
        </Navbar>
        <div className="flex-grow overflow-auto">
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </div>
      </Router>
    </main>
  )
}

export default App
