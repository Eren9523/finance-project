const fs = require('fs');
let content = fs.readFileSync('cloudflare-worker.js', 'utf8');

const newEndpoints = `
    // --- System Settings API (D1) ---
    if (url.pathname === '/api/admin/system/settings') {
      if (!env || !env.DB) return new Response(JSON.stringify({ success: false, error: "No DB binding" }), { status: 500, headers: corsHeaders });
      if (request.method === 'GET') {
        try {
          const { results } = await env.DB.prepare("SELECT * FROM system_settings").all();
          const settings = {};
          if (results) {
            results.forEach(row => {
              try { settings[row.key] = JSON.parse(row.value); } catch(e) { settings[row.key] = row.value; }
            });
          }
          return new Response(JSON.stringify({ success: true, data: settings }), { headers: corsHeaders });
        } catch (e) {
          return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: corsHeaders });
        }
      }
      if (request.method === 'POST') {
        try {
          const body = await request.json();
          const statements = [];
          for (const key of Object.keys(body)) {
            const value = typeof body[key] === 'object' ? JSON.stringify(body[key]) : String(body[key]);
            statements.push(env.DB.prepare("INSERT INTO system_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?").bind(key, value, value));
          }
          if (statements.length > 0) {
            await env.DB.batch(statements);
          }
          return new Response(JSON.stringify({ success: true, data: body }), { headers: corsHeaders });
        } catch (e) {
          return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: corsHeaders });
        }
      }
    }

    // --- Models API (D1) ---
    if (url.pathname === '/api/admin/models') {
      if (!env || !env.DB) return new Response(JSON.stringify({ success: false, error: "No DB binding" }), { status: 500, headers: corsHeaders });
      
      if (request.method === 'GET') {
        try {
          const { results } = await env.DB.prepare("SELECT * FROM models ORDER BY created_at DESC").all();
          const models = results.map(row => ({
            ...row,
            scenarios: row.scenarios ? JSON.parse(row.scenarios) : [],
            capabilities: row.capabilities ? JSON.parse(row.capabilities) : []
          }));
          return new Response(JSON.stringify({ success: true, data: models }), { headers: corsHeaders });
        } catch (e) {
          return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: corsHeaders });
        }
      }
      
      if (request.method === 'POST') {
        try {
          const body = await request.json();
          const id = body.id || 'm_' + Date.now();
          const scenarios = JSON.stringify(body.scenarios || []);
          const capabilities = JSON.stringify(body.capabilities || []);
          
          await env.DB.prepare("INSERT INTO models (id, name, category, scenarios, capabilities, status) VALUES (?, ?, ?, ?, ?, ?)")
            .bind(id, body.name || '', body.category || '', scenarios, capabilities, body.status || 'Needs Review')
            .run();
            
          return new Response(JSON.stringify({ success: true, data: { ...body, id } }), { headers: corsHeaders });
        } catch (e) {
          return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: corsHeaders });
        }
      }
    }
    
    const modelsMatch = url.pathname.match(/^\\/api\\/admin\\/models\\/(.+)$/);
    if (modelsMatch) {
      const id = modelsMatch[1];
      if (!env || !env.DB) return new Response(JSON.stringify({ success: false, error: "No DB binding" }), { status: 500, headers: corsHeaders });
      
      if (request.method === 'PUT') {
        try {
          const body = await request.json();
          if (body.status) {
            await env.DB.prepare("UPDATE models SET status = ? WHERE id = ?").bind(body.status, id).run();
          }
          // Currently only status update is implemented in UI
          return new Response(JSON.stringify({ success: true, data: { id, ...body } }), { headers: corsHeaders });
        } catch(e) {
          return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: corsHeaders });
        }
      }
      
      if (request.method === 'DELETE') {
        try {
          await env.DB.prepare("DELETE FROM models WHERE id = ?").bind(id).run();
          return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
        } catch(e) {
          return new Response(JSON.stringify({ success: false, error: e.message }), { status: 500, headers: corsHeaders });
        }
      }
    }
`;

const insertIndex = content.indexOf('// POST /api/assistant/test');
if (insertIndex !== -1) {
    content = content.slice(0, insertIndex) + newEndpoints + '\n    ' + content.slice(insertIndex);
    fs.writeFileSync('cloudflare-worker.js', content);
    console.log('Added endpoints to worker');
} else {
    console.log('Could not find insert position');
}
