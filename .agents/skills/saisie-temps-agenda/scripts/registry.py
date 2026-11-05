"""Private, per-user occurrence journal. No Google or Redmine access."""
import argparse
import json
import sqlite3
from pathlib import Path


def connect(path):
    db = sqlite3.connect(str(path), timeout=5)
    db.execute("CREATE TABLE IF NOT EXISTS entries (account TEXT NOT NULL, calendar TEXT NOT NULL, event TEXT NOT NULL, snapshot TEXT NOT NULL, target TEXT NOT NULL, state TEXT NOT NULL CHECK(state IN ('prepared', 'verified')), PRIMARY KEY(account, calendar, event))")
    return db


def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':'))


def inspect(db, account, calendar, event, snapshot):
    row = db.execute('SELECT snapshot, target, state FROM entries WHERE account=? AND calendar=? AND event=?', (account, calendar, event)).fetchone()
    if row is None:
        return {'status': 'unknown'}
    old, target, state = row
    return {'status': 'pending' if state == 'prepared' else ('unchanged' if old == canonical(snapshot) else 'changed'), 'target': json.loads(target)}


def prepare(db, account, calendar, event, snapshot, target):
    with db:
        db.execute('INSERT INTO entries VALUES (?, ?, ?, ?, ?, ?)', (account, calendar, event, canonical(snapshot), canonical(target), 'prepared'))


def verify(db, account, calendar, event):
    with db:
        cursor = db.execute("UPDATE entries SET state='verified' WHERE account=? AND calendar=? AND event=? AND state='prepared'", (account, calendar, event))
        if cursor.rowcount != 1:
            raise ValueError('No pending intent to verify')


def main():
    parser = argparse.ArgumentParser(description='Local journal; caller must independently verify Sheets writes.')
    parser.add_argument('--db', required=True, help='Existing private SQLite file outside the repository')
    parser.add_argument('action', choices=['inspect', 'prepare', 'verify'])
    parser.add_argument('--account', required=True)
    parser.add_argument('--calendar', required=True)
    parser.add_argument('--event', required=True)
    parser.add_argument('--snapshot', help='JSON object containing title, start, end and ticket')
    parser.add_argument('--target', help='JSON object containing spreadsheet, sheet, row and approved values')
    args = parser.parse_args()
    path = Path(args.db).expanduser().resolve()
    if not path.is_file():
        parser.error('Create the private registry file explicitly first; missing registry is not an empty history')
    snapshot = json.loads(args.snapshot) if args.snapshot else None
    target = json.loads(args.target) if args.target else None
    if args.action in ('inspect', 'prepare') and (not isinstance(snapshot, dict) or not {'title', 'start', 'end', 'ticket'} <= snapshot.keys()):
        parser.error('snapshot must include title, start, end and ticket')
    if args.action == 'prepare' and (not isinstance(target, dict) or not {'spreadsheet', 'sheet', 'row', 'values'} <= target.keys()):
        parser.error('target must include spreadsheet, sheet, row and values')
    with connect(path) as db:
        if args.action == 'inspect':
            result = inspect(db, args.account, args.calendar, args.event, snapshot)
        elif args.action == 'prepare':
            prepare(db, args.account, args.calendar, args.event, snapshot, target)
            result = {'status': 'prepared'}
        else:
            verify(db, args.account, args.calendar, args.event)
            result = {'status': 'verified'}
    print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()
