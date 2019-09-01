'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _changeCurrentInlineStyle = require('./changeCurrentInlineStyle');

var _changeCurrentInlineStyle2 = _interopRequireDefault(_changeCurrentInlineStyle);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var inlineMatchers = {
  BOLD: /(?:^|\s|\n|[^A-z0-9_*~`])(\*{2}|_{2})((?!\1).*?)(\1)($|\s|\n|[^A-z0-9_*~`])/g,
  ITALIC: /(?:^|\s|\n|[^A-z0-9_*~`])(\*{1}|_{1})((?!\1).*?)(\1)($|\s|\n|[^A-z0-9_*~`])/g,
  CODE: /(?:^|\s|\n|[^A-z0-9_*~`])(`)((?!\1).*?)(\1)($|\s|\n|[^A-z0-9_*~`])/g,
  STRIKETHROUGH: /(?:^|\s|\n|[^A-z0-9_*~`])(~{2})((?!\1).*?)(\1)($|\s|\n|[^A-z0-9_*~`])/g
};

var handleInlineStyle = function handleInlineStyle(editorState, character) {
  var key = editorState.getSelection().getStartKey();
  var text = editorState.getCurrentContent().getBlockForKey(key).getText();
  var line = '' + text + character;
  var newEditorState = editorState;
  Object.keys(inlineMatchers).some(function (k) {
    var re = inlineMatchers[k];
    var matchArr = void 0;
    do {
      matchArr = re.exec(line);
      if (matchArr) {
        newEditorState = (0, _changeCurrentInlineStyle2.default)(newEditorState, matchArr, k);
      }
    } while (matchArr);
    return newEditorState !== editorState;
  });
  return newEditorState;
};

exports.default = handleInlineStyle;