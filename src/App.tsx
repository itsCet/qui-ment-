import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import { useGame } from './state/store';
import { Accusation } from './ui/screens/Accusation';
import { CaseLayout } from './ui/screens/CaseLayout';
import { ConversationView } from './ui/screens/ConversationView';
import { Conversations } from './ui/screens/Conversations';
import { Dossier } from './ui/screens/Dossier';
import { EvidenceScreen } from './ui/screens/Evidence';
import { Home } from './ui/screens/Home';
import { Resolution } from './ui/screens/Resolution';
import { SuspectList, SuspectSheet } from './ui/screens/Suspects';

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  {
    path: '/enquete/:caseId',
    element: <CaseLayout />,
    children: [
      { index: true, element: <Dossier /> },
      { path: 'conversations', element: <Conversations /> },
      { path: 'conversations/:conversationId', element: <ConversationView /> },
      { path: 'suspects', element: <SuspectList /> },
      { path: 'suspects/:suspectId', element: <SuspectSheet /> },
      { path: 'preuves', element: <EvidenceScreen /> },
      { path: 'accusation', element: <Accusation /> },
      { path: 'resolution', element: <Resolution /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

/** Rien n'est rendu (ni aucune partie lancée) avant la restauration de la sauvegarde. */
export function App() {
  const hydrated = useGame((s) => s.hydrated);
  if (!hydrated) {
    return (
      <div className="loading" role="status">
        Chargement de ta partie…
      </div>
    );
  }
  return (
    <div className="app-frame">
      <a className="skip-link" href="#contenu">
        Aller au contenu
      </a>
      <RouterProvider router={router} />
    </div>
  );
}
