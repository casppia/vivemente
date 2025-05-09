import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LevelSelectionPage } from './pages/LevelSelectionPage';
import { LevelTopicsPage } from './pages/LevelTopicsPage';
import { TopicPage } from './pages/TopicPage';
import { StudyPage } from './pages/StudyPage';
import { PracticePage } from './pages/PracticePage';
import { PodcastPage } from './pages/PodcastPage';
import { TextGeneratorPage } from './pages/TextGeneratorPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { ComparisonDrill } from './components/ComparisonDrill';
import { DashboardPage } from './pages/DashboardPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Redirect root to dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="topics" element={<LevelSelectionPage />} />
          <Route path="level/:level" element={<LevelTopicsPage />} />
          <Route path="topic/:id" element={<TopicPage />} />
          <Route path="topic/:id/:sectionId" element={<TopicPage />} />
          <Route path="study" element={<StudyPage />} />
          <Route path="practice" element={<PracticePage />} />
          <Route path="comparison" element={<ComparisonDrill />} />
          <Route path="podcast" element={<PodcastPage />} />
          <Route path="generate" element={<TextGeneratorPage />} />
          {/* <Route path="favorites" element={<FavoritesPage />} /> */}
          <Route path="callback" element={<PodcastPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}