"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _draftJsCheckableListItem = require("draft-js-checkable-list-item");

var _immutable = require("immutable");

var _adjustBlockDepth = require("./modifiers/adjustBlockDepth");

var _adjustBlockDepth2 = _interopRequireDefault(_adjustBlockDepth);

var _handleBlockType = require("./modifiers/handleBlockType");

var _handleBlockType2 = _interopRequireDefault(_handleBlockType);

var _handleInlineStyle = require("./modifiers/handleInlineStyle");

var _handleInlineStyle2 = _interopRequireDefault(_handleInlineStyle);

var _insertEmptyBlock = require("./modifiers/insertEmptyBlock");

var _insertEmptyBlock2 = _interopRequireDefault(_insertEmptyBlock);

var _handleLink = require("./modifiers/handleLink");

var _handleLink2 = _interopRequireDefault(_handleLink);

var _handleImage = require("./modifiers/handleImage");

var _handleImage2 = _interopRequireDefault(_handleImage);

var _leaveList = require("./modifiers/leaveList");

var _leaveList2 = _interopRequireDefault(_leaveList);

var _insertText = require("./modifiers/insertText");

var _insertText2 = _interopRequireDefault(_insertText);

var _link = require("./decorators/link");

var _link2 = _interopRequireDefault(_link);

var _image = require("./decorators/image");

var _image2 = _interopRequireDefault(_image);

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function checkCharacterForState(editorState, character) {
  var newEditorState = (0, _handleBlockType2.default)(editorState, character);
  var contentState = editorState.getCurrentContent();
  var selection = editorState.getSelection();
  var key = selection.getStartKey();
  var currentBlock = contentState.getBlockForKey(key);
  var type = currentBlock.getType();
  if (editorState === newEditorState) {
    newEditorState = (0, _handleImage2.default)(editorState, character);
  }
  if (editorState === newEditorState) {
    newEditorState = (0, _handleLink2.default)(editorState, character);
  }
  if (editorState === newEditorState && type !== "code-block") {
    newEditorState = (0, _handleInlineStyle2.default)(editorState, character);
  }
  return newEditorState;
}

function checkReturnForState(editorState, ev, _ref) {
  var insertEmptyBlockOnReturnWithModifierKey = _ref.insertEmptyBlockOnReturnWithModifierKey;

  var newEditorState = editorState;
  var contentState = editorState.getCurrentContent();
  var selection = editorState.getSelection();
  var key = selection.getStartKey();
  var currentBlock = contentState.getBlockForKey(key);
  var type = currentBlock.getType();
  var text = currentBlock.getText();
  if (/-list-item$/.test(type) && text === "") {
    newEditorState = (0, _leaveList2.default)(editorState);
  }
  if (newEditorState === editorState && insertEmptyBlockOnReturnWithModifierKey && (ev.ctrlKey || ev.shiftKey || ev.metaKey || ev.altKey || /^header-/.test(type) && selection.isCollapsed() && selection.getEndOffset() === text.length)) {
    newEditorState = (0, _insertEmptyBlock2.default)(editorState);
  }

  if (editorState === newEditorState) {
    newEditorState = (0, _handleInlineStyle2.default)(editorState, "\n");
  }
  return newEditorState;
}

var createMarkdownShortcutsPlugin = function createMarkdownShortcutsPlugin() {
  var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { insertEmptyBlockOnReturnWithModifierKey: true };

  var store = {};
  return {
    store: store,

    decorators: [(0, _link2.default)(config, store), (0, _image2.default)(config, store)],
    initialize: function initialize(_ref2) {
      var setEditorState = _ref2.setEditorState,
          getEditorState = _ref2.getEditorState;

      store.setEditorState = setEditorState;
      store.getEditorState = getEditorState;
    },
    blockStyleFn: function blockStyleFn(block) {
      switch (block.getType()) {
        case _draftJsCheckableListItem.CHECKABLE_LIST_ITEM:
          return _draftJsCheckableListItem.CHECKABLE_LIST_ITEM;
        default:
          break;
      }
      return null;
    },
    onTab: function onTab(ev, _ref3) {
      var getEditorState = _ref3.getEditorState,
          setEditorState = _ref3.setEditorState;

      var editorState = getEditorState();
      var newEditorState = (0, _adjustBlockDepth2.default)(editorState, ev);
      if (newEditorState !== editorState) {
        setEditorState(newEditorState);
        return "handled";
      }
      return "not-handled";
    },
    handleReturn: function handleReturn(ev, editorState, _ref4) {
      var setEditorState = _ref4.setEditorState;

      var newEditorState = checkReturnForState(editorState, ev, config);
      if (editorState !== newEditorState) {
        setEditorState(newEditorState);
        return "handled";
      }
      return "not-handled";
    },
    handleBeforeInput: function handleBeforeInput(character, editorState, timestamp, _ref5) {
      var setEditorState = _ref5.setEditorState;

      if (character.match(/[A-z0-9_*~`]/)) {
        return "not-handled";
      }
      var newEditorState = checkCharacterForState(editorState, character);
      if (editorState !== newEditorState) {
        setEditorState(newEditorState);
        return "handled";
      }
      return "not-handled";
    },
    handlePastedText: function handlePastedText(text, html, editorState, _ref6) {
      var setEditorState = _ref6.setEditorState;

      if (html) {
        return "not-handled";
      }
      var newEditorState = editorState;
      var buffer = [];
      for (var i = 0; i < text.length; i++) {
        // eslint-disable-line no-plusplus
        if (text[i].match(/[^A-z0-9_*~`]/)) {
          newEditorState = (0, _utils.replaceText)(newEditorState, buffer.join("") + text[i]);
          newEditorState = checkCharacterForState(newEditorState, text[i]);
          buffer = [];
        } else if (text[i].charCodeAt(0) === 10) {
          newEditorState = (0, _utils.replaceText)(newEditorState, buffer.join(""));
          var tmpEditorState = checkReturnForState(newEditorState, {}, config);
          if (newEditorState === tmpEditorState) {
            newEditorState = (0, _insertEmptyBlock2.default)(tmpEditorState);
          } else {
            newEditorState = tmpEditorState;
          }
          buffer = [];
        } else if (i === text.length - 1) {
          newEditorState = (0, _utils.replaceText)(newEditorState, buffer.join("") + text[i]);
          buffer = [];
        } else {
          buffer.push(text[i]);
        }
      }

      if (editorState !== newEditorState) {
        setEditorState(newEditorState);
        return "handled";
      }
      return "not-handled";
    }
  };
};

exports.default = createMarkdownShortcutsPlugin;