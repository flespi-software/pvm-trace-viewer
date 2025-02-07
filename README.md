# PVM trace dump viewer

<https://flespi-software.github.io/pvm-trace-viewer/>

## How to upgrade and deploy

* edit source files on the main branch
* commit source files changes on the `main` branch
* switch to branch `gh-pages`:

      git checkout gh-pages

* merge sorce files changes:

      git merge main

* do build:

      yarn build

* commit changes in the `docs/` folder:

      git add docs
      git commit -m build

* push new build:

      git push

* switch back to branch `main`:

      git checkout main

* push changed sources:

      git push
