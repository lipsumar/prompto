import { trpc } from '../lib/trpc';
import { Button } from '@blueprintjs/core';
import AppLayout from './AppLayout';
import Side from './Side';
import Projects from './Projects';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Editor from './Editor';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Projects />,
  },
  {
    path: '/project/:projectId',
    element: <Editor />,
  },
]);

export default function App() {
  return (
    <div className="bp4-dark">
      <RouterProvider router={router} />
    </div>
  );
}
