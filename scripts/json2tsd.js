module.exports = function (data) {

  const gitgraphTypes = data.docs
    .filter(d => (d.kind === "class" || d.kind === "typedef") && d.name !== "GitGraph")
    .map(d => d.name);

  const parseComment = (comment) => comment
    .split('\n')
    .filter(line => !/options\./.exec(line))
    .filter(line => !/^ *\* *$/.exec(line))
    .map(line => line.replace(/{.*}/g, ""))
    .map(line => line.replace(/  /g, " "))
    .map(line => line.replace(/ - /g, " "))
    .join('\n');

  const pascal = (str) => str.slice(0, 1).toUpperCase() + str.slice(1);

  const parseTypes = (param, doc) => param.type.names
    .map(n => n === "object" && param.name === "options" && doc ? `GitGraph.${pascal((doc.see && doc.see[0]) || doc.name)}Options` : n) // deal with `options` type
    .map(n => n === "object" ? "any" : n) // deal with `object` type
    .map(n => n.includes("Array") ? /\<(\w+)\>/.exec(n)[1] + "[]" : n) // deal with `Array.<type>` format
    .map(n => gitgraphTypes.join(',').includes(n) ? 'GitGraph.' + n : n)
    .join('|');

  const getParams = (doc) => {
    if (!doc.params) return '';
    return doc.params
      .filter(p => !p.name.includes('.')) // avoid dot notation
      .map(p => {
        let optChar = p.optional ? '?' : '';
        return `${p.name}${optChar}: ${parseTypes(p, doc)}`;
      })
  };

  const getProperties = (doc) => {
    if (!doc.properties) return '';
    return doc.properties
      .filter(p => !p.name.includes('.')) // avoid dot notation
      .map(p => {
        let optChar = p.optional ? '?' : '';
        return `${getDescription(p)}\n${p.name}${optChar}: ${parseTypes(p, doc)};`
      });
  };

  const getReturns = (doc) => {
    if (!doc.returns) return 'void';
    return doc.returns
      .map(r => `${parseTypes(r)}`);
  }

  const getClassFunctions = (name) => {
    return data.docs
      .filter(d => d.longname.startsWith(name + "#"))
      .reduce((mem, d) => mem += `
${parseComment(d.comment)}
${d.name}(${getParams(d)}): ${getReturns(d)};
`, "");
  };

  const getDescription = (param) => `
/**
 * ${(/<p>(.*)<\/p>/.exec(param.description) || [])[1]}
 */`;

  const getObject = (doc, index = 2) => {
    let namespaces = [];
    return doc.map(p => {
      let optChar = p.optional ? '?' : '';
      let parts = p.name.split('.');
      if (parts.length > index + 1) {
        let namespace = [...Array(index + 1)].map((_, i) => parts[i]).join('.') + ".";
        if (namespaces.includes(namespace)) return;
        namespaces.push(namespace);
        let subdoc = doc.filter(a => a.name.startsWith(namespace));
        return `${parts[index]}${optChar}: {
          ${getObject(subdoc, index + 1)}
        };\n`;
      } else {
        return `${getDescription(p)}\n ${parts[index]}${optChar}: ${parseTypes(p)};\n`;
      }
    }).join('');
  }


  const getOptions = (doc) => {
    if (!doc.params.map(p => p.name).join(',').includes('options.')) return '';
    let optionsKeys = [];
    return `
${getDescription(doc.params[0])}
interface ${doc.name}Options {
  ${doc.params
        .filter(p => p.name.startsWith('options.'))
        .reduce((params, p, index) => {
          let optChar = p.optional ? '?' : '';
          let parts = p.name.split('.');
          if (optionsKeys.includes(parts[1])) return params;
          if (parts.length === 2) return params += getDescription(p) + "\n" + parts[1] + optChar + ": " + parseTypes(p) + ";\n";
          optionsKeys.push(parts[1]);
          return params += parts[1] + optChar + ": {\n"
            + getObject(doc.params.filter(p => p.name.startsWith(`options.${parts[1]}`)))
            + "};\n";
        }, "")}}`;
  };

  const generate = () => {
    let classes = "";
    let gitgraph = "";
    let gitgraphNamespace = "declare namespace GitGraph {";

    // GitGraph class
    data.docs
      .filter(d => d.kind === "class" && d.name === "GitGraph")
      .forEach(d => {
        gitgraphNamespace += getOptions(d);
        gitgraph += `
${parseComment(d.comment)}
declare class ${d.name} {
  constructor(${getParams(d)});
  ${getClassFunctions(d.name)}`;
      });

    // Other classes
    data.docs
      .filter(d => d.kind === "class" && d.name !== "GitGraph")
      .forEach(d => {
        gitgraphNamespace += `
${getOptions(d)}

${parseComment(d.comment)}
class ${d.name} {
  constructor(${getParams(d)});
  ${getClassFunctions(d.name)}
}`;
      });

    gitgraphNamespace += "\n";

    // Type def (callback)
    data.docs
      .filter(d => d.kind === "typedef" && parseTypes(d) === "function")
      .forEach(d => {
        gitgraphNamespace += `
${parseComment(d.comment)}
type ${d.name} = (${getParams(d)}) => void;
`;
      });

    // Type def (object)
    data.docs
      .filter(d => d.kind === "typedef" && d.type.names[0] === "object")
      .forEach(d => {
        gitgraphNamespace += `
${getDescription(d)}
interface ${d.name} {
  ${getProperties(d).join('\n')}
}`;
      });

    gitgraphNamespace += "}\n";
    gitgraph += "}\n";

    return (gitgraphNamespace + gitgraph + classes).replace(/\n\n\n/g, "\n\n");
  }

  return {
    parseComment,
    pascal,
    parseTypes,
    getParams,
    getProperties,
    getReturns,
    getClassFunctions,
    getObject,
    getOptions,
    generate
  }
}