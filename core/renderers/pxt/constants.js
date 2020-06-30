/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview An object that provides constants for rendering blocks in PXT
 * mode.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

goog.provide('Blockly.pxt.ConstantProvider');

goog.require('Blockly.Colours');
goog.require('Blockly.utils.dom');
goog.require('Blockly.utils.object');
goog.require('Blockly.utils.svgPaths');
goog.require('Blockly.zelos.ConstantProvider');


/**
 * An object that provides constants for rendering blocks in PXT mode.
 * @constructor
 * @package
 * @extends {Blockly.zelos.ConstantProvider}
 */
Blockly.pxt.ConstantProvider = function() {
  Blockly.pxt.ConstantProvider.superClass_.constructor.call(this);
  this.GRID_UNIT = 4;

  /**
   * @override
   */
  this.SMALL_PADDING = this.GRID_UNIT;

  /**
   * @override
   */
  this.MEDIUM_PADDING = 2 * this.GRID_UNIT;

  /**
   * @override
   */
  this.MEDIUM_LARGE_PADDING = 3 * this.GRID_UNIT;

  /**
   * @override
   */
  this.LARGE_PADDING = 4 * this.GRID_UNIT;

  /**
   * @override
   */
  this.CORNER_RADIUS = 1 * this.GRID_UNIT;

  /**
   * @override
   */
  this.NOTCH_WIDTH = 9 * this.GRID_UNIT;

  /**
   * @override
   */
  this.NOTCH_HEIGHT = 2 * this.GRID_UNIT;

  /**
   * @override
   */
  this.NOTCH_OFFSET_LEFT = 3 * this.GRID_UNIT;
  
  /**
   * @override
   */
  this.STATEMENT_INPUT_NOTCH_OFFSET = this.NOTCH_OFFSET_LEFT;

  /**
   * @override
   */
  this.MIN_BLOCK_WIDTH = 2 * this.GRID_UNIT;

  /**
   * @override
   */
  this.MIN_BLOCK_HEIGHT = 12 * this.GRID_UNIT;

  /**
   * @override
   */
  this.EMPTY_STATEMENT_INPUT_HEIGHT = 6 * this.GRID_UNIT;

  /**
   * @override
   */
  this.TAB_OFFSET_FROM_TOP = 0;

  /**
   * @override
   */
  this.TOP_ROW_MIN_HEIGHT = this.GRID_UNIT;

  /**
   * @override
   */
  this.TOP_ROW_PRECEDES_STATEMENT_MIN_HEIGHT = this.LARGE_PADDING;

  /**
   * @override
   */
  this.BOTTOM_ROW_MIN_HEIGHT = this.GRID_UNIT;

  /**
   * @override
   */
  this.BOTTOM_ROW_AFTER_STATEMENT_MIN_HEIGHT = 6 * this.GRID_UNIT;

  /**
   * @override
   */
  this.STATEMENT_BOTTOM_SPACER = -this.NOTCH_HEIGHT;

  /**
   * Minimum statement input spacer width.
   * @type {number}
   */
  this.STATEMENT_INPUT_SPACER_MIN_WIDTH = 40 * this.GRID_UNIT;

  /**
   * @override
   */
  this.STATEMENT_INPUT_PADDING_LEFT = 4 * this.GRID_UNIT;

  /**
   * @override
   */
  this.EMPTY_INLINE_INPUT_PADDING = 4 * this.GRID_UNIT;

  /**
   * @override
   */
  this.EMPTY_INLINE_INPUT_HEIGHT = 8 * this.GRID_UNIT;

  /**
   * @override
   */
  this.DUMMY_INPUT_MIN_HEIGHT = 8 * this.GRID_UNIT;

  /**
   * @override
   */
  this.DUMMY_INPUT_SHADOW_MIN_HEIGHT = 6 * this.GRID_UNIT;

  /**
   * @override
   */
  this.CURSOR_WS_WIDTH = 20 * this.GRID_UNIT;

  /**
   * @override
   */
  this.CURSOR_COLOUR = '#ffa200';

  /**
   * Radius of the cursor for input and output connections.
   * @type {number}
   * @package
   */
  this.CURSOR_RADIUS = 5;

  /**
   * @override
   */
  this.JAGGED_TEETH_HEIGHT = 0;

  /**
   * @override
   */
  this.JAGGED_TEETH_WIDTH = 0;

  /**
   * @override
   */
  this.START_HAT_HEIGHT = 22;

  /**
   * @override
   */
  this.START_HAT_WIDTH = 96;

  /**
   * @enum {number}
   * @override
   */
  this.SHAPES = {
    HEXAGONAL: 1,
    ROUND: 2,
    SQUARE: 3,
    PUZZLE: 4,
    NOTCH: 5
  };

  /**
   * Map of output/input shapes and the amount they should cause a block to be
   * padded. Outer key is the outer shape, inner key is the inner shape.
   * When a block with the outer shape contains an input block with the inner
   * shape on its left or right edge, the block elements are aligned such that
   * the padding specified is reached.
   * @package
   */
  this.SHAPE_IN_SHAPE_PADDING = {
    1: { // Outer shape: hexagon.
      0: 5 * this.GRID_UNIT, // Field in hexagon.
      1: 2 * this.GRID_UNIT, // Hexagon in hexagon.
      2: 5 * this.GRID_UNIT, // Round in hexagon.
      3: 5 * this.GRID_UNIT  // Square in hexagon.
    },
    2: { // Outer shape: round.
      0: 3 * this.GRID_UNIT, // Field in round.
      1: 3 * this.GRID_UNIT, // Hexagon in round.
      2: 1 * this.GRID_UNIT, // Round in round.
      3: 2 * this.GRID_UNIT  // Square in round.
    },
    3: { // Outer shape: square.
      0: 2 * this.GRID_UNIT, // Field in square.
      1: 2 * this.GRID_UNIT, // Hexagon in square.
      2: 2 * this.GRID_UNIT, // Round in square.
      3: 2 * this.GRID_UNIT  // Square in square.
    }
  };

  /**
   * @override
   */
  this.FULL_BLOCK_FIELDS = true;

  /**
   * @override
   */
  this.FIELD_TEXT_FONTSIZE = 3 * this.GRID_UNIT;

  /**
   * @override
   */
  this.FIELD_TEXT_FONTWEIGHT = 'bold';

  /**
   * @override
   */
  this.FIELD_TEXT_FONTFAMILY =
      '"Helvetica Neue", "Segoe UI", Helvetica, sans-serif';

  /**
   * @override
   */
  this.FIELD_TEXT_HEIGHT = 13.1;

  /**
   * Used by positioning text on IE and Edge as they don't support
   * dominant-baseline:center.
   * @override
   */
  this.FIELD_TEXT_BASELINE_Y = 13.1;

  /**
   * @override
   */
  this.FIELD_BORDER_RECT_RADIUS = this.CORNER_RADIUS;

  /**
   * @override
   */
  this.FIELD_BORDER_RECT_X_PADDING = 2 * this.GRID_UNIT;
  
  /**
   * @override
   */
  this.FIELD_BORDER_RECT_Y_PADDING = 1 * this.GRID_UNIT;

  /**
   * @override
   */
  this.FIELD_BORDER_RECT_HEIGHT = 8 * this.GRID_UNIT;

  /**
   * @override
   */
  this.FIELD_DROPDOWN_BORDER_RECT_HEIGHT = 8 * this.GRID_UNIT;

  /**
   * @override
   */
  this.FIELD_DROPDOWN_NO_BORDER_RECT_SHADOW = true;

  /**
   * @override
   */
  this.FIELD_DROPDOWN_COLOURED_DIV = true;

  /**
   * @override
   */
  this.FIELD_DROPDOWN_SVG_ARROW = true;


  /**
   * @override
   */
  this.FIELD_DROPDOWN_SVG_ARROW_PADDING = this.FIELD_BORDER_RECT_X_PADDING;

  /**
   * @override
   */
  this.FIELD_TEXTINPUT_BOX_SHADOW = true;

  /**
   * @override
   */
  this.FIELD_TEXT_Y_OFFSET = Blockly.utils.userAgent.CHROME ? -.45 : 0;

  /**
   * @override
   */
  this.FIELD_COLOUR_FULL_BLOCK = true;

  /**
   * @override
   */
  this.FIELD_COLOUR_DEFAULT_WIDTH = 2 * this.GRID_UNIT;

  /**
   * @override
   */
  this.FIELD_COLOUR_DEFAULT_HEIGHT = 4 * this.GRID_UNIT;

  /**
   * @override
   */
  this.FIELD_CHECKBOX_X_OFFSET = this.FIELD_BORDER_RECT_X_PADDING - 3;

  /**
   * @override
   */
  this.FIELD_CHECKBOX_Y_OFFSET = 22;

  /**
   * @override
   */
  this.FIELD_CHECKBOX_DEFAULT_WIDTH = 6 * this.GRID_UNIT;

  /**
   * The ID of the highlight glow filter, or the empty string if no filter is
   * set.
   * @type {string}
   * @package
   */
  this.selectedGlowFilterId = '';

  /**
   * The <filter> element to use for a higlight glow, or null if not set.
   * @type {SVGElement}
   * @private
   */
  this.selectedGlowFilter_ = null;

  /**
   * The ID of the replacement glow filter, or the empty string if no filter is
   * set.
   * @type {string}
   * @package
   */
  this.replacementGlowFilterId = '';

  /**
   * The <filter> element to use for a replacement glow, or null if not set.
   * @type {SVGElement}
   * @private
   */
  this.replacementGlowFilter_ = null;

};
Blockly.utils.object.inherits(Blockly.pxt.ConstantProvider,
    Blockly.zelos.ConstantProvider);

/**
 * @override
 */
Blockly.pxt.ConstantProvider.prototype.init = function() {
  Blockly.pxt.ConstantProvider.superClass_.init.call(this);

  /**
   * A string containing path information about ellipses.
   * @type {!string}
   */
  this.ELLIPSES = this.makeEllipses();
};

/**
 * @override
 */
Blockly.pxt.ConstantProvider.prototype.createDom = function(svg) {
  Blockly.pxt.ConstantProvider.superClass_.createDom.call(this, svg);
  var defs = Blockly.utils.dom.createSvgElement('defs', {}, svg);

  // Filter for highlighting
  var highlightGlowFilter = Blockly.utils.dom.createSvgElement('filter',
      {
        'id': 'blocklyHighlightGlowFilter' + this.randomIdentifier_,
        'height': '160%',
        'width': '180%',
        y: '-30%',
        x: '-40%'
      },
      defs);
  Blockly.utils.dom.createSvgElement('feGaussianBlur',
      {
        'in': 'SourceGraphic',
        'stdDeviation': Blockly.Colours.highlightGlowSize
      },
      highlightGlowFilter);
  // Set all gaussian blur pixels to 1 opacity before applying flood
  var highlightComponentTransfer = Blockly.utils.dom.createSvgElement('feComponentTransfer', {'result': 'outBlur'}, highlightGlowFilter);
  Blockly.utils.dom.createSvgElement('feFuncA',
      {
        'type': 'table', 'tableValues': '0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1'
      },
      highlightComponentTransfer);
  // Color the highlight
  Blockly.utils.dom.createSvgElement('feFlood',
      {'flood-color': Blockly.Colours.highlightGlow,
        'flood-opacity': Blockly.Colours.highlightGlowOpacity, 'result': 'outColor'}, highlightGlowFilter);
  Blockly.utils.dom.createSvgElement('feComposite',
      {'in': 'outColor', 'in2': 'outBlur',
        'operator': 'in', 'result': 'outGlow'}, highlightGlowFilter);
  this.highlightedGlowFilterId = highlightGlowFilter.id;
  this.highlightedGlowFilter_ = highlightGlowFilter;

  // Filter for error / warning marker
  var warningGlowFilter = Blockly.utils.dom.createSvgElement('filter',
      {
        'id': 'blocklyHighlightWarningFilter' + this.randomIdentifier_,
        'height': '160%',
        'width': '180%',
        y: '-30%',
        x: '-40%'
      },
      defs);
  Blockly.utils.dom.createSvgElement('feGaussianBlur',
      {
        'in': 'SourceGraphic',
        'stdDeviation': Blockly.Colours.warningGlowSize
      },
      warningGlowFilter);
  // Set all gaussian blur pixels to 1 opacity before applying flood
  var warningComponentTransfer = Blockly.utils.dom.createSvgElement('feComponentTransfer', {'result': 'outBlur'}, warningGlowFilter);
  Blockly.utils.dom.createSvgElement('feFuncA',
      {
        'type': 'table', 'tableValues': '0 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1'
      },
      warningComponentTransfer);
  // Color the highlight
  Blockly.utils.dom.createSvgElement('feFlood',
      {'flood-color': Blockly.Colours.warningGlow,
        'flood-opacity': Blockly.Colours.warningGlowOpacity, 'result': 'outColor'}, warningGlowFilter);
  Blockly.utils.dom.createSvgElement('feComposite',
      {'in': 'outColor', 'in2': 'outBlur',
        'operator': 'in', 'result': 'outGlow'}, warningGlowFilter);
  this.warningGlowFilterId = warningGlowFilter.id;
  this.warningGlowFilter_ = warningGlowFilter;

  // Add dropdown image definitions
  var arrowSize = this.FIELD_DROPDOWN_SVG_ARROW_SIZE;
  var dropdownArrowImage = Blockly.utils.dom.createSvgElement('image',
      {
        'id': 'blocklyDropdownArrowSvg',
        'height': arrowSize + 'px',
        'width': arrowSize + 'px'
      }, defs);
  dropdownArrowImage.setAttributeNS('http://www.w3.org/1999/xlink',
      'xlink:href', this.FIELD_DROPDOWN_SVG_ARROW_DATAURI);
};

/**
 * @return {!string} A string containing path information about
 *     collapsed block ellipses.
 * @package
 */
Blockly.pxt.ConstantProvider.prototype.makeEllipses = function() {
  var r = this.ELLIPSES_RADIUS;
  var spacing = this.ELLIPSES_SPACING;

  var mainPath = "";
  for (var i = 0; i < 3; i++) {
    mainPath += Blockly.utils.svgPaths.moveBy(spacing, 0)
    + Blockly.utils.svgPaths.arc('a', '180 1,1', r,
      Blockly.utils.svgPaths.point(r * 2, 0));
  }
  for (var i = 0; i < 3; i++) {
    mainPath += Blockly.utils.svgPaths.arc('a', '180 1,1', r,
      Blockly.utils.svgPaths.point(- r * 2, 0))
    + Blockly.utils.svgPaths.moveBy(-spacing, 0);
  }

  return mainPath;
};

/**
 * @override
 */
Blockly.pxt.ConstantProvider.prototype.getCSS_ = function(name) {
  var selector = '.' + name + '-renderer';
  var css = Blockly.pxt.ConstantProvider.superClass_.getCSS_.call(this, name);
  return css.concat([
    /* eslint-disable indent */
    // Connection indicator.
    selector + ' .blocklyConnectionIndicator, ' + selector + ' .blocklyInputConnectionIndicator {',
      'fill: #ff0000;',
      'fill-opacity: 0.9;',
      'stroke: #ffff00;',
      'stroke-width: 3px;',
    '}',
    selector + ' .blocklyConnectionIndicator {',
      'display: none;',
    '}',
    selector + ' .blocklyBlockDragSurface > g > .blocklyDraggable > .blocklyConnectionIndicator {',
      'display: block;',
    '}',
    selector + ' .blocklyConnectionLine {',
      'stroke: #ffff00;',
      'stroke-width: 4px;',
    '}',
    selector + ' .blocklyConnectionLine.hidden {',
      'display: none;',
    '}'
    /* eslint-enable indent */
  ])
}