// Eddie+ Streaming Platform - Cloudflare Worker Backend
// Database: D1 (eddie-plus-db)

const ADMIN_SECRET = 'CHANGE_THIS_SECRET_IN_PRODUCTION';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const respond = (data, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });

    const error = (msg, status = 400) => respond({ error: msg }, status);

    // Auth helper
    const getSession = async (req) => {
      const auth = req.headers.get('Authorization') || '';
      const token = auth.replace('Bearer ', '');
      if (!token) return null;
      const session = await env.DB.prepare(
        'SELECT s.*, u.role, u.email, u.username FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = ? AND s.expires_at > ?'
      ).bind(token, Math.floor(Date.now() / 1000)).first();
      return session;
    };

    const requireAuth = async (req) => {
      const s = await getSession(req);
      if (!s) throw new Error('Unauthorized');
      return s;
    };

    const requireAdmin = async (req) => {
      const s = await requireAuth(req);
      if (s.role !== 'admin') throw new Error('Forbidden');
      return s;
    };

    const generateId = () => crypto.randomUUID();

    try {
      // ── AUTH ──────────────────────────────────────────────
      if (path === '/api/auth/signup' && request.method === 'POST') {
        const { email, password, username } = await request.json();
        if (!email || !password || !username) return error('Missing fields');

        const exists = await env.DB.prepare('SELECT id FROM users WHERE email = ? OR username = ?').bind(email, username).first();
        if (exists) return error('Email or username already taken');

        const hash = await hashPassword(password);
        const id = generateId();
        await env.DB.prepare('INSERT INTO users (id, email, password_hash, username, role) VALUES (?, ?, ?, ?, ?)').bind(id, email, hash, username, 'user').run();

        // Create default profile
        const profileId = generateId();
        await env.DB.prepare('INSERT INTO profiles (id, user_id, name) VALUES (?, ?, ?)').bind(profileId, id, username).run();

        const token = generateId();
        const expires = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
        await env.DB.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').bind(token, id, expires).run();

        return respond({ token, userId: id, username, role: 'user' });
      }

      if (path === '/api/auth/login' && request.method === 'POST') {
        const { email, password } = await request.json();
        const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
        if (!user) return error('Invalid credentials', 401);

        const valid = await verifyPassword(password, user.password_hash);
        if (!valid) return error('Invalid credentials', 401);

        const token = generateId();
        const expires = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
        await env.DB.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').bind(token, user.id, expires).run();

        return respond({ token, userId: user.id, username: user.username, role: user.role });
      }

      if (path === '/api/auth/logout' && request.method === 'POST') {
        const auth = request.headers.get('Authorization') || '';
        const token = auth.replace('Bearer ', '');
        await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(token).run();
        return respond({ success: true });
      }

      if (path === '/api/auth/me' && request.method === 'GET') {
        const session = await getSession(request);
        if (!session) return error('Unauthorized', 401);
        return respond({ userId: session.user_id, username: session.username, email: session.email, role: session.role });
      }

      // ── PROFILES ──────────────────────────────────────────
      if (path === '/api/profiles' && request.method === 'GET') {
        const session = await requireAuth(request);
        const profiles = await env.DB.prepare('SELECT * FROM profiles WHERE user_id = ?').bind(session.user_id).all();
        return respond(profiles.results);
      }

      if (path === '/api/profiles' && request.method === 'POST') {
        const session = await requireAuth(request);
        const { name, avatar, pin, kids_mode } = await request.json();
        const existing = await env.DB.prepare('SELECT COUNT(*) as c FROM profiles WHERE user_id = ?').bind(session.user_id).first();
        if (existing.c >= 5) return error('Max 5 profiles');
        const id = generateId();
        await env.DB.prepare('INSERT INTO profiles (id, user_id, name, avatar, pin, kids_mode) VALUES (?, ?, ?, ?, ?, ?)').bind(id, session.user_id, name, avatar || '', pin || '', kids_mode ? 1 : 0).run();
        return respond({ id, name, avatar, kids_mode });
      }

      if (path.startsWith('/api/profiles/') && request.method === 'PUT') {
        const session = await requireAuth(request);
        const profileId = path.split('/')[3];
        const { name, avatar, pin, kids_mode } = await request.json();
        await env.DB.prepare('UPDATE profiles SET name=?, avatar=?, pin=?, kids_mode=? WHERE id=? AND user_id=?').bind(name, avatar, pin || '', kids_mode ? 1 : 0, profileId, session.user_id).run();
        return respond({ success: true });
      }

      if (path.startsWith('/api/profiles/') && request.method === 'DELETE') {
        const session = await requireAuth(request);
        const profileId = path.split('/')[3];
        await env.DB.prepare('DELETE FROM profiles WHERE id=? AND user_id=?').bind(profileId, session.user_id).run();
        return respond({ success: true });
      }

      // ── CONTENT (Public) ──────────────────────────────────
      if (path === '/api/content' && request.method === 'GET') {
        const type = url.searchParams.get('type');
        const genre = url.searchParams.get('genre');
        const featured = url.searchParams.get('featured');
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const offset = parseInt(url.searchParams.get('offset') || '0');

        let query = "SELECT * FROM content WHERE status='published'";
        const params = [];
        if (type) { query += " AND type=?"; params.push(type); }
        if (genre) { query += " AND genres LIKE ?"; params.push(`%${genre}%`); }
        if (featured === '1') { query += " AND featured=1 ORDER BY featured_order ASC"; }
        else { query += " ORDER BY created_at DESC"; }
        query += ` LIMIT ${limit} OFFSET ${offset}`;

        const stmt = env.DB.prepare(query);
        const results = params.length ? await stmt.bind(...params).all() : await stmt.all();
        return respond(results.results.map(parseContent));
      }

      if (path.startsWith('/api/content/') && !path.includes('/admin') && request.method === 'GET') {
        const slug = path.split('/')[3];
        const content = await env.DB.prepare("SELECT * FROM content WHERE slug=? AND status='published'").bind(slug).first();
        if (!content) return error('Not found', 404);

        const parsed = parseContent(content);

        if (content.type === 'show') {
          const seasons = await env.DB.prepare('SELECT * FROM seasons WHERE content_id=? ORDER BY season_number').bind(content.id).all();
          const episodes = await env.DB.prepare("SELECT * FROM episodes WHERE content_id=? AND status='published' ORDER BY season_id, episode_number").bind(content.id).all();
          parsed.seasons = seasons.results;
          parsed.episodes = episodes.results;
        }

        return respond(parsed);
      }

      // ── SEARCH ────────────────────────────────────────────
      if (path === '/api/search' && request.method === 'GET') {
        const q = url.searchParams.get('q') || '';
        if (!q) return respond([]);
        const results = await env.DB.prepare(
          "SELECT * FROM content WHERE status='published' AND (title LIKE ? OR description LIKE ? OR tags LIKE ?) LIMIT 20"
        ).bind(`%${q}%`, `%${q}%`, `%${q}%`).all();
        return respond(results.results.map(parseContent));
      }

      // ── COLLECTIONS ───────────────────────────────────────
      if (path === '/api/collections' && request.method === 'GET') {
        const collections = await env.DB.prepare("SELECT * FROM collections WHERE status='published' ORDER BY display_order").all();
        return respond(collections.results);
      }

      if (path.startsWith('/api/collections/') && request.method === 'GET') {
        const slug = path.split('/')[3];
        const col = await env.DB.prepare("SELECT * FROM collections WHERE slug=?").bind(slug).first();
        if (!col) return error('Not found', 404);
        const ids = JSON.parse(col.content_ids || '[]');
        let items = [];
        if (ids.length) {
          const placeholders = ids.map(() => '?').join(',');
          const results = await env.DB.prepare(`SELECT * FROM content WHERE id IN (${placeholders}) AND status='published'`).bind(...ids).all();
          items = results.results.map(parseContent);
        }
        return respond({ ...col, items });
      }

      // ── WATCHLIST ─────────────────────────────────────────
      if (path === '/api/watchlist' && request.method === 'GET') {
        const session = await requireAuth(request);
        const profileId = url.searchParams.get('profile_id');
        const items = await env.DB.prepare(
          'SELECT w.*, c.title, c.slug, c.type, c.poster_url, c.backdrop_url, c.genres, c.rating FROM watchlist w JOIN content c ON w.content_id = c.id WHERE w.profile_id=? ORDER BY w.added_at DESC'
        ).bind(profileId).all();
        return respond(items.results);
      }

      if (path === '/api/watchlist' && request.method === 'POST') {
        const session = await requireAuth(request);
        const { profile_id, content_id } = await request.json();
        const id = generateId();
        await env.DB.prepare('INSERT OR IGNORE INTO watchlist (id, profile_id, content_id) VALUES (?, ?, ?)').bind(id, profile_id, content_id).run();
        return respond({ success: true });
      }

      if (path.startsWith('/api/watchlist/') && request.method === 'DELETE') {
        const session = await requireAuth(request);
        const id = path.split('/')[3];
        await env.DB.prepare('DELETE FROM watchlist WHERE id=?').bind(id).run();
        return respond({ success: true });
      }

      // ── WATCH HISTORY ─────────────────────────────────────
      if (path === '/api/history' && request.method === 'POST') {
        const session = await requireAuth(request);
        const { profile_id, content_id, episode_id, progress, duration } = await request.json();
        const existing = await env.DB.prepare('SELECT id FROM watch_history WHERE profile_id=? AND content_id=? AND episode_id=?').bind(profile_id, content_id, episode_id || '').first();
        if (existing) {
          await env.DB.prepare('UPDATE watch_history SET progress=?, watched_at=? WHERE id=?').bind(progress, Math.floor(Date.now() / 1000), existing.id).run();
        } else {
          await env.DB.prepare('INSERT INTO watch_history (id, profile_id, content_id, episode_id, progress, duration) VALUES (?,?,?,?,?,?)').bind(generateId(), profile_id, content_id, episode_id || '', progress, duration).run();
        }
        return respond({ success: true });
      }

      // ── ADMIN ─────────────────────────────────────────────
      if (path.startsWith('/api/admin')) {
        const session = await requireAdmin(request);

        // List all content (including drafts/scheduled)
        if (path === '/api/admin/content' && request.method === 'GET') {
          const all = await env.DB.prepare('SELECT * FROM content ORDER BY created_at DESC').all();
          return respond(all.results.map(parseContent));
        }

        // Create content
        if (path === '/api/admin/content' && request.method === 'POST') {
          const data = await request.json();
          const id = data.id || generateId();
          const slug = data.slug || slugify(data.title);

          await env.DB.prepare(`INSERT INTO content (
            id, type, title, slug, description, long_description, tagline,
            logo_url, poster_url, backdrop_url, trailer_url, teaser_url, video_url,
            duration, release_year, release_date, scheduled_release, rating,
            genres, cast_members, crew, tags, badges, custom_font, custom_color,
            play_icon, progress_bar_style, custom_tabs, collection_id,
            season_count, episode_count, status, featured, featured_order,
            is_new, is_4k, is_hdr, is_dolby, age_rating, country, language
          ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
          `).bind(
            id, data.type, data.title, slug,
            data.description || '', data.long_description || '', data.tagline || '',
            data.logo_url || '', data.poster_url || '', data.backdrop_url || '',
            data.trailer_url || '', data.teaser_url || '', data.video_url || '',
            data.duration || 0, data.release_year || null, data.release_date || '',
            data.scheduled_release || '', data.rating || '',
            JSON.stringify(data.genres || []), JSON.stringify(data.cast_members || []),
            JSON.stringify(data.crew || []), JSON.stringify(data.tags || []),
            JSON.stringify(data.badges || []),
            data.custom_font || '', data.custom_color || '',
            data.play_icon || '', data.progress_bar_style || 'default',
            JSON.stringify(data.custom_tabs || []), data.collection_id || '',
            data.season_count || 0, data.episode_count || 0,
            data.status || 'published', data.featured ? 1 : 0, data.featured_order || 0,
            data.is_new ? 1 : 0, data.is_4k ? 1 : 0, data.is_hdr ? 1 : 0, data.is_dolby ? 1 : 0,
            data.age_rating || '', data.country || '', data.language || 'en'
          ).run();

          return respond({ id, slug });
        }

        // Update content
        if (path.startsWith('/api/admin/content/') && request.method === 'PUT') {
          const id = path.split('/')[4];
          const data = await request.json();
          await env.DB.prepare(`UPDATE content SET
            type=?, title=?, slug=?, description=?, long_description=?, tagline=?,
            logo_url=?, poster_url=?, backdrop_url=?, trailer_url=?, teaser_url=?, video_url=?,
            duration=?, release_year=?, release_date=?, scheduled_release=?, rating=?,
            genres=?, cast_members=?, crew=?, tags=?, badges=?, custom_font=?, custom_color=?,
            play_icon=?, progress_bar_style=?, custom_tabs=?, collection_id=?,
            season_count=?, episode_count=?, status=?, featured=?, featured_order=?,
            is_new=?, is_4k=?, is_hdr=?, is_dolby=?, age_rating=?, country=?, language=?,
            updated_at=strftime('%s','now')
            WHERE id=?
          `).bind(
            data.type, data.title, data.slug || slugify(data.title),
            data.description || '', data.long_description || '', data.tagline || '',
            data.logo_url || '', data.poster_url || '', data.backdrop_url || '',
            data.trailer_url || '', data.teaser_url || '', data.video_url || '',
            data.duration || 0, data.release_year || null, data.release_date || '',
            data.scheduled_release || '', data.rating || '',
            JSON.stringify(data.genres || []), JSON.stringify(data.cast_members || []),
            JSON.stringify(data.crew || []), JSON.stringify(data.tags || []),
            JSON.stringify(data.badges || []),
            data.custom_font || '', data.custom_color || '',
            data.play_icon || '', data.progress_bar_style || 'default',
            JSON.stringify(data.custom_tabs || []), data.collection_id || '',
            data.season_count || 0, data.episode_count || 0,
            data.status || 'published', data.featured ? 1 : 0, data.featured_order || 0,
            data.is_new ? 1 : 0, data.is_4k ? 1 : 0, data.is_hdr ? 1 : 0, data.is_dolby ? 1 : 0,
            data.age_rating || '', data.country || '', data.language || 'en',
            id
          ).run();
          return respond({ success: true });
        }

        // Delete content
        if (path.startsWith('/api/admin/content/') && request.method === 'DELETE') {
          const id = path.split('/')[4];
          await env.DB.prepare('DELETE FROM content WHERE id=?').bind(id).run();
          return respond({ success: true });
        }

        // Episodes
        if (path === '/api/admin/episodes' && request.method === 'POST') {
          const data = await request.json();
          const id = generateId();
          await env.DB.prepare('INSERT INTO episodes (id, content_id, season_id, episode_number, title, description, thumbnail_url, video_url, duration, release_date, scheduled_release, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').bind(
            id, data.content_id, data.season_id, data.episode_number, data.title,
            data.description || '', data.thumbnail_url || '', data.video_url || '',
            data.duration || 0, data.release_date || '', data.scheduled_release || '',
            data.status || 'published'
          ).run();
          return respond({ id });
        }

        if (path.startsWith('/api/admin/episodes/') && request.method === 'PUT') {
          const id = path.split('/')[4];
          const data = await request.json();
          await env.DB.prepare('UPDATE episodes SET title=?, description=?, thumbnail_url=?, video_url=?, duration=?, release_date=?, scheduled_release=?, status=?, episode_number=? WHERE id=?').bind(
            data.title, data.description || '', data.thumbnail_url || '', data.video_url || '',
            data.duration || 0, data.release_date || '', data.scheduled_release || '',
            data.status || 'published', data.episode_number, id
          ).run();
          return respond({ success: true });
        }

        if (path.startsWith('/api/admin/episodes/') && request.method === 'DELETE') {
          const id = path.split('/')[4];
          await env.DB.prepare('DELETE FROM episodes WHERE id=?').bind(id).run();
          return respond({ success: true });
        }

        // Seasons
        if (path === '/api/admin/seasons' && request.method === 'POST') {
          const data = await request.json();
          const id = generateId();
          await env.DB.prepare('INSERT INTO seasons (id, content_id, season_number, title, poster_url, description, release_year) VALUES (?,?,?,?,?,?,?)').bind(
            id, data.content_id, data.season_number, data.title || '', data.poster_url || '', data.description || '', data.release_year || null
          ).run();
          return respond({ id });
        }

        // Collections CRUD
        if (path === '/api/admin/collections' && request.method === 'POST') {
          const data = await request.json();
          const id = generateId();
          const slug = data.slug || slugify(data.title);
          await env.DB.prepare('INSERT INTO collections (id, title, slug, description, poster_url, backdrop_url, content_ids, display_order, status) VALUES (?,?,?,?,?,?,?,?,?)').bind(
            id, data.title, slug, data.description || '', data.poster_url || '', data.backdrop_url || '',
            JSON.stringify(data.content_ids || []), data.display_order || 0, data.status || 'published'
          ).run();
          return respond({ id, slug });
        }

        if (path.startsWith('/api/admin/collections/') && request.method === 'PUT') {
          const id = path.split('/')[4];
          const data = await request.json();
          await env.DB.prepare('UPDATE collections SET title=?, slug=?, description=?, poster_url=?, backdrop_url=?, content_ids=?, display_order=?, status=? WHERE id=?').bind(
            data.title, data.slug || slugify(data.title), data.description || '', data.poster_url || '',
            data.backdrop_url || '', JSON.stringify(data.content_ids || []), data.display_order || 0, data.status || 'published', id
          ).run();
          return respond({ success: true });
        }

        if (path.startsWith('/api/admin/collections/') && request.method === 'DELETE') {
          const id = path.split('/')[4];
          await env.DB.prepare('DELETE FROM collections WHERE id=?').bind(id).run();
          return respond({ success: true });
        }

        // Admin: list users
        if (path === '/api/admin/users' && request.method === 'GET') {
          const users = await env.DB.prepare('SELECT id, email, username, role, created_at, subscription FROM users ORDER BY created_at DESC').all();
          return respond(users.results);
        }

        // Admin: promote user
        if (path.startsWith('/api/admin/users/') && request.method === 'PUT') {
          const id = path.split('/')[4];
          const { role } = await request.json();
          await env.DB.prepare('UPDATE users SET role=? WHERE id=?').bind(role, id).run();
          return respond({ success: true });
        }

        // Admin: stats
        if (path === '/api/admin/stats' && request.method === 'GET') {
          const [users, content, watchlist, history] = await Promise.all([
            env.DB.prepare('SELECT COUNT(*) as c FROM users').first(),
            env.DB.prepare('SELECT COUNT(*) as c, type FROM content GROUP BY type').all(),
            env.DB.prepare('SELECT COUNT(*) as c FROM watchlist').first(),
            env.DB.prepare('SELECT COUNT(*) as c FROM watch_history').first(),
          ]);
          return respond({ users: users.c, content: content.results, watchlist: watchlist.c, watches: history.c });
        }
      }

      return error('Not found', 404);
    } catch (err) {
      if (err.message === 'Unauthorized') return error('Unauthorized', 401);
      if (err.message === 'Forbidden') return error('Forbidden', 403);
      console.error(err);
      return error('Internal server error', 500);
    }
  }
};

// ── HELPERS ──────────────────────────────────────────────────
function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function parseContent(c) {
  return {
    ...c,
    genres: tryParse(c.genres, []),
    cast_members: tryParse(c.cast_members, []),
    crew: tryParse(c.crew, []),
    tags: tryParse(c.tags, []),
    badges: tryParse(c.badges, []),
    custom_tabs: tryParse(c.custom_tabs, []),
  };
}

function tryParse(str, fallback) {
  try { return JSON.parse(str); } catch { return fallback; }
}

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

async function verifyPassword(password, hash) {
  const computed = await hashPassword(password);
  return computed === hash;
}
