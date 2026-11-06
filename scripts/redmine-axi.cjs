#!/usr/bin/env node

const https = require('https');
const http = require('http');
const url = require('url');
const { execSync } = require('child_process');

function getEnvVar(name) {
  if (process.env[name]) return process.env[name];
  if (process.platform === 'win32') {
    try {
      const val = execSync(`powershell -NoProfile -Command "[System.Environment]::GetEnvironmentVariable('${name}', 'User')"`, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore']
      }).trim();
      if (val) return val;
    } catch (e) {}
  }
  return '';
}

const REDMINE_URL = getEnvVar('REDMINE_URL') || 'https://redmine.alter-si.fr';
const REDMINE_API_KEY = getEnvVar('REDMINE_API_KEY');

if (!REDMINE_API_KEY) {
  console.error('[redmine-axi] Erreur : La variable d\'environnement REDMINE_API_KEY n\'est pas definie.');
  console.error('Sous Windows, executez .agents/skills/setup-assistant/scripts/configurer-redmine.bat dans votre propre terminal.');
  process.exit(1);
}

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const fullUrl = new URL(path, REDMINE_URL);
    const client = fullUrl.protocol === 'https:' ? https : http;
    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'X-Redmine-API-Key': REDMINE_API_KEY,
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    };

    const req = client.request(fullUrl, reqOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(body ? JSON.parse(body) : {});
          } catch (e) {
            resolve(body);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body || res.statusMessage}`));
        }
      });
    });

    req.on('error', reject);
    if (options.data) {
      req.write(JSON.stringify(options.data));
    }
    req.end();
  });
}

function printHelp() {
  console.log(`redmine-axi - Interface CLI Redmine pour agents et operateurs

Usage:
  redmine-axi issue view <id> [--notes] [--json]
  redmine-axi issue list [--project <id|identifier>] [--assigned <me|id>] [--status <id>] [--limit <n>]
  redmine-axi issue update <id> [--notes <texte>] [--status <id>] [--assigned <id>]
  redmine-axi project list [--limit <n>]
  redmine-axi user me
`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp();
    return;
  }

  const cmd = args[0];
  const subCmd = args[1];

  try {
    if (cmd === 'user' && subCmd === 'me') {
      const data = await request('/users/current.json');
      console.log(JSON.stringify(data.user, null, 2));
      return;
    }

    if (cmd === 'project' && subCmd === 'list') {
      const data = await request('/projects.json?limit=100');
      console.log(`PROJETS (${data.projects.length}) :`);
      for (const p of data.projects) {
        console.log(`  [${p.id}] ${p.identifier} - ${p.name}`);
      }
      return;
    }

    if (cmd === 'issue') {
      if (subCmd === 'view') {
        const id = args[2];
        if (!id) {
          console.error('[redmine-axi] Erreur : ID de ticket requis. Exemple : redmine-axi issue view 5733');
          process.exit(1);
        }
        const withNotes = args.includes('--notes');
        const asJson = args.includes('--json');

        const params = withNotes ? '?include=journals,attachments,relations' : '?include=attachments,relations';
        const data = await request(`/issues/${id}.json${params}`);
        const issue = data.issue;

        if (asJson) {
          console.log(JSON.stringify(issue, null, 2));
          return;
        }

        console.log(`======================================================================`);
        console.log(`#${issue.id} : ${issue.subject}`);
        console.log(`Projet     : ${issue.project?.name} (id: ${issue.project?.id})`);
        console.log(`Tracker    : ${issue.tracker?.name}`);
        console.log(`Statut     : ${issue.status?.name}`);
        console.log(`Priorite   : ${issue.priority?.name}`);
        console.log(`Auteur     : ${issue.author?.name}`);
        console.log(`Assigne a  : ${issue.assigned_to?.name || 'Non assigne'}`);
        console.log(`Cree le    : ${issue.created_on}`);
        console.log(`Maj le     : ${issue.updated_on}`);
        if (issue.due_date) console.log(`Echeance   : ${issue.due_date}`);
        console.log(`----------------------------------------------------------------------`);
        console.log(`DESCRIPTION :\n${issue.description || '(vide)'}`);

        if (issue.attachments && issue.attachments.length > 0) {
          console.log(`----------------------------------------------------------------------`);
          console.log(`PIECES JOINTES (${issue.attachments.length}) :`);
          for (const att of issue.attachments) {
            console.log(`  - [${att.id}] ${att.filename} (${att.filesize} bytes) -> ${att.content_url}`);
          }
        }

        if (withNotes && issue.journals && issue.journals.length > 0) {
          console.log(`----------------------------------------------------------------------`);
          console.log(`HISTORIQUE / COMMENTAIRES (${issue.journals.length}) :`);
          for (const j of issue.journals) {
            if (j.notes && j.notes.trim()) {
              console.log(`\n  * Le ${j.created_on} par ${j.user?.name} :`);
              console.log(`    ${j.notes.trim().replace(/\n/g, '\n    ')}`);
            }
          }
        }
        console.log(`======================================================================`);
        return;
      }

      if (subCmd === 'list') {
        const queryParams = new URLSearchParams();
        for (let i = 2; i < args.length; i++) {
          if (args[i] === '--project' && args[i+1]) queryParams.set('project_id', args[++i]);
          if (args[i] === '--assigned' && args[i+1]) queryParams.set('assigned_to_id', args[++i]);
          if (args[i] === '--status' && args[i+1]) queryParams.set('status_id', args[++i]);
          if (args[i] === '--limit' && args[i+1]) queryParams.set('limit', args[++i]);
        }
        if (!queryParams.has('limit')) queryParams.set('limit', '25');

        const data = await request(`/issues.json?${queryParams.toString()}`);
        if (args.includes('--json')) {
          console.log(JSON.stringify(data, null, 2));
          return;
        }

        console.log(`TICKETS (${data.total_count || data.issues.length}) :`);
        for (const iss of data.issues) {
          const assignee = iss.assigned_to ? `@${iss.assigned_to.name}` : 'unassigned';
          console.log(`  #${iss.id.toString().padEnd(6)} [${iss.status?.name.padEnd(10)}] [${iss.tracker?.name.padEnd(8)}] ${iss.subject.slice(0, 60)} (${assignee})`);
        }
        return;
      }

      if (subCmd === 'update') {
        const id = args[2];
        if (!id) {
          console.error('[redmine-axi] Erreur : ID de ticket requis.');
          process.exit(1);
        }

        const updatePayload = { issue: {} };
        for (let i = 3; i < args.length; i++) {
          if (args[i] === '--notes' && args[i+1]) updatePayload.issue.notes = args[++i];
          if (args[i] === '--status' && args[i+1]) updatePayload.issue.status_id = parseInt(args[++i], 10);
          if (args[i] === '--assigned' && args[i+1]) updatePayload.issue.assigned_to_id = args[++i] === 'me' ? 'me' : parseInt(args[++i], 10);
        }

        await request(`/issues/${id}.json`, {
          method: 'PUT',
          data: updatePayload
        });
        console.log(`[redmine-axi] Ticket #${id} mis a jour avec succes.`);
        return;
      }
    }

    console.error(`[redmine-axi] Commande inconnue : ${args.join(' ')}`);
    printHelp();
    process.exit(1);
  } catch (err) {
    console.error(`[redmine-axi] Erreur : ${err.message}`);
    process.exit(1);
  }
}

main();
