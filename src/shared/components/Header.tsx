import React from 'react';
import classNames from 'classnames';
import { useRouteMatch } from 'react-router-dom';
import { AccountIcon } from 'shared/icons/Account';
import { StreamsIcon } from 'shared/icons/Streams';
import { SendIcon } from 'shared/icons/Send';
import { NavLink } from 'shared/kit/NavLink';
import { NearAuthButton } from 'features/near-auth/NearAuthButton';
import { ROUTES_MAP } from 'shared/helpers/routing';
import LogoText from 'shared/images/logo_stream_with_text.svg';
import { useBool } from 'shared/hooks/useBool';
import { ProfileIcon } from 'shared/icons/Profile';
import { BellIcon } from 'shared/icons/Bell';

import RedesignedHeader from '@app/widgets/header/Header';

function MinifiedHeader() {
  const logo = (
    <div className="flex justify-start items-center">
      <img src={LogoText} alt="roketo logo" />
    </div>
  );
  return (
    <div
      className={classNames(
        'py-4 px-6',
        'absolute w-full pt-8',
        'flex justify-center',
      )}
    >
      {logo}
    </div>
  );
}

function FullHeader() {
  const menuControl = useBool(false);

  const navigation = (
    <ul className="flex-col lg:flex-row flex justify-center ">
      <li className="mb-2 lg:mr-2 lg:mb-0">
        <NavLink
          onClick={menuControl.turnOff}
          to={ROUTES_MAP.account.path}
          icon={<AccountIcon />}
        >
          {ROUTES_MAP.account.title}
        </NavLink>
      </li>
      <li className="mb-2 lg:mr-2 lg:mb-0">
        <NavLink
          onClick={menuControl.turnOff}
          to={ROUTES_MAP.streams.path}
          icon={<StreamsIcon />}
        >
          {ROUTES_MAP.streams.title}
        </NavLink>
      </li>

      <li className="mb-2 lg:mr-2 lg:mb-0">
        <NavLink
          onClick={menuControl.turnOff}
          to={ROUTES_MAP.myStreams.path}
          icon={<StreamsIcon />}
        >
          {ROUTES_MAP.myStreams.title}
        </NavLink>
      </li>

      <li className="mb-2 lg:mr-2 lg:mb-0">
        <NavLink
          onClick={menuControl.turnOff}
          to={ROUTES_MAP.send.path}
          icon={<SendIcon />}
        >
          {ROUTES_MAP.send.title}
        </NavLink>
      </li>
      <li className="mb-2 lg:mr-2 lg:mb-0">
        <NavLink
          onClick={menuControl.turnOff}
          to={ROUTES_MAP.profile.path}
          icon={<ProfileIcon />}
        >
          {ROUTES_MAP.profile.title}
        </NavLink>
      </li>
      <li className="mb-2 lg:mr-2 lg:mb-0">
        <NavLink
          onClick={menuControl.turnOff}
          to={ROUTES_MAP.notifications.path}
          icon={<BellIcon />}
        >
          Notifications
        </NavLink>
      </li>
    </ul>
  );

  const logo = (
    <div className="flex justify-start items-center">
      <img src={LogoText} alt="roketo logo" />
    </div>
  );

  return (
    <div className="py-4 px-6 w-full pt-8">
      <div
        className={classNames('hidden lg:grid items-center grid-cols-3 gap-3 ')}
      >
        {logo}
        {navigation}

        <div className="flex justify-end">
          <NearAuthButton />
        </div>
      </div>

      <div className={classNames('lg:hidden')}>
        <div className="flex justify-between">
          {logo}

          <button
            className="p-1"
            onClick={menuControl.toggle}
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <div
              className={classNames(
                'burger-menu',
                menuControl.on ? 'burger-menu--active' : '',
              )}
            />
          </button>
        </div>
        <div
          className={classNames(menuControl.on ? 'block' : 'hidden', 'mt-4')}
        >
          {navigation}
          <NearAuthButton className="mt-4" />
        </div>
      </div>
    </div>
  );
}
export function Header() {
  const match = useRouteMatch(ROUTES_MAP.authorize.path);
  const isRedesignedPage = useRouteMatch(ROUTES_MAP.myStreams.path);

  if (isRedesignedPage) {
    return <RedesignedHeader />;
  }

  if (match) {
    return <MinifiedHeader />;
  }

  return <FullHeader />;
}
