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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const LangGraph_1 = __importDefault(require("../src/core/LangGraph"));
const LangNode_1 = __importDefault(require("../src/core/LangNode"));
const input_1 = __importDefault(require("../src/nodes/input"));
const prompt_1 = __importDefault(require("../src/nodes/prompt"));
const target_1 = __importDefault(require("../src/nodes/target"));
describe('graph', () => {
    test('node -> target', () => __awaiter(void 0, void 0, void 0, function* () {
        const promptNode = new LangNode_1.default({
            id: 'prompt',
            execute(inputs, opts) {
                return __awaiter(this, void 0, void 0, function* () {
                    return { default: { value: 'the prompt result', type: 'string' } };
                });
            },
            outputs: { default: 'string' },
        });
        const graph = new LangGraph_1.default();
        graph.addNode(promptNode);
        graph.createEdge({
            id: '1',
            fromId: 'prompt',
            toId: '_target',
        });
        const res = yield graph.execute({ apiInput: {} });
        expect(res).toEqual({
            default: { value: 'the prompt result', type: 'string' },
        });
    }));
    test('input node', () => __awaiter(void 0, void 0, void 0, function* () {
        const graph = new LangGraph_1.default();
        graph.addNode((0, input_1.default)({ id: 'input1', inputKey: 'input1' }));
        graph.createEdge({
            id: '1',
            fromId: 'input1',
            toId: '_target',
        });
        const res = yield graph.execute({
            apiInput: {
                input1: { type: 'string', value: 'one' },
            },
        });
        expect(res).toEqual({
            default: { value: 'one', type: 'string' },
        });
    }));
    test('double input target node', () => __awaiter(void 0, void 0, void 0, function* () {
        const graph = new LangGraph_1.default();
        graph.setTargetNode((0, target_1.default)({
            inputs: {
                default: 'string',
                in2: 'string',
            },
        }));
        graph.addNode((0, input_1.default)({ id: 'input1', inputKey: 'input1' }));
        graph.addNode((0, input_1.default)({ id: 'input2', inputKey: 'input2' }));
        graph.createEdge({
            id: '1',
            fromId: 'input1',
            toId: '_target',
        });
        graph.createEdge({
            id: '2',
            fromId: 'input2',
            toId: '_target',
            toPort: 'in2',
        });
        const res = yield graph.execute({
            apiInput: {
                input1: { type: 'string', value: 'one' },
                input2: { type: 'string', value: 'two' },
            },
        });
        expect(res).toEqual({
            default: { type: 'string', value: 'one' },
            in2: { type: 'string', value: 'two' },
        });
    }));
    test.only('query store', () => __awaiter(void 0, void 0, void 0, function* () {
        const graph = new LangGraph_1.default();
        //graph.addNode(createInputNode('q'));
        graph.addNode((0, prompt_1.default)({
            id: 'p',
            text: 'how do you feel, having to go to the doctor?',
        }));
        graph.createEdge({
            id: 'mlkj',
            fromId: 'p',
            toId: '_target',
        });
        const resp = yield graph.execute({
            apiInput: {},
            openaiApiKey: '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',
        });
        console.log(resp);
    }));
});
