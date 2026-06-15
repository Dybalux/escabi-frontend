# Age Verification Specification

## Purpose

Defines the `useAgeVerification` hook that checks localStorage for age verification status, manages the blur overlay state, and triggers the age verification toast for unverified users.

## Requirements

### Requirement: AV-1 LocalStorage Verification Check

The system SHALL check `localStorage.getItem('ageVerified')` on hook initialization. If the value indicates verification, the hook SHALL set `showBlur` to `false`.

#### Scenario: Previously verified user

- GIVEN `localStorage.getItem('ageVerified')` returns a truthy value
- WHEN the hook initializes
- THEN `showBlur` is set to `false`
- AND no age verification toast is shown

#### Scenario: Unverified user

- GIVEN `localStorage.getItem('ageVerified')` returns null or falsy
- WHEN the hook initializes
- THEN `showBlur` is set to `true`
- AND `showAgeVerificationToast` is called

### Requirement: AV-2 Blur State Management

The system SHALL expose a `showBlur` boolean state that controls whether a blur overlay is applied to the page content. The state SHALL be set to `false` when the user confirms age verification via the toast.

#### Scenario: Blur dismisses on confirmation

- GIVEN `showBlur` is `true`
- WHEN the user confirms age in the toast
- THEN `showBlur` is set to `false`
- AND `localStorage.setItem('ageVerified', ...)` is called

### Requirement: AV-3 Toast Integration

The system SHALL call `showAgeVerificationToast` with a callback that sets `showBlur` to `false` when the user confirms. The toast function MUST be imported from the existing toast utilities.

#### Scenario: Toast shows for unverified non-admin

- GIVEN an unverified user who is not an admin
- WHEN the hook initializes
- THEN `showAgeVerificationToast` is called
- AND the toast includes a confirmation callback

#### Scenario: Admin bypasses age verification

- GIVEN an admin user (`shouldBypass` is `true`)
- WHEN the hook initializes
- THEN `showAgeVerificationToast` is NOT called
- AND `showBlur` remains `false`
