import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crosshair, Maximize2, Minus, Plus, RotateCcw } from 'lucide-react';
import type { LiveAnchor, Mission } from '../types';
import {
  MAP_HEIGHT,
  MAP_WIDTH,
  WORLD_SHAPES,
  locateText,
  project,
  unproject,
} from '../lib/geo';

interface MapView {
  x: number;
  y: number;
  w: number;
}

interface Pin {
  id: string;
  x: number;
  y: number;
  lat: number;
  lon: number;
  title: string;
  place: string;
  detail: string;
  tone: string;
  mission?: Mission;
  lead?: LiveAnchor;
}

interface Tip {
  x: number;
  y: number;
  title: string;
  lines: string[];
  tone: string;
}

const FULL: MapView = { x: 0, y: 0, w: MAP_WIDTH };

function clampView(view: MapView): MapView {
  const w = Math.min(MAP_WIDTH, Math.max(110, view.w));
  const h = w * (MAP_HEIGHT / MAP_WIDTH);
  const x = Math.min(MAP_WIDTH - w, Math.max(0, view.x));
  const y = Math.min(MAP_HEIGHT - h, Math.max(0, view.y));
  return { x, y, w };
}

function pinCoordinates(input: { lat?: number; lon?: number; text: string; place?: string }): {
  lat: number;
  lon: number;
  place: string;
} | null {
  if (typeof input.lat === 'number' && typeof input.lon === 'number') {
    return { lat: input.lat, lon: input.lon, place: input.place ?? '' };
  }
  const located = locateText(input.place ? `${input.place} ${input.text}` : input.text);
  if (!located) return null;
  return { lat: located.lat, lon: located.lon, place: located.name };
}

export function SituationMap({
  missions,
  leads,
  selectedLeadId,
  onSelectLead,
  height = 430,
}: {
  missions: Mission[];
  leads: LiveAnchor[];
  selectedLeadId?: string | null;
  onSelectLead?: (lead: LiveAnchor) => void;
  height?: number;
}) {
  const navigate = useNavigate();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [view, setView] = useState<MapView>(FULL);
  const [showMissions, setShowMissions] = useState(true);
  const [showLeads, setShowLeads] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [tip, setTip] = useState<Tip | null>(null);
  const [cursor, setCursor] = useState<{ lon: number; lat: number } | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const drag = useRef<{ x: number; y: number; view: MapView; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const missionPins = useMemo<Pin[]>(() => {
    const pins: Pin[] = [];
    for (const mission of missions) {
      const coords = pinCoordinates({
        lat: mission.anchor?.lat,
        lon: mission.anchor?.lon,
        text: mission.anchor?.label ?? mission.situation,
        place: mission.anchor?.place,
      });
      if (!coords) continue;
      const [x, y] = project(coords.lon, coords.lat);
      pins.push({
        id: mission.id,
        x,
        y,
        lat: coords.lat,
        lon: coords.lon,
        title: `${mission.code} / ${mission.codename}`,
        place: coords.place || mission.anchor?.source || '',
        detail: mission.title,
        tone:
          mission.priority === 'IMMEDIATE'
            ? 'var(--red)'
            : mission.priority === 'PRIORITY'
              ? 'var(--amber)'
              : 'var(--cyan)',
        mission,
      });
    }
    return pins;
  }, [missions]);

  const leadPins = useMemo<Pin[]>(() => {
    const pins: Pin[] = [];
    for (const lead of leads) {
      const coords = pinCoordinates(lead);
      if (!coords) continue;
      const [x, y] = project(coords.lon, coords.lat);
      pins.push({
        id: lead.id,
        x,
        y,
        lat: coords.lat,
        lon: coords.lon,
        title: lead.source,
        place: coords.place || lead.place || '',
        detail: lead.text,
        tone: 'var(--blue)',
        lead,
      });
    }
    return pins;
  }, [leads]);

  const countryActivity = useMemo(() => {
    const map = new Map<string, { missions: number; leads: number }>();
    for (const pin of missionPins) {
      if (!pin.place) continue;
      const entry = map.get(pin.place) ?? { missions: 0, leads: 0 };
      entry.missions += 1;
      map.set(pin.place, entry);
    }
    for (const pin of leadPins) {
      if (!pin.place) continue;
      const entry = map.get(pin.place) ?? { missions: 0, leads: 0 };
      entry.leads += 1;
      map.set(pin.place, entry);
    }
    return map;
  }, [missionPins, leadPins]);

  const zoomAt = (factor: number, clientX?: number, clientY?: number) => {
    setView((current) => {
      const rect = svgRef.current?.getBoundingClientRect();
      const nextW = Math.min(MAP_WIDTH, Math.max(110, current.w / factor));
      const ratio = nextW / current.w;
      let px = current.x + current.w / 2;
      let py = current.y + current.w * (MAP_HEIGHT / MAP_WIDTH) / 2;
      if (rect && clientX !== undefined && clientY !== undefined) {
        px = current.x + ((clientX - rect.left) / rect.width) * current.w;
        py = current.y + ((clientY - rect.top) / rect.height) * current.w * (MAP_HEIGHT / MAP_WIDTH);
      }
      return clampView({
        x: px - (px - current.x) * ratio,
        y: py - (py - current.y) * ratio,
        w: nextW,
      });
    });
  };

  useEffect(() => {
    const element = wrapRef.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      zoomAt(event.deltaY < 0 ? 1.24 : 0.8, event.clientX, event.clientY);
    };
    element.addEventListener('wheel', onWheel, { passive: false });
    return () => element.removeEventListener('wheel', onWheel);
  }, []);

  const onPointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (event.button !== 0) return;
    drag.current = { x: event.clientX, y: event.clientY, view, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (svg) {
      const rect = svg.getBoundingClientRect();
      const x = view.x + ((event.clientX - rect.left) / rect.width) * view.w;
      const y = view.y + ((event.clientY - rect.top) / rect.height) * view.w * (MAP_HEIGHT / MAP_WIDTH);
      const [lon, lat] = unproject(x, y);
      setCursor({ lon, lat });
    }
    const start = drag.current;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) start.moved = true;
    const rect = svg?.getBoundingClientRect();
    if (!rect) return;
    const unitsX = (dx / rect.width) * start.view.w;
    const unitsY = (dy / rect.height) * start.view.w * (MAP_HEIGHT / MAP_WIDTH);
    setView(clampView({ ...start.view, x: start.view.x - unitsX, y: start.view.y - unitsY }));
  };

  const endDrag = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (drag.current) {
      const moved = drag.current.moved;
      drag.current = null;
      try {
        event.currentTarget.releasePointerCapture(event.pointerId);
      } catch {
        // Pointer capture may already be released.
      }
      if (moved) {
        suppressClick.current = true;
        window.setTimeout(() => {
          suppressClick.current = false;
        }, 0);
        setTip(null);
      }
    }
  };

  const showTip = (event: ReactMouseEvent, title: string, lines: string[], tone: string) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTip({
      x: Math.min(rect.width - 250, Math.max(10, event.clientX - rect.left + 14)),
      y: Math.min(rect.height - 120, Math.max(10, event.clientY - rect.top + 12)),
      title,
      lines,
      tone,
    });
  };

  const viewHeight = view.w * (MAP_HEIGHT / MAP_WIDTH);
  const scale = view.w / MAP_WIDTH;
  const pinRadius = 4.4 * scale;
  const activePins = (showMissions ? missionPins.length : 0) + (showLeads ? leadPins.length : 0);

  return (
    <div
      className={`map-panel${fullscreen ? ' is-fullscreen' : ''}`}
      ref={wrapRef}
      style={fullscreen ? undefined : { height }}
    >
      <div className="map-toolbar">
        <div className="map-layers">
          <button
            type="button"
            className={`map-layer${showMissions ? ' active' : ''}`}
            onClick={() => setShowMissions((value) => !value)}
          >
            <i style={{ background: 'var(--amber)' }} /> Taskings
          </button>
          <button
            type="button"
            className={`map-layer${showLeads ? ' active' : ''}`}
            onClick={() => setShowLeads((value) => !value)}
          >
            <i style={{ background: 'var(--blue)' }} /> Live leads
          </button>
          <button
            type="button"
            className={`map-layer${showGrid ? ' active' : ''}`}
            onClick={() => setShowGrid((value) => !value)}
          >
            <i style={{ background: 'var(--line-hot)' }} /> Grid
          </button>
        </div>
        <div className="map-controls">
          <button type="button" className="btn btn-ghost btn-icon" title="Zoom in" onClick={() => zoomAt(1.35)}>
            <Plus size={14} />
          </button>
          <button type="button" className="btn btn-ghost btn-icon" title="Zoom out" onClick={() => zoomAt(0.74)}>
            <Minus size={14} />
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            title="Reset view"
            onClick={() => {
              setView(FULL);
              setSelectedCountry(null);
              setTip(null);
            }}
          >
            <RotateCcw size={13} />
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            title="Toggle fullscreen"
            onClick={() => {
              if (document.fullscreenElement) void document.exitFullscreen();
              else void wrapRef.current?.requestFullscreen?.();
            }}
          >
            <Maximize2 size={13} />
          </button>
        </div>
      </div>

      <svg
        ref={svgRef}
        className="situation-map"
        viewBox={`${view.x} ${view.y} ${view.w} ${viewHeight}`}
        preserveAspectRatio="xMidYMid slice"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={() => {
          drag.current = null;
          setCursor(null);
          setTip(null);
        }}
        role="img"
        aria-label="World situation map with taskings and live leads"
      >
        <defs>
          <radialGradient id="map-ocean" cx="50%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#0b1416" />
            <stop offset="100%" stopColor="#060a0b" />
          </radialGradient>
          <radialGradient id="pin-glow">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.6" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
          <filter id="pin-shadow" x="-80%" y="-80%" width="260%" height="260%">
            <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#000" floodOpacity="0.8" />
          </filter>
        </defs>
        <rect x="0" y="0" width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#map-ocean)" />
        {showGrid ? (
          <g className="map-grid" pointerEvents="none">
            {[-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150].map((lon) => {
              const [x] = project(lon, 0);
              return <line key={`lon-${lon}`} x1={x} y1={0} x2={x} y2={MAP_HEIGHT} />;
            })}
            {[-60, -30, 0, 30, 60].map((lat) => {
              const [, y] = project(0, lat);
              return <line key={`lat-${lat}`} x1={0} y1={y} x2={MAP_WIDTH} y2={y} />;
            })}
            <line className="equator" x1={0} y1={project(0, 0)[1]} x2={MAP_WIDTH} y2={project(0, 0)[1]} />
          </g>
        ) : null}

        <g className="map-countries">
          {WORLD_SHAPES.map((country) => {
            const activity = countryActivity.get(country.name);
            const selected = selectedCountry === country.name;
            return (
              <path
                key={country.name}
                d={country.d}
                fillRule="evenodd"
                className={`map-country${selected ? ' selected' : ''}${activity ? ' has-activity' : ''}`}
                onMouseEnter={(event) =>
                  showTip(
                    event,
                    country.name,
                    activity
                      ? [
                          `${activity.missions} tasking${activity.missions === 1 ? '' : 's'}`,
                          `${activity.leads} live lead${activity.leads === 1 ? '' : 's'}`,
                          'Double-click to zoom',
                        ]
                      : ['No plotted collection activity', 'Hover countries for placement'],
                    'var(--cyan)',
                  )
                }
                onMouseLeave={() => setTip(null)}
                onClick={() => {
                  if (suppressClick.current) return;
                  setSelectedCountry((current) => (current === country.name ? null : country.name));
                }}
                onDoubleClick={(event) => {
                  event.stopPropagation();
                  const [cx, cy] = project(country.label[0], country.label[1]);
                  setView(clampView({ x: cx - 120, y: cy - 62, w: 240 }));
                  setSelectedCountry(country.name);
                }}
              />
            );
          })}
        </g>

        {showLeads ? (
          <g className="map-leads">
            {leadPins.map((pin) => {
              const selected = selectedLeadId === pin.id;
              return (
                <g
                  key={pin.id}
                  transform={`translate(${pin.x} ${pin.y})`}
                  className={`map-pin lead${selected ? ' selected' : ''}`}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (suppressClick.current) return;
                    onSelectLead?.(pin.lead!);
                  }}
                  onMouseEnter={(event) =>
                    showTip(event, pin.title, [pin.place, pin.detail.slice(0, 140)], pin.tone)
                  }
                  onMouseLeave={() => setTip(null)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Live lead: ${pin.detail}`}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') onSelectLead?.(pin.lead!);
                  }}
                >
                  <rect
                    x={-pinRadius}
                    y={-pinRadius}
                    width={pinRadius * 2}
                    height={pinRadius * 2}
                    transform="rotate(45)"
                    fill={selected ? pin.tone : '#0b1416'}
                    stroke={pin.tone}
                    strokeWidth={1.1}
                  />
                  {selected ? (
                    <circle r={pinRadius * 3.4} fill="none" stroke={pin.tone} strokeOpacity="0.5" strokeDasharray="2 3" />
                  ) : null}
                </g>
              );
            })}
          </g>
        ) : null}

        {showMissions ? (
          <g className="map-missions">
            {missionPins.map((pin) => {
              const active = pin.mission?.status === 'accepted';
              const submitted = pin.mission?.status === 'submitted';
              return (
                <g
                  key={pin.id}
                  transform={`translate(${pin.x} ${pin.y})`}
                  className={`map-pin mission${active ? ' active' : ''}${submitted ? ' submitted' : ''}`}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (suppressClick.current) return;
                    navigate(`/mission/${pin.mission!.id}`);
                  }}
                  onMouseEnter={(event) =>
                    showTip(event, pin.title, [pin.detail, pin.place, `${pin.lat.toFixed(1)}°, ${pin.lon.toFixed(1)}°`], pin.tone)
                  }
                  onMouseLeave={() => setTip(null)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Tasking ${pin.title} at ${pin.place}`}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') navigate(`/mission/${pin.mission!.id}`);
                  }}
                >
                  <circle r={pinRadius * 2.7} className="map-pin-pulse" stroke={pin.tone} />
                  <circle r={pinRadius * 1.45} fill={pin.mission?.status === 'offered' ? '#0b1416' : pin.tone} stroke={pin.tone} />
                  <circle r={pinRadius * 0.45} fill={pin.tone} />
                  {pin.mission?.priority === 'IMMEDIATE' ? (
                    <circle r={pinRadius * 2.3} fill="none" stroke={pin.tone} strokeWidth={1} />
                  ) : null}
                </g>
              );
            })}
          </g>
        ) : null}
      </svg>

      {activePins === 0 ? (
        <div className="map-empty">
          <Crosshair size={20} />
          <span>No geolocated taskings or leads</span>
          <small>Run a scan, or open a tasking with a live anchor.</small>
        </div>
      ) : null}

      {tip ? (
        <div className="map-tip" style={{ left: tip.x, top: tip.y }}>
          <div className="map-tip-title" style={{ color: tip.tone }}>
            {tip.title}
          </div>
          {tip.lines.filter(Boolean).map((line, index) => (
            <div key={index} className="map-tip-line">
              {line}
            </div>
          ))}
        </div>
      ) : null}

      <div className="map-readout">
        <span className="mono">
          {cursor
            ? `${Math.abs(cursor.lat).toFixed(1)}°${cursor.lat >= 0 ? 'N' : 'S'} ${Math.abs(cursor.lon).toFixed(1)}°${cursor.lon >= 0 ? 'E' : 'W'}`
            : 'MOVE CURSOR FOR GRID'}
        </span>
        <span className="map-readout-spacer" />
        {selectedCountry ? <span className="cyan">{selectedCountry}</span> : null}
        <span>{missionPins.length} TASKING PINS</span>
        <span>{leadPins.length} LEADS</span>
        <span className="dim">ZOOM {(MAP_WIDTH / view.w).toFixed(1)}×</span>
      </div>
    </div>
  );
}
