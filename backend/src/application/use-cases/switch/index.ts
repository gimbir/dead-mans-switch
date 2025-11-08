/**
 * Switch Use Cases Index
 *
 * Central export point for all switch-related use cases.
 *
 * Available Use Cases:
 * - CreateSwitchUseCase: Create a new dead man's switch
 * - UpdateSwitchUseCase: Update an existing switch
 * - GetSwitchUseCase: Retrieve a specific switch by ID
 * - DeleteSwitchUseCase: Soft delete a switch
 * - ListSwitchesUseCase: List user's switches with pagination
 */

export * from './CreateSwitch.usecase.js';
export * from './UpdateSwitch.usecase.js';
export * from './GetSwitch.usecase.js';
export * from './DeleteSwitch.usecase.js';
export * from './ListSwitches.usecase.js';
