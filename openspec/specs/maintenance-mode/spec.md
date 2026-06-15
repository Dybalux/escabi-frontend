# Maintenance Mode Specification

## Purpose

Defines the `useMaintenanceMode` hook that polls the system status endpoint, tracks maintenance state, handles 503 responses with a 30-second polling interval, and supports admin bypass via a `shouldBypass` flag.

## Requirements

### Requirement: MM-1 System Status Polling

The system SHALL call `getSystemStatus` (imported from `'../services/system'`) on hook initialization and repeat the call every 30 seconds. The hook SHALL expose an `inMaintenance` boolean state that reflects the current system status.

#### Scenario: Initial poll on mount

- GIVEN the hook is initialized
- WHEN the component mounts
- THEN `getSystemStatus` is called once immediately
- AND `inMaintenance` reflects the response

#### Scenario: Periodic polling continues

- GIVEN the system is operational
- WHEN 30 seconds elapse
- THEN `getSystemStatus` is called again
- AND `inMaintenance` is updated with the new result

### Requirement: MM-2 503 Response Handling

The system SHALL set `inMaintenance` to `true` when `getSystemStatus` receives a 503 HTTP response. The 30-second polling interval SHALL continue even during maintenance mode.

#### Scenario: 503 triggers maintenance state

- GIVEN the system returns a 503 status code
- WHEN the poll response is processed
- THEN `inMaintenance` is set to `true`
- AND the maintenance screen is shown to users

#### Scenario: Recovery from maintenance

- GIVEN `inMaintenance` is `true`
- WHEN a subsequent poll returns a non-503 response
- THEN `inMaintenance` is set to `false`
- AND normal content is restored

### Requirement: MM-3 Admin Bypass

The system SHALL accept a `shouldBypass` boolean parameter. When `shouldBypass` is `true`, the hook SHALL NOT start the polling interval and SHALL return `inMaintenance` as `false`.

#### Scenario: Admin bypasses maintenance screen

- GIVEN `shouldBypass` is `true` (admin user)
- WHEN the hook initializes
- THEN no polling interval is started
- AND `inMaintenance` is `false`
- AND the admin sees normal content regardless of system status

#### Scenario: Non-admin sees maintenance screen

- GIVEN `shouldBypass` is `false` (regular user)
- AND the system returns 503
- WHEN the hook polls
- THEN `inMaintenance` is `true`
- AND the maintenance screen is shown

### Requirement: MM-4 Polling Cleanup

The system SHALL clear the polling interval when the component unmounts to prevent memory leaks.

#### Scenario: Interval cleared on unmount

- GIVEN the hook has started a polling interval
- WHEN the component unmounts
- THEN `clearInterval` is called
- AND no further polls occur
