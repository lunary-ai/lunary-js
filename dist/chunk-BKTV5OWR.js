import {
  AIMessage,
  BaseMessage,
  BasePromptTemplate,
  BaseStringPromptTemplate,
  ChatMessage,
  ChatPromptValue,
  HumanMessage,
  PromptTemplate,
  Runnable,
  SystemMessage,
  checkValidTemplate,
  coerceMessageLikeToMessage,
  isBaseMessage,
  renderTemplate
} from "./chunk-NX24P6ZI.js";
import {
  __name
} from "./chunk-AGSXOS4O.js";

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
  static fromTemplate(template, role) {
    return new this(PromptTemplate.fromTemplate(template), role);
  }
};
var HumanMessagePromptTemplate = class extends BaseMessageStringPromptTemplate {
  static {
    __name(this, "HumanMessagePromptTemplate");
  }
  static lc_name() {
    return "HumanMessagePromptTemplate";
  }
  async format(values) {
    return new HumanMessage(await this.prompt.format(values));
  }
  static fromTemplate(template) {
    return new this(PromptTemplate.fromTemplate(template));
  }
};
var AIMessagePromptTemplate = class extends BaseMessageStringPromptTemplate {
  static {
    __name(this, "AIMessagePromptTemplate");
  }
  static lc_name() {
    return "AIMessagePromptTemplate";
  }
  async format(values) {
    return new AIMessage(await this.prompt.format(values));
  }
  static fromTemplate(template) {
    return new this(PromptTemplate.fromTemplate(template));
  }
};
var SystemMessagePromptTemplate = class extends BaseMessageStringPromptTemplate {
  static {
    __name(this, "SystemMessagePromptTemplate");
  }
  static lc_name() {
    return "SystemMessagePromptTemplate";
  }
  async format(values) {
    return new SystemMessage(await this.prompt.format(values));
  }
  static fromTemplate(template) {
    return new this(PromptTemplate.fromTemplate(template));
  }
};
function _isBaseMessagePromptTemplate(baseMessagePromptTemplateLike) {
  return typeof baseMessagePromptTemplateLike.formatMessages === "function";
}
__name(_isBaseMessagePromptTemplate, "_isBaseMessagePromptTemplate");
function _coerceMessagePromptTemplateLike(messagePromptTemplateLike) {
  if (_isBaseMessagePromptTemplate(messagePromptTemplateLike) || isBaseMessage(messagePromptTemplateLike)) {
    return messagePromptTemplateLike;
  }
  const message = coerceMessageLikeToMessage(messagePromptTemplateLike);
  if (message._getType() === "human") {
    return HumanMessagePromptTemplate.fromTemplate(message.content);
  } else if (message._getType() === "ai") {
    return AIMessagePromptTemplate.fromTemplate(message.content);
  } else if (message._getType() === "system") {
    return SystemMessagePromptTemplate.fromTemplate(message.content);
  } else if (ChatMessage.isInstance(message)) {
    return ChatMessagePromptTemplate.fromTemplate(message.content, message.role);
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
      if (item.type !== "image_url" || typeof item.image_url === "string" || !item.image_url?.url) {
        return item;
      }
      const imageUrl = item.image_url.url;
      const promptTemplatePlaceholder = PromptTemplate.fromTemplate(imageUrl);
      const formattedUrl = await promptTemplatePlaceholder.format(inputValues);
      item.image_url.url = formattedUrl;
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
  /**
   * Load prompt template from a template f-string
   */
  static fromTemplate(template) {
    const prompt = PromptTemplate.fromTemplate(template);
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
      if (promptMessage instanceof BaseMessage)
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
