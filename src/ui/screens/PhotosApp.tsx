import { Link, Navigate, useParams } from 'react-router';
import type { Evidence } from '../../engine';
import { EvidenceDetail } from '../components/EvidenceView';
import { useCaseRoute } from '../hooks';
import { NavBar } from '../phone/NavBar';

function usePhotos(): Evidence[] {
  const { c, progress } = useCaseRoute();
  if (!c || !progress) return [];
  return progress.evidence
    .map((id) => c.evidence.find((e) => e.id === id))
    .filter((e): e is Evidence => !!e?.image)
    .sort((a, b) => (a.time ?? '99').localeCompare(b.time ?? '99'));
}

export function PhotosApp() {
  const { c } = useCaseRoute();
  const photos = usePhotos();
  if (!c) return null;
  const base = `/enquete/${c.id}`;
  return (
    <div className="app-page">
      <NavBar back={{ to: base, label: 'Accueil' }} largeTitle="Photos" />
      <p className="photos-date">
        {c.device.date.weekday} {c.device.date.day} {c.device.date.month}
      </p>
      {photos.length === 0 ? (
        <p className="empty">Aucune photo pour l’instant.</p>
      ) : (
        <ul className="photo-grid">
          {photos.map((p) => (
            <li key={p.id}>
              <Link to={`${base}/photos/${p.id}`} className="photo-cell" aria-label={p.title}>
                <img src={p.image} alt="" loading="lazy" />
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className="photos-count">
        {photos.length} photo{photos.length > 1 ? 's' : ''}
      </p>
    </div>
  );
}

export function PhotoViewer() {
  const { c } = useCaseRoute();
  const { evidenceId = '' } = useParams();
  const photos = usePhotos();
  if (!c) return null;
  const base = `/enquete/${c.id}`;
  const index = photos.findIndex((p) => p.id === evidenceId);
  const photo = photos[index];
  if (!photo) return <Navigate to={`${base}/photos`} replace />;
  const prev = photos[index - 1];
  const next = photos[index + 1];

  return (
    <div className="app-page viewer">
      <NavBar
        back={{ to: `${base}/photos`, label: 'Photos' }}
        title={
          <span className="viewer-title">
            <strong>{photo.title}</strong>
            {photo.time && (
              <span>
                {c.device.date.weekday} · {photo.time}
              </span>
            )}
          </span>
        }
      />
      <EvidenceDetail c={c} evidence={photo} />
      <nav className="viewer-nav" aria-label="Photo précédente ou suivante">
        {prev ? (
          <Link to={`${base}/photos/${prev.id}`} className="pill">
            ‹ Précédente
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={`${base}/photos/${next.id}`} className="pill">
            Suivante ›
          </Link>
        )}
      </nav>
    </div>
  );
}
