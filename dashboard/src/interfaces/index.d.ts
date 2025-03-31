export interface IClient {
  id: number;
  name: string;
  projects?: IProject[];
}

export interface IJob {
  id: number;
  jobId: string;
  user?: string;
  filename?: string;
  status?: string;
  start_time?: number;
  end_time?: number;
  print_duration?: number;
  total_duration?: number;
  filament_used?: number;
  metadata?: {
    size?: number;
    modified?: number;
    uuid?: string;
    slicer?: string;
    slicer_version?: string;
    gcode_start_byte?: number;
    gcode_end_byte?: number;
    layer_count?: number;
    object_height?: number;
    estimated_time?: number;
    nozzle_diameter?: number;
    layer_height?: number;
    first_layer_height?: number;
    first_layer_extr_temp?: number;
    first_layer_bed_temp?: number;
    chamber_temp?: number;
    filament_name?: string;
    filament_type?: string;
    filament_total?: number;
    filament_weight_total?: number;
  };
  auxiliary_data?: {
    provider?: string;
    name?: string;
    value?: number[];
    description?: string;
    units?: string | null;
  }[];
  exists?: boolean;
  project?: IProject;
  printer?: IPrinter;
}

export interface IJobFilterVariables {
  status: string;
  //project: IProject;
}

export interface IProject {
  id: number;
  name: string;
  description?: string;
  client?: Client;
  jobs?: Job[];
}
export interface IPrinter {
  id: number;
  name: string;
  ipAddress?: string;
  jobs?: Job[];
}
