import { Outlet } from 'react-router';
import { PersonaPill } from './components/PersonaPill';

export function AppLayout() {
  return (
    <>
      <Outlet />
      <PersonaPill />
    </>
  );
}
