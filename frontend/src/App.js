import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BottomNav } from "./components/BottomNav";
import { MiniPlayer } from "./components/MiniPlayer";
import { HomePage } from "./pages/HomePage";
import { LoungePage } from "./pages/LoungePage";
import { AfterDarkPage } from "./pages/AfterDarkPage";
import { ProfilePage } from "./pages/ProfilePage";

function App() {
  return (
    <div className="app-container">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/lounge" element={<LoungePage />} />
          <Route path="/after-dark" element={<AfterDarkPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
        
        {/* Mini Player - secondary feature */}
        <MiniPlayer />
        
        {/* Bottom Navigation */}
        <BottomNav />
      </BrowserRouter>
    </div>
  );
}

export default App;
