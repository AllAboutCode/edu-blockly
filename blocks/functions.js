/**
 * @license
 * PXT Blockly fork
 *
 * The MIT License (MIT)
 *
 * Copyright (c) Microsoft Corporation
 *
 * All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * @fileoverview Utility functions for handling functions (pxt-blockly's custom procedures).
 * @author Microsoft MakeCode
 */
'use strict';

// TODO GUJEN support external validators for function names
// TODO GUJEN support external validators for param names
// TODO GUJEN make function names look different than arguments / labels on declaration / definition / call
// TODO GUJEN fix function insertion placement logic

/**
 * Type to represent a function parameter
 * @typedef {Object} FunctionParameter
 * @property {string} id The blockly ID of the param
 * @property {string} name the name of the param
 * @property {string} type the type of the param (string, number, boolean or a custom type)
 */

Blockly.PXTBlockly.FunctionUtils = {};

/**
 * Create XML to represent the name and parameters of a function declaration,
 * definition or call block.
 * @return {!Element} XML storage element.
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.mutationToDom = function () {
  var container = document.createElement('mutation');
  container.setAttribute('name', this.name_);
  container.setAttribute('functionid', this.functionId_);
  this.arguments_.forEach((arg) => {
    var argNode = document.createElement('arg');
    argNode.setAttribute('name', arg.name);
    argNode.setAttribute('id', arg.id);
    argNode.setAttribute('type', arg.type);
    container.appendChild(argNode);
  });

  return container;
};

/**
 * Parse XML to restore the name and parameters of a function declaration,
 * definition or call block.
 * @param {!Element} xmlElement XML storage element.
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.domToMutation = function (xmlElement) {
  var args = [];
  xmlElement.childNodes.forEach(c => {
    args.push({
      id: c.getAttribute('id'),
      name: c.getAttribute('name'),
      type: c.getAttribute('type')
    });
  });

  this.arguments_ = args;
  this.name_ = xmlElement.getAttribute('name');
  this.functionId_ = xmlElement.getAttribute('functionid');
  this.updateDisplay_();
};

/**
 * Returns the name of the function, or the empty string if it has not yet been
 * set.
 * @return {string} Function name.
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.getName = function () {
  return this.name_;
};

/**
 * Returns the function ID of this function, or the empty string if it has not
 * yet been set. This is different from the block ID and is the same across all
 * function calls, definition and declaration for a given function.
 * @return {string} Function ID.
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.getFunctionId = function () {
  return this.functionId_;
};

/**
 * Returns the list of arguments for this function.
 * @return {FunctionParameter[]} The arguments of this function.
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.getArguments = function () {
  return this.arguments_;
}

/**
 * Returns whether or not the specified argument exists on this function
 * signature.
 * @param {string} argName The name of the argument to check.
 * @param {string} reporterType The reporter type of the argument.
 * @return {boolean} Whether the argument exists on this function.
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.hasArgument = function (argName, reporterType) {
  var args = this.getArguments();
  for (var i = 0; i < args.length; ++i) {
    if (args[i].name === argName && Blockly.Functions.isReporterOfType(args[i].type, reporterType)) {
      return true;
    }
  }
  return false;
}

/**
 * Add or remove the statement block from this function definition.
 * @param {boolean} hasStatements True if a statement block is needed.
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.setStatements_ = function (hasStatements) {
  if (this.hasStatements_ === hasStatements) {
    return;
  }
  if (hasStatements) {
    this.appendStatementInput('STACK')
  } else {
    this.removeInput('STACK', true);
  }
  this.hasStatements_ = hasStatements;
}

/**
 * Update the block's structure and appearance to match the internally stored
 * mutation.
 * @private
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.updateDisplay_ = function () {
  var wasRendered = this.rendered;
  this.rendered = false;

  var connectionMap = this.disconnectOldBlocks_();
  this.removeAllInputs_();

  this.createAllInputs_(connectionMap);
  this.deleteShadows_(connectionMap);

  this.rendered = wasRendered;
  if (wasRendered && !this.isInsertionMarker()) {
    this.initSvg();
    this.render();
  }
};

/**
 * Disconnect old blocks from all value inputs on this block, but hold onto them
 * in case they can be reattached later. Also save the shadow DOM if it exists.
 * The result is a map from argument ID to information that was associated with
 * that argument at the beginning of the mutation.
 * @return {!Object.<string, {shadow: Element, block: Blockly.Block}>} An object
 *     mapping argument IDs to blocks and shadow DOMs.
 * @private
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.disconnectOldBlocks_ = function () {
  // Remove old stuff
  var connectionMap = {};
  for (var i = 0, input; input = this.inputList[i]; i++) {
    if (input.name !== 'STACK' && input.connection) {
      var target = input.connection.targetBlock();
      var saveInfo = {
        shadow: input.connection.getShadowDom(),
        block: target
      };
      connectionMap[input.name] = saveInfo;

      // Remove the shadow DOM, then disconnect the block. Otherwise a shadow
      // block will respawn instantly, and we'd have to remove it when we remove
      // the input.
      input.connection.setShadowDom(null);
      if (target) {
        input.connection.disconnect();
      }
    }
  }
  return connectionMap;
};

/**
 * Removes all inputs on the block, including dummy inputs, except the STACK
 * input. Assumes no input has shadow DOM set.
 * @private
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.removeAllInputs_ = function () {
  // Delete inputs directly instead of with block.removeInput to avoid splicing
  // out of the input list at every index.
  var stackInput = null;
  for (var i = 0, input; input = this.inputList[i]; i++) {
    if (input.name === 'STACK') {
      stackInput = input;
    } else {
      input.dispose();
    }
  }
  this.inputList = stackInput ? [stackInput] : [];
};

/**
 * Create all inputs specified by the mutation args, and populate them with
 * shadow blocks or reconnected old blocks as appropriate.
 * @param {!Object.<string, {shadow: Element, block: Blockly.Block}>}
 *     connectionMap An object mapping argument IDs to blocks and shadow DOMs.
 * @private
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.createAllInputs_ = function (connectionMap) {
  // Create the main label.
  var labelText = '';
  switch (this.type) {
    case Blockly.FUNCTION_CALL_BLOCK_TYPE:
      labelText = Blockly.Msg.FUNCTIONS_CALL_TITLE;
      break;
    case Blockly.FUNCTION_DEFINITION_BLOCK_TYPE:
    case Blockly.FUNCTION_DECLARATION_BLOCK_TYPE:
      labelText = Blockly.Msg.PROCEDURES_DEFNORETURN_TITLE;
  }

  this.appendDummyInput()
    .appendField(labelText, 'function_title');

  // Create the function name (overridden by the block type).
  this.addFunctionLabel_(this.getName());

  // Create arguments.
  this.arguments_.forEach(arg => {
    // For custom types, the parameter type is appended to the UUID in the
    // input name. This is needed to retrieve the function signature from the
    // block inputs when the declaration block is modified.
    var inputName = arg.id;
    if (arg.type !== 'boolean' && arg.type !== 'string' && arg.type !== 'number') {
      inputName = arg.id + '_' + arg.type;
    }
    var input = this.appendValueInput(inputName);
    switch (arg.type) {
      case 'boolean':
        input.setCheck('Boolean');
        break;
      case 'string':
        input.setCheck('String');
        break;
      case 'number':
        input.setCheck('Number');
        break;
    }
    this.populateArgument_(arg, connectionMap, input);
  });

  // Move the statement input (block mouth) back to the end.
  if (this.hasStatements_) {
    this.moveInputBefore('STACK', null);
  }
};

/**
 * Delete all shadow blocks in the given map.
 * @param {!Object.<string, Blockly.Block>} connectionMap An object mapping
 *     argument IDs to the blocks that were connected to those IDs at the
 *     beginning of the mutation.
 * @private
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.deleteShadows_ = function (connectionMap) {
  // Get rid of all of the old shadow blocks if they aren't connected.
  if (connectionMap) {
    for (var id in connectionMap) {
      var saveInfo = connectionMap[id];
      if (saveInfo) {
        var block = saveInfo['block'];
        if (block && block.isShadow()) {
          block.dispose();
          connectionMap[id] = null;
          // At this point we know which shadow DOMs are about to be orphaned in
          // the VM. What do we do with that information?
        }
      }
    }
  }
};

/**
 * Add a label editor with the given text to a function_declaration
 * block. Editing the text in the label editor updates the text of the
 * corresponding label fields on function calls.
 * @param {string} text The label text.
 * @private
 */
Blockly.PXTBlockly.FunctionUtils.addLabelEditor_ = function (text) {
  this.appendDummyInput('function_name').appendField(new Blockly.FieldTextInput(text || ''), 'function_name');
};

/**
 * Add a label field with the given text to a function call or definition
 * block.
 * @param {string} text The label text.
 * @private
 */
Blockly.PXTBlockly.FunctionUtils.addLabelField_ = function (text) {
  this.appendDummyInput('function_name').appendField(text, 'function_name');
};

/**
 * Returns the block type, the field name and the field value of the shadow
 * block to use for the given argument type.
 * @param {string} argumentType The type of the argument.
 * @param {Blockly.Workspace} ws The workspace of the function call block.
 * @return {!Array<string>} An array of block type, field name and field value.
 */
Blockly.PXTBlockly.FunctionUtils.getShadowBlockInfoFromType_ = function (argumentType, ws) {
  var shadowType = '';
  var fieldName = '';
  var fieldValue = '';
  switch (argumentType) {
    case 'boolean':
      shadowType = 'logic_boolean';
      fieldName = 'BOOL';
      fieldValue = 'TRUE';
      break;
    case 'number':
      shadowType = 'math_number';
      fieldName = 'NUM';
      fieldValue = '1';
      break;
    case 'string':
      shadowType = 'text';
      fieldName = 'TEXT';
      fieldValue = 'abc';
      break;
    default:
      // This is probably a custom type. Use a variable as the shadow.
      shadowType = 'variables_get';
      fieldName = 'VAR';
      fieldValue = Blockly.Variables.getOrCreateVariablePackage(ws, null, Blockly.Msg.VARIABLES_DEFAULT_NAME, '').getId();
  }
  return [shadowType, fieldName, fieldValue];
}

/**
 * Build a DOM node representing a shadow block of the given type.
 * @param {string} argumentType The type of the argument.
 * @return {!Element} The DOM node representing the new shadow block.
 * @private
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.buildShadowDom_ = function (argumentType) {
  var shadowDom = goog.dom.createDom('shadow');
  var [shadowType, fieldName, fieldValue] = Blockly.PXTBlockly.FunctionUtils.getShadowBlockInfoFromType_(argumentType, this.workspace);
  shadowDom.setAttribute('type', shadowType);
  var fieldDom = goog.dom.createDom('field', null, fieldValue);
  fieldDom.setAttribute('name', fieldName);
  shadowDom.appendChild(fieldDom);
  return shadowDom;
};

/**
 * Create a new shadow block and attach it to the given input.
 * @param {!Blockly.Input} input The value input to attach a block to.
 * @param {string} argumentType The type of the argument.
 * @private
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.attachShadow_ = function (input, argumentType) {
  var [blockType, fieldName, fieldValue] = Blockly.PXTBlockly.FunctionUtils.getShadowBlockInfoFromType_(argumentType, this.workspace);
  Blockly.Events.disable();
  var newBlock = null;
  try {
    newBlock = this.workspace.newBlock(blockType);
    newBlock.setFieldValue(fieldValue, fieldName);
    newBlock.setShadow(true);
    if (!this.isInsertionMarker()) {
      newBlock.initSvg();
      newBlock.render(false);
    }
  }
  finally {
    Blockly.Events.enable();
  }

  newBlock && newBlock.outputConnection.connect(input.connection);
};

/**
 * Create a new argument reporter block.
 * @param {FunctionParameter} arg The argument we are building this reporter
 *  for.
 * @return {!Blockly.BlockSvg} The newly created argument reporter block.
 * @private
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.createArgumentReporter_ = function (arg) {
  var blockType = '';
  switch (arg.type) {
    case 'boolean':
      blockType = 'argument_reporter_boolean';
      break;
    case 'number':
      blockType = 'argument_reporter_number';
      break;
    case 'string':
      blockType = 'argument_reporter_string';
      break;
    default:
      blockType = 'argument_reporter_custom';
  }
  Blockly.Events.disable();
  try {
    var newBlock = this.workspace.newBlock(blockType);
    newBlock.setShadow(true);
    newBlock.setFieldValue(arg.name, 'VALUE');
    if (!this.isInsertionMarker()) {
      newBlock.initSvg();
      newBlock.render(false);
    }
  } finally {
    Blockly.Events.enable();
  }
  return newBlock;
};

/**
 * Populate the argument by attaching the correct child block or shadow to the
 * given input.
 * @param {FunctionParameter} arg The description of the argument.
 * @param {!Object.<string, {shadow: Element, block: Blockly.Block}>}
 *     connectionMap An object mapping argument IDs to blocks and shadow DOMs.
 * @param {!Blockly.Input} input The newly created input to populate.
 * @private
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.populateArgumentOnCaller_ = function (arg, connectionMap, input) {
  var oldBlock = null;
  var oldShadow = null;
  if (connectionMap && (arg.id in connectionMap)) {
    var saveInfo = connectionMap[arg.id];
    oldBlock = saveInfo['block'];
    oldShadow = saveInfo['shadow'];
  }

  if (connectionMap && oldBlock) {
    // Reattach the old block and shadow DOM.
    connectionMap[input.name] = null;
    oldBlock.outputConnection.connect(input.connection);
    var shadowDom = oldShadow || this.buildShadowDom_(arg.type);
    input.connection.setShadowDom(shadowDom);
  } else {
    this.attachShadow_(input, arg.type);
  }
};

/**
 * Populate the argument by attaching the correct argument reporter to the given
 * input.
 * @param {FunctionParameter} arg The description of the argument.
 * @param {!Object.<string, {shadow: Element, block: Blockly.Block}>}
 *     connectionMap An object mapping argument IDs to blocks and shadow DOMs.
 * @param {!Blockly.Input} input The newly created input to populate.
 * @private
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.populateArgumentOnDefinition_ = function (arg, connectionMap, input) {
  var oldBlock = null;
  if (connectionMap && (arg.id in connectionMap)) {
    var saveInfo = connectionMap[arg.id];
    oldBlock = saveInfo['block'];
  }

  // Decide which block to attach.
  if (connectionMap && oldBlock) {
    // Update the text if needed. The old argument reporter is the same type,
    // and on the same input, but the argument's display name may have changed.
    var argumentReporter = oldBlock;
    argumentReporter.setFieldValue(arg.name, 'VALUE');
    connectionMap[input.name] = null;
  } else {
    var argumentReporter = this.createArgumentReporter_(arg);
  }

  // Attach the block.
  input.connection.connect(argumentReporter.outputConnection);
};

/**
* Populate the argument by attaching the correct argument editor to the given
* input.
* @param {FunctionParameter} arg The description of the argument.
* @param {!Object.<string, {shadow: Element, block: Blockly.Block}>}
*     connectionMap An object mapping argument IDs to blocks and shadow DOMs.
* @param {!Blockly.Input} input The newly created input to populate.
* @private
* @this Blockly.Block
*/
Blockly.PXTBlockly.FunctionUtils.populateArgumentOnDeclaration_ = function (arg, connectionMap, input) {
  var oldBlock = null;
  if (connectionMap && (arg.id in connectionMap)) {
    var saveInfo = connectionMap[arg.id];
    oldBlock = saveInfo['block'];
  }

  var argumentEditor = this.createArgumentEditor_(arg.type, arg.name);

  // Attach the block.
  input.connection.connect(argumentEditor.outputConnection);
};

/**
 * Create an argument editor.
 * An argument editor is a shadow block with a single text field, which is used
 * to set the display name of the argument.
 * @param {string} argumentType One of 'b' (boolean), 's' (string) or
 *     'n' (number).
 * @param {string} displayName The display name of this argument, which is the
 *     text of the field on the shadow block.
 * @return {!Blockly.BlockSvg} The newly created argument editor block.
 * @private
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.createArgumentEditor_ = function (argumentType, displayName) {
  Blockly.Events.disable();
  var newBlock;
  try {
    switch (argumentType) {
      case 'boolean':
        newBlock = this.workspace.newBlock('argument_editor_boolean');
        break;
      case 'string':
        newBlock = this.workspace.newBlock('argument_editor_string');
        break;
      case 'number':
        newBlock = this.workspace.newBlock('argument_editor_number');
        break;
      default:
        newBlock = this.workspace.newBlock('argument_editor_custom');
    }
    newBlock.setFieldValue(displayName, 'TEXT');
    newBlock.setShadow(true);
    if (!this.isInsertionMarker()) {
      newBlock.initSvg();
      newBlock.render(false);
    }
  } finally {
    Blockly.Events.enable();
  }
  return newBlock;
};

/**
 * Update the mutation information on the declaration block based on the
 * existing inputs and their text.
 */
Blockly.PXTBlockly.FunctionUtils.updateDeclarationMutation_ = function () {
  this.arguments_ = [];

  // Start iterating at 1 to skip the function label
  for (var i = 1; i < this.inputList.length; i++) {
    var input = this.inputList[i];
    switch (input.type) {
      case Blockly.NEXT_STATEMENT:
        // Nothing to save
        break;
      case Blockly.DUMMY_INPUT:
        // This is the function name text input
        this.name_ = input.fieldRow[0].getValue();
        break;
      case Blockly.INPUT_VALUE:
        // Inspect the argument editor to add the argument to our mutation.
        var target = input.connection.targetBlock();
        var typeName = '';
        var argId = input.name;

        switch (target.type) {
          case 'argument_editor_boolean':
            typeName = 'boolean';
            break;
          case 'argument_editor_string':
            typeName = 'string';
            break;
          case 'argument_editor_number':
            typeName = 'number';
            break;
          case 'argument_editor_custom':
            // For custom types, the name of the input looks like UUID_TYPE,
            // where UUID is 20 characters. Parse the input name into the ID
            // and the type.
            argId = input.name.substr(0, 20);
            typeName = input.name.substr(21);
            break;
        }
        this.arguments_.push({
          id: argId,
          name: target.getFieldValue('TEXT'),
          type: typeName
        });
        break;
      default:
        console.warn('Unexpected input type on a function mutator root: ' + input.type);
    }
  }
};

/**
* Focus on the last argument editor editor on the declaration block.
* @private
*/
Blockly.PXTBlockly.FunctionUtils.focusLastEditor_ = function () {
  if (this.inputList.length > 0) {
    var newInput = this.inputList[this.inputList.length - 2];
    if (newInput.type == Blockly.DUMMY_INPUT) {
      this.workspace.centerOnBlock(this.id);
      newInput.fieldRow[0].showEditor_();
    } else if (newInput.type == Blockly.INPUT_VALUE) {
      // Inspect the argument editor.
      var target = newInput.connection.targetBlock();
      target.workspace.centerOnBlock(target.id);
      target.getField('TEXT').showEditor_();
    }
  }
};

/**
 * Common logic to add an argument to the function declaration.
 * @param {string} typeName The type of the param, as would be emitted to
 *  Typescript.
 * @param {string} defaultName the default name of the parameter.
 * @private
 */
Blockly.PXTBlockly.FunctionUtils.addParam_ = function (typeName, defaultName) {
  Blockly.WidgetDiv.hide(true);
  var argName = Blockly.Functions.findUniqueParamName(defaultName, this.arguments_.map(a => a.name));
  this.arguments_.push({
    id: Blockly.utils.genUid(),
    name: argName,
    type: typeName
  });
  this.updateDisplay_();
  this.focusLastEditor_();
}

/**
 * Externally-visible function to add a boolean argument to the function
 * declaration.
 * @public
 */
Blockly.PXTBlockly.FunctionUtils.addBooleanExternal = function () {
  this.addParam_('boolean', Blockly.Msg.FUNCTIONS_DEFAULT_BOOLEAN_ARG_NAME);
};

/**
 * Externally-visible function to add a string argument to the function
 * declaration.
 * @public
 */
Blockly.PXTBlockly.FunctionUtils.addStringExternal = function () {
  this.addParam_('string', Blockly.Msg.FUNCTIONS_DEFAULT_STRING_ARG_NAME);
};

/**
 * Externally-visible function to add a number argument to the function
 * declaration.
 * @public
 */
Blockly.PXTBlockly.FunctionUtils.addNumberExternal = function () {
  this.addParam_('number', Blockly.Msg.FUNCTIONS_DEFAULT_NUMBER_ARG_NAME);
};

/**
 * Externally-visible function to add a custom argument to the function
 * declaration.
 * @param {string} typeName The custom type of the param, as would be emitted
 *  to Typescript.
 * @public
 */
Blockly.PXTBlockly.FunctionUtils.addCustomExternal = function (typeName) {
  this.addParam_(typeName, Blockly.Msg.FUNCTIONS_DEFAULT_CUSTOM_ARG_NAME);
};

/**
 * Callback to remove a field, only for the declaration block.
 * @param {Blockly.Field} field The field being removed.
 * @public
 */
Blockly.PXTBlockly.FunctionUtils.removeFieldCallback = function (field) {
  var inputNameToRemove = null;
  for (var n = 0; n < this.inputList.length; n++) {
    if (inputNameToRemove) {
      break;
    }
    var input = this.inputList[n];
    if (input.connection) {
      var target = input.connection.targetBlock();
      if (!target) {
        continue;
      }
      if (target.getField(field.name) === field) {
        inputNameToRemove = input.name;
      }
    } else {
      for (var j = 0; j < input.fieldRow.length; j++) {
        if (input.fieldRow[j] == field) {
          inputNameToRemove = input.name;
        }
      }
    }
  }
  if (inputNameToRemove) {
    Blockly.WidgetDiv.hide(true);
    this.removeInput(inputNameToRemove);
    this.updateFunctionSignature();
    this.updateDisplay_();
  }
};

/**
 * Callback to pass removeField up to the declaration block from arguments.
 * @param {Blockly.Field} field The field being removed.
 * @public
 */
Blockly.PXTBlockly.FunctionUtils.removeArgumentCallback_ = function (field) {
  if (this.parentBlock_ && this.parentBlock_.removeFieldCallback) {
    this.parentBlock_.removeFieldCallback(field);
  }
};

/**
 * Function calls cannot exist without the corresponding function definition.
 * Enforce this link whenever an event is fired.
 * @param {!Blockly.Events.Abstract} event Change event.
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.onCallerChange = function (event) {
  if (!this.workspace || this.workspace.isFlyout) {
    // Block is deleted or is in a flyout.
    return;
  }
  if (event.type == Blockly.Events.BLOCK_CREATE && event.ids.indexOf(this.id) != -1) {
    // Check whether there is a matching function definition for this caller.
    var name = this.getName();
    var def = Blockly.Functions.getDefinition(name, this.workspace);
    if (def) {
      // The function definition exists, ensure the signatures match.
      var defArgs = def.getArguments().slice();
      defArgs.sort((a, b) => a.name.localeCompare(b.name));
      var thisArgs = this.arguments_.slice();
      thisArgs.sort((a, b) => a.name.localeCompare(b.name));
      if (JSON.stringify(thisArgs) !== JSON.stringify(defArgs)) {
        // The function signature has changed since this block was copied,
        // update it.
        Blockly.Functions.mutateCallersAndDefinition(def.getName(), this.workspace, def.mutationToDom());
      }
    } else {
      // There is no function definition for this function, create an empty one
      // that matches the signature of the caller.
      Blockly.Events.setGroup(event.group);
      var xml = goog.dom.createDom('xml');
      var block = goog.dom.createDom('block');
      block.setAttribute('type', Blockly.FUNCTION_DEFINITION_BLOCK_TYPE);
      var xy = this.getRelativeToSurfaceXY();
      var x = xy.x + Blockly.SNAP_RADIUS * (this.RTL ? -1 : 1);
      var y = xy.y + Blockly.SNAP_RADIUS * 2;
      block.setAttribute('x', x);
      block.setAttribute('y', y);
      var mutation = this.mutationToDom();
      block.appendChild(mutation);
      xml.appendChild(block);
      Blockly.Xml.domToWorkspace(xml, this.workspace);
      Blockly.Events.setGroup(false);
    }
  } else if (event.type == Blockly.Events.BLOCK_DELETE) {
    // If the deleted block was the function definition for this caller, delete
    // this caller.
    var name = this.getName();
    var def = Blockly.Functions.getDefinition(name, this.workspace);
    if (!def) {
      Blockly.Events.setGroup(event.group);
      this.dispose(true, false);
      Blockly.Events.setGroup(false);
    }
  }
}

/**
 * Function argument reporters cannot exist outside functions that define them
 * as arguments. Enforce this link whenever an event is fired.
 * @param {!Blockly.Events.Abstract} event Change event.
 * @this Blockly.Block
 */
Blockly.PXTBlockly.FunctionUtils.onReporterChange = function (event) {
  if (!this.workspace || this.workspace.isFlyout) {
    // Block is deleted or is in a flyout.
    return;
  }

  var thisWasCreated = event.type === Blockly.Events.BLOCK_CREATE && event.ids.indexOf(this.id) != -1;
  var thisWasDragged = event.type === Blockly.Events.END_DRAG && event.allNestedIds.indexOf(this.id) != -1;

  if (thisWasCreated || thisWasDragged) {
    var rootBlock = this.getRootBlock();
    var thisArgName = this.getFieldValue('VALUE');

    if (!Blockly.Functions.isShadowArgumentReporter(rootBlock) &&
      (rootBlock.type !== Blockly.FUNCTION_DEFINITION_BLOCK_TYPE ||
        !rootBlock.hasArgument(thisArgName, this.type))) {
      Blockly.Events.setGroup(event.group);
      this.dispose();
      Blockly.Events.setGroup(false);
    }
  }
}

Blockly.Blocks['function_declaration'] = {
  /**
   * The preview block in the function editor dialog.
   * @this Blockly.Block
   */
  init: function () {
    /* Data known about the function. */
    this.name_ = ""; // The name of the function.
    this.arguments_ = []; // The arguments of this function.
    this.functionId_ = ""; // An ID, independent from the block ID, to track a function across its call, definition and declaration blocks.

    this.createAllInputs_();
    this.setColour(Blockly.Msg.PROCEDURES_HUE);
    this.setStatements_(true);
    this.setDeletable(false);
    this.setMovable(false);
    this.contextMenu = false;
    this.setStartHat(true);
    this.statementConnection_ = null;
  },
  // Shared.
  mutationToDom: Blockly.PXTBlockly.FunctionUtils.mutationToDom,
  domToMutation: Blockly.PXTBlockly.FunctionUtils.domToMutation,
  getName: Blockly.PXTBlockly.FunctionUtils.getName,
  getFunctionId: Blockly.PXTBlockly.FunctionUtils.getFunctionId,
  getArguments: Blockly.PXTBlockly.FunctionUtils.getArguments,
  removeAllInputs_: Blockly.PXTBlockly.FunctionUtils.removeAllInputs_,
  disconnectOldBlocks_: Blockly.PXTBlockly.FunctionUtils.disconnectOldBlocks_,
  deleteShadows_: Blockly.PXTBlockly.FunctionUtils.deleteShadows_,
  createAllInputs_: Blockly.PXTBlockly.FunctionUtils.createAllInputs_,
  updateDisplay_: Blockly.PXTBlockly.FunctionUtils.updateDisplay_,
  setStatements_: Blockly.PXTBlockly.FunctionUtils.setStatements_,

  // Exists on all three blocks, but have different implementations.
  populateArgument_: Blockly.PXTBlockly.FunctionUtils.populateArgumentOnDeclaration_,
  addFunctionLabel_: Blockly.PXTBlockly.FunctionUtils.addLabelEditor_,

  // Only exists on function_declaration.
  createArgumentEditor_: Blockly.PXTBlockly.FunctionUtils.createArgumentEditor_,
  focusLastEditor_: Blockly.PXTBlockly.FunctionUtils.focusLastEditor_,
  removeFieldCallback: Blockly.PXTBlockly.FunctionUtils.removeFieldCallback,
  addParam_: Blockly.PXTBlockly.FunctionUtils.addParam_,
  addBooleanExternal: Blockly.PXTBlockly.FunctionUtils.addBooleanExternal,
  addStringExternal: Blockly.PXTBlockly.FunctionUtils.addStringExternal,
  addNumberExternal: Blockly.PXTBlockly.FunctionUtils.addNumberExternal,
  addCustomExternal: Blockly.PXTBlockly.FunctionUtils.addCustomExternal,
  updateFunctionSignature: Blockly.PXTBlockly.FunctionUtils.updateDeclarationMutation_
};

Blockly.Blocks['function_definition'] = {
  /**
   * Block for defining a function with no return value.
   * @this Blockly.Block
   */
  init: function () {
    this.jsonInit({
      "extensions": ["function_contextmenu_edit"]
    });

    /* Data known about the function. */
    this.name_ = ""; // The name of the function.
    this.arguments_ = []; // The arguments of this function.
    this.functionId_ = ""; // An ID, independent from the block ID, to track a function across its call, definition and declaration blocks.

    this.createAllInputs_();
    if ((this.workspace.options.comments ||
      (this.workspace.options.parentWorkspace &&
        this.workspace.options.parentWorkspace.options.comments)) &&
      Blockly.Msg.PROCEDURES_DEFNORETURN_COMMENT) {
      this.setCommentText(Blockly.Msg.PROCEDURES_DEFNORETURN_COMMENT);
    }
    this.setColour(Blockly.Msg.PROCEDURES_HUE);
    this.setTooltip(Blockly.Msg.PROCEDURES_DEFNORETURN_TOOLTIP);
    this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFNORETURN_HELPURL);
    this.setStatements_(true);
    this.setStartHat(true);
    this.statementConnection_ = null;
  },
  // Shared.
  mutationToDom: Blockly.PXTBlockly.FunctionUtils.mutationToDom,
  domToMutation: Blockly.PXTBlockly.FunctionUtils.domToMutation,
  getName: Blockly.PXTBlockly.FunctionUtils.getName,
  getFunctionId: Blockly.PXTBlockly.FunctionUtils.getFunctionId,
  getArguments: Blockly.PXTBlockly.FunctionUtils.getArguments,
  removeAllInputs_: Blockly.PXTBlockly.FunctionUtils.removeAllInputs_,
  disconnectOldBlocks_: Blockly.PXTBlockly.FunctionUtils.disconnectOldBlocks_,
  deleteShadows_: Blockly.PXTBlockly.FunctionUtils.deleteShadows_,
  createAllInputs_: Blockly.PXTBlockly.FunctionUtils.createAllInputs_,
  updateDisplay_: Blockly.PXTBlockly.FunctionUtils.updateDisplay_,
  setStatements_: Blockly.PXTBlockly.FunctionUtils.setStatements_,

  // Exists on all three blocks, but have different implementations.
  populateArgument_: Blockly.PXTBlockly.FunctionUtils.populateArgumentOnDefinition_,
  addFunctionLabel_: Blockly.PXTBlockly.FunctionUtils.addLabelField_,

  // Only exists on function_definition.
  createArgumentReporter_: Blockly.PXTBlockly.FunctionUtils.createArgumentReporter_,
  hasArgument: Blockly.PXTBlockly.FunctionUtils.hasArgument
};

Blockly.Blocks['function_call'] = {
  /**
   * Block for calling a function with no return value.
   * @this Blockly.Block
   */
  init: function () {
    this.jsonInit({
      "extensions": ["function_contextmenu_edit"]
    });
    /* Data known about the function. */
    this.name_ = ""; // The name of the function.
    this.arguments_ = []; // The arguments of this function.
    this.functionId_ = ""; // An ID, independent from the block ID, to track a function across its call, definition and declaration blocks.

    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(Blockly.Msg.PROCEDURES_HUE);
    this.setHelpUrl(Blockly.Msg.PROCEDURES_CALLNORETURN_HELPURL);
    this.setTooltip(Blockly.Msg.FUNCTION_CALL_TOOLTIP);
  },
  // Shared.
  mutationToDom: Blockly.PXTBlockly.FunctionUtils.mutationToDom,
  domToMutation: Blockly.PXTBlockly.FunctionUtils.domToMutation,
  getName: Blockly.PXTBlockly.FunctionUtils.getName,
  getFunctionId: Blockly.PXTBlockly.FunctionUtils.getFunctionId,
  getArguments: Blockly.PXTBlockly.FunctionUtils.getArguments,
  removeAllInputs_: Blockly.PXTBlockly.FunctionUtils.removeAllInputs_,
  disconnectOldBlocks_: Blockly.PXTBlockly.FunctionUtils.disconnectOldBlocks_,
  deleteShadows_: Blockly.PXTBlockly.FunctionUtils.deleteShadows_,
  createAllInputs_: Blockly.PXTBlockly.FunctionUtils.createAllInputs_,
  updateDisplay_: Blockly.PXTBlockly.FunctionUtils.updateDisplay_,
  setStatements_: Blockly.PXTBlockly.FunctionUtils.setStatements_,

  // Exists on all three blocks, but have different implementations.
  populateArgument_: Blockly.PXTBlockly.FunctionUtils.populateArgumentOnCaller_,
  addFunctionLabel_: Blockly.PXTBlockly.FunctionUtils.addLabelField_,

  // Only exists on function_call.
  attachShadow_: Blockly.PXTBlockly.FunctionUtils.attachShadow_,
  buildShadowDom_: Blockly.PXTBlockly.FunctionUtils.buildShadowDom_,
  onchange: Blockly.PXTBlockly.FunctionUtils.onCallerChange
};

// Argument editors

Blockly.Blocks['argument_editor_boolean'] = {
  init: function () {
    this.jsonInit({
      "message0": " %1",
      "args0": [
        {
          "type": "field_input_removable",
          "name": "TEXT",
          "text": "bool"
        }
      ],
      "colour": Blockly.Colours.textField,
      "colourSecondary": Blockly.Colours.textField,
      "colourTertiary": Blockly.Colours.textField,
      "extensions": ["output_boolean"]
    });
  },
  removeFieldCallback: Blockly.PXTBlockly.FunctionUtils.removeArgumentCallback_
};

Blockly.Blocks['argument_editor_string'] = {
  init: function () {
    this.jsonInit({
      "message0": " %1",
      "args0": [
        {
          "type": "field_input_removable",
          "name": "TEXT",
          "text": "text"
        }
      ],
      "colour": Blockly.Colours.textField,
      "colourSecondary": Blockly.Colours.textField,
      "colourTertiary": Blockly.Colours.textField,
      "extensions": ["output_string"]
    });
  },
  removeFieldCallback: Blockly.PXTBlockly.FunctionUtils.removeArgumentCallback_
};

Blockly.Blocks['argument_editor_number'] = {
  init: function () {
    this.jsonInit({
      "message0": " %1",
      "args0": [
        {
          "type": "field_input_removable",
          "name": "TEXT",
          "text": "num"
        }
      ],
      "colour": Blockly.Colours.textField,
      "colourSecondary": Blockly.Colours.textField,
      "colourTertiary": Blockly.Colours.textField,
      "extensions": ["output_number"]
    });
  },
  removeFieldCallback: Blockly.PXTBlockly.FunctionUtils.removeArgumentCallback_
};

Blockly.Blocks['argument_editor_custom'] = {
  init: function () {
    this.jsonInit({
      "message0": " %1",
      "args0": [
        {
          "type": "field_input_removable",
          "name": "TEXT",
          "text": "foo"
        }
      ],
      "colour": Blockly.Colours.textField,
      "colourSecondary": Blockly.Colours.textField,
      "colourTertiary": Blockly.Colours.textField,
      "extensions": ["output_string"]
    });
  },
  removeFieldCallback: Blockly.PXTBlockly.FunctionUtils.removeArgumentCallback_
};

// Argument reporters

Blockly.Blocks['argument_reporter_boolean'] = {
  init: function () {
    this.jsonInit({
      "message0": " %1",
      "args0": [
        {
          "type": "field_label_hover",
          "name": "VALUE",
          "text": ""
        }
      ],
      "colour": Blockly.Msg.PROCEDURES_HUE,
      "extensions": ["output_boolean"]
    });
  },
  onchange: Blockly.PXTBlockly.FunctionUtils.onReporterChange
};

Blockly.Blocks['argument_reporter_number'] = {
  init: function () {
    this.jsonInit({
      "message0": " %1",
      "args0": [
        {
          "type": "field_label_hover",
          "name": "VALUE",
          "text": ""
        }
      ],
      "colour": Blockly.Msg.PROCEDURES_HUE,
      "extensions": ["output_number"]
    });
  },
  onchange: Blockly.PXTBlockly.FunctionUtils.onReporterChange
};

Blockly.Blocks['argument_reporter_string'] = {
  init: function () {
    this.jsonInit({
      "message0": " %1",
      "args0": [
        {
          "type": "field_label_hover",
          "name": "VALUE",
          "text": ""
        }
      ],
      "colour": Blockly.Msg.PROCEDURES_HUE,
      "extensions": ["output_string"]
    });
  },
  onchange: Blockly.PXTBlockly.FunctionUtils.onReporterChange
};

Blockly.Blocks['argument_reporter_custom'] = {
  init: function () {
    this.jsonInit({
      "message0": " %1",
      "args0": [
        {
          "type": "field_label_hover",
          "name": "VALUE",
          "text": ""
        }
      ],
      "colour": Blockly.Msg.PROCEDURES_HUE,
      "inputsInline": true,
      "outputShape": Blockly.OUTPUT_SHAPE_ROUND,
      "output": null
    });
  },
  onchange: Blockly.PXTBlockly.FunctionUtils.onReporterChange
};