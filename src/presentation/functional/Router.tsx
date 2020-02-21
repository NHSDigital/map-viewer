import React, { Suspense } from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import PageWrapper from "../layout/PageWrapper";
import { Container } from "nhsuk-react-components";
import { AppStateContainer } from "./AppState";

const HomeView = React.lazy(() => import("../views/HomeView"));
const DataSelectionView = React.lazy(() =>
  import("../views/DataSelectionView")
);
const MapView = React.lazy(() => import("../views/MapView"));

const SuspenseFallback = () => (
  <Container>
    <h2>Loading...</h2>
  </Container>
);

const Router = () => (
  <BrowserRouter>
    <AppStateContainer>
      <PageWrapper>
        <Switch>
          <Suspense fallback={<SuspenseFallback />}>
            <Route component={HomeView} path="/" exact />
            <Route component={DataSelectionView} path="/data-selection" exact />
            <Route component={MapView} path="/map" exact />
          </Suspense>
        </Switch>
      </PageWrapper>
    </AppStateContainer>
  </BrowserRouter>
);

export default Router;
