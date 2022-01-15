import React from 'react';
import * as icons from './icons';
import {NavLink} from './kit';
import {NearAuthButton} from '../features/near-auth/NearAuthButton';
import classNames from 'classnames';
import {routes} from '../lib/routing';
import LogoText from '../images/logo_stream_with_text.svg';
import {useBool} from '../lib/useBool';
import {useRouteMatch} from 'react-router';

function MinifiedHeader() {
  const logo = (
    <div className="flex justify-start items-center">
      <img src={LogoText} alt="rocketo logo" />
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
          to={routes.account}
          icon={<icons.Account />}
        >
          Account
        </NavLink>
      </li>
      <li className="mb-2 lg:mr-2 lg:mb-0">
        <NavLink
          onClick={menuControl.turnOff}
          to={routes.myStreams}
          icon={<icons.Streams />}
        >
          My Streams
        </NavLink>
      </li>
      <li className="mb-2 lg:mr-2 lg:mb-0">
        <NavLink
          onClick={menuControl.turnOff}
          to={routes.send}
          icon={<icons.Send />}
        >
          Send
        </NavLink>
      </li>
    </ul>
  );

  const logo = (
    <div className="flex justify-start items-center">
      <img src={LogoText} alt="rocketo logo" />
    </div>
  );

  return (
    <div className={'py-4 px-6 w-full pt-8'}>
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
  const match = useRouteMatch('/authorize');

  if (match) {
    return <MinifiedHeader />;
  }

  return <FullHeader />;
}
