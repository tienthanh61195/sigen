import type { Roles } from "$lib/constants/users";

// Projects
export type Project = {
  avatar?: string;
  name: string;
  start_time: string;
  end_time?: string;
  id: string;
  members?: { name: string, id: string }[];
  client: { name: string };
};
// ------------------
// Tasks
export type Task = {
  id: string,
  description: string;
  start: string;
  end: string;
  date: string,
  issue: string
}
// ------------------
// Users
export type User = {
  avatar?: string,
  id: string,
  first_name: string;
  last_name: string;
  projects: { project: string, role: Roles }[]
  joined_date: string;
  remaining_leave_days: number;
  // date: string,
  // issue: string
}
// ------------------
export type CommonDataType<T = any> = {
  data: T,
  miscs: { [key in string]: any }
} 