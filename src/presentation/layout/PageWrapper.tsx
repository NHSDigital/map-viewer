import React from "react";
import {
  Footer,
  Header,
  WarningCallout,
  Container
} from "nhsuk-react-components";
import { withRouter, RouteComponentProps } from "react-router-dom";

const supportedBrowser =
  window.File && window.FileReader && window.FileList && window.Blob;

const PageWrapper: React.FC<RouteComponentProps> = ({ children, location }) => (
  <>
    <Header transactional serviceName="DigiTrial Map Viewer">
      <Header.Container>
        <Header.Logo href="/" />
      </Header.Container>
    </Header>

    <Container className="mv-main" fluid={location.pathname === "/map"}>
      {!supportedBrowser ? (
        <WarningCallout label="Unsupported Browser">
          <p>
            You are using a browser without support for essential tools required
            for this application to run.
          </p>
        </WarningCallout>
      ) : null}

      {children}
    </Container>

    <Footer>
      <Footer.List>
        <Footer.ListItem href="https://access.data.digital.nhs.uk/">
          Data Access Environment
        </Footer.ListItem>
        <Footer.ListItem href="https://digital.nhs.uk/">
          NHS Digital Website
        </Footer.ListItem>
      </Footer.List>
      <Footer.Copyright>
        &copy; NHS Digital {new Date().getFullYear()}
      </Footer.Copyright>
    </Footer>
  </>
);

export default withRouter(PageWrapper);
