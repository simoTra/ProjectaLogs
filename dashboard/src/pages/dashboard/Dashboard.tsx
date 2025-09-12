import React from 'react';
import { Card, Row, Col, Spin, Alert, Tabs, Statistic } from 'antd';
import type { TabsProps } from 'antd';
import { useApiUrl, useCustom } from '@refinedev/core';

// Import chart components
import { ClientTopByPrintTimeChart } from '../../components/charts/ClientTopByPrintTimeChart';
import { ClientFilamentUsageChart } from '../../components/charts/ClientFilamentUsageChart';
import { ClientSuccessRateChart } from '../../components/charts/ClientSuccessRateChart';
import { ProjectDurationChart } from '../../components/charts/ProjectDurationChart';
import { ProjectComplexityChart } from '../../components/charts/ProjectComplexityChart';
import { JobPerformanceChart } from '../../components/charts/JobPerformanceChart';
import { JobSuccessRateChart } from '../../components/charts/JobSuccessRateChart';
import { JobEfficiencyChart } from '../../components/charts/JobEfficiencyChart';
import { PrinterUtilizationChart } from '../../components/charts/PrinterUtilizationChart';
import { PrinterReliabilityChart } from '../../components/charts/PrinterReliabilityChart';
import { PrinterWorkloadChart } from '../../components/charts/PrinterWorkloadChart';

interface SystemOverview {
  summary: {
    totalSuccess: number;
    avgJobDuration: number;
    avgFilamentPerHour: number;
    totalJobs: number;
  };
  topClients: Array<{name: string; projects: number}>;
  topProjects: Array<{name: string; jobs: number}>;
  recentActivity: Array<{month: string; jobCount: number}>;
  printerStatus: Array<{printerName: string; totalJobs: number; totalPrintTime: number; avgJobsPerDay: number; utilizationScore: number}>;
  timestamp: string;
}

export const Dashboard: React.FC = () => {
    const API_URL = useApiUrl();

  // System overview data
  const { data: systemOverview, isLoading: overviewLoading, error: overviewError } = useCustom<SystemOverview>({
    url: `${API_URL}/stats/overview`,
    method: "get",
  });

  // Client analytics data
  const { data: clientPrintTime, isLoading: clientPrintTimeLoading } = useCustom({
    url: `${API_URL}/client/stats/top-by-print-time`,
    method: "get",
  });

  const { data: clientFilament, isLoading: clientFilamentLoading } = useCustom({
    url: `${API_URL}/client/stats/top-by-filament`,
    method: "get",
  });

  const { data: clientSuccessRates, isLoading: clientSuccessRatesLoading } = useCustom({
    url: `${API_URL}/client/stats/success-rates`,
    method: "get",
  });

  // Project analytics data
  const { data: projectDuration, isLoading: projectDurationLoading } = useCustom({
    url: `${API_URL}/project/stats/by-duration`,
    method: "get",
  });

  const { data: projectComplexity, isLoading: projectComplexityLoading } = useCustom({
    url: `${API_URL}/project/stats/most-complex`,
    method: "get",
  });

  // Job analytics data
  const { data: jobPerformance, isLoading: jobPerformanceLoading } = useCustom({
    url: `${API_URL}/job/stats/performance-analysis`,
    method: "get",
  });

  const { data: jobSuccessRates, isLoading: jobSuccessRatesLoading } = useCustom({
    url: `${API_URL}/job/stats/success-rates`,
    method: "get",
  });

  const { data: jobEfficiency, isLoading: jobEfficiencyLoading } = useCustom({
    url: `${API_URL}/job/stats/efficiency-metrics`,
    method: "get",
  });

  // Printer analytics data
  const { data: printerUtilization, isLoading: printerUtilizationLoading } = useCustom({
    url: `${API_URL}/printer/stats/utilization-rates`,
    method: "get",
  });

  const { data: printerReliability, isLoading: printerReliabilityLoading } = useCustom({
    url: `${API_URL}/printer/stats/reliability-comparison`,
    method: "get",
  });

  const { data: printerWorkload, isLoading: printerWorkloadLoading } = useCustom({
    url: `${API_URL}/printer/stats/workload-distribution`,
    method: "get",
  });

  const isLoading = overviewLoading || clientPrintTimeLoading || clientFilamentLoading || 
    clientSuccessRatesLoading || projectDurationLoading || projectComplexityLoading ||
    jobPerformanceLoading || jobSuccessRatesLoading || jobEfficiencyLoading ||
    printerUtilizationLoading || printerReliabilityLoading || printerWorkloadLoading;

  // Tab configuration
  const tabItems: TabsProps['items'] = [
    {
      key: '1',
      label: 'Overview',
      children: (
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic 
                    title="Total Jobs" 
                    value={systemOverview?.data?.summary?.totalJobs || 0} 
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic 
                    title="Success Rate" 
                    value={systemOverview?.data?.summary?.totalSuccess || 0} 
                    suffix="%" 
                    precision={1}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic 
                    title="Avg Job Duration" 
                    value={systemOverview?.data?.summary?.avgJobDuration ? Math.round(systemOverview.data.summary.avgJobDuration / 3600 * 100) / 100 : 0} 
                    suffix="hours" 
                    precision={2}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic 
                    title="Filament Rate" 
                    value={systemOverview?.data?.summary?.avgFilamentPerHour ? Math.round(systemOverview.data.summary.avgFilamentPerHour * 100) / 100 : 0} 
                    suffix="g/h" 
                    precision={0}
                  />
                </Card>
              </Col>
            </Row>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card title="Job Status Distribution" style={{ height: 400 }} styles={{ body: { height: 'calc(100% - 57px)', padding: '16px' } }}>
              <JobSuccessRateChart data={jobSuccessRates?.data as any} />
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card title="Printer Workload Distribution" style={{ height: 400 }} styles={{ body: { height: 'calc(100% - 57px)', padding: '16px' } }}>
              <PrinterWorkloadChart data={printerWorkload?.data as any} />
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: '2',
      label: 'Client Analytics',
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Top Clients by Print Time" style={{ height: 400 }} styles={{ body: { height: 'calc(100% - 57px)', padding: '16px' } }}>
              <ClientTopByPrintTimeChart data={clientPrintTime?.data as any} />
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card title="Client Success Rates" style={{ height: 400 }} styles={{ body: { height: 'calc(100% - 57px)', padding: '16px' } }}>
              <ClientSuccessRateChart data={clientSuccessRates?.data as any} />
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card title="Filament Usage by Client" style={{ height: 400 }} styles={{ body: { height: 'calc(100% - 57px)', padding: '16px' } }}>
              <ClientFilamentUsageChart data={clientFilament?.data as any} />
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: '3',
      label: 'Project Analytics',
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Project Duration Timeline" style={{ height: 400 }} styles={{ body: { height: 'calc(100% - 57px)', padding: '16px' } }}>
              <ProjectDurationChart data={projectDuration?.data as any} />
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card title="Project Complexity Analysis" style={{ height: 400 }} styles={{ body: { height: 'calc(100% - 57px)', padding: '16px' } }}>
              <ProjectComplexityChart data={projectComplexity?.data as any} />
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: '4',
      label: 'Job Analytics',
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card title="Job Performance Over Time" style={{ height: 400 }} styles={{ body: { height: 'calc(100% - 57px)', padding: '16px' } }}>
              <JobPerformanceChart data={jobPerformance?.data as any} />
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card title="Job Status Distribution" style={{ height: 400 }} styles={{ body: { height: 'calc(100% - 57px)', padding: '16px' } }}>
              <JobSuccessRateChart data={jobSuccessRates?.data as any} />
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card title="Efficiency Metrics" style={{ height: 400 }} styles={{ body: { height: 'calc(100% - 57px)', padding: '16px' } }}>
              <JobEfficiencyChart data={jobEfficiency?.data as any} />
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: '5',
      label: 'Printer Analytics',
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24}>
            <Card title="Printer Utilization Rates" style={{ height: 400 }} styles={{ body: { height: 'calc(100% - 57px)', padding: '16px' } }}>
              <PrinterUtilizationChart data={printerUtilization?.data as any} />
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card title="Printer Reliability Comparison" style={{ height: 400 }} styles={{ body: { height: 'calc(100% - 57px)', padding: '16px' } }}>
              <PrinterReliabilityChart data={printerReliability?.data as any} />
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card title="Workload Distribution" style={{ height: 400 }} styles={{ body: { height: 'calc(100% - 57px)', padding: '16px' } }}>
              <PrinterWorkloadChart data={printerWorkload?.data as any} />
            </Card>
          </Col>
        </Row>
      ),
    },
  ];

  if (overviewError) {
    return (
      <Alert 
        message="Error loading dashboard data" 
        description={overviewError.message || 'Failed to fetch analytics data'} 
        type="error" 
        showIcon 
      />
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>ProjectaLogs Dashboard</h1>
      
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <p style={{ marginTop: '16px' }}>Loading analytics data...</p>
        </div>
      ) : (
        <Tabs defaultActiveKey="1" items={tabItems} />
      )}
    </div>
  );
};