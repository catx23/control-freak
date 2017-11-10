"use strict";
/*!
 * serve-index
 * Copyright(c) 2011 Sencha Inc.
 * Copyright(c) 2011 TJ Holowaychuk
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * Copyright(c) 2016 Shilong Jiang
 * MIT Licensed
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Module dependencies.
 * @private
 */
const accepts = require('accepts');
const createError = require('http-errors');
const debug = require('debug')('serve-index');
const escapeHtml = require('escape-html');
const fs = require('mz/fs');
const _fs = require('fs');
const path = require('path');
const normalize = path.normalize;
const sep = path.sep;
const extname = path.extname;
const join = path.join;
const mime = require('mime-types');
const parseUrl = require('parseurl');
const resolve = require('path').resolve;
const Promise = require('bluebird');
const co = require('co');
/**
 * Module exports.
 * @public
 */
// module.exports = serveIndex;
/*!
 * Icon cache.
 */
const cache = {};
/*!
 * Default template.
 */
const defaultTemplate = join(__dirname, 'public', 'directory.html');
/*!
 * Stylesheet.
 */
const defaultStylesheet = join(__dirname, 'public', 'style.css');
/**
 * Media types and the map for content negotiation.
 */
const mediaTypes = [
    'text/html',
    'text/plain',
    'application/json'
];
const mediaType = {
    'text/html': 'html',
    'text/plain': 'plain',
    'application/json': 'json'
};
/**
 * Serve directory listings with the given `root` path.
 *
 * See Readme.md for documentation of options.
 *
 * @param {String} root
 * @param {Object} options
 * @return {Function} middleware
 * @public
 */
function serveIndex(root, options) {
    const opts = options || {};
    // root required
    if (!root) {
        throw new TypeError('serveIndex() root path required');
    }
    // resolve root to absolute and normalize
    const rootPath = normalize(resolve(root) + sep);
    const filter = opts.filter;
    const hidden = opts.hidden;
    const icons = opts.icons;
    const stylesheet = opts.stylesheet || defaultStylesheet;
    const template = opts.template || defaultTemplate;
    const view = opts.view || 'tiles';
    const remove = opts.remove || "";
    return function (ctx, next) {
        return co(function* () {
            if (ctx.method !== 'GET' && ctx.method !== 'HEAD') {
                ctx.status = 'OPTIONS' === ctx.method ? 200 : 405;
                ctx.set('Allow', 'GET, HEAD, OPTIONS');
                ctx.set('Content-Length', '0');
                return;
            }
            // parse URLs
            const url = parseUrl(ctx);
            const originalUrl = parseUrl.original(ctx);
            let dir = decodeURIComponent(url.pathname);
            dir = dir.replace(remove, '');
            let originalDir = decodeURIComponent(originalUrl.pathname);
            originalDir = originalDir.replace(remove, '');
            // join / normalize from root dir
            const path = normalize(join(rootPath, dir));
            /*
            console.log('p ', path);
            console.log('dir ', dir);
            console.log('rootPath ', rootPath);
            console.log('ori  ', originalDir);
            console.log('remove  ', remove);
            */
            // null byte(s), bad request
            if (path.indexOf('\0') !== -1) {
                throw createError(400);
            }
            // malicious path
            if ((path + sep).substr(0, rootPath.length) !== rootPath) {
                debug('malicious path "%s"', path);
                throw createError(403);
            }
            // determine ".." display
            const showUp = normalize(resolve(path) + sep) !== rootPath;
            // check if we have a directory
            debug('stat "%s"', path);
            let stat;
            try {
                stat = yield fs.stat(path);
            }
            catch (err) {
                if (err.code === 'ENOENT') {
                    yield next();
                    return;
                }
                err.status = err.code === 'ENAMETOOLONG'
                    ? 414
                    : 404;
                throw err;
            }
            if (!stat.isDirectory()) {
                yield next();
                return;
            }
            // fetch files
            debug('readdir "%s"', path);
            let files = yield fs.readdir(path);
            if (!hidden) {
                files = removeHidden(files);
            }
            if (filter) {
                files = files.filter((filename, index, list) => {
                    return filter(filename, index, list, path);
                });
            }
            files.sort();
            // content-negotiation
            const accept = accepts(ctx.req);
            const type = accept.type(mediaTypes);
            // not acceptable
            if (!type) {
                throw createError(406);
            }
            yield serveIndex[mediaType[type]](ctx, files, next, originalDir || remove, showUp, icons, path, view, template, stylesheet);
        });
    };
}
exports.serveIndex = serveIndex;
/**
 * Respond with text/html.
 */
serveIndex['html'] = function _html(ctx, files, next, dir, showUp, icons, path, view, template, stylesheet) {
    return co(function* () {
        const render = typeof template !== 'function'
            ? createHtmlRender(template)
            : Promise.promisify(template);
        if (showUp) {
            files.unshift('..');
        }
        // stat all files
        const stats = yield stat(path, files);
        // combine the stats into the file list
        const fileList = files.map((file, i) => {
            return { name: file, stat: stats[i] };
        });
        // sort file list
        fileList.sort(fileSort);
        // read stylesheet
        const style = yield fs.readFile(stylesheet, 'utf8');
        // create locals for rendering
        const locals = {
            directory: dir,
            displayIcons: Boolean(icons),
            fileList,
            path,
            style,
            viewName: view
        };
        // render html
        const body = yield render(locals);
        const buf = new Buffer(body, 'utf8');
        ctx.set('Content-Type', 'text/html; charset=utf-8');
        ctx.set('Content-Length', buf.length);
        ctx.body = buf;
    });
};
/**
 * Respond with application/json.
 */
serveIndex['json'] = function _json(ctx, files) {
    return co(function* () {
        const body = JSON.stringify(files);
        const buf = new Buffer(body, 'utf8');
        ctx.set('Content-Type', 'application/json; charset=utf-8');
        ctx.set('Content-Length', buf.length);
        ctx.body = buf;
    });
};
/**
 * Respond with text/plain.
 */
serveIndex['plain'] = function _plain(ctx, files) {
    return co(function* () {
        const body = files.join('\n') + '\n';
        const buf = new Buffer(body, 'utf8');
        ctx.set('Content-Type', 'text/plain; charset=utf-8');
        ctx.set('Content-Length', buf.length);
        ctx.body = buf;
    });
};
/**
 * Map html `files`, returning an html unordered list.
 * @private
 */
function createHtmlFileList(files, dir, useIcons, view) {
    let html = '<ul id="files" class="view-' + escapeHtml(view) + '">'
        + (view === 'details' ? ('<li class="header">'
            + '<span class="name">Name</span>'
            + '<span class="size">Size</span>'
            + '<span class="date">Modified</span>'
            + '</li>') : '');
    html += files.map((file) => {
        const classes = [];
        const isDir = file.stat && file.stat.isDirectory();
        const path = dir.split('/').map((c) => encodeURIComponent(c));
        if (useIcons) {
            classes.push('icon');
            if (isDir) {
                classes.push('icon-directory');
            }
            else {
                const ext = extname(file.name);
                const icon = iconLookup(file.name);
                classes.push('icon');
                classes.push('icon-' + ext.substring(1));
                if (classes.indexOf(icon.className) === -1) {
                    classes.push(icon.className);
                }
            }
        }
        path.push(encodeURIComponent(file.name));
        const date = file.stat && file.name !== '..'
            ? file.stat.mtime.toLocaleDateString() + ' ' + file.stat.mtime.toLocaleTimeString()
            : '';
        const size = file.stat && !isDir
            ? file.stat.size
            : '';
        return '<li><a href="'
            + escapeHtml(normalizeSlashes(normalize(path.join('/'))))
            + '" class="' + escapeHtml(classes.join(' ')) + '"'
            + ' title="' + escapeHtml(file.name) + '">'
            + '<span class="name">' + escapeHtml(file.name) + '</span>'
            + '<span class="size">' + escapeHtml(size) + '</span>'
            + '<span class="date">' + escapeHtml(date) + '</span>'
            + '</a></li>';
    }).join('\n');
    html += '</ul>';
    return html;
}
/**
 * Create function to render html.
 */
function createHtmlRender(template) {
    return function render(locals) {
        return co(function* () {
            // read template
            const str = yield fs.readFile(template, 'utf8');
            return str
                .replace(/\{style\}/g, locals.style.concat(iconStyle(locals.fileList, locals.displayIcons)))
                .replace(/\{files\}/g, createHtmlFileList(locals.fileList, locals.directory, locals.displayIcons, locals.viewName))
                .replace(/\{directory\}/g, escapeHtml(locals.directory))
                .replace(/\{linked-path\}/g, htmlPath(locals.directory));
        });
    };
}
/**
 * Sort function for with directories first.
 */
function fileSort(a, b) {
    // sort ".." to the top
    if (a.name === '..' || b.name === '..') {
        return a.name === b.name ? 0
            : a.name === '..' ? -1 : 1;
    }
    return Number(b.stat && b.stat.isDirectory()) - Number(a.stat && a.stat.isDirectory()) ||
        String(a.name).toLocaleLowerCase().localeCompare(String(b.name).toLocaleLowerCase());
}
/**
 * Map html `dir`, returning a linked path.
 */
function htmlPath(dir) {
    const parts = dir.split('/');
    const crumb = new Array(parts.length);
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (part) {
            parts[i] = encodeURIComponent(part);
            crumb[i] = '<a href="' + escapeHtml(parts.slice(0, i + 1).join('/')) + '">' + escapeHtml(part) + '</a>';
        }
    }
    return crumb.join(' / ');
}
/**
 * Get the icon data for the file name.
 */
function iconLookup(filename) {
    const ext = extname(filename);
    // try by extension
    if (icons[ext]) {
        return {
            className: 'icon-' + ext.substring(1),
            fileName: icons[ext]
        };
    }
    const mimetype = mime.lookup(ext);
    // default if no mime type
    if (mimetype === false) {
        return {
            className: 'icon-default',
            fileName: icons.default
        };
    }
    // try by mime type
    if (icons[mimetype]) {
        return {
            className: 'icon-' + mimetype.replace('/', '-'),
            fileName: icons[mimetype]
        };
    }
    const suffix = mimetype.split('+')[1];
    if (suffix && icons['+' + suffix]) {
        return {
            className: 'icon-' + suffix,
            fileName: icons['+' + suffix]
        };
    }
    const type = mimetype.split('/')[0];
    // try by type only
    if (icons[type]) {
        return {
            className: 'icon-' + type,
            fileName: icons[type]
        };
    }
    return {
        className: 'icon-default',
        fileName: icons.default
    };
}
/**
 * Load icon images, return css string.
 */
function iconStyle(files, useIcons) {
    if (!useIcons) {
        return '';
    }
    let i;
    let iconName;
    const list = [];
    const rules = {};
    let selector;
    const selectors = {};
    let style = '';
    for (i = 0; i < files.length; i++) {
        const file = files[i];
        const isDir = file.stat && file.stat.isDirectory();
        const icon = isDir
            ? { className: 'icon-directory', fileName: icons.folder }
            : iconLookup(file.name);
        const iconName = icon.fileName;
        selector = '#files .' + icon.className + ' .name';
        if (!rules[iconName]) {
            rules[iconName] = 'background-image: url(data:image/png;base64,' + load(iconName) + ');';
            selectors[iconName] = [];
            list.push(iconName);
        }
        if (selectors[iconName].indexOf(selector) === -1) {
            selectors[iconName].push(selector);
        }
    }
    for (i = 0; i < list.length; i++) {
        iconName = list[i];
        style += selectors[iconName].join(',\n') + ' {\n  ' + rules[iconName] + '\n}\n';
    }
    return style;
}
/**
 * Load and cache the given `icon`.
 *
 * @param {String} icon
 * @return {String}
 * @api private
 */
function load(icon) {
    if (cache[icon])
        return cache[icon];
    cache[icon] = fs.readFileSync(__dirname + '/public/icons/' + icon, 'base64');
    return cache[icon];
}
/**
 * Normalizes the path separator from system separator
 * to URL separator, aka `/`.
 *
 * @param {String} path
 * @return {String}
 * @api private
 */
function normalizeSlashes(path) {
    return path.split(sep).join('/');
}
/**
 * Filter "hidden" `files`, aka files
 * beginning with a `.`.
 *
 * @param {Array} files
 * @return {Array}
 * @api private
 */
function removeHidden(files) {
    return files.filter((file) => {
        return '.' !== file[0];
    });
}
/**
 * Stat all files and return array of stat
 * in same order.
 */
function stat(dir, files) {
    return Promise.map(files, file => {
        return new Promise((resolve, reject) => {
            _fs.stat(join(dir, file), (err, stat) => {
                if (err && err.code !== 'ENOENT')
                    reject(err);
                // pass ENOENT as null stat, not error
                resolve(stat || null);
            });
        });
    }, { concurrency: 10 });
}
/**
 * Icon map.
 */
const icons = {
    // base icons
    'default': 'page_white.png',
    'folder': 'folder.png',
    // generic mime type icons
    'image': 'image.png',
    'text': 'page_white_text.png',
    'video': 'film.png',
    // generic mime suffix icons
    '+json': 'page_white_code.png',
    '+xml': 'page_white_code.png',
    '+zip': 'box.png',
    // specific mime type icons
    'application/font-woff': 'font.png',
    'application/javascript': 'page_white_code_red.png',
    'application/json': 'page_white_code.png',
    'application/msword': 'page_white_word.png',
    'application/pdf': 'page_white_acrobat.png',
    'application/postscript': 'page_white_vector.png',
    'application/rtf': 'page_white_word.png',
    'application/vnd.ms-excel': 'page_white_excel.png',
    'application/vnd.ms-powerpoint': 'page_white_powerpoint.png',
    'application/vnd.oasis.opendocument.presentation': 'page_white_powerpoint.png',
    'application/vnd.oasis.opendocument.spreadsheet': 'page_white_excel.png',
    'application/vnd.oasis.opendocument.text': 'page_white_word.png',
    'application/x-7z-compressed': 'box.png',
    'application/x-sh': 'application_xp_terminal.png',
    'application/x-font-ttf': 'font.png',
    'application/x-msaccess': 'page_white_database.png',
    'application/x-shockwave-flash': 'page_white_flash.png',
    'application/x-sql': 'page_white_database.png',
    'application/x-tar': 'box.png',
    'application/x-xz': 'box.png',
    'application/xml': 'page_white_code.png',
    'application/zip': 'box.png',
    'image/svg+xml': 'page_white_vector.png',
    'text/css': 'page_white_code.png',
    'text/html': 'page_white_code.png',
    'text/less': 'page_white_code.png',
    // other, extension-specific icons
    '.accdb': 'page_white_database.png',
    '.apk': 'box.png',
    '.app': 'application_xp.png',
    '.as': 'page_white_actionscript.png',
    '.asp': 'page_white_code.png',
    '.aspx': 'page_white_code.png',
    '.bat': 'application_xp_terminal.png',
    '.bz2': 'box.png',
    '.c': 'page_white_c.png',
    '.cab': 'box.png',
    '.cfm': 'page_white_coldfusion.png',
    '.clj': 'page_white_code.png',
    '.cc': 'page_white_cplusplus.png',
    '.cgi': 'application_xp_terminal.png',
    '.cpp': 'page_white_cplusplus.png',
    '.cs': 'page_white_csharp.png',
    '.db': 'page_white_database.png',
    '.dbf': 'page_white_database.png',
    '.deb': 'box.png',
    '.dll': 'page_white_gear.png',
    '.dmg': 'drive.png',
    '.docx': 'page_white_word.png',
    '.erb': 'page_white_ruby.png',
    '.exe': 'application_xp.png',
    '.fnt': 'font.png',
    '.gam': 'controller.png',
    '.gz': 'box.png',
    '.h': 'page_white_h.png',
    '.ini': 'page_white_gear.png',
    '.iso': 'cd.png',
    '.jar': 'box.png',
    '.java': 'page_white_cup.png',
    '.jsp': 'page_white_cup.png',
    '.lua': 'page_white_code.png',
    '.lz': 'box.png',
    '.lzma': 'box.png',
    '.m': 'page_white_code.png',
    '.map': 'map.png',
    '.msi': 'box.png',
    '.mv4': 'film.png',
    '.otf': 'font.png',
    '.pdb': 'page_white_database.png',
    '.php': 'page_white_php.png',
    '.pl': 'page_white_code.png',
    '.pkg': 'box.png',
    '.pptx': 'page_white_powerpoint.png',
    '.psd': 'page_white_picture.png',
    '.py': 'page_white_code.png',
    '.rar': 'box.png',
    '.rb': 'page_white_ruby.png',
    '.rm': 'film.png',
    '.rom': 'controller.png',
    '.rpm': 'box.png',
    '.sass': 'page_white_code.png',
    '.sav': 'controller.png',
    '.scss': 'page_white_code.png',
    '.srt': 'page_white_text.png',
    '.tbz2': 'box.png',
    '.tgz': 'box.png',
    '.tlz': 'box.png',
    '.vb': 'page_white_code.png',
    '.vbs': 'page_white_code.png',
    '.xcf': 'page_white_picture.png',
    '.xlsx': 'page_white_excel.png',
    '.yaws': 'page_white_code.png'
};
//# sourceMappingURL=index.js.map