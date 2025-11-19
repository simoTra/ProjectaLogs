import { Refine } from "@refinedev/core";
//import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { AntdInferencer } from "@refinedev/inferencer/antd";

import {
  ErrorComponent,
  ThemedLayout,
  ThemedSider,
  ThemedTitle,
  useNotificationProvider,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import routerBindings, {
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { App as AntdApp, ConfigProvider, Layout } from "antd";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import { Header } from "./components/header";
import { ColorModeContextProvider } from "./contexts/color-mode";
import dataProvider from "./components/dataProvider";
import {
  ClientCreate,
  ClientEdit,
  ClientList,
  ClientShow,
} from "./pages/client";
import {
  DatabaseOutlined,
  FolderOutlined,
  PieChartOutlined,
  PrinterOutlined,
  ProjectOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  ProjectCreate,
  ProjectEdit,
  ProjectList,
  ProjectShow,
} from "./pages/project";
import {
  PrinterCreate,
  PrinterEdit,
  PrinterList,
  PrinterShow,
} from "./pages/printer";
import { JobEdit, JobList, JobShow } from "./pages/job";
import { Dashboard } from "./pages/dashboard";

function App() {
  const API_URL = import.meta.env.VITE_API_URL;

  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          {/* <ConfigProvider theme={themeConfig}> */}
            <AntdApp>
              {/* <DevtoolsProvider> */}
              <Refine
                dataProvider={dataProvider(API_URL)}
                notificationProvider={useNotificationProvider}
                routerProvider={routerBindings}
                resources={[
                  {
                    name: "dashboard",
                    list: "/",
                    meta: {
                      label: "Dashboard",
                      canDelete: false,
                      icon: <PieChartOutlined />,
                    },
                  },
                  {
                    name: "projects",
                    list: "/projects",
                    create: "/projects/create",
                    edit: "/projects/edit/:id",
                    show: "/projects/show/:id",
                    meta: {
                      canDelete: true,
                      icon: <ProjectOutlined />,
                    },
                  },
                  {
                    name: "jobs",
                    list: "/jobs",
                    edit: "/jobs/edit/:id",
                    show: "/jobs/show/:id",
                    meta: {
                      canDelete: true,
                      icon: <FolderOutlined />,
                    },
                  },
                  {
                    name: "clients",
                    list: "/clients",
                    create: "/clients/create",
                    edit: "/clients/edit/:id",
                    show: "/clients/show/:id",
                    meta: {
                      canDelete: true,
                      icon: <UserOutlined />,
                    },
                  },
                  {
                    name: "printers",
                    list: "/printers",
                    create: "/printers/create",
                    edit: "/printers/edit/:id",
                    show: "/printers/show/:id",
                    meta: {
                      canDelete: true,
                      icon: <PrinterOutlined />,
                    },
                  },
                ]}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                  projectId: "SHzJAm-gbWyKh-kL7d5G",
                }}
              >
                <Routes>
                  <Route
                    element={
                      <ThemedLayout
                        Header={() => <Header sticky />}
                        Sider={(props: any) => <ThemedSider {...props} fixed />}
                        Title={({ collapsed }: any) => (
                          <ThemedTitle
                            collapsed={collapsed}
                            icon={
                              collapsed ? (
                                <DatabaseOutlined />
                              ) : (
                                <DatabaseOutlined />
                              )
                            }
                            text="ProjectaLogs"
                          />
                        )}
                        Footer={() => (
                          <Layout.Footer
                            style={{
                              textAlign: "center",
                              color: "#fff",
                            }}
                          >
                            ProjectaLogs ©2025 Created by Simone Traversi
                          </Layout.Footer>
                        )}
                      >
                        <Outlet />
                      </ThemedLayout>
                    }
                  >
                    <Route index element={<Dashboard />} />
                    <Route path="/projects">
                      <Route path="/projects" element={<ProjectList />} />
                      <Route
                        path="/projects/create"
                        element={<ProjectCreate />}
                      />
                      <Route
                        path="/projects/edit/:id"
                        element={<ProjectEdit />}
                      />
                      <Route
                        path="/projects/show/:id"
                        element={<ProjectShow />}
                      />
                    </Route>
                    <Route path="/jobs">
                      <Route path="/jobs" element={<JobList />} />
                      <Route path="/jobs/create" element={<AntdInferencer />} />
                      <Route
                        path="/jobs/edit/:id"
                        element={<JobEdit />}
                      />
                      <Route
                        path="/jobs/show/:id"
                        element={<JobShow />}
                      />
                    </Route>
                    <Route path="/clients">
                      <Route path="/clients" element={<ClientList />} />
                      <Route path="/clients/create" element={<ClientCreate />} />
                      <Route path="/clients/edit/:id" element={<ClientEdit />} />
                      <Route path="/clients/show/:id" element={<ClientShow />} />
                    </Route>
                    <Route path="/printers">
                      <Route path="/printers" element={<PrinterList />} />
                      <Route
                        path="/printers/create"
                        element={<PrinterCreate />}
                      />
                      <Route
                        path="/printers/edit/:id"
                        element={<PrinterEdit />}
                      />
                      <Route
                        path="/printers/show/:id"
                        element={<PrinterShow />}
                      />
                    </Route>
                    <Route path="*" element={<ErrorComponent />} />
                  </Route>
                </Routes>

                <RefineKbar />
                <UnsavedChangesNotifier />
                <DocumentTitleHandler />
              </Refine>
              {/* 
              <DevtoolsPanel />
            </DevtoolsProvider> */}
            </AntdApp>
          {/* </ConfigProvider> */}
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
