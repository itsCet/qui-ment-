import { Link } from 'react-router';
import { getCurrentObjective, unreadCount } from '../../engine';
import { useCaseRoute } from '../hooks';
import { AppIcon, type AppIconId } from '../phone/AppIcon';

interface HomeApp {
  id: AppIconId;
  label: string;
  to: string;
  badge?: number;
}

function AppTile({ app, showLabel = true }: { app: HomeApp; showLabel?: boolean }) {
  return (
    <Link
      to={app.to}
      className="app-tile"
      aria-label={app.badge ? `${app.label}, ${app.badge} non lu${app.badge > 1 ? 's' : ''}` : app.label}
    >
      <span className="app-icon">
        <AppIcon id={app.id} />
        {app.badge ? <span className="app-badge">{app.badge}</span> : null}
      </span>
      {showLabel && <span className="app-label">{app.label}</span>}
    </Link>
  );
}

export function HomeScreen() {
  const { c, progress } = useCaseRoute();
  if (!c || !progress) return null;
  const base = `/enquete/${c.id}`;
  const notes = c.conversations.find((cv) => cv.kind === 'notes');
  const chatUnread = c.conversations
    .filter((cv) => cv.kind !== 'notes')
    .reduce((sum, cv) => sum + unreadCount(progress, cv.id), 0);
  const notesUnread = notes ? unreadCount(progress, notes.id) : 0;
  const objective = getCurrentObjective(c, progress);
  const { device } = c;

  const apps: HomeApp[] = [
    { id: 'echanges', label: 'Échanges', to: `${base}/echanges`, badge: chatUnread },
    { id: 'photos', label: 'Photos', to: `${base}/photos` },
    { id: 'notes', label: 'Notes', to: `${base}/notes`, badge: notesUnread },
    { id: 'contacts', label: 'Contacts', to: `${base}/contacts` },
    ...device.apps.map((a) => ({ id: a.icon === 'lock' ? 'serrure' : 'box', label: a.label, to: `${base}/app/${a.id}` }) as HomeApp),
    { id: 'carnet', label: 'Carnet', to: `${base}/carnet` },
    { id: 'enquete', label: 'Enquête', to: `${base}/enquete` },
  ];
  const dock = apps.filter((a) => ['echanges', 'photos', 'notes', 'carnet'].includes(a.id));

  return (
    <div className="home-screen">
      <div className="widgets">
        <div className="widget widget-calendar">
          <p className="widget-weekday">{device.date.weekday}</p>
          <p className="widget-day">{device.date.day}</p>
          <p className="widget-event">
            <span className="event-dot" aria-hidden="true" />
            {device.event.title} · {device.event.time}
          </p>
        </div>
        <div className="widget widget-weather">
          <p className="widget-city">{device.weather.city}</p>
          <p className="widget-temp">{device.weather.temperature}</p>
          <p className="widget-condition">{device.weather.condition}</p>
        </div>
      </div>

      <Link to={`${base}/${progress.solved ? 'resolution' : 'enquete'}`} className="widget widget-objective">
        <span className="widget-objective-icon">
          <AppIcon id="enquete" />
        </span>
        <span>
          <span className="widget-label">{objective ? 'Objectif' : 'Enquête'}</span>
          <span className="widget-objective-title">{objective ? objective.title : 'Affaire résolue — voir la résolution'}</span>
        </span>
      </Link>

      <nav className="app-grid" aria-label="Applications">
        {apps.map((app) => (
          <AppTile key={app.id} app={app} />
        ))}
      </nav>

      <div className="page-dots" aria-hidden="true">
        <span className="active" />
        <span />
      </div>

      <nav className="dock" aria-label="Applications favorites">
        {dock.map((app) => (
          <AppTile key={app.id} app={app} showLabel={false} />
        ))}
      </nav>
    </div>
  );
}
