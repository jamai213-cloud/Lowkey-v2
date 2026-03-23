import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BottomNav } from "./components/BottomNav";
import { MiniPlayer } from "./components/MiniPlayer";
import { RadioProvider } from "./context/RadioContext";
import { HomePage } from "./pages/HomePage";
import { LoungePage } from "./pages/LoungePage";
import { AfterDarkPage } from "./pages/AfterDarkPage";
import { ProfilePage } from "./pages/ProfilePage";

function App() {
  return (
    <RadioProvider>
      <div className="app-container">
        <BrowserRouter>
          {/* Main content area with proper bottom padding */}
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/lounge" element={<LoungePage />} />
              <Route path="/after-dark" element={<AfterDarkPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </main>
          
          {/* Mini Player - positioned above bottom nav */}
          <MiniPlayer />
          
          {/* Bottom Navigation */}
          <BottomNav />
        </BrowserRouter>
      </div>
    </RadioProvider>
  );
}

export default App;
