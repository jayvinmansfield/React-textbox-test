import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import TextFields from "./Textfields";

function TabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      <Box p={3}>{children}</Box>
    </Typography>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired
};

function a11yProps(index: any) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`
  };
}

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper
  }
}));

interface FullState {
  "tab-1": {};
  "tab-2": {};
  "tab-3": {};
  "tab-4": {};
  "tab-5": {};
  "tab-6": {};
  "tab-7": {};
  "tab-update": {};
}

export default function SimpleTabs() {
  const classes = useStyles();
  const [values, setValues] = React.useState<FullState>({
    "tab-1": {},
    "tab-2": {},
    "tab-3": {},
    "tab-4": {},
    "tab-5": {},
    "tab-6": {},
    "tab-7": {},
    "tab-update": {}
  });
  function handleChange(event: any, newValue: any) {
    setValues(newValue);
  }

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Tabs
          value={values}
          onChange={handleChange}
          aria-label="simple tabs example"
        >
          <Tab label="Tab One" {...a11yProps(0)} />
          <Tab label="Tab Two" {...a11yProps(1)} />
          <Tab label="Tab Three" {...a11yProps(2)} />
          <Tab label="Tab Four" {...a11yProps(3)} />
          <Tab label="Tab Five" {...a11yProps(4)} />
          <Tab label="Tab Six" {...a11yProps(5)} />
          <Tab label="Tab Seven" {...a11yProps(6)} />
          <Tab label="Update" {...a11yProps(7)} />
        </Tabs>
      </AppBar>
      <TabPanel value={values} index={0}>
        <TextFields
          values={values["tab-1"]}
          setValues={setValues}
          tabRef="tab-1"
        />
      </TabPanel>
      <TabPanel value={values} index={1}>
        <TextFields
          values={values["tab-2"]}
          setValues={setValues}
          tabRef="tab-2"
        />
      </TabPanel>
      <TabPanel value={values} index={2}>
        <TextFields
          values={values["tab-3"]}
          setValues={setValues}
          tabRef="tab-3"
        />
      </TabPanel>
      <TabPanel value={values} index={3}>
        <TextFields
          values={values["tab-4"]}
          setValues={setValues}
          tabRef="tab-4"
        />
      </TabPanel>
      <TabPanel value={values} index={4}>
        <TextFields
          values={values["tab-5"]}
          setValues={setValues}
          tabRef="tab-5"
        />
      </TabPanel>
      <TabPanel value={values} index={5}>
        <TextFields
          values={values["tab-6"]}
          setValues={setValues}
          tabRef="tab-6"
        />
      </TabPanel>
      <TabPanel value={values} index={6}>
        <TextFields
          values={values["tab-7"]}
          setValues={setValues}
          tabRef="tab-7"
        />
      </TabPanel>
      <TabPanel value={values} index={7}>
        <TextFields
          values={values["tab-update"]}
          setValues={setValues}
          tabRef="tab-update"
        />
      </TabPanel>
    </div>
  );
}
