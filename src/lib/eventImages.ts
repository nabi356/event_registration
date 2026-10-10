/**
 * Curated high-resolution thematic images for campus events.
 * Provides rich visual aesthetics for cards, passes, and modals.
 */

export const DEFAULT_EVENT_IMAGES = {
  ai: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
  quantum: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80',
  hackathon: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
  keynote: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
  cultural: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
  cybersecurity: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
  robotics: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=1200&q=80',
  general: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80',
};

export function getEventImage(event?: { name?: string; category?: string; imageUrl?: string } | null): string {
  if (event?.imageUrl && event.imageUrl.trim().length > 0) {
    return event.imageUrl;
  }

  const name = (event?.name || '').toLowerCase();
  const category = (event?.category || '').toLowerCase();
  const combined = `${name} ${category}`;

  if (combined.includes('ai') || combined.includes('artificial') || combined.includes('neural')) {
    return DEFAULT_EVENT_IMAGES.ai;
  }
  if (combined.includes('quantum') || combined.includes('physics') || combined.includes('colloquium')) {
    return DEFAULT_EVENT_IMAGES.quantum;
  }
  if (combined.includes('hack') || combined.includes('code') || combined.includes('dev') || combined.includes('techfest')) {
    return DEFAULT_EVENT_IMAGES.hackathon;
  }
  if (combined.includes('cyber') || combined.includes('security') || combined.includes('crypto')) {
    return DEFAULT_EVENT_IMAGES.cybersecurity;
  }
  if (combined.includes('robot') || combined.includes('automation') || combined.includes('hardware')) {
    return DEFAULT_EVENT_IMAGES.robotics;
  }
  if (combined.includes('cultural') || combined.includes('music') || combined.includes('concert') || combined.includes('night') || combined.includes('fest')) {
    return DEFAULT_EVENT_IMAGES.cultural;
  }
  if (combined.includes('keynote') || combined.includes('summit') || combined.includes('conference') || combined.includes('gala')) {
    return DEFAULT_EVENT_IMAGES.keynote;
  }

  return DEFAULT_EVENT_IMAGES.general;
}
