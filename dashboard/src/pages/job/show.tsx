import React from 'react';
import { useApiUrl, useShow } from '@refinedev/core';
import {
  Show,
  NumberField,
  TextField,
} from '@refinedev/antd';
import { Typography, Row, Col, Card, Divider, Tag, Space, Statistic } from 'antd';
import {
  ClockCircleOutlined,
  UserOutlined,
  FileOutlined,
  PrinterOutlined,
  ExperimentOutlined,
  FireOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { IJob } from '../../interfaces';

const { Title, Text } = Typography;

const formatDuration = (seconds: number | null | undefined): string => {
  if (seconds == null) return 'N/A';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

const getStatusTag = (status?: string) => {
  const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
    completed: { color: 'success', icon: <CheckCircleOutlined /> },
    in_progress: { color: 'processing', icon: <LoadingOutlined /> },
    error: { color: 'error', icon: <CloseCircleOutlined /> },
    cancelled: { color: 'warning', icon: <WarningOutlined /> },
    klippy_shutdown: { color: 'default', icon: <WarningOutlined /> },
  };

  const config = statusConfig[status || ''] || { color: 'default', icon: null };
  return (
    <Tag color={config.color} icon={config.icon}>
      {status?.toUpperCase() || 'UNKNOWN'}
    </Tag>
  );
};

export const JobShow = () => {
  const { query } = useShow<IJob>();
  const { data, isLoading } = query;
  const API_URL = useApiUrl();

  const record = data?.data;
  const thumbnail = record?.metadata?.thumbnails?.find(t => t.width === 320 && t.height === 320);

  const estimatedTime = record?.metadata?.estimated_time;
  const actualTime = record?.print_duration;
  const timeVariance = estimatedTime && actualTime
    ? ((actualTime - estimatedTime) / estimatedTime * 100).toFixed(1)
    : null;

  return (
    <Show isLoading={isLoading}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Status and Basic Info */}
        <Card>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Space size="middle">
                <Title level={4} style={{ margin: 0 }}>Job #{record?.id}</Title>
                {getStatusTag(record?.status)}
              </Space>
            </Col>
          </Row>

          <Divider />

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Space direction="vertical" size={0}>
                <Text type="secondary"><UserOutlined /> User</Text>
                <Text strong>{record?.user || 'N/A'}</Text>
              </Space>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Space direction="vertical" size={0}>
                <Text type="secondary"><FileOutlined /> Filename</Text>
                <Text strong>{record?.filename || 'N/A'}</Text>
              </Space>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Space direction="vertical" size={0}>
                <Text type="secondary"><PrinterOutlined /> Printer</Text>
                <Text strong>{record?.printer?.name || 'N/A'}</Text>
              </Space>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Space direction="vertical" size={0}>
                <Text type="secondary"><ExperimentOutlined /> Project</Text>
                <Text strong>{record?.project?.name || 'N/A'}</Text>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Time Information */}
        <Card title={<><ClockCircleOutlined /> Time Information</>}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Statistic
                title="Start Time"
                value={record?.start_time ? new Date(record.start_time * 1000).toLocaleString() : 'N/A'}
                valueStyle={{ fontSize: '16px' }}
              />
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Statistic
                title="End Time"
                value={record?.end_time ? new Date(record.end_time * 1000).toLocaleString() : 'In Progress'}
                valueStyle={{ fontSize: '16px' }}
              />
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Statistic
                title="Print Duration"
                value={formatDuration(record?.print_duration)}
                valueStyle={{ fontSize: '20px', color: '#1890ff' }}
              />
            </Col>
          </Row>

          <Divider />

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Statistic
                title="Estimated Time"
                value={formatDuration(estimatedTime)}
                valueStyle={{ fontSize: '16px' }}
              />
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Statistic
                title="Total Duration"
                value={formatDuration(record?.total_duration)}
                valueStyle={{ fontSize: '16px' }}
              />
            </Col>

            {timeVariance && (
              <Col xs={24} sm={12} md={8}>
                <Statistic
                  title="Time Variance"
                  value={`${timeVariance}%`}
                  valueStyle={{
                    fontSize: '16px',
                    color: parseFloat(timeVariance) > 0 ? '#cf1322' : '#3f8600'
                  }}
                  prefix={parseFloat(timeVariance) > 0 ? '+' : ''}
                />
              </Col>
            )}
          </Row>
        </Card>

        {/* Material Information */}
        <Card title={<><FireOutlined /> Material Information</>}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Space direction="vertical" size={0}>
                <Text type="secondary">Filament Type</Text>
                <Text strong>{record?.metadata?.filament_type || 'N/A'}</Text>
              </Space>
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Filament Used (Actual)"
                value={record?.filament_used != null ? record.filament_used.toFixed(2) : 'N/A'}
                suffix="g"
                valueStyle={{ fontSize: '18px', color: '#52c41a' }}
              />
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Filament Estimated"
                value={record?.metadata?.filament_weight_total != null ? record.metadata.filament_weight_total.toFixed(2) : 'N/A'}
                suffix="g"
                valueStyle={{ fontSize: '16px' }}
              />
            </Col>

            <Col xs={24} sm={12} md={6}>
              <Space direction="vertical" size={0}>
                <Text type="secondary">Filament Name</Text>
                <Text strong>{record?.metadata?.filament_name || 'N/A'}</Text>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Print Settings */}
        {record?.metadata && (
          <Card title="Print Settings">
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={8} md={6}>
                <Space direction="vertical" size={0}>
                  <Text type="secondary">Slicer</Text>
                  <Text strong>{record.metadata.slicer || 'N/A'}</Text>
                </Space>
              </Col>

              <Col xs={12} sm={8} md={6}>
                <Space direction="vertical" size={0}>
                  <Text type="secondary">Layer Height</Text>
                  <Text strong>{record.metadata.layer_height ? `${record.metadata.layer_height}mm` : 'N/A'}</Text>
                </Space>
              </Col>

              <Col xs={12} sm={8} md={6}>
                <Space direction="vertical" size={0}>
                  <Text type="secondary">Nozzle Diameter</Text>
                  <Text strong>{record.metadata.nozzle_diameter ? `${record.metadata.nozzle_diameter}mm` : 'N/A'}</Text>
                </Space>
              </Col>

              <Col xs={12} sm={8} md={6}>
                <Space direction="vertical" size={0}>
                  <Text type="secondary">Layer Count</Text>
                  <Text strong>{record.metadata.layer_count || 'N/A'}</Text>
                </Space>
              </Col>

              <Col xs={12} sm={8} md={6}>
                <Space direction="vertical" size={0}>
                  <Text type="secondary">Object Height</Text>
                  <Text strong>{record.metadata.object_height ? `${record.metadata.object_height}mm` : 'N/A'}</Text>
                </Space>
              </Col>

              <Col xs={12} sm={8} md={6}>
                <Space direction="vertical" size={0}>
                  <Text type="secondary">First Layer Temp</Text>
                  <Text strong>{record.metadata.first_layer_extr_temp ? `${record.metadata.first_layer_extr_temp}°C` : 'N/A'}</Text>
                </Space>
              </Col>

              <Col xs={12} sm={8} md={6}>
                <Space direction="vertical" size={0}>
                  <Text type="secondary">Bed Temp</Text>
                  <Text strong>{record.metadata.first_layer_bed_temp ? `${record.metadata.first_layer_bed_temp}°C` : 'N/A'}</Text>
                </Space>
              </Col>
            </Row>
          </Card>
        )}

        {/* Thumbnail */}
        {thumbnail && record?.id && (
          <Card title="Thumbnail">
            <div style={{ textAlign: 'center' }}>
              <img
                src={`${API_URL}/jobs/thumbnail/${record.id}?path=${encodeURIComponent(thumbnail.relative_path)}`}
                alt="Job thumbnail"
                style={{ maxWidth: '100%', width: 320, height: 320, borderRadius: 8 }}
              />
            </div>
          </Card>
        )}
      </Space>
    </Show>
  );
};
