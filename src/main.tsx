import {
  Link,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useBlocker,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import React from 'react'
import ReactDOM from 'react-dom/client'
import './App.css'; 

const rootRoute = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  // block going from editor-1 to /foo/123?hello=world
  const { proceed, reset, status } = useBlocker({
    shouldBlockFn: ({ current, next }) => {
      if (
        current.routeId === '/react-router-blocker-bug/editor-1' &&
        next.fullPath === '/react-router-blocker-bug/foo/$id' &&
        next.params.id === '123' &&
        next.search.hello === 'world'
      ) {
        console.log("--BLOCKED--")
        return true
      }
      return false
    },
    enableBeforeUnload: false,
    withResolver: true,
  })

  return (
    <>
      <div className="p-2 flex gap-2 text-lg">
        <Link
          to="/react-router-blocker-bug"
          activeProps={{
            className: 'font-bold',
          }}
          activeOptions={{ exact: true }}
        >
          Home
        </Link>{' '}
        <Link
          to="/react-router-blocker-bug/editor-1"
          activeProps={{
            className: 'font-bold',
          }}
        >
          Editor 1
        </Link>{' '}
        <Link
          to={'/react-router-blocker-bug/editor-1/editor-2'}
          activeProps={{
            className: 'font-bold',
          }}
        >
          Editor 2
        </Link>{' '}
        <Link
          to="/react-router-blocker-bug/foo/$id"
          params={{ id: '123' }}
          search={{ hello: 'world' }}
          activeProps={{
            className: 'font-bold',
          }}
          activeOptions={{ exact: true, includeSearch: true }}
        >
          foo 123
        </Link>{' '}
        <Link
          to="/react-router-blocker-bug/foo/$id"
          params={{ id: '456' }}
          search={{ hello: 'universe' }}
          activeProps={{
            className: 'font-bold',
          }}
          activeOptions={{ exact: true, includeSearch: true }}
        >
          foo 456
        </Link>{' '}
      </div>
      <hr />

      {status === 'blocked' && (
        <div className="mt-2">
          <div>
            Are you sure you want to leave editor 1 for /foo/123?hello=world ?
          </div>
          <button
            className="bg-lime-500 text-white rounded p-1 px-2 mr-2"
            onClick={proceed}
          >
            YES
          </button>
          <button
            className="bg-red-500 text-white rounded p-1 px-2"
            onClick={reset}
          >
            NO
          </button>
        </div>
      )}
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  )
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'react-router-blocker-bug',
  component: IndexComponent,
})

function IndexComponent() {
  return (
    <div className="p-2">
      <h3>Welcome Home!</h3>
    </div>
  )
}

const fooRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'react-router-blocker-bug/foo/$id',
  validateSearch: (search) => ({ hello: search.hello }) as { hello: string },
  component: () => <>foo {fooRoute.useParams().id}</>,
})

const editor1Route = createRoute({
  getParentRoute: () => rootRoute,
  path: 'react-router-blocker-bug/editor-1',
  component: Editor1Component,
})

function Editor1Component() {
  const [value, setValue] = React.useState('')

  // Block leaving editor-1 if there is text in the input
  const { proceed, reset, next, current, status } = useBlocker({
    shouldBlockFn: () => value !== '',
    enableBeforeUnload: () => value !== '',
    withResolver: true,
  })

  //The error occurs here (downloadable url) //fixed with target _blank
  const handleDownload = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.target = '_blank';//fixed
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  //but not here (generated csv)
  const handleGenerateCsvAndDownload = async () => {
    const csvFinal = ["Name, Nickname, Address 1, City, State, Number",
      "John,Doe,120 jefferson st.,Riverside, NJ, 08075",
      "Jack,McGinnis,220 hobo Av.,Phila, PA,09119",
      "John 'Da Man',Repici,120 Jefferson St.,Riverside, NJ,08075",
      "Stephen,Tyler,'7452 Terrace ''At the Plaza'' road',SomeTown,SD, 91234",
      ",Blankman,,SomeTown, SD, 00298",
      "Joan 'the bone', Anne,Jet,'9th, at Terrace plc',Desert City,CO,00123"
      ].join("\n");
    
    // Add UTF-8 BOM
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvFinal;
    
    // Specify UTF-8 encoding in the Blob
    const blob = new Blob([csvWithBOM], { 
      type: "text/csv;charset=utf-8" 
    });
    
    const url = await window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", 'generated_agenda');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col p-2">
      <h3>Editor 1</h3>
      <div>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="border"
        />
      </div>
      <hr className="m-2" />

      <div className="app-container">
      <button className="styled-button" onClick={() => handleDownload('https://people.sc.fsu.edu/~jburkardt/data/csv/addresses.csv')}>
        DOWNLOAD CSV
        <span className="tooltip-text">FILL THE INPUT 1 AND CLICK HERE TO TRIGGER THE ERROR (downloadable url)</span>
      </button>
      <button className="styled-button" onClick={handleGenerateCsvAndDownload}>
        GENERATE CSV AND DOWNLOAD
        <span className="tooltip-text">THIS ONE DOES NOT TRIGGER THE ERROR (generated csv)</span>
      </button>
    </div>

      <Link to="/react-router-blocker-bug/editor-1/editor-2">Go to Editor 2</Link>
      <Outlet />

      {status === 'blocked' && (
        <div className="mt-2">
          <div>Are you sure you want to leave editor 1?</div>
          <div>
            You are going from {current.pathname} to {next.pathname}
          </div>
          <button
            className="bg-lime-500 text-white rounded p-1 px-2 mr-2"
            onClick={proceed}
          >
            YES
          </button>
          <button
            className="bg-red-500 text-white rounded p-1 px-2"
            onClick={reset}
          >
            NO
          </button>
        </div>
      )}
    </div>
  )
}

const editor2Route = createRoute({
  getParentRoute: () => editor1Route,
  path: 'react-router-blocker-bug/editor-2',
  component: Editor2Component,
})

function Editor2Component() {
  const [value, setValue] = React.useState('')

  return (
    <div className="p-2">
      <h3>Editor 2</h3>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="border"
      />
    </div>
  )
}

const routeTree = rootRoute.addChildren([
  indexRoute,
  fooRoute,
  editor1Route.addChildren([editor2Route]),
])

// Set up a Router instance
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

// Register things for typesafety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('app')!

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)

  root.render(<RouterProvider router={router} />)
}
