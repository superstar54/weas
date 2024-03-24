## Web Environment For Atomic Structure (WEAS)

[![npm version](https://img.shields.io/npm/v/weas.svg?style=flat-square)](https://www.npmjs.com/package/weas)
[![Docs status](https://readthedocs.org/projects/weas/badge)](http://weas.readthedocs.io/)
[![Unit test](https://github.com/superstar54/weas/actions/workflows/ci.yml/badge.svg)](https://github.com/superstar54/weas/actions/workflows/ci.yml)

The WEAS package is a JavaScript library designed to visualize and edit atomic structures (molecule, crystal, nanoparticle) in the web environments.

Features:

- Model: space-filling, ball-stick, polyhedral.
- Supported File types: CIF, XYZ, cube.
- Edit structure: move, rotate, delete, and replace atoms.
- Support periodic boundary conditions.
- Animation (view and edit).
- Volumetric data (isosurface).
- Vector fields, e.g., magnetic moment.

Here are some demo pages:

- [Codepen Demo](https://codepen.io/superstar54/full/MWRgKaG)
- ...

### How to use

Please visit: [WEAS Documentation](https://weas.readthedocs.io/en/latest/index.html)

### How to run a demo locally

Clone the repository,

```console
npm install
npm start
```

Then go to the `demo` site.

### Test

```console
npm install
npm test
```

#### End-to-end test

Use [playwright](https://playwright.dev/docs/intro) for the e2e test.

For the first time, one needs to install the dependence.

```
npx playwright install
```

Then run

```
npm run build
npx playwright test
```

Run the test with the title

```
npx playwright test -g "Animation"
```

If the snapshots need to be updated:

```
npx playwright test --update-snapshots
```

### Contact

- Xing Wang <xingwang1991@gmail.com>
