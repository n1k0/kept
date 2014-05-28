Kept
====

Personal rich notes HTML app inspired by [Google Keep](https://keep.google.com/)
and powered by [React](http://facebook.github.io/react/).

![](http://cl.ly/image/0S2K1D41441M/Screen%20Shot%202014-05-27%20at%2020.36.13.png)

For now, data are stored using `localStorage`. Full mobile compatibility & Sync
are in the pipe.

**This is WiP, don't use it yet.**

Install
-------

Install [Bower](http://bower.io/):

    $ npm install -g bower

Install [Gulp](http://gulpjs.com/):

    $ npm install -g gulp

Install Kept dependencies:

    $ npm install
    $ bower install

The project provide a gulp file to ease the development.
To launch a local server with livereload

    $ gulp

To build a minify version of kept.

    $ gulp dist


Serve index.html. A [working demo is also available online](http://n1k0.github.io/kept/).

**Note:** Kept currently uses the live React JSX parser, which is slow but helpful
while hacking on this project.

License
-------

MIT.
