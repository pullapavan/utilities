import React from 'react';
import { Switch, Route } from "react-router-dom";
import LayoutWrapper from './layout/LayoutWrapper';
import PrivateRoute from './components/common/PrivateRoute';
import Home from './pages/Home';
import Search from './pages/Search';
import * as paths from './data/constants/paths'
import { PROFILE_PAGE_ROLES } from './data/constants/roles';
import Profile from './pages/player/index';
import RedeemLimitConfig from './pages/Redeem/RedeemLimitConfig';
import Configurations from './pages/configurations';
import RoleManagement from "./pages/role_management/index"
import { useAgent } from './hooks/useAgent';
import SignIn from './pages/signin/Signin';
import Ameyo from './pages/Ameyo';
import BannerConfiguration from './pages/banner_configuration/bannerManagement';
import GameLobby from './pages/game_lobby/gameLobby';
import GameConfigs from './pages/game_configs/gameConfigs';
import { useState, useEffect } from 'react';
import PLApprovals from './pages/RM/PLApprovals';
import ProfileImageCue from './pages/RM/ProfileImageCue';
import LobbyBanners from './pages/game_lobby/lobbyBanners';
import GamePools from './pages/pools/GamePools';
import PlatformAutologin from './pages/PlatformAutologin';
import PurchaseCancellation from './pages/purchases/purchaseCancellation';
import PurchaseTallyReconcillaton from './pages/purchases/PurchaseTallyReconcillaton';



function App() {

  //TODO: this can be checked and removed...
  useEffect(() => {
    const initialValue = document.body.style.zoom;
    document.body.style.zoom = "90%";

    return () => {
      document.body.style.zoom = initialValue;
    };
  }, []);

  return (
    <div className="App">
      <RoutesWrapper></RoutesWrapper>
    </div>
  );
}

function RoutesWrapper() {

  const { isLoggedIn, onAppReload, loggedInFlag } = useAgent()

  useEffect(() => {
    onAppReload()
  }, [])

  if (loggedInFlag || isLoggedIn()) {
    return <>
      <LayoutWrapper>
        <Switch>
          <PrivateRoute exact path={paths.BASE} component={Home} />
          <PrivateRoute exact path={paths.HOME} component={Home} />
          <PrivateRoute exact path={`${paths.SEARCH}*`} component={Search} />
          <PrivateRoute path={paths.PLAYER} requiredRoles={PROFILE_PAGE_ROLES} component={Profile} />
          <PrivateRoute path={paths.REDEEM_LIMIT_CONGIG} component={RedeemLimitConfig} />
          <PrivateRoute path={`${paths.CONFIG_BASE}/*`} component={Configurations} />
          <PrivateRoute path={`${paths.ROLE_MANAGEMENT}/*`} component={RoleManagement} />
          <PrivateRoute path={paths.PURCHASE_LIMITS_APPROVALS} component={PLApprovals}></PrivateRoute>
          <PrivateRoute path={paths.PROFILE_IMAGES_CUE} component={ProfileImageCue}></PrivateRoute>
          <PrivateRoute path={`${paths.BANNER_CONFIGURATION}/*`} component={BannerConfiguration} />
          <PrivateRoute path={`${paths.GAME_LOBBY}*`} component={GameLobby} />
          <PrivateRoute path={`${paths.LOBBY_BANNERS}*`} component={LobbyBanners} />
          <PrivateRoute path={`${paths.GAME_CONFIGS}*`} component={GameConfigs} />
          <PrivateRoute path={`${paths.GAMES}*`} component={GamePools} />
          <PrivateRoute path={paths.PURCHASE_RECONCILLIATION} component={PurchaseTallyReconcillaton} />
          <PrivateRoute path={`${paths.PURCHASE_CANCELLATIONS}*`} component={PurchaseCancellation} />
          <Route path={`${paths.AMEYO}*`} component={Ameyo} />
          <Route path={`${paths.AUTOLOGIN_JOURNEY}*`} component={PlatformAutologin} />
          <Route component={Home}></Route>
        </Switch>
      </LayoutWrapper>
    </>
  }

  return <Switch>

    <Route path={`${paths.AUTOLOGIN_JOURNEY}*`} component={PlatformAutologin} />
    <Route path={`${paths.AMEYO}*`} component={Ameyo} />
    <Route component={SignIn}>
    </Route>
  </Switch>

}

export default App;
