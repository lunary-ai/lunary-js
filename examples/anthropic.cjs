"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var sdk_1 = require("@anthropic-ai/sdk");
var node_assert_1 = require("node:assert");
var anthropic_1 = require("lunary/anthropic");
var client = (0, anthropic_1.default)(new sdk_1.default()); // gets API Key from environment variable ANTHROPIC_API_KEY
function non_streaming() {
    return __awaiter(this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.messages.create({
                        messages: [
                            {
                                role: "user",
                                content: "Hey Claude!?",
                            },
                        ],
                        model: "claude-3-opus-20240229",
                        max_tokens: 1024,
                    })];
                case 1:
                    result = _a.sent();
                    console.dir(result);
                    return [2 /*return*/];
            }
        });
    });
}
function streaming() {
    return __awaiter(this, void 0, void 0, function () {
        var stream, _a, stream_1, stream_1_1, event_1, e_1_1, message;
        var _b, e_1, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    stream = client.messages
                        .stream({
                        messages: [
                            {
                                role: "user",
                                content: "Hey Claude! How can I recursively list all files in a directory in Rust?",
                            },
                        ],
                        model: "claude-3-opus-20240229",
                        max_tokens: 1024,
                    })
                        // Once a content block is fully streamed, this event will fire
                        .on("contentBlock", function (content) { return console.log("contentBlock", content); })
                        // Once a message is fully streamed, this event will fire
                        .on("message", function (message) { return console.log("message", message); });
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 6, 7, 12]);
                    _a = true, stream_1 = __asyncValues(stream);
                    _e.label = 2;
                case 2: return [4 /*yield*/, stream_1.next()];
                case 3:
                    if (!(stream_1_1 = _e.sent(), _b = stream_1_1.done, !_b)) return [3 /*break*/, 5];
                    _d = stream_1_1.value;
                    _a = false;
                    event_1 = _d;
                    console.log("event", event_1);
                    _e.label = 4;
                case 4:
                    _a = true;
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 12];
                case 6:
                    e_1_1 = _e.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 12];
                case 7:
                    _e.trys.push([7, , 10, 11]);
                    if (!(!_a && !_b && (_c = stream_1.return))) return [3 /*break*/, 9];
                    return [4 /*yield*/, _c.call(stream_1)];
                case 8:
                    _e.sent();
                    _e.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 11: return [7 /*endfinally*/];
                case 12: return [4 /*yield*/, stream.finalMessage()];
                case 13:
                    message = _e.sent();
                    console.log("finalMessage", message);
                    return [2 /*return*/];
            }
        });
    });
}
function raw_streaming() {
    return __awaiter(this, void 0, void 0, function () {
        var stream, _a, stream_2, stream_2_1, event_2, e_2_1;
        var _b, e_2, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, client.messages.create({
                        model: "claude-3-opus-20240229",
                        stream: true,
                        max_tokens: 500,
                        messages: [
                            {
                                role: "user",
                                content: "Hey Claude!",
                            },
                        ],
                    })];
                case 1:
                    stream = _e.sent();
                    _e.label = 2;
                case 2:
                    _e.trys.push([2, 7, 8, 13]);
                    _a = true, stream_2 = __asyncValues(stream);
                    _e.label = 3;
                case 3: return [4 /*yield*/, stream_2.next()];
                case 4:
                    if (!(stream_2_1 = _e.sent(), _b = stream_2_1.done, !_b)) return [3 /*break*/, 6];
                    _d = stream_2_1.value;
                    _a = false;
                    event_2 = _d;
                    if (event_2.type === "content_block_delta" &&
                        event_2.delta.type === "text_delta") {
                        process.stdout.write(event_2.delta.text);
                    }
                    _e.label = 5;
                case 5:
                    _a = true;
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 13];
                case 7:
                    e_2_1 = _e.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 13];
                case 8:
                    _e.trys.push([8, , 11, 12]);
                    if (!(!_a && !_b && (_c = stream_2.return))) return [3 /*break*/, 10];
                    return [4 /*yield*/, _c.call(stream_2)];
                case 9:
                    _e.sent();
                    _e.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    if (e_2) throw e_2.error;
                    return [7 /*endfinally*/];
                case 12: return [7 /*endfinally*/];
                case 13:
                    process.stdout.write("\n");
                    return [2 /*return*/];
            }
        });
    });
}
function tool_calls() {
    return __awaiter(this, void 0, void 0, function () {
        var userMessage, tools, message, tool, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userMessage = {
                        role: "user",
                        content: "What is the weather in SF?",
                    };
                    tools = [
                        {
                            name: "get_weather",
                            description: "Get the weather for a specific location",
                            input_schema: {
                                type: "object",
                                properties: { location: { type: "string" } },
                            },
                        },
                    ];
                    return [4 /*yield*/, client.messages.create({
                            model: "claude-3-opus-20240229",
                            max_tokens: 1024,
                            messages: [userMessage],
                            tools: tools,
                        })];
                case 1:
                    message = _a.sent();
                    console.log("Initial response:");
                    console.dir(message, { depth: 4 });
                    (0, node_assert_1.default)(message.stop_reason === "tool_use");
                    tool = message.content.find(function (content) { return content.type === "tool_use"; });
                    (0, node_assert_1.default)(tool);
                    return [4 /*yield*/, client.messages.create({
                            model: "claude-3-opus-20240229",
                            max_tokens: 1024,
                            messages: [
                                userMessage,
                                { role: message.role, content: message.content },
                                {
                                    role: "user",
                                    content: [
                                        {
                                            type: "tool_result",
                                            tool_use_id: tool.id,
                                            content: [{ type: "text", text: "The weather is 73f" }],
                                        },
                                    ],
                                },
                            ],
                            tools: tools,
                        })];
                case 2:
                    result = _a.sent();
                    console.log("\nFinal response");
                    console.dir(result, { depth: 4 });
                    return [2 /*return*/];
            }
        });
    });
}
function tool_streaming() {
    return __awaiter(this, void 0, void 0, function () {
        var stream;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    stream = client.messages
                        .stream({
                        messages: [
                            {
                                role: 'user',
                                content: "What is the weather in SF?",
                            },
                        ],
                        tools: [
                            {
                                name: 'get_weather',
                                description: 'Get the weather at a specific location',
                                input_schema: {
                                    type: 'object',
                                    properties: {
                                        location: { type: 'string', description: 'The city and state, e.g. San Francisco, CA' },
                                        unit: {
                                            type: 'string',
                                            enum: ['celsius', 'fahrenheit'],
                                            description: 'Unit for the output',
                                        },
                                    },
                                    required: ['location'],
                                },
                            },
                        ],
                        model: 'claude-3-haiku-20240307',
                        max_tokens: 1024,
                    })
                        // When a JSON content block delta is encountered this
                        // event will be fired with the delta and the currently accumulated object
                        .on('inputJson', function (delta, snapshot) {
                        console.log("delta: ".concat(delta));
                        console.log("snapshot: ".concat(inspect(snapshot)));
                        console.log();
                    });
                    return [4 /*yield*/, stream.done()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}

// non_streaming().then(console.log);
// streaming().then(console.log)
raw_streaming().then(console.log)
// tool_calls().then(console.log)
// tool_streaming().then(console.log)
