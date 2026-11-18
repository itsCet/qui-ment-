import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import { useGame } from './state/store';
import { Accusation } from './ui/screens/Accusation';
import { CarnetApp } from './ui/screens/CarnetApp';
import { ChatView } from './ui/screens/ChatView';
import { ContactsApp, ContactSheet } from './ui/screens/ContactsApp';
import { DeviceAppScreen } from './ui/screens/DeviceAppScreen';
import { EnqueteApp } from './ui/screens/EnqueteApp';
import { HomeScreen } from './ui/screens/HomeScreen';
import { LockScreen } from './ui/screens/LockScreen';
import { MessagesApp } from './ui/screens/MessagesApp';
import { NotesApp } from './ui/screens/NotesApp';
import { PhoneLayout } from './ui/screens/PhoneLayout';
import { PhotosApp, PhotoViewer } from './ui/screens/PhotosApp';
import { Resolution } from './ui/screens/Resolution';

const router = createBrowserRouter([
  { path: '/', element: <LockScreen /> },
  {
    path: '/enquete/:caseId',
    element: <PhoneLayout />,
    children: [
      { index: true, element: <HomeScreen /> },
      { path: 'echanges', element: <MessagesApp /> },
      { path: 'echanges/:conversationId', element: <ChatView /> },
      { path: 'photos', element: <PhotosApp /> },
      { path: 'photos/:evidenceId', element: <PhotoViewer /> },
      { path: 'notes', element: <NotesApp /> },
      { path: 'app/:appId', element: <DeviceAppScreen /> },
      { path: 'contacts', element: <ContactsApp /> },
      { path: 'contacts/:suspectId', element: <ContactSheet /> },
      { path: 'carnet', element: <CarnetApp /> },
      { path: 'enquete', element: <EnqueteApp /> },
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
    <div className="device-frame">
      <a className="skip-link" href="#contenu">
        Aller au contenu
      </a>
      <RouterProvider router={router} />
    </div>
  );
}
