/*
 * Copyright 2023 Avaiga Private Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

import React from "react";
import { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormGroup,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Dialog as MuiDialog,
  Select,
  TextField,
} from "@mui/material";
import {
  ChevronRight,
  ExpandMore,
  FlagOutlined,
  Close,
  DeleteOutline,
  Add,
} from "@mui/icons-material";
import TreeItem from "@mui/lab/TreeItem";
import { Typography } from "@mui/material";
import { useFormik } from "formik";

import {
  LoV,
  useDynamicProperty,
  useDispatch,
  useModule,
  createRequestUpdateAction,
  getUpdateVar,
  createSendActionNameAction,
} from "taipy-gui";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import MuiTreeView from "@mui/lab/TreeView";
import { cycles } from "./data";
import { format } from "date-fns";

export type Scenario = {
  date: string;
  name: string;
  config: string;
  id: string;
};

export type Property = {
  id: string;
  key: string;
  value: string;
};

export type TreeNode = {
  id: string;
  label: string;
  type: NodeType;
  primary?: boolean;
  children?: TreeNode[];
};

export enum NodeType {
  CYCLE = 0,
  SCENARIO = 1,
}

interface ScenarioSelectorProps {
  defaultShowAddButton: boolean;
  showAddButton?: boolean;
  defaultDisplayCycles: boolean;
  displayCycles?: boolean;
  defaultShowPrimaryFlag: boolean;
  showPrimaryFlag?: boolean;
  scenarios?: LoV;
  defaultScenarios?: LoV;
  defaultScenarioId?: string;
  scenarioId?: string;
  onScenarioCreate?: string;
  coreChanged?: Record<string, unknown>;
  updateVarNames: string;
}

// COMMENTED THIS OUT SINCE WE DONT NEED TO VALIDATE FOR NOW
//
// const scenarioSchema = Yup.object().shape({
//   config: Yup.string()
//     .trim("Cannot include leading and trailing spaces")
//     .required("Config is required."),
//   name: Yup.string()
//     .trim("Cannot include leading and trailing spaces")
//     .required("Name is required."),
//   date: Yup.string().required("Date is required."),
// });

const ScenarioSelector = (props: ScenarioSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [key, setKey] = useState<string>("");
  const [value, setValue] = useState<string>("");

  const dispatch = useDispatch();
  const module = useModule();

  const showAddButton = useDynamicProperty(
    props.showAddButton,
    props.defaultShowAddButton,
    true
  );
  const displayCycles = useDynamicProperty(
    props.displayCycles,
    props.defaultDisplayCycles,
    true
  );
  const showPrimaryFlag = useDynamicProperty(
    props.showPrimaryFlag,
    props.defaultShowPrimaryFlag,
    true
  );
  const scenarioId = useDynamicProperty(
    props.scenarioId,
    props.defaultScenarioId,
    ""
  );

  const onAdd = (node: Scenario) => {
    dispatch(
      createSendActionNameAction("", module, props.onScenarioCreate, node)
    );
  };

  const propertyAdd = (key: string, value: string) => {
    let newProp: Property = {
      id: properties.length + 1 + "",
      key: key,
      value: value,
    };
    setProperties([...properties, newProp]);
    setKey("");
    setValue("");
  };
  const propertyDelete = (id: string) => {
    const filtered = properties.filter((itm) => itm.id !== id);
    setProperties(filtered);
  };

  const onSubmit = (values: any) => {
    onAdd(values);
    form.resetForm();
    setOpen(false);
  };

  const form = useFormik({
    initialValues: {
      config: "",
      name: "",
      date: new Date().toString(),
      properties: properties,
    },
    onSubmit,
  });

  const scenarioNodes = (scenarios?: TreeNode[]) =>
    scenarios &&
    scenarios?.map((child) => (
      <TreeItem
        key={child.id}
        nodeId={child.id}
        label={
          showPrimaryFlag && child.primary ? (
            <Badge
              badgeContent={
                <FlagOutlined
                  sx={{
                    color: "#FFFFFF",
                    fontSize: "11px",
                  }}
                />
              }
              color="primary"
              anchorOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              sx={{
                "& .MuiBadge-badge": {
                  marginLeft: "-12px",
                  height: "19px",
                  width: "12px",
                },
              }}
            >
              <Grid
                container
                alignItems="center"
                direction="row"
                flexWrap="nowrap"
                justifyContent="flex-start"
                spacing={1}
              >
                <Grid item>{child.label}</Grid>
              </Grid>
            </Badge>
          ) : (
            <Grid
              container
              alignItems="center"
              direction="row"
              flexWrap="nowrap"
              justifyContent="flex-start"
              spacing={1}
            >
              <Grid item>{child.label}</Grid>
            </Grid>
          )
        }
      />
    ));

  useEffect(() => {
    if (props.coreChanged?.scenario) {
      const updateVar = getUpdateVar(props.updateVarNames, "scenarios");
      updateVar &&
        dispatch(createRequestUpdateAction("", module, [updateVar], true));
    }
  }, [props.coreChanged, props.updateVarNames, module, dispatch]);

  useEffect(() => {
    const data = cycles;
    if (data) {
      setNodes(data);
    }
  }, []);

  return (
    <div>
      <Box
        sx={{
          maxWidth: 300,
          overflowY: "auto",
        }}
      >
        <Typography variant="h5" gutterBottom>
          Scenarios
        </Typography>
        <MuiTreeView
          defaultCollapseIcon={<ExpandMore />}
          defaultExpandIcon={<ChevronRight />}
          sx={{
            mb: 2,
          }}
        >
          {nodes.map((item) => (
            <>
              {displayCycles &&
                (item.type === NodeType.CYCLE ? (
                  <TreeItem
                    key={item.id}
                    nodeId={item.id}
                    label={item.label}
                    sx={{
                      ".MuiTreeItem-content": {
                        padding: "4px 8px",
                        gap: "4px",
                        borderRadius: "4px",
                        mb: "5px",
                      },
                      ".MuiTreeItem-label": {
                        fontWeight: "700",
                        fontSize: "16px",
                      },
                    }}
                  >
                    {scenarioNodes(item.children)}
                  </TreeItem>
                ) : (
                  scenarioNodes([item])
                ))}
              {!displayCycles &&
                (item.type === NodeType.SCENARIO
                  ? scenarioNodes([item])
                  : scenarioNodes(item.children))}
            </>
          ))}
        </MuiTreeView>

        {showAddButton && (
          <Button
            variant="outlined"
            color="error"
            onClick={() => setOpen(true)}
            fullWidth
            sx={{ minHeight: "36px" }}
          >
            ADD SCENARIO &nbsp;&nbsp;
            <Add />
          </Button>
        )}
      </Box>

      <MuiDialog onClose={() => setOpen(false)} open={open}>
        <DialogTitle>
          <Grid
            container
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h5">Create new scenario</Typography>
            <IconButton
              aria-label="close"
              onClick={() => setOpen(false)}
              sx={{ p: 0 }}
            >
              <Close />
            </IconButton>
          </Grid>
        </DialogTitle>
        <form onSubmit={form.handleSubmit}>
          <DialogContent
            sx={{
              width: "500px",
            }}
            dividers
          >
            <Grid container rowSpacing={2}>
              <Grid item xs={12}>
                <FormGroup>
                  <FormControl fullWidth>
                    <InputLabel id="select-config">Configuration</InputLabel>
                    <Select
                      labelId="select-config"
                      label="Configuration"
                      {...form.getFieldProps("config")}
                      error={!!form.errors.config && form.touched.config}
                    >
                      <MenuItem value={1}>config_test_1</MenuItem>
                      <MenuItem value={2}>config_test_2</MenuItem>
                      <MenuItem value={3}>config_test_3</MenuItem>
                    </Select>
                    <FormHelperText
                      error={!!form.errors.config && form.touched.config}
                      sx={{ pl: 12 }}
                    >
                      {form.errors.config}
                    </FormHelperText>
                  </FormControl>
                </FormGroup>
              </Grid>
              <Grid item xs={12}>
                <FormGroup>
                  <TextField
                    id="name"
                    {...form.getFieldProps("name")}
                    error={!!form.errors.name && form.touched.name}
                    helperText={form.errors.name}
                    label="Label"
                    variant="outlined"
                  />
                </FormGroup>
              </Grid>
              <Grid item xs={12}>
                <FormGroup>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Date"
                      value={new Date(form.values.date)}
                      onChange={(date) =>
                        form.setFieldValue("date", date?.toString())
                      }
                    />
                  </LocalizationProvider>
                </FormGroup>
              </Grid>
              <Grid item xs={12} container justifyContent="space-between">
                <Grid item xs={8} container alignItems="center">
                  <Typography variant="h6">Custom Properties</Typography>
                </Grid>
                <Grid item xs={4} container justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={() => {
                      setProperties([]);
                    }}
                  >
                    REMOVE ALL
                  </Button>
                </Grid>
              </Grid>
              {properties?.map((item, index) => (
                <Grid
                  item
                  xs={12}
                  key={item.id}
                  container
                  justifyContent="space-between"
                >
                  <Grid item xs={4}>
                    <TextField
                      id="property-key"
                      value={item.key}
                      label="Key"
                      variant="outlined"
                      onChange={(e) => {
                        const updated = [...properties];
                        updated[index].key = e.target.value;
                        setProperties(updated);
                      }}
                    />
                  </Grid>
                  <Grid item xs={5}>
                    <TextField
                      id="property-value"
                      value={item.value}
                      label="Value"
                      variant="outlined"
                      onChange={(e) => {
                        const updated = [...properties];
                        updated[index].value = e.target.value;
                        setProperties(updated);
                      }}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <Button
                      color="inherit"
                      variant="outlined"
                      component="label"
                      onClick={() => propertyDelete(item.id)}
                    >
                      <DeleteOutline />
                    </Button>
                  </Grid>
                </Grid>
              ))}
              <Grid item xs={12} container justifyContent="space-between">
                <Grid item xs={4}>
                  <TextField
                    id="add-key"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    label="Key"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    id="add-value"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    label="Value"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={2}>
                  <Button
                    color="primary"
                    variant="outlined"
                    component="label"
                    onClick={() => propertyAdd(key, value)}
                  >
                    <Add />
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="contained" color="primary" type="submit">
              CREATE
            </Button>
          </DialogActions>
        </form>
      </MuiDialog>
    </div>
  );
};

export default ScenarioSelector;
