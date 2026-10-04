#!/usr/bin/env python3
"""Soundtool catalog CLI — list / search / pick tools from the free browser audio toolkit.

Zero dependencies (Python 3.8+ stdlib only).
Every invocation prints the site link: https://soundtool.tools
"""
import argparse
import json
import os
import random
import sys
import webbrowser

SITE = 'https://soundtool.tools'
_CATALOG = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'catalog', 'soundtool-tools.json')


def load():
    with open(_CATALOG, encoding='utf-8') as f:
        return json.load(f)['tools']


def _foot():
    return f'\n  Soundtool — free browser audio tools → {SITE}'


def main(argv=None):
    p = argparse.ArgumentParser(
        prog='soundtool',
        description=f'Browse the Soundtool catalog ({SITE}). '
                    'list | search <query> | random | count | open <slug>')
    p.add_argument('action', nargs='?', default='list',
                   choices=['list', 'search', 'random', 'count', 'open'])
    p.add_argument('query', nargs='*', help='search terms or tool slug')
    args = p.parse_args(argv)

    tools = load()
    q = ' '.join(args.query).strip().lower()

    if args.action == 'count':
        print(len(tools), 'tools')
    elif args.action == 'list':
        for t in tools:
            print(f"  {t['icon']} {t['name']}")
    elif args.action == 'search':
        hits = [t for t in tools if q and (q in t['name'].lower() or q in t['desc'].lower()
                or q in t['category'].lower() or q in t['slug'].lower())]
        if not hits:
            print(f'No tools match "{q}".')
        for t in hits[:20]:
            print(f"  {t['icon']} {t['name']}  ({SITE}/{t['slug']}/)")
        if len(hits) > 20:
            print(f'  ... and {len(hits) - 20} more — see {SITE}')
    elif args.action == 'random':
        t = random.choice(tools)
        print(f"  {t['icon']} {t['name']}")
        print(f"  {t['desc']}")
        print(f"  → {SITE}/{t['slug']}/")
    elif args.action == 'open':
        hit = next((x for x in tools if x['slug'] == q), None)
        if not hit:
            print(f'Unknown slug "{q}". Try: soundtool search <word>')
        else:
            webbrowser.open(f"{SITE}/{hit['slug']}/")
            print(f"  Opening {hit['name']} → {SITE}/{hit['slug']}/")
    print(_foot())


if __name__ == '__main__':
    main()
