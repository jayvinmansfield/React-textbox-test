import React from "react";
import {
  makeStyles,
  createStyles,
  Theme,
  withStyles,
  WithStyles
} from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: "flex",
      flexWrap: "wrap"
    },
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: 200
    },
    dense: {
      marginTop: 19
    },
    menu: {
      width: 200
    }
  })
);

interface State {
  name: string;
}

type Fullstate = {
  values: any;
  setValues: any;
  tabRef: any;
};

const TextFields: React.FC<Fullstate> = (props: any) => {
  const classes = useStyles();
  const [values, setValues] = React.useState({});
  const handleChange = (name: keyof State) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setValues({ ...values, [name]: event.target.value });
  };

  return (
    <form className={classes.container} noValidate autoComplete="off">
      {[...Array(100)].map((x, i) => (
        <Fields
          index={i}
          values={values}
          setValues={setValues}
          tabRef={props.tabRef}
        />
      ))}
    </form>
  );
};

type Foo = {
  index: any;
  values: any;
  setValues: any;
  props?: any;
  tabRef?: any;
};

export const Fields: React.FC<Foo> = (props: any) => {
  const classes = useStyles();
  const idx = props.index.toString();
  // console.log(idx)

  return (
    <TextField
      // key={props.index}
      // ref={props.index}
      id="standard-name"
      label="Text"
      className={classes.textField}
      value={props.values[idx]}
      onChange={(e: any) => {
        const asd = props.index.toString();
        props.setValues({
          [props.tabRef]: { ...props.values, [asd]: e.target.value }
        });
      }}
      // onChange={handleChange('name')}
      margin="normal"
    />
  );
};

export default TextFields;
