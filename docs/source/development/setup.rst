Setup
=================


Clone the repo
---------------

```
git clone https://github.com/superstar54/weas
```


Install dependencies
--------------------

```
npm install
```


Run the server
--------------

```
npm start
```
visit http://localhost:8080


Build
-----

```
npm run build
```


Test
----

Unit test
~~~~~~~~

```
npm test
```

End-to-end test
~~~~~~~~~~~~~~~

Use `playwright <https://playwright.dev/docs/intro>`_ for the e2e test.


For the first, one needs to install the dependence.

```
npx playwright install
```

Then run

```
npm run build
npx playwright test
```

If the snapshots need to be updated:

```
npx playwright test --update-snapshots
```
