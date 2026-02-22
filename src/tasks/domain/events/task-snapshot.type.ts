// A point-in-time snapshot of the Task entity's observable state.
// Used as the before/after payload in all Task domain events.
// Must stay a pure TS type — zero framework imports (domain layer rule).
export interface TaskSnapshot {
    id: string;
    title: string;
    description: string;
    status: string;
}
