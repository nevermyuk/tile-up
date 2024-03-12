import * as Blockly from "blockly/core";

Blockly.Blocks["forward"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("move")
      .appendField(
        new Blockly.FieldDropdown([
          ["forward", "F"],
          ["backward", "B"],
          ["left", "L"],
          ["right", "R"],
        ]),
        "direction"
      );
    this.setInputsInline(false);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(260);
    this.setTooltip("Forward");
    this.setHelpUrl("");
  },
};

Blockly.JavaScript["forward"] = function (block) {
  var dropdown_direction = block.getFieldValue("direction");
  return dropdown_direction;
};

Blockly.Blocks["backward"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("move")
      .appendField(
        new Blockly.FieldDropdown([
          ["backward", "B"],
          ["forward", "F"],
          ["left", "L"],
          ["right", "R"],
        ]),
        "direction"
      );
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(260);
    this.setTooltip("Backward");
    this.setHelpUrl("");
  },
};

Blockly.JavaScript["backward"] = function (block) {
  var dropdown_direction = block.getFieldValue("direction");
  // TODO: Assemble JavaScript into code variable.
  return dropdown_direction;
};

Blockly.Blocks["left"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("move")
      .appendField(
        new Blockly.FieldDropdown([
          ["left", "L"],
          ["right", "R"],
          ["forward", "F"],
          ["backward", "B"],
        ]),
        "direction"
      );
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(260);
    this.setTooltip("");
    this.setHelpUrl("");
  },
};

Blockly.JavaScript["left"] = function (block) {
  var dropdown_direction = block.getFieldValue("direction");
  // TODO: Assemble JavaScript into code variable.
  return dropdown_direction;
};

Blockly.Blocks["right"] = {
  init: function () {
    this.appendDummyInput()
      .setAlign(Blockly.ALIGN_CENTRE)
      .appendField("move")
      .appendField(
        new Blockly.FieldDropdown([
          ["right", "R"],
          ["left", "L"],
          ["forward", "F"],
          ["backward", "B"],
        ]),
        "direction"
      );
    this.setInputsInline(false);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(260);
    this.setTooltip("");
    this.setHelpUrl("");
  },
};

Blockly.JavaScript["right"] = function (block) {
  var dropdown_direction = block.getFieldValue("direction");
  // TODO: Assemble JavaScript into code variable.
  return dropdown_direction;
};

Blockly.Blocks["repeat_direction"] = {
  init: function () {
    this.appendDummyInput()
      .appendField("repeat move")
      .appendField(
        new Blockly.FieldDropdown([
          ["forward", "F"],
          ["backward", "B"],
          ["left", "L"],
          ["right", "R"],
        ]),
        "direction"
      )
      .appendField(new Blockly.FieldNumber(1, 1, Infinity, 1), "times")
      .appendField("times");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(330);
    this.setTooltip("");
    this.setHelpUrl("");
  },
};

Blockly.JavaScript["repeat_direction"] = function (block) {
  var dropdown_direction = block.getFieldValue("direction");
  var number_times = block.getFieldValue("times");
  return dropdown_direction.repeat(number_times);
};
