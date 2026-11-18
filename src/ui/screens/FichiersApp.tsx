import { Link, Navigate, useParams } from 'react-router';
import type { Evidence } from '../../engine';
import { EvidenceDetail } from '../components/EvidenceView';
import { Icon } from '../components/Icon';
import { evidenceWhen } from '../evidenceMeta';
import { useCaseRoute } from '../hooks';
import { NavBar } from '../phone/NavBar';

/** Documents (rapports, bons, fiches, journaux) présents ou reçus. */
function useFiles(): Evidence[] {
  const { c, progress } = useCaseRoute();
  if (!c || !progress) return [];
  return progress.evidence
    .map((id) => c.evidence.find((e) => e.id === id))
    .filter((e): e is Evidence => !!e && (e.content.type === 'document' || e.content.type === 'log'));
}

export function FichiersApp() {
  const { c } = useCaseRoute();
  const files = useFiles();
  if (!c) return null;
  const base = `/enquete/${c.id}`;
  return (
    <div className="app-page grouped">
      <NavBar back={{ to: base, label: 'Accueil' }} largeTitle="Fichiers" />
      {c.device.copy && <p className="section-intro">Documents de la copie et fichiers reçus depuis.</p>}
      <section className="group-section">
        {files.length === 0 ? (
          <p className="section-foot">Aucun fichier.</p>
        ) : (
          <ul className="grouped-list">
            {files.map((f) => (
              <li key={f.id}>
                <Link to={`${base}/fichiers/${f.id}`} className="list-row">
                  <span className="thumb thumb-icon file-icon">
                    <Icon name={f.content.type === 'log' ? 'log' : 'note'} size={20} />
                  </span>
                  <span className="list-row-text">
                    <span className="list-row-title">{f.title}</span>
                    <span className="list-row-sub">{evidenceWhen(f)}</span>
                    <span className="list-row-sub">{f.source}</span>
                  </span>
                  <Icon name="chevron" size={16} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export function FichierViewer() {
  const { c } = useCaseRoute();
  const { evidenceId = '' } = useParams();
  const files = useFiles();
  if (!c) return null;
  const base = `/enquete/${c.id}`;
  const file = files.find((f) => f.id === evidenceId);
  if (!file) return <Navigate to={`${base}/fichiers`} replace />;
  return (
    <div className="app-page viewer">
      <NavBar back={{ to: `${base}/fichiers`, label: 'Fichiers' }} title={file.title} />
      <EvidenceDetail c={c} evidence={file} />
    </div>
  );
}
