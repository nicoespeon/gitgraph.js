const fs = require('fs');
const data = JSON.parse(fs.readFileSync("./scripts/__mocks__/doc.json"));

const {
  parseComment,
  pascal,
  parseTypes,
  getParams,
  getProperties,
  getReturns,
  getClassFunctions,
  getOptions,
  getObject
} = require('./json2tsd.js')(data);

describe('parseComment', () => {
  it('should remove all dot notation params', () => {
    let comment = data.docs.find(d => d.name === "GitGraph").comment;

    expect(parseComment(comment)).toMatchSnapshot();
  });
});

describe('pascal', () => {
  it('should uppercase first letter', () => {
    expect(pascal("gitGraph")).toEqual("GitGraph");
  })
});

describe('parseTypes', () => {
  it('should join types', () => {
    let param = { type: { names: ["number", "string"] } };

    expect(parseTypes(param)).toEqual("number|string")
  });

  it('should replace object with gitgraph types', () => {
    let param = { name: "options", type: { names: ["object"] } };
    let doc = { see: ["Template"] };

    expect(parseTypes(param, doc)).toEqual("GitGraph.TemplateOptions");
  });

  it('should prepend with `GitGraph.` if type exists', () => {
    let param = { type: { names: ["Template"] } };

    expect(parseTypes(param)).toEqual("GitGraph.Template");
  });

  it('should not prepend with `GitGraph.` if type not exists', () => {
    let param = { type: { names: ["MouseEvent"] } };

    expect(parseTypes(param)).toEqual("MouseEvent");
  });

  it('should deal this array notation', () => {
    let param = { type: { names: ["Array.<string>"] } };

    expect(parseTypes(param)).toEqual("string[]");
  });

  it('should put `any` if is an unknown object', () => {
    let param = { type: { names: ["object"] } };

    expect(parseTypes(param)).toEqual("any");
  });
});

describe('getParams', () => {
  it('should remove dot notation', () => {
    let doc = data.docs.find(d => d.name === "GitGraph");

    expect(getParams(doc)).toEqual(["options?: GitGraph.GitGraphOptions"]);
  });

  it('should parse type properly', () => {
    let doc = data.docs.find(d => d.longname === "GitGraph#applyCommits");

    expect(getParams(doc)).toEqual(["event: MouseEvent", "callbackFn: GitGraph.CommitCallback"]);
  });
});

describe('getProperties', () => {
  it('should extract properly all properties', () => {
    let doc = data.docs.find(d => d.name === "BranchCommitOptions");

    expect(getProperties(doc)).toMatchSnapshot();
  });

  it('should deal with `object` type', () => {
    let doc = data.docs.find(d => d.name === "BranchCommitOptions");

    expect(getProperties(doc)).toMatchSnapshot();
  });
});

describe('getReturns', () => {
  it('should parse return type', () => {
    let doc = {
      "returns": [
        {
          "type": {
            "names": [
              "Template"
            ]
          },
          "description": "<p>[template] - Template if exist</p>"
        }
      ],
    };

    expect(getReturns(doc)).toEqual(["GitGraph.Template"]);
  });

  it('should return void if no returns', () => {
    expect(getReturns({})).toEqual('void');
  })
});

describe('getClassFunction', () => {
  it('should return corresponding class function', () => {
    expect(getClassFunctions("GitGraph")).toMatchSnapshot();
  });
});

describe('getObject', () => {
  it('should return a pretty format object', () => {
    let input = [{
      "type": {
        "names": [
          "string"
        ]
      },
      "optional": true,
      "description": "<p>Arrow color</p>",
      "name": "options.arrow.color"
    },
    {
      "type": {
        "names": [
          "number"
        ]
      },
      "optional": true,
      "description": "<p>Arrow size</p>",
      "name": "options.arrow.size"
    },
    {
      "type": {
        "names": [
          "number"
        ]
      },
      "optional": true,
      "description": "<p>Arrow offset</p>",
      "name": "options.arrow.offset"
    }];

    expect(getObject(input)).toMatchSnapshot();
  });

  it('should deal with nested objects', () => {
    let input = [{
      "type": {
        "names": [
          "string"
        ]
      },
      "optional": true,
      "description": "<p>Master commit color (dot &amp; message)</p>",
      "name": "options.commit.color"
    },
    {
      "type": {
        "names": [
          "string"
        ]
      },
      "optional": true,
      "description": "<p>Commit dot color</p>",
      "name": "options.commit.dot.color"
    },
    {
      "type": {
        "names": [
          "number"
        ]
      },
      "optional": true,
      "description": "<p>Commit dot size</p>",
      "name": "options.commit.dot.size"
    }];

    expect(getObject(input)).toMatchSnapshot();
  })
});

describe('getOptions', () => {
  it('should return parsed options from doc', () => {
    let doc = data.docs.find(d => d.name = "GitGraph");

    expect(getOptions(doc)).toMatchSnapshot();
  });

  it('should deal with nested object format', () => {
    let doc = data.docs.find(d => d.name === "Template");

    expect(getOptions(doc)).toMatchSnapshot();
  });
});