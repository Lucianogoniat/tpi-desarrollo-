import authTools from "./auth";
import productTools from './products';
import categoryTools from './categories';
import userTools from './users';
export default [
    ...authTools,
    ...productTools,
    ...categoryTools,
    ...userTools,
];
