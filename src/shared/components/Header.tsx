import React from 'react';
import classNames from 'classnames';
import { useRouteMatch } from 'react-router-dom';

import { StreamsIcon } from 'shared/icons/Streams';
import { NavLink } from 'shared/kit/NavLink';

import { ROUTES_MAP } from 'shared/helpers/routing';
import {DarkLogo} from '@ui/icons/Logo';
import { useBool } from 'shared/hooks/useBool';
import { ProfileIcon } from 'shared/icons/Profile';
import { BellIcon } from 'shared/icons/Bell';

import {Authorization} from 'features/authorization/ui'
import RedesignedHeader from 'widgets/header/Header';

function MinifiedHeader() {
  return (
    <div
      className={classNames(
        'py-4 px-6',
        'absolute w-full pt-8',
        'flex justify-center',
      )}
    >
      <DarkLogo />
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
          to={ROUTES_MAP.streams.path}
          icon={<StreamsIcon />}
        >
          {ROUTES_MAP.streams.title}
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

  return (
    <div className="py-4 px-6 w-full pt-8">
      <div
        className={classNames('hidden lg:grid items-center grid-cols-3 gap-3 ')}
      >
        <DarkLogo />
        {navigation}

        <div className="flex justify-end">
          <Authorization />
        </div>
      </div>

      <div className={classNames('lg:hidden')}>
        <div className="flex justify-between">
          <DarkLogo />

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
          <Authorization />
        </div>
      </div>
    </div>
  );
}
export function Header() {
  const match = useRouteMatch(ROUTES_MAP.authorize.path);
  const isRedesignedPage = useRouteMatch(ROUTES_MAP.streams.path);

  if (isRedesignedPage) {
    return <RedesignedHeader />;
  }

  if (match) {
    return <MinifiedHeader />;
  }

  return <FullHeader />;
}
