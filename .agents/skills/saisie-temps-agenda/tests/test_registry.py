import importlib.util
import sqlite3
import tempfile
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('registry', Path(__file__).parents[1] / 'scripts' / 'registry.py')
registry = importlib.util.module_from_spec(spec)
spec.loader.exec_module(registry)


class RegistryTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.db = registry.connect(Path(self.tmp.name) / 'test.sqlite')
        self.snapshot = {'title': 'Seen 5630', 'start': '2026-11-02T13:00+01:00', 'end': '2026-11-02T13:45+01:00', 'ticket': '5630'}
        self.target = {'spreadsheet': 'test', 'sheet': 'Seenorest', 'row': 10, 'values': {'E': '0,75'}}
        self.key = ('user', 'calendar', 'occurrence-1')

    def tearDown(self):
        self.db.close()
        self.tmp.cleanup()

    def test_lifecycle_and_no_duplicate(self):
        self.assertEqual(registry.inspect(self.db, *self.key, self.snapshot)['status'], 'unknown')
        registry.prepare(self.db, *self.key, self.snapshot, self.target)
        self.assertEqual(registry.inspect(self.db, *self.key, self.snapshot)['status'], 'pending')
        with self.assertRaises(sqlite3.IntegrityError):
            registry.prepare(self.db, *self.key, self.snapshot, self.target)
        registry.verify(self.db, *self.key)
        self.assertEqual(registry.inspect(self.db, *self.key, self.snapshot)['status'], 'unchanged')
        self.assertEqual(registry.inspect(self.db, *self.key, {**self.snapshot, 'end': 'changed'})['status'], 'changed')
        self.assertEqual(registry.inspect(self.db, 'user', 'calendar', 'occurrence-2', self.snapshot)['status'], 'unknown')

    def test_verify_requires_prepared(self):
        with self.assertRaises(ValueError):
            registry.verify(self.db, *self.key)

    def test_reopen_preserves_pending(self):
        registry.prepare(self.db, *self.key, self.snapshot, self.target)
        path = self.db.execute('PRAGMA database_list').fetchone()[2]
        other = registry.connect(path)
        try:
            self.assertEqual(registry.inspect(other, *self.key, self.snapshot)['status'], 'pending')
        finally:
            other.close()


if __name__ == '__main__':
    unittest.main()
