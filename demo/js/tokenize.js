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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
Object.defineProperty(exports, "__esModule", { value: true });
var kuromoji_1 = require("../../build/kuromoji");
var DIC_URL = "../dict/unidic";
(function () { return __awaiter(void 0, void 0, void 0, function () {
    function initializeTokenizer() {
        return __awaiter(this, void 0, void 0, function () {
            var msgbox, frombox, tokenizer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        msgbox = document.querySelector("#load-msgbox");
                        frombox = document.querySelector("#formbox");
                        msgbox.style.display = "block";
                        frombox.style.display = "none";
                        return [4 /*yield*/, kuromoji_1.default.build({ dicPath: DIC_URL, dicType: "UniDic" })];
                    case 1:
                        tokenizer = _a.sent();
                        input.value = "すもももももももものうち";
                        msgbox.style.display = "none";
                        frombox.style.display = "block";
                        return [2 /*return*/, tokenizer];
                }
            });
        });
    }
    function tokenize(inputText) {
        return __awaiter(this, void 0, void 0, function () {
            var tokens, tokensElement;
            return __generator(this, function (_a) {
                tokens = tokenizer.tokenize(inputText);
                tokensElement = document.querySelector("#tokens");
                tokensElement.innerHTML = "";
                tokens.forEach((function (token) {
                    var _a, _b;
                    var tokenElement = document.createElement("tr");
                    var surface_formElement = document.createElement("td");
                    surface_formElement.textContent = token.surface_form;
                    var posElement = document.createElement("td");
                    posElement.textContent = token.pos;
                    var pos_detail_1Element = document.createElement("td");
                    pos_detail_1Element.textContent = token.pos_detail_1;
                    var pos_detail_2Element = document.createElement("td");
                    pos_detail_2Element.textContent = token.pos_detail_2;
                    var pos_detail_3Element = document.createElement("td");
                    pos_detail_3Element.textContent = token.pos_detail_3;
                    var conjugated_typeElement = document.createElement("td");
                    conjugated_typeElement.textContent = token.conjugated_type;
                    var conjugated_formElement = document.createElement("td");
                    conjugated_formElement.textContent = token.conjugated_form;
                    var basic_formElement = document.createElement("td");
                    basic_formElement.textContent = token.basic_form;
                    var readingElement = document.createElement("td");
                    readingElement.textContent = (_a = token.reading) !== null && _a !== void 0 ? _a : null;
                    var pronunciationElement = document.createElement("td");
                    pronunciationElement.textContent = (_b = token.pronunciation) !== null && _b !== void 0 ? _b : null;
                    tokenElement.appendChild(surface_formElement);
                    tokenElement.appendChild(posElement);
                    tokenElement.appendChild(pos_detail_1Element);
                    tokenElement.appendChild(pos_detail_2Element);
                    tokenElement.appendChild(pos_detail_3Element);
                    tokenElement.appendChild(conjugated_typeElement);
                    tokenElement.appendChild(conjugated_formElement);
                    tokenElement.appendChild(basic_formElement);
                    tokenElement.appendChild(readingElement);
                    tokenElement.appendChild(pronunciationElement);
                    tokensElement.appendChild(tokenElement);
                }));
                return [2 /*return*/];
            });
        });
    }
    var input, tokenizer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                input = document.querySelector("#input");
                input === null || input === void 0 ? void 0 : input.addEventListener("change", function () {
                    console.log("Tokenizing:", input.value);
                    tokenize(input.value);
                });
                return [4 /*yield*/, initializeTokenizer()];
            case 1:
                tokenizer = _a.sent();
                return [2 /*return*/];
        }
    });
}); })();
