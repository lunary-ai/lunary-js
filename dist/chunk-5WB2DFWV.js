import {
  AIMessage,
  BaseMessage,
  BasePromptTemplate,
  BaseStringPromptTemplate,
  ChatMessage,
  ChatPromptValue,
  HumanMessage,
  ImagePromptValue,
  PromptTemplate,
  Runnable,
  SystemMessage,
  addLangChainErrorFields,
  checkValidTemplate,
  coerceMessageLikeToMessage,
  isBaseMessage,
  parseFString,
  parseMustache,
  renderTemplate
} from "./chunk-NONCHV5C.js";
import {
  __name
} from "./chunk-AGSXOS4O.js";

// node_modules/@langchain/core/dist/prompts/image.js
var ImagePromptTemplate = class _ImagePromptTemplate extends BasePromptTemplate {
  static {
    __name(this, "ImagePromptTemplate");
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
    Object.defineProperty(this, "additionalContentFields", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.template = input.template;
    this.templateFormat = input.templateFormat ?? this.templateFormat;
    this.validateTemplate = input.validateTemplate ?? this.validateTemplate;
    this.additionalContentFields = input.additionalContentFields;
    if (this.validateTemplate) {
      let totalInputVariables = this.inputVariables;
      if (this.partialVariables) {
        totalInputVariables = totalInputVariables.concat(Object.keys(this.partialVariables));
      }
      checkValidTemplate([
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
      ...this.partialVariables ?? {},
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
        formatted[key] = renderTemplate(value, this.templateFormat, values);
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
    return new ImagePromptValue(formattedPrompt);
  }
};

// node_modules/@langchain/core/dist/prompts/chat.js
var BaseMessagePromptTemplate = class extends Runnable {
  static {
    __name(this, "BaseMessagePromptTemplate");
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
var MessagesPlaceholder = class extends BaseMessagePromptTemplate {
  static {
    __name(this, "MessagesPlaceholder");
  }
  static lc_name() {
    return "MessagesPlaceholder";
  }
  constructor(fields) {
    if (typeof fields === "string") {
      fields = { variableName: fields };
    }
    super(fields);
    Object.defineProperty(this, "variableName", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "optional", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this.variableName = fields.variableName;
    this.optional = fields.optional ?? false;
  }
  get inputVariables() {
    return [this.variableName];
  }
  async formatMessages(values) {
    const input = values[this.variableName];
    if (this.optional && !input) {
      return [];
    } else if (!input) {
      const error = new Error(`Field "${this.variableName}" in prompt uses a MessagesPlaceholder, which expects an array of BaseMessages as an input value. Received: undefined`);
      error.name = "InputFormatError";
      throw error;
    }
    let formattedMessages;
    try {
      if (Array.isArray(input)) {
        formattedMessages = input.map(coerceMessageLikeToMessage);
      } else {
        formattedMessages = [coerceMessageLikeToMessage(input)];
      }
    } catch (e) {
      const readableInput = typeof input === "string" ? input : JSON.stringify(input, null, 2);
      const error = new Error([
        `Field "${this.variableName}" in prompt uses a MessagesPlaceholder, which expects an array of BaseMessages or coerceable values as input.`,
        `Received value: ${readableInput}`,
        `Additional message: ${e.message}`
      ].join("\n\n"));
      error.name = "InputFormatError";
      error.lc_error_code = e.lc_error_code;
      throw error;
    }
    return formattedMessages;
  }
};
var BaseMessageStringPromptTemplate = class extends BaseMessagePromptTemplate {
  static {
    __name(this, "BaseMessageStringPromptTemplate");
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
var BaseChatPromptTemplate = class extends BasePromptTemplate {
  static {
    __name(this, "BaseChatPromptTemplate");
  }
  constructor(input) {
    super(input);
  }
  async format(values) {
    return (await this.formatPromptValue(values)).toString();
  }
  async formatPromptValue(values) {
    const resultMessages = await this.formatMessages(values);
    return new ChatPromptValue(resultMessages);
  }
};
var ChatMessagePromptTemplate = class extends BaseMessageStringPromptTemplate {
  static {
    __name(this, "ChatMessagePromptTemplate");
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
    return new ChatMessage(await this.prompt.format(values), this.role);
  }
  static fromTemplate(template, role, options) {
    return new this(PromptTemplate.fromTemplate(template, {
      templateFormat: options?.templateFormat
    }), role);
  }
};
var _StringImageMessagePromptTemplate = class extends BaseMessagePromptTemplate {
  static {
    __name(this, "_StringImageMessagePromptTemplate");
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
    this.additionalOptions = additionalOptions ?? this.additionalOptions;
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
      return new this(PromptTemplate.fromTemplate(template, additionalOptions));
    }
    const prompt = [];
    for (const item of template) {
      if (typeof item === "string" || typeof item === "object" && "text" in item) {
        let text = "";
        if (typeof item === "string") {
          text = item;
        } else if (typeof item.text === "string") {
          text = item.text ?? "";
        }
        const options = {
          ...additionalOptions,
          ...typeof item !== "string" ? { additionalContentFields: item } : {}
        };
        prompt.push(PromptTemplate.fromTemplate(text, options));
      } else if (typeof item === "object" && "image_url" in item) {
        let imgTemplate = item.image_url ?? "";
        let imgTemplateObject;
        let inputVariables = [];
        if (typeof imgTemplate === "string") {
          let parsedTemplate;
          if (additionalOptions?.templateFormat === "mustache") {
            parsedTemplate = parseMustache(imgTemplate);
          } else {
            parsedTemplate = parseFString(imgTemplate);
          }
          const variables = parsedTemplate.flatMap((item2) => item2.type === "variable" ? [item2.name] : []);
          if ((variables?.length ?? 0) > 0) {
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
            inputVariables,
            templateFormat: additionalOptions?.templateFormat,
            additionalContentFields: item
          });
        } else if (typeof imgTemplate === "object") {
          if ("url" in imgTemplate) {
            let parsedTemplate;
            if (additionalOptions?.templateFormat === "mustache") {
              parsedTemplate = parseMustache(imgTemplate.url);
            } else {
              parsedTemplate = parseFString(imgTemplate.url);
            }
            inputVariables = parsedTemplate.flatMap((item2) => item2.type === "variable" ? [item2.name] : []);
          } else {
            inputVariables = [];
          }
          imgTemplateObject = new ImagePromptTemplate({
            template: imgTemplate,
            inputVariables,
            templateFormat: additionalOptions?.templateFormat,
            additionalContentFields: item
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
    if (this.prompt instanceof BaseStringPromptTemplate) {
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
        if (prompt instanceof BaseStringPromptTemplate) {
          const formatted = await prompt.format(inputs);
          let additionalContentFields;
          if ("additionalContentFields" in prompt) {
            additionalContentFields = prompt.additionalContentFields;
          }
          content.push({
            ...additionalContentFields,
            type: "text",
            text: formatted
          });
        } else if (prompt instanceof ImagePromptTemplate) {
          const formatted = await prompt.format(inputs);
          let additionalContentFields;
          if ("additionalContentFields" in prompt) {
            additionalContentFields = prompt.additionalContentFields;
          }
          content.push({
            ...additionalContentFields,
            type: "image_url",
            image_url: formatted
          });
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
    __name(this, "HumanMessagePromptTemplate");
  }
  static _messageClass() {
    return HumanMessage;
  }
  static lc_name() {
    return "HumanMessagePromptTemplate";
  }
};
var AIMessagePromptTemplate = class extends _StringImageMessagePromptTemplate {
  static {
    __name(this, "AIMessagePromptTemplate");
  }
  static _messageClass() {
    return AIMessage;
  }
  static lc_name() {
    return "AIMessagePromptTemplate";
  }
};
var SystemMessagePromptTemplate = class extends _StringImageMessagePromptTemplate {
  static {
    __name(this, "SystemMessagePromptTemplate");
  }
  static _messageClass() {
    return SystemMessage;
  }
  static lc_name() {
    return "SystemMessagePromptTemplate";
  }
};
function _isBaseMessagePromptTemplate(baseMessagePromptTemplateLike) {
  return typeof baseMessagePromptTemplateLike.formatMessages === "function";
}
__name(_isBaseMessagePromptTemplate, "_isBaseMessagePromptTemplate");
function _coerceMessagePromptTemplateLike(messagePromptTemplateLike, extra) {
  if (_isBaseMessagePromptTemplate(messagePromptTemplateLike) || isBaseMessage(messagePromptTemplateLike)) {
    return messagePromptTemplateLike;
  }
  if (Array.isArray(messagePromptTemplateLike) && messagePromptTemplateLike[0] === "placeholder") {
    const messageContent = messagePromptTemplateLike[1];
    if (typeof messageContent !== "string" || messageContent[0] !== "{" || messageContent[messageContent.length - 1] !== "}") {
      throw new Error(`Invalid placeholder template: "${messagePromptTemplateLike[1]}". Expected a variable name surrounded by curly braces.`);
    }
    const variableName = messageContent.slice(1, -1);
    return new MessagesPlaceholder({ variableName, optional: true });
  }
  const message = coerceMessageLikeToMessage(messagePromptTemplateLike);
  let templateData;
  if (typeof message.content === "string") {
    templateData = message.content;
  } else {
    templateData = message.content.map((item) => {
      if ("text" in item) {
        return { ...item, text: item.text };
      } else if ("image_url" in item) {
        return { ...item, image_url: item.image_url };
      } else {
        return item;
      }
    });
  }
  if (message._getType() === "human") {
    return HumanMessagePromptTemplate.fromTemplate(templateData, extra);
  } else if (message._getType() === "ai") {
    return AIMessagePromptTemplate.fromTemplate(templateData, extra);
  } else if (message._getType() === "system") {
    return SystemMessagePromptTemplate.fromTemplate(templateData, extra);
  } else if (ChatMessage.isInstance(message)) {
    return ChatMessagePromptTemplate.fromTemplate(message.content, message.role, extra);
  } else {
    throw new Error(`Could not coerce message prompt template from input. Received message type: "${message._getType()}".`);
  }
}
__name(_coerceMessagePromptTemplateLike, "_coerceMessagePromptTemplateLike");
function isMessagesPlaceholder(x) {
  return x.constructor.lc_name() === "MessagesPlaceholder";
}
__name(isMessagesPlaceholder, "isMessagesPlaceholder");
var ChatPromptTemplate = class _ChatPromptTemplate extends BaseChatPromptTemplate {
  static {
    __name(this, "ChatPromptTemplate");
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
    Object.defineProperty(this, "templateFormat", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "f-string"
    });
    if (input.templateFormat === "mustache" && input.validateTemplate === void 0) {
      this.validateTemplate = false;
    }
    Object.assign(this, input);
    if (this.validateTemplate) {
      const inputVariablesMessages = /* @__PURE__ */ new Set();
      for (const promptMessage of this.promptMessages) {
        if (promptMessage instanceof BaseMessage)
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
      const promptTemplatePlaceholder = PromptTemplate.fromTemplate(imageUrl, {
        templateFormat: this.templateFormat
      });
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
      if (promptMessage instanceof BaseMessage) {
        resultMessages.push(await this._parseImagePrompts(promptMessage, allValues));
      } else {
        const inputValues = promptMessage.inputVariables.reduce((acc, inputVariable) => {
          if (!(inputVariable in allValues) && !(isMessagesPlaceholder(promptMessage) && promptMessage.optional)) {
            const error = addLangChainErrorFields(new Error(`Missing value for input variable \`${inputVariable.toString()}\``), "INVALID_PROMPT_INPUT");
            throw error;
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
      ...this.partialVariables ?? {},
      ...values
    };
    const promptDict = {
      ...this,
      inputVariables: newInputVariables,
      partialVariables: newPartialVariables
    };
    return new _ChatPromptTemplate(promptDict);
  }
  static fromTemplate(template, options) {
    const prompt = PromptTemplate.fromTemplate(template, options);
    const humanTemplate = new HumanMessagePromptTemplate({ prompt });
    return this.fromMessages([humanTemplate]);
  }
  /**
   * Create a chat model-specific prompt from individual chat messages
   * or message-like tuples.
   * @param promptMessages Messages to be passed to the chat model
   * @returns A new ChatPromptTemplate
   */
  static fromMessages(promptMessages, extra) {
    const flattenedMessages = promptMessages.reduce((acc, promptMessage) => acc.concat(
      // eslint-disable-next-line no-instanceof/no-instanceof
      promptMessage instanceof _ChatPromptTemplate ? promptMessage.promptMessages : [
        _coerceMessagePromptTemplateLike(promptMessage, extra)
      ]
    ), []);
    const flattenedPartialVariables = promptMessages.reduce((acc, promptMessage) => (
      // eslint-disable-next-line no-instanceof/no-instanceof
      promptMessage instanceof _ChatPromptTemplate ? Object.assign(acc, promptMessage.partialVariables) : acc
    ), /* @__PURE__ */ Object.create(null));
    const inputVariables = /* @__PURE__ */ new Set();
    for (const promptMessage of flattenedMessages) {
      if (promptMessage instanceof BaseMessage)
        continue;
      for (const inputVariable of promptMessage.inputVariables) {
        if (inputVariable in flattenedPartialVariables) {
          continue;
        }
        inputVariables.add(inputVariable);
      }
    }
    return new this({
      ...extra,
      inputVariables: [...inputVariables],
      promptMessages: flattenedMessages,
      partialVariables: flattenedPartialVariables,
      templateFormat: extra?.templateFormat
    });
  }
  /** @deprecated Renamed to .fromMessages */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromPromptMessages(promptMessages) {
    return this.fromMessages(promptMessages);
  }
};

// node_modules/@langchain/core/dist/prompts/few_shot.js
var FewShotPromptTemplate = class _FewShotPromptTemplate extends BaseStringPromptTemplate {
  static {
    __name(this, "FewShotPromptTemplate");
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
      checkValidTemplate(this.prefix + this.suffix, this.templateFormat, totalInputVariables);
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
      ...this.partialVariables ?? {},
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
    return renderTemplate(template, this.templateFormat, allValues);
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
    const examplePrompt = await PromptTemplate.deserialize(example_prompt);
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
    __name(this, "FewShotChatMessagePromptTemplate");
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
    this.exampleSeparator = fields.exampleSeparator ?? "\n\n";
    this.exampleSelector = fields.exampleSelector;
    this.prefix = fields.prefix ?? "";
    this.suffix = fields.suffix ?? "";
    this.templateFormat = fields.templateFormat ?? "f-string";
    this.validateTemplate = fields.validateTemplate ?? true;
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
      checkValidTemplate(this.prefix + this.suffix, this.templateFormat, totalInputVariables);
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
    return renderTemplate(template, this.templateFormat, allValues);
  }
  /**
   * Partially formats the prompt with the given values.
   * @param values The values to partially format the prompt with.
   * @returns A promise that resolves to an instance of `FewShotChatMessagePromptTemplate` with the given values partially formatted.
   */
  async partial(values) {
    const newInputVariables = this.inputVariables.filter((variable) => !(variable in values));
    const newPartialVariables = {
      ...this.partialVariables ?? {},
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

export {
  ChatPromptTemplate,
  FewShotPromptTemplate,
  FewShotChatMessagePromptTemplate
};
