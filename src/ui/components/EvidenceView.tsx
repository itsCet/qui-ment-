import type { Case, Evidence } from '../../engine/types';
import { Icon } from './Icon';

/* Illustrations locales des photos (aucune image distante). */
function PhotoEnveloppe() {
  return (
    <svg viewBox="0 0 320 200" role="img" aria-label="Une enveloppe kraft marquée « Pour Léa » dans un tiroir de commode en bois">
      <rect width="320" height="200" fill="#2b2118" />
      <rect x="20" y="40" width="280" height="150" fill="#5a3f2a" />
      <rect x="34" y="52" width="252" height="128" fill="#3a281b" />
      <rect x="34" y="52" width="252" height="12" fill="#22170f" opacity="0.7" />
      <g transform="rotate(-6 160 118)">
        <rect x="88" y="78" width="150" height="88" rx="4" fill="#c9a26b" />
        <path d="M88 82l75 48 75-48" fill="none" stroke="#9c7848" strokeWidth="3" />
        <text x="163" y="152" textAnchor="middle" fontSize="16" fill="#3b2a17" fontFamily="Georgia, serif" fontStyle="italic">
          Pour Léa
        </text>
      </g>
      <rect x="20" y="20" width="280" height="22" fill="#6b4c33" />
      <rect x="140" y="26" width="40" height="8" rx="4" fill="#c9b18a" />
    </svg>
  );
}

function PhotoSalon() {
  return (
    <svg viewBox="0 0 320 200" role="img" aria-label="Un salon décoré : guirlandes, banderole « 30 ans », et une veste kaki posée sur l’accoudoir du canapé. Personne sur la photo.">
      <rect width="320" height="200" fill="#1d2436" />
      <rect y="150" width="320" height="50" fill="#2a2a33" />
      <path d="M10 30 Q 80 60 160 30 T 310 30" fill="none" stroke="#e7d7a8" strokeWidth="2" />
      {[30, 60, 90, 120, 150, 180, 210, 240, 270].map((x, i) => (
        <path key={x} d={`M${x} ${36 + (i % 2) * 6}l8 14h-16z`} fill={i % 2 ? '#e0a84a' : '#7fa7d9'} />
      ))}
      <rect x="110" y="62" width="100" height="26" rx="3" fill="#f0e6cf" />
      <text x="160" y="80" textAnchor="middle" fontSize="15" fontWeight="700" fill="#3b3326" fontFamily="system-ui, sans-serif">
        30 ans
      </text>
      <rect x="60" y="112" width="200" height="48" rx="10" fill="#4b5a78" />
      <rect x="48" y="104" width="30" height="62" rx="10" fill="#566785" />
      <rect x="242" y="104" width="30" height="62" rx="10" fill="#566785" />
      <rect x="70" y="96" width="180" height="26" rx="8" fill="#5c6d8d" />
      <path d="M236 96c10-6 30-6 40 2l4 40c-8 6-30 8-44 2z" fill="#6b6b3a" stroke="#4d4d28" strokeWidth="2" />
      <path d="M252 100v38" stroke="#4d4d28" strokeWidth="2" />
      <circle cx="40" cy="70" r="12" fill="#c9617a" />
      <path d="M40 82v40" stroke="#a9b0c3" strokeWidth="1" />
      <circle cx="285" cy="62" r="11" fill="#7fa7d9" />
      <path d="M285 73v40" stroke="#a9b0c3" strokeWidth="1" />
    </svg>
  );
}

const visuals: Record<string, () => React.JSX.Element> = { enveloppe: PhotoEnveloppe, salon: PhotoSalon };

/** Contenu détaillé d'une pièce. */
export function EvidenceContent({ c, evidence }: { c: Case; evidence: Evidence }) {
  const content = evidence.content;
  switch (content.type) {
    case 'photo': {
      const Visual = visuals[content.visual];
      return (
        <figure className="ev-photo">
          {Visual ? <Visual /> : null}
          <figcaption>{content.caption}</figcaption>
        </figure>
      );
    }
    case 'log':
      return (
        <div className="ev-log">
          <p className="ev-log-app">{content.app}</p>
          <table>
            <thead>
              <tr>
                {content.columns.map((col) => (
                  <th key={col} scope="col">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {content.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {content.note && <p className="ev-note">{content.note}</p>}
        </div>
      );
    case 'receipt':
      return (
        <div className="ev-receipt">
          <p className="ev-receipt-shop">{content.shop}</p>
          <dl>
            {content.lines.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <p className="ev-receipt-footer">{content.footer}</p>
        </div>
      );
    case 'quote': {
      const author = c.suspects.find((s) => s.id === content.author);
      return (
        <blockquote className="ev-quote">
          <p className="ev-quote-meta">
            {author?.name ?? content.author} · {content.time}
          </p>
          <p className="ev-quote-text">« {content.text} »</p>
          {content.context && <p className="ev-note">{content.context}</p>}
        </blockquote>
      );
    }
    case 'object':
      return (
        <div className="ev-object">
          <Icon name="plug" size={40} />
          <p>{content.note}</p>
        </div>
      );
  }
}

export function EvidenceDetail({ c, evidence }: { c: Case; evidence: Evidence }) {
  return (
    <div className="ev-detail">
      {evidence.image && (
        <figure className="ev-photo ev-real-photo">
          <img src={evidence.image} alt={evidence.description} />
          {evidence.content.type === 'photo' && <figcaption>{evidence.content.caption}</figcaption>}
        </figure>
      )}
      {!(evidence.image && (evidence.content.type === 'photo' || evidence.content.type === 'object')) && (
        <EvidenceContent c={c} evidence={evidence} />
      )}
      <p>{evidence.description}</p>
      <p className="ev-source">
        <strong>Provenance :</strong> {evidence.source}
      </p>
    </div>
  );
}
