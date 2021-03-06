import "babel-polyfill";
import { readFile } from "fs";
import * as util from "util";
const readFileP = util.promisify(readFile);
import * as path from 'path';
import * as WebIFC from "web-ifc/web-ifc-api.js";
import { LBDParser } from "../src";
import * as jsonld from 'jsonld';

const mepModelPath = path.join(__dirname, './artifacts/MEP.ifc');
let mepModelData: Buffer;

beforeAll(async () => {
    mepModelData = await readFileP(mepModelPath);
})

describe('FSO', () => {

    test('can parse MEP model', async () => {

        // Init API and load model
        const ifcApi = new WebIFC.IfcAPI();
        await ifcApi.Init();
        const modelID = ifcApi.OpenModel(mepModelData);

        // Init LBD Parser and parse BOT
        const lbdParser = new LBDParser();
        const fso: any = await lbdParser.parseFSOTriples(ifcApi, modelID);

        // Close the model, all memory is freed
        ifcApi.CloseModel(modelID);
        
        // Get all RDF triples from returned JSON-LD object
        const rdf: any = await jsonld.toRDF(fso);
        const tripleCount = rdf.length;

        // Evaluate
        expect(Array.isArray(fso["@graph"])).toBe(true);
        expect(fso["@graph"].length).toBe(1127);
        expect(Array.isArray(rdf)).toBe(true);
        expect(tripleCount).toBe(1734);

    });

});