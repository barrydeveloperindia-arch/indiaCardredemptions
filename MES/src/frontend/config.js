/**
 * Centralized configuration for the frontend application.
 * Allows easy switching between local development and production/containerized environments.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8008";
