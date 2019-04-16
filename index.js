/**
 * author: Adam Hollett and Jeremy Hanson-Finger
 * copyright: 2016 Shopify
 * license: MIT
 * module: atom:linter:rorybot
 * fileoverview: Linter.
 */

'use strict';

// Initialize contants
const config = atom.config;
const deps = require('atom-package-deps');
const minimatch = require('minimatch');
const rorybot = require('rorybot');

const CODE_EXPRESSION = /`([^`]+)`/g;

function activate() {
  deps.install('linter-rory');
}

function linter() {

  // Return word range for highlighting
  function toRange(location) {
    return [[
      Number(location.start.line) - 1,
      Number(location.start.column) - 1
    ], [
      Number(location.end.line) - 1,
      Number(location.end.column) - 1
    ]];
  }

  // Transform VFile messages into linter messages
  function transform(message, editorPath) {
    return {
      severity: 'error',
      excerpt: message.reason,
      description: message.reason,
      location: {
        file: editorPath,
        position: toRange(message.location)
      }
    };
  }

  return {
    grammarScopes: config.get('linter-rorybot').grammars,
    name: 'rorybot',
    scope: 'file',
    lintsOnChange: true,
    lint(textEditor) {
      const editorPath = textEditor.getPath();
      let settings = config.get('linter-rorybot');

      if (minimatch(editorPath, settings.ignoreFiles)) {
        return [];
      }
      return new Promise(function (resolve) {
        resolve(rorybot(textEditor.getText()).messages.map((message) => transform(message, editorPath)));
      });
    }
  };
}

// Export module
module.exports = {
  config: {
    ignoreFiles: {
      description: 'Disable files matching (minimatch) glob',
      type: 'string',
      default: ''
    },
    grammars: {
      description: 'List of scopes for languages which will be ' +
        'checked. Note: setting new sources overwrites the ' +
        'defaults.',
      type: 'array',
      default: [
        'source.gfm',
        'text.html.basic',
        'text.html.ruby',
        'text.plain'
      ]
    }
  },
  provideLinter: linter,
  activate: activate
};
