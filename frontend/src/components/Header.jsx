import React from 'react';
import * as icons from './icons';
import {NavLink} from './kit';
import {NearAuthButton} from '../features/near-auth/NearAuthButton';
import classNames from 'classnames';
import {routes} from '../lib/routing';
import LogoText from '../images/logo_stream_with_text.svg';
import {useBool} from '../lib/useBool';

export function Header({signedIn}) {
  const menuControl = useBool(false);

  const navigation = signedIn ? (
    <ul className="twind-flex-col lg:twind-flex-row twind-flex twind-justify-center ">
      <li className="twind-mb-2 lg:twind-mr-2 lg:twind-mb-0">
        <NavLink
          onClick={menuControl.turnOff}
          to={routes.account}
          icon={<icons.Account />}
        >
          Account
        </NavLink>
      </li>
      <li className="twind-mb-2 lg:twind-mr-2 lg:twind-mb-0">
        <NavLink
          onClick={menuControl.turnOff}
          to={routes.myStreams}
          icon={<icons.Streams />}
        >
          My Streams
        </NavLink>
      </li>
      <li className="twind-mb-2 lg:twind-mr-2 lg:twind-mb-0">
        <NavLink
          onClick={menuControl.turnOff}
          to={routes.send}
          icon={<icons.Send />}
        >
          Send
        </NavLink>
      </li>
    </ul>
  ) : (
    ''
  );

  const logo = (
    <div className="twind-flex twind-justify-start twind-items-center">
      <img src={LogoText} alt="xyiming logo" />
    </div>
  );

  return (
    <div
      className={
        'twind-py-4 twind-px-6 ' +
        (!signedIn ? 'twind-absolute twind-w-full twind-pt-8' : '')
      }
    >
      <div
        className={classNames(
          signedIn
            ? 'twind-hidden lg:twind-grid twind-items-center twind-grid-cols-3 twind-gap-3 '
            : 'twind-hidden lg:twind-flex twind-justify-center',
        )}
      >
        {logo}
        {navigation}

        {signedIn ? (
          <div className="twind-flex twind-justify-end">
            <NearAuthButton />
          </div>
        ) : (
          ''
        )}
      </div>

      <div className={classNames('lg:twind-hidden')}>
        <div
          className={
            signedIn
              ? 'twind-flex twind-justify-between'
              : 'twind-flex twind-justify-center'
          }
        >
          {logo}

          {signedIn ? (
            <button
              className="twind-p-1"
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
          ) : (
            ''
          )}
        </div>
        <div
          className={classNames(
            menuControl.on ? 'twind-block' : 'twind-hidden',
            'twind-mt-4',
          )}
          id="navbarSupportedContent"
        >
          {navigation}
          <NearAuthButton className="mt-4" />
        </div>
      </div>
    </div>
  );
}
