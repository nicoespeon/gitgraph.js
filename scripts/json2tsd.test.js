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
  it('should deal with `{object|string}` format', () => {
    let comment = "{object|string} options";
    let expected = "{any|string} options";

    expect(parseComment(comment)).toEqual(expected);
  });

  it('should deal with `{object}` format', () => {
    let comment = "{object} options";
    let expected = "{any} options";

    expect(parseComment(comment)).toEqual(expected);
  });

  it('should deal with `{string|object}` format', () => {
    let comment = "{string|object} options";
    let expected = "{string|any} options";

    expect(parseComment(comment)).toEqual(expected);
  });

  it('should deal with `{(object|string)}` format', () => {
    let comment = "{(object|string)} options";
    let expected = "{(any|string)} options";

    expect(parseComment(comment)).toEqual(expected);
  });

  it('should deal with `{(string|object)}` format', () => {
    let comment = "{(string|object)} options";
    let expected = "{(string|any)} options";

    expect(parseComment(comment)).toEqual(expected);
  });
});

describe('pascal', () => {
  it('should uppercase first letter', () => {
    expect(pascal("gitGraph")).toEqual("GitGraph");
  })
});

describe('parseTypes', () => {
  it('should join types', () => {
    let type = { names: ["number", "string"] };

    expect(parseTypes(type)).toEqual("number|string")
  });

  it('should replace object with gitgraph types', () => {
    let type = { names: ["object"] };
    let doc = { see: ["Template"] };

    expect(parseTypes(type, doc)).toEqual("GitGraph.TemplateOptions");
  });

  it('should prepend with `GitGraph.` if type exists', () => {
    let type = { names: ["Template"] };

    expect(parseTypes(type)).toEqual("GitGraph.Template");
  });

  it('should not prepend with `GitGraph.` if type not exists', () => {
    let type = { names: ["MouseEvent"] };

    expect(parseTypes(type)).toEqual("MouseEvent");
  });

  it('should deal this array notation', () => {
    let type = { names: ["Array.<string>"] };

    expect(parseTypes(type)).toEqual("string[]");
  });

  it('should put `any` if is an unknown object', () => {
    let type = { names: ["object"] };

    expect(parseTypes(type)).toEqual("any");
  });
});

describe('getParams', () => {
  it('should remove dot notation', () => {
    let doc = data.docs.find(d => d.name === "GitGraph");

    expect(getParams(doc)).toEqual(["options: GitGraph.GitGraphOptions"]);
  });

  it('should parse type properly', () => {
    let doc = data.docs.find(d => d.longname === "GitGraph#applyCommits");

    expect(getParams(doc)).toEqual(["event: MouseEvent", "callbackFn: GitGraph.CommitCallback"]);
  })
});

describe('getProperties', () => {
  it('should extract properly all properties', () => {
    let doc = {
      properties: [
        {
          "type": {
            "names": [
              "string"
            ]
          },
          "description": "<p>Branch color</p>",
          "name": "color"
        },
        {
          "type": {
            "names": [
              "number"
            ]
          },
          "optional": true,
          "description": "<p>Branch line width</p>",
          "name": "lineWidth"
        },
        {
          "type": {
            "names": [
              "string"
            ]
          },
          "optional": true,
          "defaultvalue": "(\"bezier\"|\"straight\")",
          "description": "<p>Branch merge style</p>",
          "name": "mergeStyle"
        },
        {
          "type": {
            "names": [
              "number"
            ]
          },
          "optional": true,
          "description": "<p>Space between branches</p>",
          "name": "spacingX"
        },
        {
          "type": {
            "names": [
              "number"
            ]
          },
          "optional": true,
          "description": "<p>Space between branches</p>",
          "name": "spacingY"
        }
      ]
    };

    let expected = [
      "color: string;",
      "lineWidth?: number;",
      "mergeStyle?: string;",
      "spacingX?: number;",
      "spacingY?: number;"
    ];

    expect(getProperties(doc)).toEqual(expected);
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