import { Link, Navigate, useParams } from 'react-router';
import type { Evidence } from '../../engine';
import { EvidenceDetail } from '../components/EvidenceView';
import { evidenceSortKey, evidenceWhen } from '../evidenceMeta';
import { useCaseRoute } from '../hooks';
import { NavBar } from '../phone/NavBar';

function usePhotos(): Evidence[] {
  const { c, progress } = useCaseRoute();
  if (!c || !progress) return [];
  const owned = c.evidence.filter((e) => e.image && progress.evidence.includes(e.id));
  // Sans date explicite (premier niveau), on garde l'ordre chronologique des heures.
  // Avec des dates : les plus récentes d'abord, comme sur un téléphone. Sinon : ordre des heures.
  return owned.some((e) => e.date)
    ? owned.sort((a, b) => evidenceSortKey(b) - evidenceSortKey(a))
    : owned.sort((a, b) => (a.time ?? '99').localeCompare(b.time ?? '99'));
}

export function PhotosApp() {
  const { c } = useCaseRoute();
  const photos = usePhotos();
  if (!c) return null;
  const base = `/enquete/${c.id}`;
  const fallback = `${c.device.date.weekday} ${c.device.date.day} ${c.device.date.month}`;
  const groups: { date: string; items: Evidence[] }[] = [];
  for (const p of photos) {
    const date = p.date ?? fallback;
    const group = groups.find((g) => g.date === date);
    if (group) group.items.push(p);
    else groups.push({ date, items: [p] });
  }
  return (
    <div className="app-page">
      <NavBar back={{ to: base, label: 'Accueil' }} largeTitle="Photos" />
      {photos.length === 0 && <p className="empty">Aucune photo pour l’instant.</p>}
      {groups.map((group) => (
        <section key={group.date} aria-label={group.date}>
          <h2 className="photos-date">{group.date}</h2>
          <ul className="photo-grid">
            {group.items.map((p) => (
              <li key={p.id}>
                <Link to={`${base}/photos/${p.id}`} className="photo-cell" aria-label={`${p.title}, ${evidenceWhen(p)}`}>
                  <img src={p.image} alt="" loading="lazy" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
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
            <span>{evidenceWhen(photo) || `${c.device.date.weekday} ${c.device.date.day} ${c.device.date.month}`}</span>
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
