import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Icon } from '../components/Icon';

interface NavBarProps {
  back?: { to: string; label: string };
  /** Titre compact centré (sous-pages). */
  title?: ReactNode;
  /** Grand titre aligné à gauche (page principale d'une appli). */
  largeTitle?: string;
  right?: ReactNode;
  tint?: 'blue' | 'yellow' | 'brown';
}

/** Barre de navigation d'appli, façon téléphone. */
export function NavBar({ back, title, largeTitle, right, tint = 'blue' }: NavBarProps) {
  return (
    <header className={`navbar tint-${tint}`}>
      <div className="navbar-row">
        <div className="navbar-side">
          {back && (
            <Link to={back.to} className="navbar-back">
              <Icon name="back" size={24} />
              <span>{back.label}</span>
            </Link>
          )}
        </div>
        <div className="navbar-title">{title}</div>
        <div className="navbar-side navbar-right">{right}</div>
      </div>
      {largeTitle && <h1 className="large-title">{largeTitle}</h1>}
    </header>
  );
}
