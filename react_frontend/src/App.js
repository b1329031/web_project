import { BrowserRouter, Routes, Route } from 'react-router-dom';
import IndexPage from './pages/IndexPage';
import QuizPage from './pages/QuizPage';
import GachaPage from './pages/GachaPage';
import ProfilePage from './pages/ProfilePage';
import VocabPage from './pages/VocabPage';
import UserPage from './pages/UserPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/gacha" element={<GachaPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/vocab" element={<VocabPage />} />
        <Route path="/user" element={<UserPage />} />
      </Routes>
    </BrowserRouter>
  );
}
