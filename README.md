# Blueprint Splash Page 2016

## Dev Setup
Make sure you have SASS installed! We use this to make styling easlier (SASS has support for variables, mixins, nesting, etc). You can install it at http://sass-lang.com/install.

In one terminal window, run `make watch` to watch for changes in the `assets/scss` folder. In another terminal window, run `python -m SimpleHTTPServer` to serve `index.html` locally on port 8000. Navigate to `http://localhost:8000` to view the splash page.

## Deploying
Run `git checkout gh-pages` to switch to the `gh-pages` branch from `master`. Run `git merge master` to merge changes in `master` into `gh-pages`. The splash page should then update automatically within a few minutes.

Run `git checkout master` to switch back to the `master` branch and continue development work.
