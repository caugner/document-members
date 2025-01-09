# `Document` members

This repository contains semi-automatically collected data about members of the `Document` interface,
and whether they are available on `HTMLDocument`, `SVGDocument` and `XMLDocument`.

Context: https://github.com/mdn/browser-compat-data/issues/10682

## Structure

### Branches

Each browser has a separate branch (e.g. `firefox`), and the results are in the `result.txt` file.

- [Chrome](https://github.com/caugner/document-members/blame/chrome/result.txt)
- [Firefox](https://github.com/caugner/document-members/blame/firefox/result.txt)
- [IE/Edge](https://github.com/caugner/document-members/blame/edge/result.txt)
- [Opera](https://github.com/caugner/document-members/blame/opera/result.txt)
- [Safari](https://github.com/caugner/document-members/blame/safari/result.txt)

### File

The `result.txt` file has the following structure:

- The first line contains the value of `window.navigator.userAgent`.
- Beginning in the third line, all known `Document` members (as of May 2021) are listed, line by line, preceded by a bit pattern:
    - `000` means the member is not available on any of `HTMLDocument`, `SVGDocument` and `XMLDocument`.
    - `100` means the member is only available on the `HTMLDocument`.
    - `111` means the member is available in `HTMLDocument`, `SVGDocument` and `XMLDocument`.

## Collection

The data was collected by running `node server.js`, and consequently accessing http://localhost:3000/ from all browser versions,
in chronological order, using local QEMU VMs (Safari 1-3), CrossOver (Chrome 1-14, Firefox 1-2), and BrowserStack Live.
