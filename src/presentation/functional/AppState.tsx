import React, { PureComponent, createContext } from "react";
import { fileToText } from "../../helpers/FileHelpers";
import { withRouter, RouteComponentProps } from "react-router-dom";
import { DataParser, ParsedFile } from "../../core/parsing/version-1/Parser";

export interface IAppStateContext {
  selectedFile: File | null;
  submitFile: (file: File) => void;
  parsedFile: ParsedFile;
}

const defaultAppState: IAppStateContext = {
  selectedFile: null,
  submitFile: () => {},
  parsedFile: new ParsedFile()
};

export const AppStateContext = createContext<IAppStateContext>(defaultAppState);

class AppState extends PureComponent<RouteComponentProps, IAppStateContext> {
  constructor(props: RouteComponentProps, ...rest: any[]) {
    super(props, ...rest);

    this.state = {
      ...defaultAppState,
      parsedFile: new ParsedFile()
    };

    console.log(this.state.parsedFile);
  }

  submitFile = async (file: File) => {
    const text = await fileToText(file);
    const { success, parsedFile } = DataParser.parse(text);
    if (success && parsedFile) {
      this.setState({ parsedFile }, () => {
        this.props.history.push("/data-selection");
      });
    }
  };

  render() {
    const { children } = this.props;
    const contextValue: IAppStateContext = {
      ...this.state,
      submitFile: this.submitFile
    };

    return (
      <AppStateContext.Provider value={contextValue}>
        {children}
      </AppStateContext.Provider>
    );
  }
}

export const AppStateContainer = withRouter(AppState);
