#!/usr/bin/env python3
"""Restore *your own* custom icon font files from your original source ZIP.

Usage:
  python3 restore_original_icon_fonts.py /path/to/index_jsconcepts_.zip

No browser/server/network needed; this site is entirely local flat files.
"""
from pathlib import Path
import sys,zipfile,hashlib
ROOT=Path(__file__).resolve().parent
DEST=ROOT/'js-concepts'/'smallsetfonts'/'fonts'
PREFIX='index_jsconcepts/recursion_nomemoryleak/smallsetfonts/fonts/'
FONTS=('smallsetfonts.eot','smallsetfonts.woff','smallsetfonts.ttf','smallsetfonts.svg')
def main():
    candidates=[Path(v).expanduser() for v in sys.argv[1:]]
    candidates += [ROOT/'index_jsconcepts_.zip',ROOT.parent/'index_jsconcepts_.zip',Path.home()/'Downloads'/'index_jsconcepts_.zip']
    archive=next((p for p in candidates if p.is_file()),None)
    if not archive:
        raise SystemExit('Your original index_jsconcepts_.zip was not found. Pass its path as the argument.')
    with zipfile.ZipFile(archive) as source:
        names=set(source.namelist())
        missing=[p for p in FONTS if PREFIX+p not in names]
        if missing:raise SystemExit('The source ZIP is missing: '+', '.join(missing))
        DEST.mkdir(parents=True,exist_ok=True)
        for name in FONTS:
            destination=DEST/name
            payload=source.read(PREFIX+name)
            destination.write_bytes(payload)
            print(name, len(payload),'bytes',hashlib.sha256(payload).hexdigest()[:16])
    print('Original icon fonts restored to',DEST)
    print('Open index.html directly; no local HTTP server is needed.')
if __name__=='__main__':main()
