// Useful functions used in CaseContainer component.
import configData from "../config.json";

function getBaseURL() {
  const envURL = process.env.REACT_APP_BASE_URL;
  if (envURL !== undefined) return envURL;
  return configData.DEFAULT_BASE_URL;
}

function getClientID() {
  const envGithubClient = process.env.GITHUB_CLIENT_ID;
  if (envGithubClient !== undefined) return envGithubClient;
  return configData.DEFAULT_GITHUB_CLIENT_ID;
}

function getRedirectURI() {
  const envRedirectURI = process.env.GITHUB_REDIRECT_URI;
  if (envRedirectURI !== undefined) return envRedirectURI;
  return configData.DEFAULT_GITHUB_REDIRECT_URI;
}

function sanitizeForMermaid(input_text) {
  let sanitizedText = input_text.replace(/[^a-z0-9 .,_-]/gim, "");
  return sanitizedText.trim();
}

function removeArrayElement(array, element) {
  // Remove from `array`, in place, the (first instance of?) `element`.
  array.splice(array.indexOf(element), 1);
}

/**
 *
 * @param {*} in_json
 * @param {string?} highlightedType
 * @param {string?} highlightedId
 * @param {string[]} collapsedNodes
 * @param {any[]} orphans
 * @returns
 */
function jsonToMermaid(
  in_json,
  highlightedType,
  highlightedId,
  collapsedNodes,
  orphans,
) {
  // function to convert the JSON response from a GET request to the /cases/id
  // API endpoint, into the markdown string required for Mermaid to render a flowchart.
  // Nodes in the flowchart will be named [TypeName]_[ID]
  function getNodeName(itemType, itemId) {
    return itemType + "_" + itemId;
  }

  function makeBox(text, shape, name, isCollapsed) {
    // text is already sanitised at this point, so will not contain <> or "

    if (text.length > configData["BOX_NCHAR"]) {
      text = text.substring(0, configData["BOX_NCHAR"] - 3) + "...";
    }

    const symbol = isCollapsed ? "&plus;" : "&minus;";
    const helpText = isCollapsed ? "Expand" : "Collapse";
    text += `<button class='collapse-expand' data-key='${name}'><span class='assistive-text'>${helpText}</span>${symbol}</button>`;

    // surround with quotes so mermaid doesn't treat content as markdown
    text = '"' + text + '"';

    if (shape === "square") return "[" + text + "]";
    else if (shape === "diamond") return "{" + text + "}";
    else if (shape === "rounded") return "(" + text + ")";
    else if (shape === "circle") return "((" + text + "))";
    else if (shape === "hexagon") return "{{" + text + "}}";
    else if (shape === "parallelogram-left") return "[\\" + text + "\\]";
    else if (shape === "parallelogram-right") return "[/" + text + "/]";
    else if (shape === "stadium") return "([" + text + "])";
    else if (shape === "data") return "[(" + text + ")]";
    else return "";
  }

  function addClasses(node, obj, type, outputmd) {
    outputmd += "\nclass " + node + " blackBox;\n";
    if (obj.claim_type === "Project claim") {
      outputmd += "\nclass " + node + " classProjectClaim;\n";
      if (obj.level !== undefined) {
        outputmd +=
          "\nclass " + node + " classProjectClaimLevel" + obj.level + ";\n";
      }
    } else if (obj.claim_type === "System claim") {
      outputmd += "\nclass " + node + " classSystemClaim;\n";
      if (obj.level !== undefined) {
        outputmd +=
          "\nclass " + node + " classSystemClaimLevel" + obj.level + ";\n";
      }
    } else {
      outputmd += "\nclass " + node + " class" + type + ";\n";
    }
    if (obj.level !== undefined) {
      outputmd += "\nclass " + node + " classLevel" + obj.level + ";\n";
    }

    if (highlightedType === type && highlightedId === obj.id.toString()) {
      outputmd +=
        "\nclass " + getNodeName(type, obj.id) + " classHighlighted;\n";
    }

    return outputmd;
  }

  let arrow = " --- ";
  /// Recursive function to go down the tree adding components
  function addTree(itemType, parent, parentNode, outputmd, visited) {
    visited.push(JSON.stringify(parent));
    // look up the 'API name', e.g. "goals" for "TopLevelNormativeGoal"
    let thisType = configData.navigation[itemType]["db_name"];
    let boxShape = configData.navigation[itemType]["shape"];
    // loop over all objects of this type
    // here is the issue, evidence not being set as having proper parents!
    for (let i = 0; i < parent[thisType].length; i++) {
      let thisObj = parent[thisType][i];
      let thisNode = getNodeName(itemType, thisObj.id);
      const isCollapsed = collapsedNodes.includes(thisNode);
      if (parentNode != null) {
        outputmd +=
          parentNode +
          arrow +
          thisNode +
          makeBox(
            sanitizeForMermaid(thisObj.name),
            boxShape,
            thisNode,
            isCollapsed,
          ) +
          "\n";
      } else {
        outputmd +=
          thisNode +
          makeBox(
            sanitizeForMermaid(thisObj.name),
            boxShape,
            thisNode,
            isCollapsed,
          ) +
          "\n";
      }
      // add a click link to the node
      outputmd +=
        "\n click " +
        thisNode +
        ' callback "' +
        thisObj.short_description +
        '"\n';
      // add style to the node
      outputmd = addClasses(thisNode, thisObj, itemType, outputmd);
      if (!isCollapsed && !visited.includes(JSON.stringify(thisObj))) {
        for (
          let j = 0;
          j < configData.navigation[itemType]["children"].length;
          j++
        ) {
          let childType = configData.navigation[itemType]["children"][j];
          outputmd = addTree(childType, thisObj, thisNode, outputmd, visited);
        }
      }
    }
    return outputmd;
  }

  let outputmd = "graph TB; \n";
  outputmd +=
    "classDef blackBox stroke:#333,stroke-width:3px,text-align:center; \n";
  const styleclasses = configData["mermaid_styles"][in_json["color_profile"]];
  Object.keys(styleclasses).forEach((key) => {
    outputmd += `classDef ${key} ${styleclasses[key]}; \n`;
  });
  // call the recursive addTree function, starting with the Goal as the top node
  outputmd = addTree("TopLevelNormativeGoal", in_json, null, outputmd, []);

  if (orphans.length > 0) {
    outputmd += "subgraph Unconnected items\n";

    orphans.forEach((node) => {
      // node type is always set for orphans
      let thisType = configData.navigation[node.type]["db_name"];
      const fakeParent = {};
      fakeParent[thisType] = [node];
      outputmd = addTree(node.type, fakeParent, null, outputmd, []);
    });

    outputmd += "end\n";
  }

  // output the length of the Mermaid string
  return outputmd;
}

function splitCommaSeparatedString(string) {
  // Trim trailing comma if any.
  if (string[string.length - 1] === ",")
    string = string.substr(0, string.length - 1);
  return string.replace(/\s/g, "").split(",");
}

function joinCommaSeparatedString(array) {
  return array.join();
}

async function getSelfUser() {
  const requestOptions = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${localStorage.getItem("token")}`,
    },
  };

  const response = await fetch(`${getBaseURL()}/user/`, requestOptions);
  const user = await response.json();
  return user;
}

/**
 * Make a mutable copy of a case item, and run a callback to mutate the new copy
 * @param {*} caseItem root case item
 * @param {(caseItem: any, type: string) => void} callback function to run at every step of the tree
 * @returns
 */
function visitCaseItem(caseItem, callback, itemType = "TopLevelNormativeGoal") {
  if (typeof caseItem != "object") {
    return caseItem;
  }

  // make a shallow copy
  var copy = { ...caseItem };

  configData.navigation[itemType]["children"].forEach((childName, j) => {
    let childType = configData.navigation[itemType]["children"][j];
    let dbName = configData.navigation[childName]["db_name"];
    // recurse to make deep copies of the child arrays, if they exist
    if (Array.isArray(copy[dbName])) {
      copy[dbName] = copy[dbName].map((g) => visitCaseItem(g, callback, childType));
    }
  })

  callback(copy, itemType);

  return copy;
}

export {
  getBaseURL,
  getClientID,
  getRedirectURI,
  joinCommaSeparatedString,
  jsonToMermaid,
  removeArrayElement,
  sanitizeForMermaid,
  splitCommaSeparatedString,
  getSelfUser,
  visitCaseItem,
};
