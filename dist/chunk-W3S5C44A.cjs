"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
















var _chunkYDKLITBQcjs = require('./chunk-YDKLITBQ.cjs');


var _chunkEC6JY3PVcjs = require('./chunk-EC6JY3PV.cjs');

// node_modules/@langchain/core/dist/prompts/image.js
var ImagePromptTemplate = class _ImagePromptTemplate extends _chunkYDKLITBQcjs.BasePromptTemplate {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "ImagePromptTemplate");
  }
  static lc_name() {
    return "ImagePromptTemplate";
  }
  constructor(input) {
    super(input);
    Object.defineProperty(this, "lc_namespace", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: ["langchain_core", "prompts", "image"]
    });
    Object.defineProperty(this, "template", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "templateFormat", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "f-string"
    });
    Object.defineProperty(this, "validateTemplate", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: true
    });
    this.template = input.template;
    this.templateFormat = _nullishCoalesce(input.templateFormat, () => ( this.templateFormat));
    this.validateTemplate = _nullishCoalesce(input.validateTemplate, () => ( this.validateTemplate));
    if (this.validateTemplate) {
      let totalInputVariables = this.inputVariables;
      if (this.partialVariables) {
        totalInputVariables = totalInputVariables.concat(Object.keys(this.partialVariables));
      }
      _chunkYDKLITBQcjs.checkValidTemplate.call(void 0, [
        { type: "image_url", image_url: this.template }
      ], this.templateFormat, totalInputVariables);
    }
  }
  _getPromptType() {
    return "prompt";
  }
  /**
   * Partially applies values to the prompt template.
   * @param values The values to be partially applied to the prompt template.
   * @returns A new instance of ImagePromptTemplate with the partially applied values.
   */
  async partial(values) {
    const newInputVariables = this.inputVariables.filter((iv) => !(iv in values));
    const newPartialVariables = {
      ..._nullishCoalesce(this.partialVariables, () => ( {})),
      ...values
    };
    const promptDict = {
      ...this,
      inputVariables: newInputVariables,
      partialVariables: newPartialVariables
    };
    return new _ImagePromptTemplate(promptDict);
  }
  /**
   * Formats the prompt template with the provided values.
   * @param values The values to be used to format the prompt template.
   * @returns A promise that resolves to a string which is the formatted prompt.
   */
  async format(values) {
    const formatted = {};
    for (const [key, value] of Object.entries(this.template)) {
      if (typeof value === "string") {
        formatted[key] = value.replace(/{([^{}]*)}/g, (match, group) => {
          const replacement = values[group];
          return typeof replacement === "string" || typeof replacement === "number" ? String(replacement) : match;
        });
      } else {
        formatted[key] = value;
      }
    }
    const url = values.url || formatted.url;
    const detail = values.detail || formatted.detail;
    if (!url) {
      throw new Error("Must provide either an image URL.");
    }
    if (typeof url !== "string") {
      throw new Error("url must be a string.");
    }
    const output = { url };
    if (detail) {
      output.detail = detail;
    }
    return output;
  }
  /**
   * Formats the prompt given the input values and returns a formatted
   * prompt value.
   * @param values The input values to format the prompt.
   * @returns A Promise that resolves to a formatted prompt value.
   */
  async formatPromptValue(values) {
    const formattedPrompt = await this.format(values);
    return new (0, _chunkYDKLITBQcjs.ImagePromptValue)(formattedPrompt);
  }
};

// node_modules/@langchain/core/dist/prompts/chat.js
var BaseMessagePromptTemplate = class extends _chunkYDKLITBQcjs.Runnable {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "BaseMessagePromptTemplate");
  }
  constructor() {
    super(...arguments);
    Object.defineProperty(this, "lc_namespace", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: ["langchain_core", "prompts", "chat"]
    });
    Object.defineProperty(this, "lc_serializable", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: true
    });
  }
  /**
   * Calls the formatMessages method with the provided input and options.
   * @param input Input for the formatMessages method
   * @param options Optional BaseCallbackConfig
   * @returns Formatted output messages
   */
  async invoke(input, options) {
    return this._callWithConfig((input2) => this.formatMessages(input2), input, { ...options, runType: "prompt" });
  }
};
var BaseMessageStringPromptTemplate = class extends BaseMessagePromptTemplate {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "BaseMessageStringPromptTemplate");
  }
  constructor(fields) {
    if (!("prompt" in fields)) {
      fields = { prompt: fields };
    }
    super(fields);
    Object.defineProperty(this, "prompt", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.prompt = fields.prompt;
  }
  get inputVariables() {
    return this.prompt.inputVariables;
  }
  async formatMessages(values) {
    return [await this.format(values)];
  }
};
var BaseChatPromptTemplate = class extends _chunkYDKLITBQcjs.BasePromptTemplate {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "BaseChatPromptTemplate");
  }
  constructor(input) {
    super(input);
  }
  async format(values) {
    return (await this.formatPromptValue(values)).toString();
  }
  async formatPromptValue(values) {
    const resultMessages = await this.formatMessages(values);
    return new (0, _chunkYDKLITBQcjs.ChatPromptValue)(resultMessages);
  }
};
var ChatMessagePromptTemplate = class extends BaseMessageStringPromptTemplate {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "ChatMessagePromptTemplate");
  }
  static lc_name() {
    return "ChatMessagePromptTemplate";
  }
  constructor(fields, role) {
    if (!("prompt" in fields)) {
      fields = { prompt: fields, role };
    }
    super(fields);
    Object.defineProperty(this, "role", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.role = fields.role;
  }
  async format(values) {
    return new (0, _chunkYDKLITBQcjs.ChatMessage)(await this.prompt.format(values), this.role);
  }
  static fromTemplate(template, role) {
    return new this(_chunkYDKLITBQcjs.PromptTemplate.fromTemplate(template), role);
  }
};
var _StringImageMessagePromptTemplate = class extends BaseMessagePromptTemplate {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "_StringImageMessagePromptTemplate");
  }
  static _messageClass() {
    throw new Error("Can not invoke _messageClass from inside _StringImageMessagePromptTemplate");
  }
  constructor(fields, additionalOptions) {
    if (!("prompt" in fields)) {
      fields = { prompt: fields };
    }
    super(fields);
    Object.defineProperty(this, "lc_namespace", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: ["langchain_core", "prompts", "chat"]
    });
    Object.defineProperty(this, "lc_serializable", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: true
    });
    Object.defineProperty(this, "inputVariables", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: []
    });
    Object.defineProperty(this, "additionalOptions", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: {}
    });
    Object.defineProperty(this, "prompt", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "messageClass", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "chatMessageClass", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.prompt = fields.prompt;
    if (Array.isArray(this.prompt)) {
      let inputVariables = [];
      this.prompt.forEach((prompt) => {
        if ("inputVariables" in prompt) {
          inputVariables = inputVariables.concat(prompt.inputVariables);
        }
      });
      this.inputVariables = inputVariables;
    } else {
      this.inputVariables = this.prompt.inputVariables;
    }
    this.additionalOptions = _nullishCoalesce(additionalOptions, () => ( this.additionalOptions));
  }
  createMessage(content) {
    const constructor = this.constructor;
    if (constructor._messageClass()) {
      const MsgClass = constructor._messageClass();
      return new MsgClass({ content });
    } else if (constructor.chatMessageClass) {
      const MsgClass = constructor.chatMessageClass();
      return new MsgClass({
        content,
        role: this.getRoleFromMessageClass(MsgClass.lc_name())
      });
    } else {
      throw new Error("No message class defined");
    }
  }
  getRoleFromMessageClass(name) {
    switch (name) {
      case "HumanMessage":
        return "human";
      case "AIMessage":
        return "ai";
      case "SystemMessage":
        return "system";
      case "ChatMessage":
        return "chat";
      default:
        throw new Error("Invalid message class name");
    }
  }
  static fromTemplate(template, additionalOptions) {
    if (typeof template === "string") {
      return new this(_chunkYDKLITBQcjs.PromptTemplate.fromTemplate(template));
    }
    const prompt = [];
    for (const item of template) {
      if (typeof item === "string" || typeof item === "object" && "text" in item) {
        let text = "";
        if (typeof item === "string") {
          text = item;
        } else if (typeof item.text === "string") {
          text = _nullishCoalesce(item.text, () => ( ""));
        }
        prompt.push(_chunkYDKLITBQcjs.PromptTemplate.fromTemplate(text));
      } else if (typeof item === "object" && "image_url" in item) {
        let imgTemplate = _nullishCoalesce(item.image_url, () => ( ""));
        let imgTemplateObject;
        let inputVariables = [];
        if (typeof imgTemplate === "string") {
          const parsedTemplate = _chunkYDKLITBQcjs.parseFString.call(void 0, imgTemplate);
          const variables = parsedTemplate.flatMap((item2) => item2.type === "variable" ? [item2.name] : []);
          if ((_nullishCoalesce(_optionalChain([variables, 'optionalAccess', _ => _.length]), () => ( 0))) > 0) {
            if (variables.length > 1) {
              throw new Error(`Only one format variable allowed per image template.
Got: ${variables}
From: ${imgTemplate}`);
            }
            inputVariables = [variables[0]];
          } else {
            inputVariables = [];
          }
          imgTemplate = { url: imgTemplate };
          imgTemplateObject = new ImagePromptTemplate({
            template: imgTemplate,
            inputVariables
          });
        } else if (typeof imgTemplate === "object") {
          if ("url" in imgTemplate) {
            const parsedTemplate = _chunkYDKLITBQcjs.parseFString.call(void 0, imgTemplate.url);
            inputVariables = parsedTemplate.flatMap((item2) => item2.type === "variable" ? [item2.name] : []);
          } else {
            inputVariables = [];
          }
          imgTemplateObject = new ImagePromptTemplate({
            template: imgTemplate,
            inputVariables
          });
        } else {
          throw new Error("Invalid image template");
        }
        prompt.push(imgTemplateObject);
      }
    }
    return new this({ prompt, additionalOptions });
  }
  async format(input) {
    if (this.prompt instanceof _chunkYDKLITBQcjs.BaseStringPromptTemplate) {
      const text = await this.prompt.format(input);
      return this.createMessage(text);
    } else {
      const content = [];
      for (const prompt of this.prompt) {
        let inputs = {};
        if (!("inputVariables" in prompt)) {
          throw new Error(`Prompt ${prompt} does not have inputVariables defined.`);
        }
        for (const item of prompt.inputVariables) {
          if (!inputs) {
            inputs = { [item]: input[item] };
          }
          inputs = { ...inputs, [item]: input[item] };
        }
        if (prompt instanceof _chunkYDKLITBQcjs.BaseStringPromptTemplate) {
          const formatted = await prompt.format(inputs);
          content.push({ type: "text", text: formatted });
        } else if (prompt instanceof ImagePromptTemplate) {
          const formatted = await prompt.format(inputs);
          content.push({ type: "image_url", image_url: formatted });
        }
      }
      return this.createMessage(content);
    }
  }
  async formatMessages(values) {
    return [await this.format(values)];
  }
};
var HumanMessagePromptTemplate = class extends _StringImageMessagePromptTemplate {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "HumanMessagePromptTemplate");
  }
  static _messageClass() {
    return _chunkYDKLITBQcjs.HumanMessage;
  }
  static lc_name() {
    return "HumanMessagePromptTemplate";
  }
};
var AIMessagePromptTemplate = class extends _StringImageMessagePromptTemplate {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "AIMessagePromptTemplate");
  }
  static _messageClass() {
    return _chunkYDKLITBQcjs.AIMessage;
  }
  static lc_name() {
    return "AIMessagePromptTemplate";
  }
};
var SystemMessagePromptTemplate = class extends _StringImageMessagePromptTemplate {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "SystemMessagePromptTemplate");
  }
  static _messageClass() {
    return _chunkYDKLITBQcjs.SystemMessage;
  }
  static lc_name() {
    return "SystemMessagePromptTemplate";
  }
};
function _isBaseMessagePromptTemplate(baseMessagePromptTemplateLike) {
  return typeof baseMessagePromptTemplateLike.formatMessages === "function";
}
_chunkEC6JY3PVcjs.__name.call(void 0, _isBaseMessagePromptTemplate, "_isBaseMessagePromptTemplate");
function _coerceMessagePromptTemplateLike(messagePromptTemplateLike) {
  if (_isBaseMessagePromptTemplate(messagePromptTemplateLike) || _chunkYDKLITBQcjs.isBaseMessage.call(void 0, messagePromptTemplateLike)) {
    return messagePromptTemplateLike;
  }
  const message = _chunkYDKLITBQcjs.coerceMessageLikeToMessage.call(void 0, messagePromptTemplateLike);
  if (message._getType() === "human") {
    return HumanMessagePromptTemplate.fromTemplate(message.content);
  } else if (message._getType() === "ai") {
    return AIMessagePromptTemplate.fromTemplate(message.content);
  } else if (message._getType() === "system") {
    return SystemMessagePromptTemplate.fromTemplate(message.content);
  } else if (_chunkYDKLITBQcjs.ChatMessage.isInstance(message)) {
    return ChatMessagePromptTemplate.fromTemplate(message.content, message.role);
  } else {
    throw new Error(`Could not coerce message prompt template from input. Received message type: "${message._getType()}".`);
  }
}
_chunkEC6JY3PVcjs.__name.call(void 0, _coerceMessagePromptTemplateLike, "_coerceMessagePromptTemplateLike");
function isMessagesPlaceholder(x) {
  return x.constructor.lc_name() === "MessagesPlaceholder";
}
_chunkEC6JY3PVcjs.__name.call(void 0, isMessagesPlaceholder, "isMessagesPlaceholder");
var ChatPromptTemplate = class _ChatPromptTemplate extends BaseChatPromptTemplate {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "ChatPromptTemplate");
  }
  static lc_name() {
    return "ChatPromptTemplate";
  }
  get lc_aliases() {
    return {
      promptMessages: "messages"
    };
  }
  constructor(input) {
    super(input);
    Object.defineProperty(this, "promptMessages", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "validateTemplate", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: true
    });
    Object.assign(this, input);
    if (this.validateTemplate) {
      const inputVariablesMessages = /* @__PURE__ */ new Set();
      for (const promptMessage of this.promptMessages) {
        if (promptMessage instanceof _chunkYDKLITBQcjs.BaseMessage)
          continue;
        for (const inputVariable of promptMessage.inputVariables) {
          inputVariablesMessages.add(inputVariable);
        }
      }
      const totalInputVariables = this.inputVariables;
      const inputVariablesInstance = new Set(this.partialVariables ? totalInputVariables.concat(Object.keys(this.partialVariables)) : totalInputVariables);
      const difference = new Set([...inputVariablesInstance].filter((x) => !inputVariablesMessages.has(x)));
      if (difference.size > 0) {
        throw new Error(`Input variables \`${[
          ...difference
        ]}\` are not used in any of the prompt messages.`);
      }
      const otherDifference = new Set([...inputVariablesMessages].filter((x) => !inputVariablesInstance.has(x)));
      if (otherDifference.size > 0) {
        throw new Error(`Input variables \`${[
          ...otherDifference
        ]}\` are used in prompt messages but not in the prompt template.`);
      }
    }
  }
  _getPromptType() {
    return "chat";
  }
  async _parseImagePrompts(message, inputValues) {
    if (typeof message.content === "string") {
      return message;
    }
    const formattedMessageContent = await Promise.all(message.content.map(async (item) => {
      if (item.type !== "image_url") {
        return item;
      }
      let imageUrl = "";
      if (typeof item.image_url === "string") {
        imageUrl = item.image_url;
      } else {
        imageUrl = item.image_url.url;
      }
      const promptTemplatePlaceholder = _chunkYDKLITBQcjs.PromptTemplate.fromTemplate(imageUrl);
      const formattedUrl = await promptTemplatePlaceholder.format(inputValues);
      if (typeof item.image_url !== "string" && "url" in item.image_url) {
        item.image_url.url = formattedUrl;
      } else {
        item.image_url = formattedUrl;
      }
      return item;
    }));
    message.content = formattedMessageContent;
    return message;
  }
  async formatMessages(values) {
    const allValues = await this.mergePartialAndUserVariables(values);
    let resultMessages = [];
    for (const promptMessage of this.promptMessages) {
      if (promptMessage instanceof _chunkYDKLITBQcjs.BaseMessage) {
        resultMessages.push(await this._parseImagePrompts(promptMessage, allValues));
      } else {
        const inputValues = promptMessage.inputVariables.reduce((acc, inputVariable) => {
          if (!(inputVariable in allValues) && !(isMessagesPlaceholder(promptMessage) && promptMessage.optional)) {
            throw new Error(`Missing value for input variable \`${inputVariable.toString()}\``);
          }
          acc[inputVariable] = allValues[inputVariable];
          return acc;
        }, {});
        const message = await promptMessage.formatMessages(inputValues);
        resultMessages = resultMessages.concat(message);
      }
    }
    return resultMessages;
  }
  async partial(values) {
    const newInputVariables = this.inputVariables.filter((iv) => !(iv in values));
    const newPartialVariables = {
      ..._nullishCoalesce(this.partialVariables, () => ( {})),
      ...values
    };
    const promptDict = {
      ...this,
      inputVariables: newInputVariables,
      partialVariables: newPartialVariables
    };
    return new _ChatPromptTemplate(promptDict);
  }
  /**
   * Load prompt template from a template f-string
   */
  static fromTemplate(template) {
    const prompt = _chunkYDKLITBQcjs.PromptTemplate.fromTemplate(template);
    const humanTemplate = new HumanMessagePromptTemplate({ prompt });
    return this.fromMessages([humanTemplate]);
  }
  /**
   * Create a chat model-specific prompt from individual chat messages
   * or message-like tuples.
   * @param promptMessages Messages to be passed to the chat model
   * @returns A new ChatPromptTemplate
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromMessages(promptMessages) {
    const flattenedMessages = promptMessages.reduce((acc, promptMessage) => acc.concat(
      // eslint-disable-next-line no-instanceof/no-instanceof
      promptMessage instanceof _ChatPromptTemplate ? promptMessage.promptMessages : [_coerceMessagePromptTemplateLike(promptMessage)]
    ), []);
    const flattenedPartialVariables = promptMessages.reduce((acc, promptMessage) => (
      // eslint-disable-next-line no-instanceof/no-instanceof
      promptMessage instanceof _ChatPromptTemplate ? Object.assign(acc, promptMessage.partialVariables) : acc
    ), /* @__PURE__ */ Object.create(null));
    const inputVariables = /* @__PURE__ */ new Set();
    for (const promptMessage of flattenedMessages) {
      if (promptMessage instanceof _chunkYDKLITBQcjs.BaseMessage)
        continue;
      for (const inputVariable of promptMessage.inputVariables) {
        if (inputVariable in flattenedPartialVariables) {
          continue;
        }
        inputVariables.add(inputVariable);
      }
    }
    return new _ChatPromptTemplate({
      inputVariables: [...inputVariables],
      promptMessages: flattenedMessages,
      partialVariables: flattenedPartialVariables
    });
  }
  /** @deprecated Renamed to .fromMessages */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromPromptMessages(promptMessages) {
    return this.fromMessages(promptMessages);
  }
};

// node_modules/@langchain/core/dist/prompts/few_shot.js
var FewShotPromptTemplate = class _FewShotPromptTemplate extends _chunkYDKLITBQcjs.BaseStringPromptTemplate {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "FewShotPromptTemplate");
  }
  constructor(input) {
    super(input);
    Object.defineProperty(this, "lc_serializable", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: false
    });
    Object.defineProperty(this, "examples", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "exampleSelector", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "examplePrompt", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "suffix", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: ""
    });
    Object.defineProperty(this, "exampleSeparator", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "\n\n"
    });
    Object.defineProperty(this, "prefix", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: ""
    });
    Object.defineProperty(this, "templateFormat", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "f-string"
    });
    Object.defineProperty(this, "validateTemplate", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: true
    });
    Object.assign(this, input);
    if (this.examples !== void 0 && this.exampleSelector !== void 0) {
      throw new Error("Only one of 'examples' and 'example_selector' should be provided");
    }
    if (this.examples === void 0 && this.exampleSelector === void 0) {
      throw new Error("One of 'examples' and 'example_selector' should be provided");
    }
    if (this.validateTemplate) {
      let totalInputVariables = this.inputVariables;
      if (this.partialVariables) {
        totalInputVariables = totalInputVariables.concat(Object.keys(this.partialVariables));
      }
      _chunkYDKLITBQcjs.checkValidTemplate.call(void 0, this.prefix + this.suffix, this.templateFormat, totalInputVariables);
    }
  }
  _getPromptType() {
    return "few_shot";
  }
  static lc_name() {
    return "FewShotPromptTemplate";
  }
  async getExamples(inputVariables) {
    if (this.examples !== void 0) {
      return this.examples;
    }
    if (this.exampleSelector !== void 0) {
      return this.exampleSelector.selectExamples(inputVariables);
    }
    throw new Error("One of 'examples' and 'example_selector' should be provided");
  }
  async partial(values) {
    const newInputVariables = this.inputVariables.filter((iv) => !(iv in values));
    const newPartialVariables = {
      ..._nullishCoalesce(this.partialVariables, () => ( {})),
      ...values
    };
    const promptDict = {
      ...this,
      inputVariables: newInputVariables,
      partialVariables: newPartialVariables
    };
    return new _FewShotPromptTemplate(promptDict);
  }
  /**
   * Formats the prompt with the given values.
   * @param values The values to format the prompt with.
   * @returns A promise that resolves to a string representing the formatted prompt.
   */
  async format(values) {
    const allValues = await this.mergePartialAndUserVariables(values);
    const examples = await this.getExamples(allValues);
    const exampleStrings = await Promise.all(examples.map((example) => this.examplePrompt.format(example)));
    const template = [this.prefix, ...exampleStrings, this.suffix].join(this.exampleSeparator);
    return _chunkYDKLITBQcjs.renderTemplate.call(void 0, template, this.templateFormat, allValues);
  }
  serialize() {
    if (this.exampleSelector || !this.examples) {
      throw new Error("Serializing an example selector is not currently supported");
    }
    if (this.outputParser !== void 0) {
      throw new Error("Serializing an output parser is not currently supported");
    }
    return {
      _type: this._getPromptType(),
      input_variables: this.inputVariables,
      example_prompt: this.examplePrompt.serialize(),
      example_separator: this.exampleSeparator,
      suffix: this.suffix,
      prefix: this.prefix,
      template_format: this.templateFormat,
      examples: this.examples
    };
  }
  static async deserialize(data) {
    const { example_prompt } = data;
    if (!example_prompt) {
      throw new Error("Missing example prompt");
    }
    const examplePrompt = await _chunkYDKLITBQcjs.PromptTemplate.deserialize(example_prompt);
    let examples;
    if (Array.isArray(data.examples)) {
      examples = data.examples;
    } else {
      throw new Error("Invalid examples format. Only list or string are supported.");
    }
    return new _FewShotPromptTemplate({
      inputVariables: data.input_variables,
      examplePrompt,
      examples,
      exampleSeparator: data.example_separator,
      prefix: data.prefix,
      suffix: data.suffix,
      templateFormat: data.template_format
    });
  }
};
var FewShotChatMessagePromptTemplate = class _FewShotChatMessagePromptTemplate extends BaseChatPromptTemplate {
  static {
    _chunkEC6JY3PVcjs.__name.call(void 0, this, "FewShotChatMessagePromptTemplate");
  }
  _getPromptType() {
    return "few_shot_chat";
  }
  static lc_name() {
    return "FewShotChatMessagePromptTemplate";
  }
  constructor(fields) {
    super(fields);
    Object.defineProperty(this, "lc_serializable", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: true
    });
    Object.defineProperty(this, "examples", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "exampleSelector", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "examplePrompt", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "suffix", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: ""
    });
    Object.defineProperty(this, "exampleSeparator", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "\n\n"
    });
    Object.defineProperty(this, "prefix", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: ""
    });
    Object.defineProperty(this, "templateFormat", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "f-string"
    });
    Object.defineProperty(this, "validateTemplate", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: true
    });
    this.examples = fields.examples;
    this.examplePrompt = fields.examplePrompt;
    this.exampleSeparator = _nullishCoalesce(fields.exampleSeparator, () => ( "\n\n"));
    this.exampleSelector = fields.exampleSelector;
    this.prefix = _nullishCoalesce(fields.prefix, () => ( ""));
    this.suffix = _nullishCoalesce(fields.suffix, () => ( ""));
    this.templateFormat = _nullishCoalesce(fields.templateFormat, () => ( "f-string"));
    this.validateTemplate = _nullishCoalesce(fields.validateTemplate, () => ( true));
    if (this.examples !== void 0 && this.exampleSelector !== void 0) {
      throw new Error("Only one of 'examples' and 'example_selector' should be provided");
    }
    if (this.examples === void 0 && this.exampleSelector === void 0) {
      throw new Error("One of 'examples' and 'example_selector' should be provided");
    }
    if (this.validateTemplate) {
      let totalInputVariables = this.inputVariables;
      if (this.partialVariables) {
        totalInputVariables = totalInputVariables.concat(Object.keys(this.partialVariables));
      }
      _chunkYDKLITBQcjs.checkValidTemplate.call(void 0, this.prefix + this.suffix, this.templateFormat, totalInputVariables);
    }
  }
  async getExamples(inputVariables) {
    if (this.examples !== void 0) {
      return this.examples;
    }
    if (this.exampleSelector !== void 0) {
      return this.exampleSelector.selectExamples(inputVariables);
    }
    throw new Error("One of 'examples' and 'example_selector' should be provided");
  }
  /**
   * Formats the list of values and returns a list of formatted messages.
   * @param values The values to format the prompt with.
   * @returns A promise that resolves to a string representing the formatted prompt.
   */
  async formatMessages(values) {
    const allValues = await this.mergePartialAndUserVariables(values);
    let examples = await this.getExamples(allValues);
    examples = examples.map((example) => {
      const result = {};
      this.examplePrompt.inputVariables.forEach((inputVariable) => {
        result[inputVariable] = example[inputVariable];
      });
      return result;
    });
    const messages = [];
    for (const example of examples) {
      const exampleMessages = await this.examplePrompt.formatMessages(example);
      messages.push(...exampleMessages);
    }
    return messages;
  }
  /**
   * Formats the prompt with the given values.
   * @param values The values to format the prompt with.
   * @returns A promise that resolves to a string representing the formatted prompt.
   */
  async format(values) {
    const allValues = await this.mergePartialAndUserVariables(values);
    const examples = await this.getExamples(allValues);
    const exampleMessages = await Promise.all(examples.map((example) => this.examplePrompt.formatMessages(example)));
    const exampleStrings = exampleMessages.flat().map((message) => message.content);
    const template = [this.prefix, ...exampleStrings, this.suffix].join(this.exampleSeparator);
    return _chunkYDKLITBQcjs.renderTemplate.call(void 0, template, this.templateFormat, allValues);
  }
  /**
   * Partially formats the prompt with the given values.
   * @param values The values to partially format the prompt with.
   * @returns A promise that resolves to an instance of `FewShotChatMessagePromptTemplate` with the given values partially formatted.
   */
  async partial(values) {
    const newInputVariables = this.inputVariables.filter((variable) => !(variable in values));
    const newPartialVariables = {
      ..._nullishCoalesce(this.partialVariables, () => ( {})),
      ...values
    };
    const promptDict = {
      ...this,
      inputVariables: newInputVariables,
      partialVariables: newPartialVariables
    };
    return new _FewShotChatMessagePromptTemplate(promptDict);
  }
};





exports.ChatPromptTemplate = ChatPromptTemplate; exports.FewShotPromptTemplate = FewShotPromptTemplate; exports.FewShotChatMessagePromptTemplate = FewShotChatMessagePromptTemplate;
