import authTools from "./auth";
import productTools from './products';
import categoryTools from './categories';
import userTools from './users';
import type { ToolDef } from "../tool-factory";

export default [
  ...authTools,
  ...productTools,
  ...categoryTools,
  ...userTools,
] as ToolDef[];
