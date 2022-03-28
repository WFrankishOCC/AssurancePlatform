import { saveAs } from "file-saver";
import React, { Component } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Grid, Box, DropButton, Layer, Button, Text } from "grommet";
import { FormClose, ZoomIn, ZoomOut } from "grommet-icons";

import MermaidChart from "./Mermaid";
import configData from "../config.json";

import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import EditableText from "./EditableText.js";
import ItemViewer from "./ItemViewer.js";
import ItemEditor from "./ItemEditor.js";
import ItemCreator from "./ItemCreator.js";

import "./CaseContainer.css";

class CaseContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showViewLayer: false,
      showEditLayer: false,
      showCreateLayer: false,
      showConfirmDeleteLayer: false,
      loading: true,
      assurance_case: {
        id: 0,
        name: "",
        description: "",
        goals: [],
      },
      mermaid_md: "graph TB; \n",
    };

    this.url = `${configData.BASE_URL}/cases/`;
  }

  fetchData = async (id) => {
    const res = await fetch(this.url + id);
    const json_response = await res.json();

    this.setState({
      assurance_case: json_response,
    });
    this.setState({
      mermaid_md: this.jsonToMermaid(this.state.assurance_case),
    });
    this.setState({ loading: false });
  };

  deleteCurrentCase() {
    const id = this.state.assurance_case.id;
    const backendURL = `${configData.BASE_URL}/cases/${id}/`;
    const requestOptions = {
      method: "DELETE",
    };
    return fetch(backendURL, requestOptions);
  }

  async exportCurrentCase() {
    const id = this.state.assurance_case.id;
    const response = await fetch(this.url + id);
    let json_response = await response.json();
    const name = json_response["name"];
    // Remove the `id` fields, since they are only meaningful to the backend, and might
    // confuse it when importing the JSON exported here.
    json_response = JSON.stringify(json_response);
    json_response = json_response.replaceAll(/"id":\d+(,)?/g, "");
    // Write to a file, which to the user shows as a download.
    const blob = new Blob([json_response], {
      type: "text/plain;charset=utf-8",
    });
    const now = new Date();
    // Using a custom date format because the ones that Date offers are either very long
    // or include characters not allowed in filenames on Windows.
    const datestr =
      now.getFullYear() +
      "-" +
      now.getMonth() +
      "-" +
      now.getDate() +
      "T" +
      now.getHours() +
      "-" +
      now.getMinutes() +
      "-" +
      now.getSeconds();
    const filename = name + "-" + datestr + ".json";
    saveAs(blob, filename);
  }

  componentDidMount() {
    const id = this.props.params.caseSlug;
    this.setState({ id: id });
    this.fetchData(id);
  }

  componentDidUpdate(prevProps) {
    const id = this.props.params.caseSlug;
    const oldId = prevProps.params.caseSlug;
    if (id !== oldId) {
      this.setState({ id: id }, this.updateView);
    }
  }

  jsonToMermaid(in_json) {
    // function to convert the JSON response from a GET request to the /cases/id
    // API endpoint, into the markdown string required for Mermaid to render a flowchart.

    // Nodes in the flowchart will be named [TypeName]_[ID]
    function getNodeName(itemType, itemId) {
      return itemType + "_" + itemId;
    }

    function makeBox(text, shape) {
      if (shape === "square") return "[" + text + "]";
      else if (shape === "diamond") return "{" + text + "}";
      else if (shape === "rounded") return "(" + text + ")";
      else if (shape === "circle") return "((" + text + "))";
      else if (shape === "data") return "[(" + text + ")]";
      else return "";
    }

    let arrow = " --- ";
    /// Recursive function to go down the tree adding components
    function addTree(itemType, parent, parentNode, outputmd) {
      // look up the 'API name', e.g. "goals" for "TopLevelNormativeGoal"
      let thisType = configData.navigation[itemType]["db_name"];
      let boxShape = configData.navigation[itemType]["shape"];
      // loop over all objects of this type
      for (let i = 0; i < parent[thisType].length; i++) {
        let thisObj = parent[thisType][i];
        let thisNode = getNodeName(itemType, thisObj.id);
        if (parentNode != null) {
          outputmd +=
            parentNode +
            arrow +
            thisNode +
            makeBox(thisObj.name, boxShape) +
            "\n";
        } else {
          outputmd += thisNode + makeBox(thisObj.name, boxShape) + "\n";
        }
        // add a click link to the node
        outputmd +=
          "\n click " +
          thisNode +
          ' callback "' +
          thisObj.short_description +
          '"\n';
        for (
          let j = 0;
          j < configData.navigation[itemType]["children"].length;
          j++
        ) {
          let childType = configData.navigation[itemType]["children"][j];
          outputmd = addTree(childType, thisObj, thisNode, outputmd);
        }
      }
      // console.log(outputmd)
      return outputmd;
    }

    let outputmd = "graph TB; \n";
    // call the recursive addTree function, starting with the Goal as the top node
    outputmd = addTree("TopLevelNormativeGoal", in_json, null, outputmd);

    return outputmd;
  }

  updateView() {
    // render() will be called again anytime setState is called, which
    // is done both by hideEditLayer() and hideCreateLayer()
    this.setState({ loading: true });
    this.hideViewLayer();
    this.hideEditLayer();
    this.hideCreateLayer();
    this.fetchData(this.state.id);
    console.log("in updateView");
  }

  showViewLayer(e) {
    // use the name of the node to derive the type and id of the item that
    // was clicked on, and set the state accordingly.
    // This will cause a new layer, showing the details of the selected node,
    // to appear (the ItemViewer component)
    let chunks = e.split("_");
    if (chunks.length === 2) {
      let itemType = chunks[0];
      let itemId = chunks[1];

      this.setState({ itemType: itemType, itemId: itemId });
    }
    // Maybe this is unnecessary, to check that the itemType and itemId state is
    // set, but need to make sure showViewLayer isn't set prematurely.
    if (this.state.itemType && this.state.itemId)
      this.setState({ showViewLayer: true });
  }

  showEditLayer(itemType, itemId, event) {
    console.log("in showEditLayer", this, itemId);
    event.preventDefault();
    // this should be redundant, as the itemId and itemType should already
    // be set when showViewLayer is called, but they can't do any harm..
    this.setState({ itemType: itemType, itemId: itemId });
    this.hideViewLayer();
    this.setState({ showEditLayer: true });
  }

  showCreateLayer(itemType, parentId, event) {
    console.log("in showCreateLayer", this, parentId);
    event.preventDefault();
    this.setState({ createItemType: itemType, createItemParentId: parentId });
    this.setState({ showCreateLayer: true });
  }

  showConfirmDeleteLayer(event) {
    event.preventDefault();
    this.setState({ showConfirmDeleteLayer: true });
  }

  hideViewLayer() {
    this.setState({ showViewLayer: false });
  }

  hideEditLayer() {
    this.setState({ showEditLayer: false, itemType: null, itemId: null });
  }

  hideCreateLayer() {
    this.setState({
      showCreateLayer: false,
      createItemType: null,
      createItemParentId: null,
    });
  }

  hideConfirmDeleteLayer() {
    this.setState({
      showConfirmDeleteLayer: false,
    });
  }

  viewLayer() {
    return (
      <Box>
        <Layer
          full="vertical"
          position="right"
          onEsc={() => this.hideViewLayer()}
          onClickOutside={() => this.hideViewLayer()}
        >
          <Box
            pad="medium"
            gap="small"
            width={{ min: "medium" }}
            height={{ min: "small" }}
            fill
          >
            <Button
              alignSelf="end"
              icon={<FormClose />}
              onClick={() => this.hideViewLayer()}
            />
            <Box>
              <ItemViewer
                type={this.state.itemType}
                id={this.state.itemId}
                editItemLayer={this.showEditLayer.bind(this)}
                updateView={this.updateView.bind(this)}
              />
            </Box>
          </Box>
        </Layer>
      </Box>
    );
  }

  editLayer() {
    return (
      <Box>
        <Layer
          full="vertical" //"false"
          position="right" //"bottom-left"
          onEsc={() => this.hideEditLayer()}
          onClickOutside={() => this.hideEditLayer()}
        >
          <Box
            pad="medium"
            gap="small"
            width={{ min: "medium" }}
            height={{ min: "small" }}
            fill
          >
            <Button
              alignSelf="end"
              icon={<FormClose />}
              onClick={() => this.hideEditLayer()}
            />
            <Box>
              <ItemEditor
                type={this.state.itemType}
                id={this.state.itemId}
                createItemLayer={this.showCreateLayer.bind(this)}
                updateView={this.updateView.bind(this)}
              />
            </Box>
          </Box>
        </Layer>
      </Box>
    );
  }

  submitCaseChange(field, value) {
    // Send to the backend a PUT request, changing the `field` of the current case to be
    // `value`.
    const id = this.state.assurance_case.id;
    const backendURL = `${configData.BASE_URL}/cases/${id}/`;
    const changeObj = {};
    changeObj[field] = value;
    const requestOptions = {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changeObj),
    };
    fetch(backendURL, requestOptions);
  }

  createLayer() {
    return (
      <Box>
        <Layer
          full="false"
          position="bottom-right" //"bottom-left"
          onEsc={() => this.hideCreateLayer()}
          onClickOutside={() => this.hideCreateLayer()}
        >
          <Box
            pad="medium"
            gap="small"
            width={{ min: "medium" }}
            height={{ min: "small" }}
            fill
          >
            <Button
              alignSelf="end"
              icon={<FormClose />}
              onClick={() => this.hideCreateLayer()}
            />
            <Box>
              <ItemCreator
                type={this.state.createItemType}
                parentId={this.state.createItemParentId}
                updateView={this.updateView.bind(this)}
              />
            </Box>
          </Box>
        </Layer>
      </Box>
    );
  }
  confirmDeleteLayer() {
    return (
      <Box>
        <Layer
          position="center"
          onEsc={this.hideConfirmDeleteLayer.bind(this)}
          onClickOutside={this.hideConfirmDeleteLayer.bind(this)}
        >
          <Box pad="medium" gap="small" fill>
            <Text>Are you sure you want to permanently delete this case?</Text>
            <Box direction="row" justify="end" fill={true}>
              <Button
                label="No"
                margin="small"
                onClick={this.hideConfirmDeleteLayer.bind(this)}
              />
              <Button
                label="Yes"
                margin="small"
                onClick={() => {
                  this.deleteCurrentCase().then((response) => {
                    if (response.status === 204) {
                      this.props.navigate("/");
                    } else {
                      // Something seems to have gone wrong.
                      // TODO How should we handle this?
                      this.hideConfirmDeleteLayer();
                    }
                  });
                }}
              />
            </Box>
          </Box>
        </Layer>
      </Box>
    );
  }

  render() {
    // don't try to render the chart until we're sure we have the full JSON from the DB
    if (this.state.loading) {
      return <Box>loading</Box>;
    } else {
      return (
        <Box>
          <Grid
            rows={["auto", "flex", "xxsmall"]}
            columns={["flex", "20%"]}
            gap="none"
            areas={[
              { name: "header", start: [0, 0], end: [1, 0] },
              { name: "main", start: [0, 1], end: [1, 1] },
              { name: "topright", start: [1, 0], end: [1, 0] },
              { name: "footer", start: [0, 2], end: [1, 2] },
            ]}
          >
            {this.state.showViewLayer &&
              this.state.itemType &&
              this.state.itemId &&
              this.viewLayer()}
            {this.state.showEditLayer &&
              this.state.itemType &&
              this.state.itemId &&
              this.editLayer()}
            {this.state.showCreateLayer &&
              this.state.createItemType &&
              this.state.createItemParentId &&
              this.createLayer()}
            {this.state.showConfirmDeleteLayer && this.confirmDeleteLayer()}

            <Box
              gridArea="header"
              direction="column"
              gap="small"
              pad={{
                horizontal: "small",
                top: "medium",
                bottom: "none",
              }}
            >
              <EditableText
                initialValue={this.state.assurance_case.name}
                textsize="xlarge"
                style={{
                  height: 0,
                }}
                onSubmit={(value) => this.submitCaseChange("name", value)}
              />
              <EditableText
                initialValue={this.state.assurance_case.description}
                size="small"
                style={{
                  height: 0,
                }}
                onSubmit={(value) =>
                  this.submitCaseChange("description", value)
                }
              />
            </Box>

            <Box
              gridArea="topright"
              direction="column"
              gap="small"
              pad={{
                horizontal: "small",
                top: "small",
                bottom: "none",
              }}
            >
              <Button
                label="Delete Case"
                secondary
                onClick={this.showConfirmDeleteLayer.bind(this)}
              />
              <Button
                label="Export"
                secondary
                onClick={this.exportCurrentCase.bind(this)}
              />
              <DropButton
                label="Add Goal"
                dropAlign={{ top: "bottom", right: "right" }}
                dropContent={
                  <ItemCreator
                    type="TopLevelNormativeGoal"
                    parentId={this.state.id}
                    updateView={this.updateView.bind(this)}
                  />
                }
              />
            </Box>

            <Box
              gridArea="main"
              background={{
                color: "white",
                size: "20px 20px",
                image: "radial-gradient(#999999 0.2%, transparent 10%)",
                height: "200px",
                width: "100%",
                repeat: "repeat-xy",
              }}
            >
              <TransformWrapper initialScale={1} centerOnInit={true}>
                {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
                  <React.Fragment>
                    <TransformComponent wrapperStyle={{ width: "100%" }}>
                      <MermaidChart
                        chartmd={this.state.mermaid_md}
                        viewLayerFunc={(e) => this.showViewLayer(e)}
                      />
                    </TransformComponent>
                    <Box className="tools" gap="xxsmall" direction="row">
                      <Button
                        secondary
                        onClick={() => zoomIn()}
                        icon=<ZoomIn />
                      />
                      <Button
                        secondary
                        onClick={() => zoomOut()}
                        icon=<ZoomOut />
                      />
                      <Button
                        secondary
                        onClick={() => resetTransform()}
                        icon=<FormClose />
                      />
                    </Box>
                  </React.Fragment>
                )}
              </TransformWrapper>
            </Box>

            <Box gridArea="footer" background="light-5" pad="small">
              &copy; credits
            </Box>
          </Grid>
        </Box>
      );
    }
  }
}

export default (props) => (
  <CaseContainer {...props} params={useParams()} navigate={useNavigate()} />
);
